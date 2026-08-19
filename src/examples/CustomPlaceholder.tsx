/**
 * custom-placeholder — 占位符与空文档状态定制。
 */
import { useK3Editor, K3EditorView } from "@/k3blocks";
import { PanelLabel } from "./shared";

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useK3Editor, K3EditorView } from "@thejoven_com/k3blocks";

export default function App() {
  const editor = useK3Editor({
    placeholder: "开始你的 RFC… 输入 '/' 插入块",  // 定制占位符
  });
  return (
    <div className="rfc-page">
      <K3EditorView editor={editor} />
    </div>
  );
}`,
  },
  {
    name: "styles.css",
    language: "css",
    code: `.rfc-page {
  /* 空文档的 call-to-action 容器 */
  border: 1px dashed var(--border);
  border-radius: 8px;
  padding: 48px 24px;
}`,
  },
];

export default function CustomPlaceholder({ theme }: { theme?: "light" | "dark" }) {
  const editor = useK3Editor({
    placeholder: "开始你的 RFC… 输入 '/' 插入块",
  });

  return (
    <div className="px-6 py-12 md:px-16">
      <div className="mx-auto max-w-prose">
        <div className="mb-8 text-center">
          <PanelLabel>EMPTY STATE — placeholder prop</PanelLabel>
        </div>
        {/* 空文档 call-to-action 容器：dashed hairline 框 */}
        <div className="rounded-lg border border-dashed border-border px-6 py-12">
          <K3EditorView
            editor={editor}
            theme={theme}
            placeholder="开始你的 RFC… 输入 '/' 插入块"
          />
        </div>
        <p className="mt-4 text-center font-mono text-[12px] text-text-4">
          placeholder=&#34;开始你的 RFC… 输入 &#39;/&#39; 插入块&#34;
        </p>
      </div>
    </div>
  );
}
