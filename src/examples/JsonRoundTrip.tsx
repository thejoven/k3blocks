/**
 * json-round-trip — 导出 JSON → 清空 → 导入复原，证明 JSON 即无损存储格式。
 */
import { useState } from "react";
import { Download } from "lucide-react";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";
import { replaceDocument, sampleDocument } from "@/lib/sampleDoc";
import { CopyButton, GhostButton, PanelLabel } from "./shared";

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useState } from "react";
import { useK3Editor, K3EditorView } from "@thejoven_com/k3blocks";

export default function App() {
  const editor = useK3Editor({ initialContent: doc });
  const [exported, setExported] = useState<Block[] | null>(null);

  const exportJson = () => setExported(editor.document);          // 快照
  const clear = () =>
    editor.removeBlocks(editor.document.map((b) => b.id));        // 清空
  const importJson = () => {
    if (!exported) return;
    editor.removeBlocks(editor.document.map((b) => b.id));
    editor.insertBlocks(exported);                                // 无损复原
  };

  return (
    <>
      <K3EditorView editor={editor} />
      <button onClick={exportJson}>Export JSON</button>
      <button onClick={clear}>Clear</button>
      <button onClick={importJson}>Import</button>
      <pre>{exported && JSON.stringify(exported, null, 2)}</pre>
    </>
  );
}`,
  },
];

export default function JsonRoundTrip({ theme }: { theme?: "light" | "dark" }) {
  const editor = useK3Editor({ initialContent: sampleDocument().slice(0, 6) });
  const [exported, setExported] = useState<Block[] | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [, setTick] = useState(0);

  const exportJson = () => {
    setExported(JSON.parse(JSON.stringify(editor.document)));
    setNote("已导出当前文档快照");
  };
  const clear = () => {
    editor.removeBlocks(editor.document.map((b) => b.id));
    setTick((v) => v + 1);
    setNote(exported ? "文档已清空 — 点 Import 复原" : "文档已清空");
  };
  const importJson = () => {
    if (!exported) return;
    replaceDocument(editor, exported);
    // 无损校验：导入后与导出快照逐字节一致
    const same =
      JSON.stringify(editor.document.map(({ id, ...rest }) => rest)) ===
      JSON.stringify(exported.map(({ id, ...rest }) => rest));
    setTick((v) => v + 1);
    setNote(same ? "导入完成 — 与导出快照逐字节一致 ✓" : "导入完成");
  };
  const download = () => {
    if (!exported) return;
    const blob = new Blob([JSON.stringify(exported, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "k3blocks-document.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid md:grid-cols-[minmax(0,1fr)_340px]">
      <div className="px-6 py-10 md:px-10">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <PanelLabel>EDITOR</PanelLabel>
          <span className="flex-1" />
          <GhostButton onClick={exportJson}>Export JSON</GhostButton>
          <GhostButton onClick={clear}>Clear</GhostButton>
          <GhostButton onClick={importJson} disabled={!exported}>
            Import
          </GhostButton>
        </div>
        <K3EditorView editor={editor} theme={theme} />
        {note && <p className="mt-6 font-mono text-[12px] text-text-3">{note}</p>}
      </div>
      <div className="border-t border-border md:border-l md:border-t-0">
        <div className="flex h-9 items-center justify-between border-b border-border px-4">
          <PanelLabel>EXPORTED JSON</PanelLabel>
          {exported && (
            <span className="flex items-center gap-2">
              <CopyButton text={JSON.stringify(exported, null, 2)} />
              <GhostButton onClick={download}>
                <Download size={13} strokeWidth={1.5} />
                .json
              </GhostButton>
            </span>
          )}
        </div>
        {exported ? (
          <pre className="max-h-[420px] overflow-auto p-4 font-mono text-[12px] leading-[1.7] text-text-3">
            {JSON.stringify(exported, null, 2)}
          </pre>
        ) : (
          <p className="p-4 font-mono text-[12px] text-text-4">
            点 Export JSON 生成快照…
          </p>
        )}
      </div>
    </div>
  );
}
