/**
 * 9 个块专页的共享配置（blocks.md §3）：种子文档、props 表、创建方式、
 * demo 提示条与行为说明。页面模板见 BlockDocPage.tsx。
 */
import type { ReactNode } from "react";
import {
  Code2,
  Heading,
  Image,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Quote,
  Type,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Block, InlineContent, InlineStyles, K3Editor } from "@/k3blocks";
import Kbd from "@/components/Kbd";

/* --------------------------------- 构造辅助 --------------------------------- */

const t = (text: string, styles?: InlineStyles): InlineContent => ({
  type: "text",
  text,
  ...(styles ? { styles } : {}),
});

const b = (
  id: string,
  type: string,
  content: InlineContent[] = [],
  props: Record<string, unknown> = {},
  children: Block[] = [],
): Block => ({ id, type, props, content, children });

/** 深拷贝种子，供 Reset 重新插入（避免引用同一对象）。 */
export function cloneBlocks(blocks: Block[]): Block[] {
  return JSON.parse(JSON.stringify(blocks)) as Block[];
}

/* ---------------------------------- 类型 ---------------------------------- */

export interface PropRow {
  prop: string;
  type: string;
  def: string;
  desc: string;
}

export interface HintItem {
  keys?: string[];
  text: string;
}

export interface BlockDoc {
  /** 路由 slug，如 "bullet-list" */
  slug: string;
  /** 展示名，如 "Bullet List" */
  name: string;
  icon: LucideIcon;
  /** 磁贴与创建卡上展示的斜杠命令 */
  slash: string;
  lead: string;
  /** demo 面板种子文档（只含该块的有意义变体） */
  seed: Block[];
  /** props 表行；空数组 → 展示「无 props」 */
  props: PropRow[];
  /** props 表下方补充说明 */
  propsNote?: string;
  /** Markdown 行首规则的 kbd 序列；无规则时用 markdownNote */
  markdownKeys?: string[];
  markdownNote?: string;
  /** 创建方式卡中的 API 片段（行内 mono） */
  apiSnippet: string;
  /** demo 画布下方的提示条 */
  hints: HintItem[];
  /** 行为 / 渲染说明（Callout） */
  notes?: ReactNode;
  /** demo 条上的额外控件（语言选择、填 URL 等） */
  renderBarExtra?: (editor: K3Editor) => ReactNode;
  /** 相关示例链接（缺省指向 /examples） */
  relatedExample?: { slug: string; title: string };
}

/* --------------------------------- 各块种子 --------------------------------- */

const CODE_SNIPPET = `import { useK3Editor, K3EditorView } from "@thejoven_com/k3blocks";

export default function App() {
  const editor = useK3Editor();
  return <K3EditorView editor={editor} />;
}`;

const barBtnClass =
  "flex h-7 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[12px] text-text-2 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-1";

/* ---------------------------------- 配置 ---------------------------------- */

