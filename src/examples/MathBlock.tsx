/**
 * math-block — 内置 math 块（KaTeX displayMode）演示：3 个公式种子，
 * 点击渲染态进入编辑态改 latex，失焦 / ⌘Enter 实时重渲染。
 */
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";
import { PanelLabel } from "./shared";

function mathDoc(): Block[] {
  return [
    {
      id: "ma-1",
      type: "paragraph",
      props: {},
      content: [
        { type: "text" as const, text: "点击任意公式进入编辑态，修改 LaTeX 后失焦（或 " },
        { type: "text" as const, text: "⌘/Ctrl+Enter", styles: { code: true } },
        { type: "text" as const, text: "）重新渲染，Esc 放弃。" },
      ],
      children: [],
    },
    { id: "ma-2", type: "math", props: { latex: "E = mc^2" }, content: [], children: [] },
    {
      id: "ma-3",
      type: "math",
      props: { latex: "\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}" },
      content: [],
      children: [],
    },
    {
      id: "ma-4",
      type: "math",
      props: {
        latex: "\\int_0^\\infty e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}, \\quad A = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}",
      },
      content: [],
      children: [],
    },
    { id: "ma-5", type: "paragraph", props: {}, content: [], children: [] },
  ];
}

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useK3Editor, K3EditorView } from "@thejoven_com/k3blocks";

const doc = [
  // math 块：props.latex 为 KaTeX 展示模式（displayMode）源码
  { id: "m1", type: "math", props: { latex: "E = mc^2" }, content: [], children: [] },
  { id: "m2", type: "math", props: { latex: "\\\\sum_{i=1}^{n} i = \\\\frac{n(n+1)}{2}" }, content: [], children: [] },
];

export default function App() {
  const editor = useK3Editor({ initialContent: doc });
  // 斜杠菜单 Media 组「数学公式」也可插入；Markdown 导出为 $$...$$ 围栏
  return <K3EditorView editor={editor} />;
}`,
  },
];

export default function MathBlock({ theme }: { theme?: "light" | "dark" }) {
  const editor = useK3Editor({ initialContent: mathDoc() });

  return (
    <div>
      <div className="px-6 py-10 md:px-10">
        <div className="mb-6">
          <PanelLabel>EDITOR — KaTeX 公式块</PanelLabel>
        </div>
        <K3EditorView editor={editor} theme={theme} />
      </div>
      <p className="border-t border-border px-6 py-3 font-mono text-[12px] leading-[1.7] text-text-4 md:px-10">
        渲染失败不抛异常——显示原始源码 + 红色小标。Markdown 导出为 $$…$$ 围栏；
        支持 KaTeX 子集（env 差异以 KaTeX 为准），暂无行内公式块。
      </p>
    </div>
  );
}
