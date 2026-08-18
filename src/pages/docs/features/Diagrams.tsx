/**
 * /docs/features/diagrams — diagram 块：mermaid 源码/渲染双态、主题跟随、
 * 动态加载说明；live demo（flowchart 种子 + 切换 sequenceDiagram 示例按钮）。
 */
import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import Kbd from "@/components/Kbd";
import DocsShell from "@/components/docs/DocsShell";
import LiveDemo from "@/components/docs/LiveDemo";
import {
  CardStrip,
  H2,
  InlineCode,
  P,
} from "@/components/docs/primitives";
import type { Block, K3Editor } from "@/k3blocks";

/* ------------------------------- live demo ------------------------------- */

const FLOWCHART = `flowchart LR
  A[草稿] --> B{评审}
  B -->|通过| C[发布]
  B -->|打回| A`;

const SEQUENCE = `sequenceDiagram
  participant U as 用户
  participant E as 编辑器
  U->>E: 输入 mermaid 源码
  E-->>U: 渲染 SVG`;

const DEMO_DOC: Block[] = [
  { id: "dg1", type: "diagram", props: { code: FLOWCHART }, content: [], children: [] },
  { id: "dg2", type: "paragraph", props: {}, content: [], children: [] },
];

/** 控制条按钮：flowchart / sequenceDiagram 示例互换（updateBlock 回写 props.code）。 */
function DiagramSwitcher(editor: K3Editor) {
  const block = editor.document.find((x) => x.type === "diagram");
  if (!block) return null;
  const isFlow = String(block.props.code).startsWith("flowchart");
  return (
    <button
      type="button"
      onClick={() =>
        editor.updateBlock(block.id, {
          props: { ...block.props, code: isFlow ? SEQUENCE : FLOWCHART },
        })
      }
      className="flex h-7 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[12px] text-text-2 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-1"
    >
      {isFlow ? "换成 sequenceDiagram" : "换成 flowchart"}
    </button>
  );
}

/* ---------------------------------- 页面 ---------------------------------- */

const MD_CODE = "```mermaid\nflowchart LR\n  A --> B\n```";

export default function Diagrams() {
  return (
    <DocsShell
      crumbs={["Docs", "Features", "Diagrams"]}
      title="Diagrams."
      lead="图表块以 Mermaid 源码描述图形、渲染为 SVG——mermaid 按需动态加载，不进首屏 bundle。"
    >
      <H2 id="two-states">源码 / 渲染双态。</H2>
      <P>
        图表块持有 <InlineCode>props.code</InlineCode>（Mermaid 源码）。渲染态渲染 SVG，右上「
        编辑源码」按钮进入编辑态：mono textarea（inset 深底），
        <Kbd>⌘</Kbd>+<Kbd>Enter</Kbd> 或失焦提交并重渲染，<Kbd>Esc</Kbd> 放弃。
        斜杠菜单 <InlineCode>/diagram</InlineCode>（别名{" "}
        <InlineCode>mermaid/图表/tubiao</InlineCode>）插入 flowchart 种子。
      </P>

      <H2 id="demo">在线体验。</H2>
      <P>用控制条按钮在 flowchart 与 sequenceDiagram 示例间切换，或直接编辑源码。</P>
      <LiveDemo
        className="mt-4"
        seed={DEMO_DOC}
        barExtra={DiagramSwitcher}
        hints={[
          { text: "「编辑源码」改写 mermaid" },
          { keys: ["⌘", "Enter"], text: "提交并重渲染" },
          { keys: ["Esc"], text: "放弃修改" },
        ]}
      />

      <H2 id="loading">动态加载与主题。</H2>
      <P>
        mermaid 经 <InlineCode>await import('mermaid')</InlineCode> 按需加载——首次渲染需下载
        mermaid chunk（有短暂空白帧），之后常驻缓存。渲染主题跟随当前{" "}
        <InlineCode>data-theme</InlineCode>：暗色用 <InlineCode>dark</InlineCode> 主题，亮色用{" "}
        <InlineCode>default</InlineCode>——切换 demo 主题即可看到 SVG 配色同步翻转。
      </P>
      <Callout className="mt-4" title="渲染失败与安全性">
        源码语法错误时块显示 mono 错误信息条（<InlineCode>diagram.renderError</InlineCode>
        前缀），不炸页面。渲染以 <InlineCode>securityLevel: "strict"</InlineCode>{" "}
        执行——图内 HTML 与脚本一律禁用。
      </Callout>

      <H2 id="markdown-export">Markdown 导出。</H2>
      <P>
        <InlineCode>blocksToMarkdown()</InlineCode> 将图表块导出为 mermaid 围栏代码块：
      </P>
      <CodeBlock className="mt-4" code={MD_CODE} language="markdown" />

      <CardStrip
        className="mt-14"
        cards={[
          { to: "/docs/features/math", title: "Math equations", description: "KaTeX 公式块：编辑/渲染双态。" },
          { to: "/docs/features/embeds", title: "Embeds", description: "embed 块：iframe 嵌入与链接识别。" },
        ]}
      />
    </DocsShell>
  );
}
