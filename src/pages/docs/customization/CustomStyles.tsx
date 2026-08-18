/**
 * /docs/customization/custom-styles — inlineStyleRenderers 教程：
 * 给 text 节点加自定义 `fontSize` 样式键（styles: { fontSize: "20px" }），
 * inlineStyleRenderers: { fontSize: (v) => ({ fontSize: v }) } 转成 CSS；
 * live demo 展示大小混排文字，并说明与内置 textColor 的关系。
 */
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import SectionLabel from "@/components/SectionLabel";
import DocsShell from "@/components/docs/DocsShell";
import {
  CardStrip,
  DocTable,
  H2,
  InlineCode,
  MonoCell,
  P,
} from "@/components/docs/primitives";
import { txt } from "@/components/docs/utils";
import { cn } from "@/lib/utils";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block, K3InlineStyleRenderer } from "@/k3blocks";

/* ------------------------------ fontSize demo ------------------------------ */

/** 自定义样式渲染口：styles.fontSize 的值 → CSS fontSize。 */
const STYLE_RENDERERS: Record<string, K3InlineStyleRenderer> = {
  fontSize: (v) => ({ fontSize: v }),
};

const SEED: Block[] = [
  {
    id: "fs1",
    type: "paragraph",
    props: {},
    content: [
      txt("同一段落里混排 "),
      txt("12px 注脚", { fontSize: "12px" }),
      txt("、"),
      txt("默认正文"),
      txt(" 与 "),
      txt("24px 强调", { fontSize: "24px" }),
      txt("——大小由自定义 styles 键驱动。"),
    ],
    children: [],
  },
  {
    id: "fs2",
    type: "paragraph",
    props: {},
    content: [
      txt("自定义键可与内置样式叠加："),
      txt("20px 加粗红字", { fontSize: "20px", bold: true, textColor: "#e03131" }),
      txt("。"),
    ],
    children: [],
  },
  { id: "fs3", type: "paragraph", props: {}, content: [], children: [] },
];

function cloneSeed(): Block[] {
  return JSON.parse(JSON.stringify(SEED)) as Block[];
}

function FontSizeDemo() {
  const [view, setView] = useState<"edit" | "json">("edit");
  const [version, setVersion] = useState(0);
  const editor = useK3Editor({
    initialContent: cloneSeed(),
    onChange: () => setVersion((v) => v + 1),
  });

  const json = useMemo(
    () => JSON.stringify(editor.document, null, 2),
    // version 随每次 onChange 递增，驱动重新读取 editor.document
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, version],
  );

  const reset = () => {
    const ids = editor.document.map((blk) => blk.id);
    if (ids.length > 0) editor.removeBlocks(ids);
    editor.insertBlocks(cloneSeed());
  };

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border bg-surface-1">
      <div className="flex min-h-11 flex-wrap items-center gap-3 border-b border-border px-3 py-1.5">
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
              {v === "edit" ? "Edit" : "JSON"}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={reset}
          className="ml-auto flex h-7 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[12px] text-text-2 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-1"
        >
          <RotateCcw size={13} strokeWidth={1.5} />
          Reset
        </button>
      </div>
      <div className="bg-surface-inset px-5 py-8 md:px-10 md:py-10">
        <AnimatePresence mode="wait" initial={false}>
          {view === "edit" ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <K3EditorView
                editor={editor}
                slashMenu
                formattingToolbar
                sideMenu
                inlineStyleRenderers={STYLE_RENDERERS}
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
              <CodeBlock code={json} language="json" className="max-h-[420px] overflow-y-auto" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-4 py-2.5 text-[12px] text-text-3">
        <span className="flex items-center gap-1.5">切到 JSON 视图：styles.fontSize 原样保留</span>
        <span className="flex items-center gap-1.5">选中文字用工具栏加粗 / 上色，与 fontSize 叠加</span>
      </div>
    </div>
  );
}

/* -------------------------------- 教程代码 -------------------------------- */

const STEP_DATA = `// 1. 数据：InlineStyles 带索引签名，允许任意额外键。
//    未注册的键不影响渲染，但 JSON 往返原样保留。
const node = {
  type: "text",
  text: "24px 强调",
  styles: { fontSize: "24px" },
};`;

