/**
 * displaying-selected-blocks — editor.onSelectionChange 驱动右侧面板：
 * 实时显示选区覆盖的块 id 与 type 列表；无选区时显示空态。
 */
import { useEffect, useState } from "react";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { K3Selection } from "@/k3blocks";
import { sampleDocument } from "@/lib/sampleDoc";
import { PanelLabel } from "./shared";

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useEffect, useState } from "react";
import { useK3Editor, K3EditorView } from "@k3/blocks";
import type { K3Selection } from "@k3/blocks";

export default function App() {
  const editor = useK3Editor({ initialContent: doc });
  const [sel, setSel] = useState<K3Selection | null>(null);

  // 选区（含折叠光标）在编辑器内时实时上报覆盖块 id 集；移出时回调 null
  useEffect(() => editor.onSelectionChange(setSel), [editor]);

  return (
    <div className="grid grid-cols-2">
      <K3EditorView editor={editor} />
      {sel ? (
        <ul>
          {sel.blockIds.map((id) => (
            <li key={id}>
              {id} — {editor.getBlock(id)?.type}
            </li>
          ))}
        </ul>
      ) : (
        <p>点击或拖选编辑器内容…</p>
      )}
    </div>
  );
}`,
  },
];

export default function DisplayingSelectedBlocks({ theme }: { theme?: "light" | "dark" }) {
  const editor = useK3Editor({ initialContent: sampleDocument().slice(0, 9) });
  const [sel, setSel] = useState<K3Selection | null>(null);

  useEffect(() => editor.onSelectionChange(setSel), [editor]);

  return (
    <div className="grid md:grid-cols-[minmax(0,1fr)_340px]">
      <div className="px-6 py-10 md:px-10">
        <div className="mb-6">
          <PanelLabel>EDITOR — 点击或拖选</PanelLabel>
        </div>
        <K3EditorView editor={editor} theme={theme} />
      </div>
      <div className="border-t border-border md:border-l md:border-t-0">
        <div className="flex h-9 items-center justify-between border-b border-border px-4">
          <PanelLabel>SELECTION</PanelLabel>
          <span className="font-mono text-[11px] text-text-4">
            {sel ? `${sel.blockIds.length} block(s)` : "—"}
          </span>
        </div>
        {sel ? (
          <ul className="max-h-[420px] overflow-auto p-4">
            {sel.blockIds.map((id) => (
              <li
                key={id}
                className="flex items-center justify-between border-b border-border py-2 font-mono text-[12px] last:border-b-0"
              >
                <span className="text-text-2">{id}</span>
                <span className="text-text-4">{editor.getBlock(id)?.type ?? "?"}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-4 font-mono text-[12px] text-text-4">
            选区不在编辑器内——点击或拖选任意块。
          </p>
        )}
      </div>
    </div>
  );
}
