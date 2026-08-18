/**
 * diagram-block — 内置 diagram 块（Mermaid，动态 import）演示：flowchart 种子 +
 * 外置按钮把 code 切换为 sequenceDiagram / gantt（updateBlock 回写）；
 * 块内「编辑源码」改 code 后重渲染。
 */
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";
import { GhostButton, PanelLabel } from "./shared";

const DIAGRAMS: Record<string, string> = {
  flowchart: `flowchart LR
  A[用户输入] --> B{合法?}
  B -- 是 --> C[更新文档]
  B -- 否 --> D[忽略]
  C --> E[触发 onChange]`,
  sequenceDiagram: `sequenceDiagram
  participant U as 用户
  participant E as 编辑器
  participant S as 宿主
  U->>E: 输入文字
  E->>S: onChange(document)
  S-->>E: 持久化 JSON`,
  gantt: `gantt
  title v4 发布计划
  dateFormat YYYY-MM-DD
  section 引擎
  mentions       :a1, 2025-01-01, 14d
  font style     :a2, after a1, 10d
  section 块
  pdf block      :b1, 2025-01-20, 7d`,
};

function diagramDoc(): Block[] {
  return [
    {
      id: "dg-1",
      type: "paragraph",
      props: {},
      content: [
        { type: "text" as const, text: "用上方按钮把整个 diagram 块切换为别的图源码，或点块内「编辑源码」直接改——" },
        { type: "text" as const, text: "props.code", styles: { code: true } },
        { type: "text" as const, text: " 变更即重渲染。" },
      ],
      children: [],
    },
    { id: "dg-2", type: "diagram", props: { code: DIAGRAMS.flowchart }, content: [], children: [] },
    { id: "dg-3", type: "paragraph", props: {}, content: [], children: [] },
  ];
}

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useK3Editor, K3EditorView } from "@k3/blocks";

const doc = [
  // diagram 块：props.code 为 Mermaid 源码；mermaid 动态 import，不进首屏 bundle
  { id: "d1", type: "diagram", props: { code: "flowchart LR\\n  A-->B" }, content: [], children: [] },
];

export default function App() {
  const editor = useK3Editor({ initialContent: doc });
  return (
    <>
      {/* 外置按钮换图：updateBlock 写回 props.code 即重渲染 */}
      <button onClick={() =>
        editor.updateBlock("d1", { props: { code: "sequenceDiagram\\n  A->>B: hi" } })
      }>
        换成时序图
      </button>
      <K3EditorView editor={editor} />
    </>
  );
}`,
  },
];

export default function DiagramBlock({ theme }: { theme?: "light" | "dark" }) {
  const editor = useK3Editor({ initialContent: diagramDoc() });

  const swap = (code: string) => editor.updateBlock("dg-2", { props: { code } });

  return (
    <div>
      <div className="flex h-11 flex-wrap items-center gap-2 border-b border-border px-4">
        <PanelLabel>SWAP SOURCE — updateBlock</PanelLabel>
        <div className="ml-auto flex items-center gap-2">
          <GhostButton onClick={() => swap(DIAGRAMS.flowchart)}>flowchart</GhostButton>
          <GhostButton onClick={() => swap(DIAGRAMS.sequenceDiagram)}>sequenceDiagram</GhostButton>
          <GhostButton onClick={() => swap(DIAGRAMS.gantt)}>gantt</GhostButton>
        </div>
      </div>
      <div className="px-6 py-10 md:px-10">
        <K3EditorView editor={editor} theme={theme} />
      </div>
      <p className="border-t border-border px-6 py-3 font-mono text-[12px] leading-[1.7] text-text-4 md:px-10">
        mermaid 按需动态加载（首次渲染有短暂空白帧），主题跟随 data-theme；
        securityLevel: "strict"（图内 HTML / 脚本禁用）；渲染失败显示 mono 错误条而不炸页面；
        Markdown 导出为 ```mermaid 围栏。
      </p>
    </div>
  );
}
