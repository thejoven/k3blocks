/**
 * /docs/features/built-in-blocks — 全部内置块总览。
 * 基础 9 + columnList/column + 媒体 4（table/math/embed/diagram），
 * 每种一行：mono type 名 + 中文说明 + slash 命令 + 可运行微缩预览（pointer-events-none）。
 */
import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import DocsShell from "@/components/docs/DocsShell";
import { CardStrip, H2, InlineCode, MonoCell, P } from "@/components/docs/primitives";
import { txt } from "@/components/docs/utils";
import MiniEditor from "@/pages/blocks/MiniEditor";
import type { Block } from "@/k3blocks";

/* --------------------------------- 行数据 --------------------------------- */

interface BlockRow {
  type: string;
  desc: string;
  slash: string;
  seed: Block[];
  /** 预览高度类名（默认 h-24） */
  previewClass?: string;
}

const b = (
  id: string,
  type: string,
  content: Block["content"] = [],
  props: Record<string, unknown> = {},
  children: Block[] = [],
): Block => ({ id, type, props, content, children });

const BASIC_ROWS: BlockRow[] = [
  {
    type: "paragraph",
    desc: "默认文本块，一切内容的起点。",
    slash: "/text",
    seed: [b("bi-p", "paragraph", [txt("段落"), txt("粗体", { bold: true })])],
  },
  {
    type: "heading",
    desc: "三级标题（props.level: 1 | 2 | 3）。",
    slash: "/h1 /h2 /h3",
    seed: [b("bi-h", "heading", [txt("标题")], { level: 2 })],
  },
  {
    type: "bulletListItem",
    desc: "无序列表，Tab 嵌套。",
    slash: "/bullet",
    seed: [
      b("bi-b1", "bulletListItem", [txt("第一项")]),
      b("bi-b2", "bulletListItem", [txt("第二项")]),
    ],
  },
  {
    type: "numberedListItem",
    desc: "有序列表，编号自动计算。",
    slash: "/numbered",
    seed: [
      b("bi-n1", "numberedListItem", [txt("第一步")]),
      b("bi-n2", "numberedListItem", [txt("第二步")]),
    ],
  },
  {
    type: "checkListItem",
    desc: "待办列表（props.checked 写回勾选态）。",
    slash: "/todo",
    seed: [
      b("bi-t1", "checkListItem", [txt("已完成")], { checked: true }),
      b("bi-t2", "checkListItem", [txt("未完成")], { checked: false }),
    ],
  },
  {
    type: "quote",
    desc: "引用：左侧 2px 强调条。",
    slash: "/quote",
    seed: [b("bi-q", "quote", [txt("引用一段文字")])],
  },
  {
    type: "codeBlock",
    desc: "代码块：语言标签 + 复制按钮。",
    slash: "/code",
    seed: [b("bi-c", "codeBlock", [txt('const a = 1;\nconsole.log(a);')], { language: "ts" })],
  },
  {
    type: "divider",
    desc: "1px 发丝分割线。",
    slash: "/divider",
    seed: [b("bi-d1", "paragraph", [txt("上")]), b("bi-d2", "divider")],
  },
  {
    type: "image",
    desc: "图片：URL 嵌入 + caption。",
    slash: "/image",
    seed: [b("bi-i", "image", [], { src: "/logo.svg", caption: "logo.svg", alt: "K3Blocks" })],
  },
];

const LAYOUT_ROWS: BlockRow[] = [
  {
    type: "columnList / column",
    desc: "分栏容器：columnList 的 children 只能是 column，栏内可放任意常规块。",
    slash: "/columns",
    previewClass: "h-28",
    seed: [
      b("bi-cl", "columnList", [], {}, [
        b("bi-cl1", "column", [], {}, [b("bi-cl1p", "paragraph", [txt("左栏")])]),
        b("bi-cl2", "column", [], {}, [b("bi-cl2p", "paragraph", [txt("右栏")])]),
      ]),
    ],
  },
];

const MEDIA_ROWS: BlockRow[] = [
  {
    type: "table",
    desc: "表格：props.rows 二维纯文本，Tab 跳格，工具条增删行列。",
    slash: "/table",
    previewClass: "h-32",
    seed: [
      b("bi-tb", "table", [], {
        rows: [
          ["名称", "状态"],
          ["表格", "✓ stable"],
        ],
      }),
    ],
  },
  {
    type: "math",
    desc: "数学公式：KaTeX 渲染 LaTeX（props.latex）。",
    slash: "/math",
    previewClass: "h-32",
    seed: [b("bi-m", "math", [], { latex: "E = mc^2" })],
  },
  {
    type: "embed",
    desc: "嵌入：iframe 预览，识别 YouTube / Vimeo / B 站。",
    slash: "/embed",
    previewClass: "h-28",
    seed: [b("bi-e", "embed", [], { url: "" })],
  },
  {
    type: "diagram",
    desc: "图表：Mermaid 源码渲染 SVG（动态加载）。",
    slash: "/diagram",
    previewClass: "h-40",
    seed: [b("bi-g", "diagram", [], { code: "flowchart LR\n  A[输入] --> B[渲染]" })],
  },
];

