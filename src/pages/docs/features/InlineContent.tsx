/**
 * /docs/features/inline-content — InlineContent 模型：text + styles / link；
 * JSON 结构解剖（DOM 盒图）；格式化工具栏与 ⌘B/I/U/E/K 对照表；live demo。
 */
import Kbd from "@/components/Kbd";
import DocsShell from "@/components/docs/DocsShell";
import LiveDemo from "@/components/docs/LiveDemo";
import {
  CardStrip,
  DocTable,
  H2,
  InlineCode,
  MonoCell,
  P,
} from "@/components/docs/primitives";
import { lnk, txt } from "@/components/docs/utils";
import type { Block } from "@/k3blocks";

/* ---------------------------- anatomy diagram ---------------------------- */

/** InlineContent 解剖图 —— 复用 DocumentStructure 的 DOM 盒图风格。 */
function InlineAnatomy() {
  return (
    <div className="mt-6 rounded-xl border border-border bg-surface-1 p-5 sm:p-6">
      <div className="rounded-lg border border-border bg-surface-2 p-4">
        <div className="font-mono text-[12px] uppercase tracking-[0.08em] text-text-3">
          content: InlineContent[]
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {/* text node */}
          <div className="rounded-md border border-border bg-surface-1 px-3 py-2 font-mono text-[12px]">
            <span className="text-accent">{`{ type: "text"`}</span>
            <span className="text-text-3">, text: </span>
            <span className="text-code-green">"加粗的文字"</span>
            <span className="text-text-3">, styles: </span>
            <span className="text-text-1">{`{ bold: true }`}</span>
            <span className="text-accent">{` }`}</span>
          </div>
          {/* link node */}
          <div className="rounded-md border border-border bg-surface-1 px-3 py-2 font-mono text-[12px]">
            <span className="text-accent">{`{ type: "link"`}</span>
            <span className="text-text-3">, href: </span>
            <span className="text-code-green">"https://…"</span>
            <span className="text-text-3">, content: </span>
            <span className="text-text-1">InlineContent[]</span>
            <span className="text-accent">{` }`}</span>
            <span className="ml-2 text-text-4">{"// 链接内可再嵌套 text"}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {["bold", "italic", "underline", "strike", "code"].map((s) => (
          <span
            key={s}
            className="rounded-md border border-border bg-surface-inset px-2 py-1 font-mono text-[12px] text-text-2"
          >
            {s}
          </span>
        ))}
        <span className="px-2 py-1 font-mono text-[12px] text-text-4">
          {"// InlineStyles 五个可选键"}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------- live demo ------------------------------- */

const DEMO_DOC: Block[] = [
  {
    id: "ic1",
    type: "paragraph",
    props: {},
    content: [
      txt("选中这段"),
      txt("粗体", { bold: true }),
      txt("、"),
      txt("斜体", { italic: true }),
      txt(" 或 "),
      lnk("https://github.com/thejoven/k3blocks", "这个链接"),
      txt("，格式化工具栏即刻浮出。"),
    ],
    children: [],
  },
  {
    id: "ic2",
    type: "paragraph",
    props: {},
    content: [txt("行内代码 "), txt("const x = 1", { code: true }), txt(" 也是 styles 的一种。")],
    children: [],
  },
  { id: "ic3", type: "paragraph", props: {}, content: [], children: [] },
];

/* ---------------------------------- 页面 ---------------------------------- */

export default function InlineContent() {
  return (
    <DocsShell
      crumbs={["Docs", "Features", "Inline content"]}
      title="Inline content."
      lead="块内的文字不是字符串，而是 InlineContent 数组：text 节点携带 styles，link 节点携带 href 并可再嵌套。"
    >
      <H2 id="model">数据模型。</H2>
      <P>
        <InlineCode>content: InlineContent[]</InlineCode> 只有两种节点——
        <MonoCell accent>text</MonoCell>（带可选 <InlineCode>styles</InlineCode>）与{" "}
        <MonoCell accent>link</MonoCell>（带 <InlineCode>href</InlineCode> 与递归的{" "}
        <InlineCode>content</InlineCode>）。五种行内样式可任意叠加：
      </P>
      <InlineAnatomy />

      <H2 id="demo">在线体验。</H2>
      <P>选中任意文字，格式化工具栏浮出；切到 JSON 视图可看到 styles 实时写入。</P>
      <LiveDemo
        className="mt-4"
        seed={DEMO_DOC}
        hints={[
          { keys: ["⌘", "B"], text: "加粗" },
          { keys: ["⌘", "K"], text: "设为链接" },
          { keys: ["`"], text: "`code` 行内规则" },
        ]}
      />

      <H2 id="toolbar">格式化工具栏与快捷键。</H2>
      <DocTable
        columns={["样式", "styles 键", "快捷键 / 规则"]}
        rows={[
          ["加粗", <MonoCell>bold</MonoCell>, <span className="flex gap-1"><Kbd>⌘</Kbd><Kbd>B</Kbd></span>],
          ["斜体", <MonoCell>italic</MonoCell>, <span className="flex gap-1"><Kbd>⌘</Kbd><Kbd>I</Kbd></span>],
          ["下划线", <MonoCell>underline</MonoCell>, <span className="flex gap-1"><Kbd>⌘</Kbd><Kbd>U</Kbd></span>],
          ["行内代码", <MonoCell>code</MonoCell>, <span className="flex gap-1"><Kbd>⌘</Kbd><Kbd>E</Kbd><span className="text-text-4">或 `code`</span></span>],
          ["删除线", <MonoCell>strike</MonoCell>, <span className="text-text-3">工具栏按钮</span>],
          ["链接", <MonoCell>link.href</MonoCell>, <span className="flex gap-1"><Kbd>⌘</Kbd><Kbd>K</Kbd></span>],
        ]}
      />
      <P>
        行内加粗也支持 Markdown 规则：输入 <InlineCode>**bold**</InlineCode>{" "}
        自动转成带 <InlineCode>bold</InlineCode> 样式的 text 节点。所有样式键均可选、可叠加，
        未设置的键在 JSON 中缺省而非 <InlineCode>false</InlineCode>。
      </P>

      <CardStrip
        className="mt-14"
        cards={[
          { to: "/docs/foundations/document-structure", title: "Document structure", description: "Block 五字段与文档树的完整解剖。" },
          { to: "/docs/features/typography", title: "Typography", description: "标题阶梯、段落与引用的排版规则。" },
        ]}
      />
    </DocsShell>
  );
}
