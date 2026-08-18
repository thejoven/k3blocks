/**
 * /docs/features/code-blocks — codeBlock：language 标签、复制按钮、
 * Enter 换行 / ⌘Enter 跳出、``` 行首规则；live demo 语言 select 实时 updateBlock。
 */
import Callout from "@/components/Callout";
import Kbd from "@/components/Kbd";
import DocsShell from "@/components/docs/DocsShell";
import LiveDemo from "@/components/docs/LiveDemo";
import {
  CardStrip,
  DocTable,
  H2,
  InlineCode,
  P,
} from "@/components/docs/primitives";
import { txt } from "@/components/docs/utils";
import type { Block, K3Editor } from "@/k3blocks";

/* ------------------------------- live demo ------------------------------- */

const SNIPPET = `import { useK3Editor, K3EditorView } from "@k3/blocks";

export default function App() {
  const editor = useK3Editor();
  return <K3EditorView editor={editor} />;
}`;

const DEMO_DOC: Block[] = [
  { id: "cb1", type: "codeBlock", props: { language: "tsx" }, content: [txt(SNIPPET)], children: [] },
  { id: "cb2", type: "paragraph", props: {}, content: [], children: [] },
];

const LANGS = ["tsx", "ts", "js", "json", "css", "text"];

/** 语言 select —— 实时 updateBlock 回写 props.language（同 Blocks 区 code-block 页）。 */
function LanguageSelect(editor: K3Editor) {
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
      {LANGS.map((l) => (
        <option key={l} value={l}>
          {l}
        </option>
      ))}
    </select>
  );
}

/* ---------------------------------- 页面 ---------------------------------- */

export default function CodeBlocks() {
  return (
    <DocsShell
      crumbs={["Docs", "Features", "Code blocks"]}
      title="Code blocks."
      lead="代码块渲染在凹陷井中：Prism 语法高亮、等宽字体、语言切换、悬停淡入的复制按钮。"
    >
      <H2 id="anatomy">构成。</H2>
      <P>
        代码块持有 <InlineCode>props.language</InlineCode>（默认{" "}
        <InlineCode>"text"</InlineCode>），右上角为语言 select。内置 Prism
        语法高亮（13 种语言子集，按需动态加载，不进主包）：高亮层与可编辑层
        叠加渲染，编辑体验与纯文本一致。主体渲染于{" "}
        <InlineCode>--surface-inset</InlineCode> 凹陷井，复制按钮在 hover
        时以 150ms 淡入，点击复制纯文本。token 配色由{" "}
        <InlineCode>--k3-code-*</InlineCode> CSS 变量驱动，可在编辑器根覆盖
        （见示例 Code block theme）。
      </P>

      <H2 id="demo">在线体验。</H2>
      <P>用控制条上的语言 select 试试——它直接调用 updateBlock 改写 props.language。</P>
      <LiveDemo
        className="mt-4"
        seed={DEMO_DOC}
        barExtra={LanguageSelect}
        hints={[
          { keys: ["Enter"], text: "块内换行" },
          { keys: ["⌘", "Enter"], text: "跳出代码块" },
          { text: "hover 右上角复制" },
        ]}
      />

      <H2 id="keyboard">键盘行为。</H2>
      <DocTable
        columns={["输入", "行为"]}
        rows={[
          [<span className="flex gap-1"><Kbd>Enter</Kbd></span>, "代码块内换行（不拆块）"],
          [<span className="flex gap-1"><Kbd>⌘</Kbd><Kbd>Enter</Kbd></span>, "跳出代码块，在下方新增段落"],
          [<span className="flex gap-1"><Kbd>```</Kbd><Kbd>Enter</Kbd></span>, "空块行首输入：转换为代码块"],
          [<span className="flex gap-1"><Kbd>`</Kbd></span>, "`code` 行内规则：段内行内代码"],
        ]}
      />
      <Callout className="mt-4">
        多行文本粘贴进代码块不会按行拆块——默认粘贴行为在代码块内部保持原样插入。
      </Callout>

      <CardStrip
        className="mt-14"
        cards={[
          { to: "/blocks/code-block", title: "Code Block", description: "代码块专页：props 表与创建方式。" },
          { to: "/docs/features/diagrams", title: "Diagrams", description: "Mermaid 图表块同样以围栏代码块导出。" },
        ]}
      />
    </DocsShell>
  );
}
