import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heading2, ListTodo, Moon, RotateCcw, Sigma, Sun, Table, Workflow } from "lucide-react";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block, InlineContent, K3Editor, PartialBlock } from "@/k3blocks";
import { isTextBlock } from "@/k3blocks/types";
import Kbd from "@/components/Kbd";
import SectionLabel from "@/components/SectionLabel";
import CodeBlock from "@/components/CodeBlock";
import { docStats, replaceDocument } from "@/lib/sampleDoc";
import { cn } from "@/lib/utils";

const QUICKSTART = `import { useK3Editor, K3EditorView } from "@thejoven_com/k3blocks";
import "@thejoven_com/k3blocks/style.css";

export default function App() {
  const editor = useK3Editor({ onChange: (e) => save(e.document) });
  return <K3EditorView editor={editor} />;
}`;

/** Seeded document showcasing every P0 block (home.md §S2). */
const SEED_DOCUMENT: Block[] = [
  {
    id: "b1",
    type: "heading",
    props: { level: 1 },
    content: [{ type: "text", text: "欢迎使用 K3Blocks 👋", styles: {} }],
    children: [],
  },
  {
    id: "b2",
    type: "paragraph",
    props: {},
    content: [
      { type: "text", text: "这是一个 ", styles: {} },
      { type: "text", text: "完整运行", styles: { bold: true } },
      { type: "text", text: " 的编辑器：支持 ", styles: {} },
      { type: "text", text: "斜杠菜单", styles: { italic: true } },
      { type: "text", text: "、", styles: {} },
      { type: "text", text: "inline code", styles: { code: true } },
      { type: "text", text: " 和 ", styles: {} },
      {
        type: "link",
        href: "https://github.com/thejoven/k3blocks",
        content: [{ type: "text", text: "链接", styles: {} }],
      },
      { type: "text", text: "。", styles: {} },
    ],
    children: [],
  },
  {
    id: "b3",
    type: "checkListItem",
    props: { checked: true },
    content: [{ type: "text", text: "npm install @thejoven_com/k3blocks", styles: {} }],
    children: [],
  },
  {
    id: "b4",
    type: "checkListItem",
    props: { checked: true },
    content: [{ type: "text", text: "五行代码接入 React 应用", styles: {} }],
    children: [],
  },
  {
    id: "b5",
    type: "checkListItem",
    props: { checked: false },
    content: [{ type: "text", text: "试着勾选我", styles: {} }],
    children: [],
  },
  {
    id: "b6",
    type: "quote",
    props: {},
    content: [{ type: "text", text: "内容即界面。", styles: {} }],
    children: [],
  },
  {
    id: "b7",
    type: "bulletListItem",
    props: {},
    content: [{ type: "text", text: "无序列表项", styles: {} }],
    children: [
      {
        id: "b7a",
        type: "bulletListItem",
        props: {},
        content: [{ type: "text", text: "Tab 缩进嵌套一层", styles: {} }],
        children: [],
      },
    ],
  },
  {
    id: "b8",
    type: "numberedListItem",
    props: {},
    content: [{ type: "text", text: "有序列表项", styles: {} }],
    children: [],
  },
  {
    id: "b9",
    type: "codeBlock",
    props: { language: "tsx" },
    content: [{ type: "text", text: QUICKSTART, styles: {} }],
    children: [],
  },
  { id: "b10", type: "divider", props: {}, content: [], children: [] },
  {
    id: "b11",
    type: "image",
    props: { src: "/logo.svg", alt: "K3Blocks logo", caption: "logo.svg — 三条横杠的 K3 抽象" },
    content: [],
    children: [],
  },
  { id: "b12", type: "paragraph", props: {}, content: [], children: [] },
];

/* ------------------------------- 快速插入种子 ------------------------------- */

const MINI_FLOWCHART = "flowchart LR\n  A[输入] --> B{解析}\n  B --> C[渲染]";