/* --------------------------------- 行组件 --------------------------------- */

function BlockRowItem({ row }: { row: BlockRow }) {
  return (
    <div className="flex flex-col gap-4 border-b border-border py-5 last:border-b-0 sm:flex-row sm:items-center sm:gap-6">
      <div className="min-w-0 sm:w-64 sm:shrink-0">
        <MonoCell accent>{row.type}</MonoCell>
        <p className="mt-1.5 text-sm leading-relaxed text-text-2">{row.desc}</p>
        <span className="mt-2 inline-flex h-5 items-center rounded-md border border-border bg-surface-2 px-1.5 font-mono text-[11px] text-text-3">
          {row.slash}
        </span>
      </div>
      <div
        className={`pointer-events-none min-w-0 flex-1 select-none overflow-hidden rounded-md border border-border bg-surface-inset px-3 py-2 ${row.previewClass ?? "h-24"}`}
        aria-hidden="true"
      >
        <MiniEditor seed={row.seed} />
      </div>
    </div>
  );
}

/* ---------------------------------- 页面 ---------------------------------- */

const WHITELIST_CODE = `useK3Editor({
  // 只保留段落、标题与图片：菜单、Markdown 规则、insertBlocks 同步收敛
  blockTypes: ["paragraph", "heading", "image"],
});`;

export default function BuiltInBlocks() {
  return (
    <DocsShell
      crumbs={["Docs", "Features", "Built-in blocks"]}
      title="Built-in blocks."
      lead="K3Blocks 内置 9 种基础块、分栏容器与 4 种媒体块（table / math / embed / diagram）。下面每一行都是真实运行的编辑器预览。"
    >
      <H2 id="basic">基础块。</H2>
      <P>
        九种基础块覆盖日常写作：文本、标题、三种列表、引用、代码、分割线与图片。全部可经斜杠菜单、
        Markdown 行首规则或 <InlineCode>insertBlocks</InlineCode> 创建。
      </P>
      <div className="mt-4 rounded-lg border border-border px-5">
        {BASIC_ROWS.map((row) => (
          <BlockRowItem key={row.type} row={row} />
        ))}
      </div>

      <H2 id="layout">分栏。</H2>
      <P>
        <InlineCode>columnList</InlineCode> 以 CSS grid 均分栏宽，栏间 24px 间距加 1px
        发丝分隔线；窄屏退化为单列堆叠。<InlineCode>column</InlineCode> 随{" "}
        <InlineCode>columnList</InlineCode> 隐式允许，不单独出现在菜单中。
      </P>
      <div className="mt-4 rounded-lg border border-border px-5">
        {LAYOUT_ROWS.map((row) => (
          <BlockRowItem key={row.type} row={row} />
        ))}
      </div>

      <H2 id="media">媒体块。</H2>
      <P>
        表格、公式、嵌入与图表四种媒体块由斜杠菜单 Media 组插入，各自持有结构化 props
        而非行内 content。详见各自的专题页。
      </P>
      <div className="mt-4 rounded-lg border border-border px-5">
        {MEDIA_ROWS.map((row) => (
          <BlockRowItem key={row.type} row={row} />
        ))}
      </div>

      <H2 id="whitelist">关闭不需要的块。</H2>
      <P>
        通过 <InlineCode>useK3Editor</InlineCode> 的 <InlineCode>blockTypes</InlineCode>{" "}
        白名单收敛可用块类型：斜杠菜单与「转换为」菜单只显示白名单类型，被移除类型的 Markdown
        行首规则失效，<InlineCode>insertBlocks</InlineCode> 遇到非白名单 type 时递归降级为{" "}
        <InlineCode>paragraph</InlineCode>。
      </P>
      <CodeBlock className="mt-4" code={WHITELIST_CODE} language="ts" />
      <Callout className="mt-4" title="白名单语义">
        未设置 <InlineCode>blockTypes</InlineCode> 时全部放行；schema 未注册的自定义 type（经{" "}
        <InlineCode>blockRenderers</InlineCode> 渲染）始终放行，不会被白名单误杀。
      </Callout>

      <CardStrip
        className="mt-14"
        cards={[
          { to: "/docs/features/tables", title: "Tables", description: "表格块：props.rows、单元格编辑与 Markdown 导出。" },
          { to: "/docs/features/custom-blocks", title: "Custom blocks", description: "blockRenderers 自定义渲染口完整教程。" },
        ]}
      />
    </DocsShell>
  );
}
