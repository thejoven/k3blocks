/**
 * displaying-document-json — 编辑器 + 右侧实时 pretty JSON 面板。
 * editor.onChange 订阅驱动 JSON 刷新；onSelectionChange 高亮当前块 id/type。
 */
import { useEffect, useState } from "react";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";
import { countBlocks, sampleDocument } from "@/lib/sampleDoc";
import { CopyButton, PanelLabel } from "./shared";

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useEffect, useState } from "react";
import { useK3Editor, K3EditorView } from "@thejoven_com/k3blocks";

export default function App() {
  const editor = useK3Editor({ initialContent: doc });
  const [json, setJson] = useState(() => JSON.stringify(editor.document, null, 2));

  // 订阅文档变更：每次击键都刷新右侧 JSON
  useEffect(
    () => editor.onChange((e) => setJson(JSON.stringify(e.document, null, 2))),
    [editor],
  );

  return (
    <div className="grid grid-cols-2">
      <K3EditorView editor={editor} />
      <pre>{json}</pre>
    </div>
  );
}`,
  },
];

export default function DisplayingDocumentJson({ theme }: { theme?: "light" | "dark" }) {
  const editor = useK3Editor({ initialContent: sampleDocument().slice(0, 7) });
  const [json, setJson] = useState(() => JSON.stringify(editor.document, null, 2));
  const [current, setCurrent] = useState<Block | null>(null);

  useEffect(
    () => editor.onChange((e) => setJson(JSON.stringify(e.document, null, 2))),
    [editor],
  );

  // 当前块高亮：选区（含折叠光标）覆盖的第一个块
  useEffect(
    () =>
      editor.onSelectionChange((sel) => {
        const first = sel?.blockIds[0];
        setCurrent(first ? (editor.getBlock(first) ?? null) : null);
      }),
    [editor],
  );

  return (
    <div className="grid md:grid-cols-[minmax(0,1fr)_380px]">
      <div className="px-6 py-10 md:px-10">
        <div className="mb-6 flex items-center justify-between">
          <PanelLabel>EDITOR</PanelLabel>
          <span className="font-mono text-[11px] text-text-4">
            {current ? `当前块 ${current.id} · ${current.type}` : "点击任意块定位 JSON"}
          </span>
        </div>
        <K3EditorView editor={editor} theme={theme} />
      </div>
      <div className="border-t border-border md:border-l md:border-t-0">
        <div className="flex h-9 items-center justify-between border-b border-border px-4">
          <PanelLabel>DOCUMENT JSON — live</PanelLabel>
          <span className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-text-4">
              blocks: {countBlocks(editor.document)}
            </span>
            <CopyButton text={json} />
          </span>
        </div>
        <pre className="max-h-[480px] overflow-auto p-4 font-mono text-[12px] leading-[1.7] text-text-3">
          {json}
        </pre>
      </div>
    </div>
  );
}