/** 工具条快速插入：标题 / 待办 / 表格 2×3 / 公式 / 图表（外部驱动 editor API 的演示） */
const QUICK_INSERTS: { label: string; icon: ReactNode; make: () => PartialBlock }[] = [
  {
    label: "标题",
    icon: <Heading2 size={13} strokeWidth={1.5} />,
    make: () => ({
      type: "heading",
      props: { level: 2 },
      content: [{ type: "text", text: "外部插入的标题", styles: {} }],
    }),
  },
  {
    label: "待办",
    icon: <ListTodo size={13} strokeWidth={1.5} />,
    make: () => ({
      type: "checkListItem",
      props: { checked: false },
      content: [{ type: "text", text: "editor.insertBlocks() 插入的待办", styles: {} }],
    }),
  },
  {
    label: "表格",
    icon: <Table size={13} strokeWidth={1.5} />,
    make: () => ({
      type: "table",
      props: {
        rows: [
          ["名称", "类型", "说明"],
          ["theme", '"dark" | "light"', "编辑器主题"],
        ],
      },
    }),
  },
  {
    label: "公式",
    icon: <Sigma size={13} strokeWidth={1.5} />,
    make: () => ({ type: "math", props: { latex: "\\sum_{i=1}^n i = \\frac{n(n+1)}{2}" } }),
  },
  {
    label: "图表",
    icon: <Workflow size={13} strokeWidth={1.5} />,
    make: () => ({ type: "diagram", props: { code: MINI_FLOWCHART } }),
  },
];

/** 行内内容纯文本长度（插入后光标落末尾用） */
function inlineLen(content: InlineContent[]): number {
  let n = 0;
  for (const c of content) n += c.type === "text" ? c.text.length : inlineLen(c.content);
  return n;
}

/**
 * Renders the Edit / JSON views for the shared editor instance owned by
 * LiveDemo, so JSON reflects edits instantly and the toolbar can drive the
 * same editor via its public API.
 */