const STEP_RENDERER = `// 2. 渲染：inlineStyleRenderers 把 styles[key] 的值转成 CSSProperties，
//    应用到 text 节点的外层 span。
<K3EditorView
  editor={editor}
  inlineStyleRenderers={{
    fontSize: (value) => ({ fontSize: value }),
  }}
/>`;

/* ---------------------------------- 页面 ---------------------------------- */

export default function CustomStyles() {
  return (
    <DocsShell
      crumbs={["Docs", "Customization", "Custom styles"]}
      title="Custom styles."
      lead="inlineStyleRenderers 把 text 节点 styles 里的自定义键转成 CSS：数据侧是一个普通字符串值，渲染侧是一个 (value) => CSSProperties 函数——两步让任意行内样式生效。"
    >
      <H2 id="how">两步接入。</H2>
      <P>
        <InlineCode>InlineStyles</InlineCode> 除了 bold / italic 等内置键还带索引签名，
        允许任意额外键。数据先落进 <InlineCode>styles</InlineCode>：
      </P>
      <CodeBlock className="mt-3" code={STEP_DATA} language="ts" />
      <P>
        再注册同名渲染器。渲染 text 节点时，每个在表里命中的{" "}
        <InlineCode>styles[key]</InlineCode> 都会经对应函数转成 CSS，
        与内置样式合到同一个外层 <InlineCode>span</InlineCode>：
      </P>
      <CodeBlock className="mt-3" code={STEP_RENDERER} language="tsx" />

      <H2 id="demo">大小混排。</H2>
      <P>
        下面段落里的 12px / 24px 文字都由 <InlineCode>fontSize</InlineCode> 键驱动；
        第二段的 20px 文字还叠加了内置 <InlineCode>bold</InlineCode> 与{" "}
        <InlineCode>textColor</InlineCode>——自定义键与内置键共存于同一个 styles 对象。
      </P>
      <SectionLabel className="mt-6">LIVE DEMO — 自定义 fontSize 样式键</SectionLabel>
      <FontSizeDemo />

      <H2 id="builtin">与内置样式键的关系。</H2>
      <DocTable
        columns={["键", "来源", "渲染方式"]}
        rows={[
          [
            <MonoCell>bold / italic / underline / strike / code</MonoCell>,
            "内置",
            "语义标签 strong / em / u / s / code；格式化工具栏与快捷键写入。",
          ],
          [
            <MonoCell>textColor / backgroundColor</MonoCell>,
            "内置",
            "外层 span 的 color / background-color；工具栏两个颜色下拉写入（hex 入模型）。",
          ],
          [
            <MonoCell accent>fontSize（本页）</MonoCell>,
            "inlineStyleRenderers",
            "(value) => CSSProperties，合并到同一外层 span；需自行提供写入入口。",
          ],
          [
            <MonoCell>任意未注册键</MonoCell>,
            "—",
            "不影响渲染，但 JSON 往返原样保留——数据不会因缺渲染器而丢失。",
          ],
        ]}
      />
      <P>
        自定义键与内置 <InlineCode>textColor</InlineCode> 是同一机制的两端：内置键由组件自带
        UI（格式化工具栏）写入并渲染；自定义键共用同一个 <InlineCode>styles</InlineCode>{" "}
        容器与渲染管道，只是写入入口（工具栏按钮、粘贴规则、导入器）由你提供。
      </P>

      <Callout className="mt-6" title="边界说明">
        自定义样式键只影响渲染与 JSON 往返：Markdown 导出忽略所有样式键（含内置颜色）；
        未在 <InlineCode>inlineStyleRenderers</InlineCode> 注册的键静默跳过渲染，
        不会报错、也不会在序列化时被裁掉。
      </Callout>

      <CardStrip
        className="mt-14"
        cards={[
          { to: "/docs/features/inline-content", title: "Inline content", description: "内置行内样式键与格式化工具栏对照表。" },
          { to: "/examples/font-style", title: "示例：Font style", description: "内置 textColor / backgroundColor 颜色下拉的完整示例。" },
          { to: "/docs/api", title: "API reference", description: "inlineStyleRenderers 与 InlineStyles 的完整签名。" },
        ]}
      />
    </DocsShell>
  );
}
