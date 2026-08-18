/**
 * /docs/features/math — math 块：latex 编辑/渲染双态、KaTeX 子集、
 * 失败降级显示、$$ 导出；live demo（E=mc^2 + 求和/矩阵公式）。
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
  MonoCell,
  P,
} from "@/components/docs/primitives";
import type { Block } from "@/k3blocks";

/* ------------------------------- live demo ------------------------------- */

const DEMO_DOC: Block[] = [
  { id: "ma1", type: "math", props: { latex: "E = mc^2" }, content: [], children: [] },
  {
    id: "ma2",
    type: "math",
    props: { latex: "\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}" },
    content: [],
    children: [],
  },
  {
    id: "ma3",
    type: "math",
    props: { latex: "A = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}" },
    content: [],
    children: [],
  },
  { id: "ma4", type: "paragraph", props: {}, content: [], children: [] },
];

/* ---------------------------------- 页面 ---------------------------------- */

const MD_CODE = `$$
E = mc^2
$$`;

export default function MathEquations() {
  return (
    <DocsShell
      crumbs={["Docs", "Features", "Math equations"]}
      title="Math equations."
      lead="数学公式块以 KaTeX 展示模式渲染 props.latex——渲染态与编辑态双态切换，渲染失败时优雅降级。"
    >
      <H2 id="two-states">编辑 / 渲染双态。</H2>
      <P>
        渲染态右上角常驻 mono <MonoCell>TeX</MonoCell> 小标；可编辑时点击公式进入编辑态——
        mono inset 输入框改写 <InlineCode>props.latex</InlineCode>，失焦或{" "}
        <Kbd>⌘</Kbd>+<Kbd>Enter</Kbd> 回到渲染态，<Kbd>Esc</Kbd> 放弃修改。
        斜杠菜单 <InlineCode>/math</InlineCode>（别名{" "}
        <InlineCode>katex/latex/公式/gongshi</InlineCode>）插入种子 <InlineCode>E = mc^2</InlineCode>。
      </P>

      <H2 id="demo">在线体验。</H2>
      <P>点击任意公式进入编辑态改两行 LaTeX；试试删出一个语法错误，看降级行为。</P>
      <LiveDemo
        className="mt-4"
        seed={DEMO_DOC}
        hints={[
          { text: "点击公式进入编辑态" },
          { keys: ["⌘", "Enter"], text: "提交并渲染" },
          { keys: ["Esc"], text: "放弃修改" },
        ]}
      />

      <H2 id="katex-subset">KaTeX 子集。</H2>
      <P>
        渲染依赖 <InlineCode>katex</InlineCode>（<InlineCode>katex.min.css</InlineCode>{" "}
        随块组件引入），以 <InlineCode>displayMode: true</InlineCode>
        展示。支持 KaTeX 的全部命令子集——上下标、分式、根号、求和、希腊字母与矩阵环境
        （<InlineCode>pmatrix</InlineCode> 等）均可使用；具体差异以 KaTeX 官方支持表为准。
        组件没有行内公式块，公式总是独立成块。
      </P>
      <Callout className="mt-4" title="渲染失败不炸页面">
        LaTeX 语法错误时块不抛异常：原位显示原始源码，并附红色小标提示（字典键{" "}
        <InlineCode>math.renderError</InlineCode>），修正后自动恢复渲染。
      </Callout>

      <H2 id="markdown-export">Markdown 导出。</H2>
      <P>
        <InlineCode>blocksToMarkdown()</InlineCode> 将公式块导出为 <InlineCode>$$</InlineCode> 围栏：
      </P>
      <CodeBlock className="mt-4" code={MD_CODE} language="markdown" />

      <CardStrip
        className="mt-14"
        cards={[
          { to: "/docs/features/tables", title: "Tables", description: "表格块：props.rows 与工具条交互。" },
          { to: "/docs/features/diagrams", title: "Diagrams", description: "Mermaid 图表块：动态加载与主题跟随。" },
        ]}
      />
    </DocsShell>
  );
}