function DemoBody({
  editor,
  docVersion,
  view,
  demoTheme,
}: {
  editor: K3Editor;
  docVersion: number;
  view: "edit" | "json";
  demoTheme: "dark" | "light";
}) {
  const json = useMemo(
    () => JSON.stringify(editor.document ?? SEED_DOCUMENT, null, 2),
    // docVersion ticks on every onChange, re-reading editor.document.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, docVersion],
  );

  return (
    <AnimatePresence mode="wait" initial={false}>
      {view === "edit" ? (
        <motion.div
          key="edit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="mx-auto max-w-prose"
        >
          <K3EditorView
            editor={editor}
            theme={demoTheme}
            slashMenu
            formattingToolbar
            sideMenu
          />
        </motion.div>
      ) : (
        <motion.div
          key="json"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <CodeBlock code={json} language="json" className="max-h-[480px] overflow-y-auto" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * S2 Live Demo (home.md §S2): the site's entire spectacle budget — a real,
 * fully interactive K3Blocks editor in a 24px-radius framed panel.
 */
export default function LiveDemo() {
  const [view, setView] = useState<"edit" | "json">("edit");
  const [demoTheme, setDemoTheme] = useState<"dark" | "light">("dark");
  const [editable, setEditable] = useState(true);
  const [docVersion, setDocVersion] = useState(0);
  /** demo 面板容器（快速插入后 scrollIntoView 定位用） */
  const demoRef = useRef<HTMLDivElement | null>(null);

  const editor = useK3Editor({
    initialContent: SEED_DOCUMENT,
    editable,
    placeholder: "输入 '/' 查看命令",
    onChange: () => setDocVersion((v) => v + 1),
  });

  /* 工具条实时统计：块数 + 字符数 */
  const stats = useMemo(
    () => docStats(editor.document),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, docVersion],
  );

  /** 快速插入：文末插入种子块并聚焦（文本块置光标，所有块滚动到可视区） */
  const quickInsert = (make: () => PartialBlock) => {
    const doc = editor.document;
    const lastId = doc.length ? doc[doc.length - 1].id : null;
    const [inserted] = editor.insertBlocks([make()], lastId, "after");
    if (!inserted) return;
    if (isTextBlock(inserted.type)) {
      editor.setTextCursor(inserted.id, inlineLen(inserted.content));
    }
    window.requestAnimationFrame(() => {
      demoRef.current
        ?.querySelector(`[data-block-id="${inserted.id}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  /** Reset：整包替换回种子文档（保留单一 editor 实例，JSON 视图即时同步） */
  const resetDocument = () => {
    replaceDocument(editor, SEED_DOCUMENT);
    setDocVersion((v) => v + 1);
  };

  return (
    <section id="demo" className="mx-auto max-w-shell scroll-mt-20 px-6">
      <SectionLabel>交互演示</SectionLabel>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.015em] text-text-1">
        在这里，直接试。
      </h2>
      <p className="mt-2 text-sm text-text-2">
        这不是截图。下面是一个完整运行的 K3Blocks 编辑器。
      </p>

      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-surface-1">
        {/* Demo control bar (44px row) */}
        <div className="flex h-11 flex-wrap items-center gap-3 border-b border-border px-3">
          {/* Segmented Edit | JSON */}
          <div className="flex h-7 items-center rounded-lg border border-border p-0.5">
            {(["edit", "json"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  "flex h-6 items-center rounded-md px-2.5 font-mono text-[12px] transition-colors duration-150 ease-k3",
                  view === v
                    ? "border border-border bg-surface-2 text-text-1"
                    : "border border-transparent text-text-3 hover:text-text-2",
                )}
              >
                {v === "edit" ? "编辑" : "JSON"}
              </button>
            ))}
          </div>

          {/* 快速插入：editor API 外部驱动演示（28px，icon + 字） */}
          <div className="flex items-center gap-1.5" aria-label="快速插入">
            {QUICK_INSERTS.map((q) => (
              <button
                key={q.label}
                type="button"
                title={`文末插入${q.label}块`}
                onClick={() => quickInsert(q.make)}
                className="flex h-7 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[12px] text-text-2 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-1"
              >
                {q.icon}
                {q.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* 实时统计：块数 + 字符数 */}
            <span className="hidden font-mono text-[12px] text-text-4 md:block">
              {stats.blocks} 块 · {stats.chars} 字符
            </span>
            {/* Demo-only theme toggle */}
            <button
              type="button"
              aria-label="切换演示主题"
              onClick={() => setDemoTheme((t) => (t === "dark" ? "light" : "dark"))}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-text-2 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-1"
            >
              <span
                className="flex transition-transform duration-200 ease-k3"
                style={{ transform: demoTheme === "dark" ? "rotate(0deg)" : "rotate(180deg)" }}
              >
                {demoTheme === "dark" ? (
                  <Sun size={15} strokeWidth={1.5} />
                ) : (
                  <Moon size={15} strokeWidth={1.5} />
                )}
              </span>
            </button>

            {/* Editable switch */}
            <label className="flex h-7 cursor-pointer items-center gap-2 rounded-lg px-2 text-[12px] text-text-3 transition-colors duration-150 ease-k3 hover:bg-hover-overlay">
              <input
                type="checkbox"
                checked={editable}
                onChange={(e) => setEditable(e.target.checked)}
                className="h-3.5 w-3.5 accent-[#388aff]"
              />
              可编辑
            </label>

            {/* Reset */}
            <button
              type="button"
              onClick={resetDocument}
              className="flex h-7 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[12px] text-text-2 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-1"
            >
              <RotateCcw size={13} strokeWidth={1.5} />
              重置文档
            </button>
          </div>
        </div>

        {/* Editor canvas / JSON view — inset recess, 48/64px padding, 150ms crossfade */}
        <div ref={demoRef} className="bg-surface-inset px-6 py-12 md:px-16 md:py-16">
          <DemoBody editor={editor} docVersion={docVersion} view={view} demoTheme={demoTheme} />
        </div>

        {/* Hint bar：快捷键速查行 */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-4 py-2.5 text-[12px] text-text-3">
          <span>选中文字唤出工具栏</span>
          <span className="flex items-center gap-1.5">
            <Kbd>/</Kbd> 菜单
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>⌘B</Kbd> 粗体
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>Tab</Kbd> 嵌套
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>```</Kbd> 代码块
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>---</Kbd> 分割线
          </span>
          <span>拖动 ⠿ 排序</span>
        </div>
      </div>
    </section>
  );
}
