/**
 * controlled-editor — initialContent + onChange 受控模式：外部 React state
 * 实时同步（同时写入 localStorage），Load sample doc 演示由外向内的更新。
 */
import { useState } from "react";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";
import { countBlocks, replaceDocument, sampleDocument } from "@/lib/sampleDoc";
import { GhostButton, PanelLabel } from "./shared";

const STORAGE_KEY = "k3:example:controlled";

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useState } from "react";
import { useK3Editor, K3EditorView } from "@k3/blocks";

export default function App() {
  const [doc, setDoc] = useState(initialDoc);
  const editor = useK3Editor({
    initialContent: doc,
    onChange: (e) => {
      setDoc(e.document);                       // 每次击键同步外部 state
      localStorage.setItem("doc", JSON.stringify(e.document));
    },
  });

  const loadSample = () => {
    // 由外向内：用公共 API 整包替换文档
    editor.removeBlocks(editor.document.map((b) => b.id));
    editor.insertBlocks(sampleDoc);
  };

  return (
    <>
      <K3EditorView editor={editor} />
      <pre>{JSON.stringify(doc, null, 2)}</pre>
      <button onClick={loadSample}>Load sample doc</button>
    </>
  );
}`,
  },
];

export default function ControlledEditor({ theme }: { theme?: "light" | "dark" }) {
  const [doc, setDoc] = useState<Block[]>(() => sampleDocument().slice(0, 4));
  const editor = useK3Editor({
    initialContent: doc,
    onChange: (e) => {
      const next = e.document;
      setDoc(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // localStorage 不可用（隐私模式等）——跳过持久化
      }
    },
  });

  const loadSample = () => replaceDocument(editor, sampleDocument());

  return (
    <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_340px]">
      <div className="px-6 py-10 md:px-10">
        <div className="mb-6 flex items-center justify-between">
          <PanelLabel>EDITOR — controlled</PanelLabel>
          <GhostButton onClick={loadSample}>Load sample doc</GhostButton>
        </div>
        <K3EditorView editor={editor} theme={theme} />
      </div>
      <div className="border-t border-border md:border-l md:border-t-0">
        <div className="flex h-9 items-center justify-between border-b border-border px-4">
          <PanelLabel>EXTERNAL STATE</PanelLabel>
          <span className="font-mono text-[11px] text-text-4">
            blocks: {countBlocks(doc)}
          </span>
        </div>
        <pre className="max-h-[420px] overflow-auto p-4 font-mono text-[12px] leading-[1.7] text-text-3">
          {JSON.stringify(doc, null, 2)}
        </pre>
      </div>
    </div>
  );
}
