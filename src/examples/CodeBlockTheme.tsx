/**
 * code-block-theme — 用 CSS 变量覆盖代码高亮配色。
 * 左右对照：同一份 tsx 种子代码，左边默认主题，右边容器覆盖 --k3-code-* 变量
 * （string → 品牌橙 #e8590c，keyword → #0047ff，其余 token 同步换色）。
 */
import type { CSSProperties } from "react";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";
import { PanelLabel } from "./shared";

const SEED_CODE = `import { useK3Editor, K3EditorView } from "@k3/blocks";
import "@k3/blocks/style.css";

export default function App() {
  // 五行代码，接入编辑器
  const editor = useK3Editor({ onChange: (e) => save(e.document) });
  return <K3EditorView editor={editor} theme="dark" />;
}`;

/** 同一 tsx 种子代码 → 单个 codeBlock 的文档 */
const seedDocument = (): Block[] => [
  {
    id: "cb-1",
    type: "codeBlock",
    props: { language: "tsx" },
    content: [{ type: "text", text: SEED_CODE, styles: {} }],
    children: [],
  },
];

/** 定制高亮配色：在编辑器容器上覆盖 --k3-code-* 变量（不改组件、不改主题文件） */
const CUSTOM_CODE_VARS = {
  "--k3-code-keyword": "#0047ff",
  "--k3-code-string": "#e8590c",
  "--k3-code-comment": "#868e96",
  "--k3-code-function": "#9775fa",
  "--k3-code-number": "#ffa94d",
  "--k3-code-operator": "#66d9e8",
  "--k3-code-punctuation": "#adb5bd",
} as CSSProperties;

const CUSTOM_CSS = `.brand-code {
  /* 只覆盖高亮变量，其余主题令牌不动 */
  --k3-code-keyword: #0047ff;
  --k3-code-string: #e8590c; /* 品牌橙 */
  --k3-code-comment: #868e96;
  --k3-code-function: #9775fa;
  --k3-code-number: #ffa94d;
  --k3-code-operator: #66d9e8;
  --k3-code-punctuation: #adb5bd;
}`;

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useK3Editor, K3EditorView } from "@k3/blocks";
import "@k3/blocks/style.css";
import "./styles.css";

const doc = [
  {
    type: "codeBlock",
    props: { language: "tsx" },
    content: [{ type: "text", text: SEED_CODE }],
  },
];

export default function App() {
  const defaultEditor = useK3Editor({ initialContent: doc });
  const customEditor = useK3Editor({ initialContent: doc });

  return (
    <div className="grid md:grid-cols-2">
      {/* 默认主题 */}
      <K3EditorView editor={defaultEditor} theme="dark" />

      {/* 定制高亮：变量挂在容器上，随层叠作用于内部代码块 */}
      <div className="brand-code">
        <K3EditorView editor={customEditor} theme="dark" />
      </div>
    </div>
  );
}`,
  },
  { name: "styles.css", language: "css", code: CUSTOM_CSS },
];

function DemoEditor({ custom }: { custom?: boolean }) {
  const editor = useK3Editor({ initialContent: seedDocument() });
  return (
    <div
      className="rounded-lg border border-border p-4"
      style={{
        backgroundColor: "var(--surface-inset)",
        ...(custom ? CUSTOM_CODE_VARS : {}),
      }}
    >
      <K3EditorView editor={editor} theme="dark" />
    </div>
  );
}

export default function CodeBlockTheme(_props: { theme?: "light" | "dark" }) {
  return (
    <div className="px-6 py-10 md:px-16">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <PanelLabel>默认主题</PanelLabel>
            <span className="font-mono text-[11px] text-text-4">default tokens</span>
          </div>
          <DemoEditor />
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <PanelLabel>定制主题</PanelLabel>
            <span className="font-mono text-[11px] text-text-4">--k3-code-* overrides</span>
          </div>
          <DemoEditor custom />
        </div>
      </div>
      <p className="mt-4 font-mono text-[12px] text-text-4">
        string → #e8590c（品牌橙） · keyword → #0047ff —— 见 Code 面板的 styles.css
      </p>
    </div>
  );
}
