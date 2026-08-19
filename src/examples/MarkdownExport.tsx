/**
 * markdown-export — blocksToMarkdown() 一键导出，旁栏实时预览。
 */
import { useState } from "react";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import { sampleDocument } from "@/lib/sampleDoc";
import { CopyButton, PanelLabel } from "./shared";

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useState } from "react";
import { useK3Editor, K3EditorView } from "@thejoven_com/k3blocks";

export default function App() {
  const [markdown, setMarkdown] = useState("");
  const editor = useK3Editor({
    initialContent: doc,
    onChange: (e) => setMarkdown(e.blocksToMarkdown()), // 实时导出
  });

  return (
    <div className="grid grid-cols-2">
      <K3EditorView editor={editor} />
      <pre>{markdown}</pre>
    </div>
  );
}`,
  },
];

export default function MarkdownExport({ theme }: { theme?: "light" | "dark" }) {
  const [markdown, setMarkdown] = useState("");
  const editor = useK3Editor({
    initialContent: sampleDocument(),
    onChange: (e) => setMarkdown(e.blocksToMarkdown()),
  });
  // 首次渲染也展示初始文档的 Markdown
  const shown = markdown || editor.blocksToMarkdown();

  return (
    <div className="grid md:grid-cols-2">
      <div className="px-6 py-10 md:px-8">
        <div className="mb-6">
          <PanelLabel>EDITOR</PanelLabel>
        </div>
        <K3EditorView editor={editor} theme={theme} />
      </div>
      <div className="border-t border-border md:border-l md:border-t-0">
        <div className="flex h-9 items-center justify-between border-b border-border px-4">
          <PanelLabel>MARKDOWN — blocksToMarkdown()</PanelLabel>
          <CopyButton text={shown} />
        </div>
        <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap p-4 font-mono text-[12px] leading-[1.7] text-text-2">
          {shown}
        </pre>
      </div>
    </div>
  );
}