export const BLOCK_DOCS: BlockDoc[] = [
  {
    slug: "paragraph",
    name: "Paragraph",
    icon: Type,
    slash: "/text",
    lead: "一切从段落开始。空段落即占位符，承载斜杠菜单入口。",
    seed: [
      b("p1", "paragraph", [
        t("段落承载 "),
        t("粗体", { bold: true }),
        t("、"),
        t("斜体", { italic: true }),
        t("、"),
        t("下划线", { underline: true }),
        t("、"),
        t("删除线", { strike: true }),
        t("、"),
        t("行内代码", { code: true }),
        t(" 和 "),
        { type: "link", href: "https://github.com/thejoven/k3blocks", content: [t("链接")] },
        t("。"),
      ]),
      b("p2", "paragraph"),
    ],
    props: [],
    propsNote: "加粗、斜体等 inline styles 属于 content 而非 props。",
    markdownNote: "无 Markdown 规则（默认块）",
    apiSnippet: 'insertBlocks([{ type: "paragraph" }], refId)',
    hints: [
      { keys: ["/"], text: "空段落中唤出斜杠菜单" },
      { keys: ["Enter"], text: "在光标处拆成两个块" },
      { keys: ["Backspace"], text: "空块上按下合并到上一块" },
    ],
    notes: (
      <>
        按下 <Kbd>Enter</Kbd> 会在光标处拆分当前块；在空段落上按下 <Kbd>Backspace</Kbd>{" "}
        会删除该块并把光标并入上一块。段落在块首按 <Kbd>Backspace</Kbd>{" "}
        也会先「降级」其它块类型为段落。
      </>
    ),
  },
  {
    slug: "heading",
    name: "Heading",
    icon: Heading,
    slash: "/h1 /h2 /h3",
    lead: "三级标题，语义化 outline 的骨架。",
    seed: [
      b("h1", "heading", [t("一级标题")], { level: 1 }),
      b("h2", "heading", [t("二级标题")], { level: 2 }),
      b("h3", "heading", [t("三级标题")], { level: 3 }),
    ],
    props: [{ prop: "level", type: "1 | 2 | 3", def: "1", desc: "标题级别" }],
    markdownKeys: ["#", "##", "###", "Space"],
    apiSnippet: 'insertBlocks([{ type: "heading", props: { level: 2 } }], refId)',
    hints: [
      { keys: ["#", "Space"], text: "行首输入快速切换级别" },
      { text: "侧边菜单「转换为」切换级别" },
    ],
    notes: (
      <>
        悬停块左侧打开侧边菜单，「转换为」可在 1–3 级标题与段落之间互相转换；
        行首输入 <Kbd>#</Kbd> <Kbd>##</Kbd> <Kbd>###</Kbd> 加 <Kbd>Space</Kbd> 可直接设定级别。
      </>
    ),
  },
  {
    slug: "bullet-list",
    name: "Bullet List",
    icon: List,
    slash: "/bullet",
    lead: "无序列表，支持 Tab 嵌套为树。",
    seed: [
      b("bl1", "bulletListItem", [t("无序列表项")]),
      b("bl2", "bulletListItem", [t("第二项")]),
      b("bl3", "bulletListItem", [t("含一层嵌套的项")], {}, [
        b("bl3a", "bulletListItem", [t("Tab 缩进产生的子条目")]),
      ]),
    ],
    props: [],
    markdownKeys: ["-", "Space"],
    apiSnippet: 'insertBlocks([{ type: "bulletListItem" }], refId)',
    hints: [
      { keys: ["Tab"], text: "缩进一层" },
      { keys: ["Shift", "Tab"], text: "提升一层" },
      { keys: ["Enter"], text: "空项上降级为段落" },
    ],
  },
  {
    slug: "numbered-list",
    name: "Numbered List",
    icon: ListOrdered,
    slash: "/numbered",
    lead: "有序列表，编号自动计算，嵌套时各自独立计数。",
    seed: [
      b("n1", "numberedListItem", [t("第一步")]),
      b("n2", "numberedListItem", [t("第二步（含子步骤）")], {}, [
        b("n2a", "numberedListItem", [t("子步骤一")]),
        b("n2b", "numberedListItem", [t("子步骤二")]),
      ]),
      b("n3", "numberedListItem", [t("第三步")]),
    ],
    props: [],
    markdownKeys: ["1.", "Space"],
    apiSnippet: 'insertBlocks([{ type: "numberedListItem" }], refId)',
    hints: [
      { keys: ["⠿"], text: "拖拽排序，编号即时重算" },
      { keys: ["Tab"], text: "嵌套后独立计数" },
    ],
    notes: <>编号由文档结构实时推导：拖动 ⠿ 手柄重排，或增删任意一项，编号即刻重新计算。</>,
  },
  {
    slug: "todo-list",
    name: "To-do List",
    icon: ListTodo,
    slash: "/todo",
    lead: "待办列表。勾选即完成，标签以删除线淡出。",
    seed: [
      b("td1", "checkListItem", [t("写文档")], { checked: true }),
      b("td2", "checkListItem", [t("发布 v0.1")], { checked: true }),
      b("td3", "checkListItem", [t("支持表格")], { checked: false }),
    ],
    props: [{ prop: "checked", type: "boolean", def: "false", desc: "勾选状态" }],
    markdownKeys: ["[", "]", "Space"],
    apiSnippet: 'updateBlock(id, { props: { checked: true } })',
    hints: [
      { text: "点击 16px 复选框切换完成态" },
      { keys: ["Enter"], text: "新待办自动继承未勾选" },
    ],
    notes: (
      <>
        勾选后标签以 <span className="font-mono text-[12px]">--text-4</span> 加删除线淡出（150ms
        过渡），复选框填充强调色。
      </>
    ),
  },
  {
    slug: "quote",
    name: "Quote",
    icon: Quote,
    slash: "/quote",
    lead: "引用块：左侧 2px 强调条，内缩排版。",
    seed: [
      b("q1", "quote", [t('"Surfaces, not shadows." — cladd')]),
      b("q2", "quote"),
    ],
    props: [],
    markdownKeys: [">", "Space"],
    apiSnippet: 'insertBlocks([{ type: "quote" }], refId)',
    hints: [{ keys: [">", "Space"], text: "行首输入即刻转换为引用" }],
  },
  {
    slug: "code-block",
    name: "Code Block",
    icon: Code2,
    slash: "/code",
    lead: "内嵌代码块：等宽字体、语言标签、一键复制。",
    seed: [b("c1", "codeBlock", [t(CODE_SNIPPET)], { language: "tsx" })],
    props: [
      { prop: "language", type: "string", def: '"text"', desc: "语言标签，展示于右上角" },
    ],
    markdownKeys: ["```", "Enter"],
    apiSnippet: 'insertBlocks([{ type: "codeBlock", props: { language: "ts" } }], refId)',
    hints: [
      { keys: ["Enter"], text: "块内换行" },
      { keys: ["⌘", "Enter"], text: "跳出代码块" },
    ],
    notes: (
      <>
        代码块渲染在 <span className="font-mono text-[12px]">--surface-inset</span>{" "}
        凹陷井中，复制按钮在悬停时以 150ms 淡入。
      </>
    ),
    renderBarExtra: (editor) => {
      const block = editor.document.find((x) => x.type === "codeBlock");
      const lang = String(block?.props.language ?? "text");
      return (
        <select
          aria-label="代码语言"
          value={lang}
          onChange={(e) =>
            block &&
            editor.updateBlock(block.id, {
              props: { ...block.props, language: e.target.value },
            })
          }
          className="h-7 rounded-lg border border-border bg-surface-1 px-2 font-mono text-[12px] text-text-2 outline-none transition-colors duration-150 ease-k3 hover:bg-hover-overlay focus-visible:border-accent"
        >
          {["tsx", "ts", "js", "json", "css", "text"].map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      );
    },
    relatedExample: { slug: "code-block-theme", title: "Code block theme" },
  },
  {
    slug: "divider",
    name: "Divider",
    icon: Minus,
    slash: "/divider",
    lead: "一条 1px 发丝线，给文档呼吸。",
    seed: [
      b("d1", "paragraph", [t("分割线之上")]),
      b("d2", "divider"),
      b("d3", "paragraph", [t("分割线之下")]),
    ],
    props: [],
    markdownKeys: ["---", "Enter"],
    apiSnippet: 'insertBlocks([{ type: "divider" }], refId)',
    hints: [
      { text: "点击选中，呈现强调色描边" },
      { keys: ["Backspace"], text: "选中后删除" },
    ],
    notes: (
      <>
        分割线以 1px <span className="font-mono text-[12px]">--border</span> 渲染，上下各留 24px
        垂直节奏；它是可选中的块——点击后出现强调色描边，按 <Kbd>Backspace</Kbd> 或{" "}
        <Kbd>Delete</Kbd> 删除。
      </>
    ),
  },
  {
    slug: "image",
    name: "Image",
    icon: Image,
    slash: "/image",
    lead: "图片块：URL 嵌入、说明文字、块级拖拽排序。",
    seed: [
      b("i1", "image", [], {
        src: "",
        caption: "caption 支持内联样式",
        alt: "",
      }),
    ],
    props: [
      { prop: "src", type: "string", def: '""', desc: "图片 URL；为空时显示占位" },
      { prop: "caption", type: "string", def: '""', desc: "说明文字" },
      { prop: "alt?", type: "string", def: "—", desc: "无障碍替代文本" },
    ],
    markdownNote: "无 Markdown 规则",
    apiSnippet: 'insertBlocks([{ type: "image", props: { src: "…" } }], refId)',
    hints: [
      { text: "空状态时粘贴 URL 并回车嵌入" },
      { keys: ["⠿"], text: "拖拽手柄调整位置" },
    ],
    notes: (
      <>
        空状态的上传区是一个凹陷的虚线发丝线放置区，拖入文件时以强调色高亮（150ms）。
      </>
    ),
    renderBarExtra: (editor) => (
      <button
        type="button"
        className={barBtnClass}
        onClick={() => {
          const img = editor.document.find((x) => x.type === "image");
          if (img)
            editor.updateBlock(img.id, {
              props: { ...img.props, src: "/logo.svg", alt: "K3Blocks logo" },
            });
        }}
      >
        填入示例 URL
      </button>
    ),
  },
];

export function getBlockDoc(slug: string): BlockDoc {
  const doc = BLOCK_DOCS.find((d) => d.slug === slug);
  if (!doc) throw new Error(`Unknown block slug: ${slug}`);
  return doc;
}

export function blockNeighbors(slug: string): { prev?: BlockDoc; next?: BlockDoc } {
  const i = BLOCK_DOCS.findIndex((d) => d.slug === slug);
  return { prev: BLOCK_DOCS[i - 1], next: BLOCK_DOCS[i + 1] };
}
