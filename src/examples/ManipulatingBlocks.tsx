/**
 * manipulating-blocks — 外置按钮条驱动公共 API：在选中块后插入 / 更新当前块 /
 * 删除末块 / 复制首块 / Undo / Redo（按 canUndo/canRedo 禁用）。
 */
import { useState } from "react";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";
import { sampleDocument } from "@/lib/sampleDoc";
import { GhostButton, PanelLabel } from "./shared";

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useK3Editor, K3EditorView } from "@k3/blocks";

export default function App() {
  const editor = useK3Editor({ initialContent: doc });

  const insertAfterSelection = () => {
    const sel = editor.getSelection()?.blockIds[0];
    editor.insertBlocks(
      [{ type: "paragraph", content: "新段落" }],
      sel ?? null,          // 无选区则追加到文末
      "after",
    );
  };
  const updateCurrent = () => {
    const sel = editor.getSelection()?.blockIds[0];
    if (sel) editor.updateBlock(sel, { content: "已更新" });
  };

  return (
    <>
      <button onClick={insertAfterSelection}>在选中块后插入</button>
      <button onClick={updateCurrent}>更新当前块</button>
      <button onClick={() => editor.undo()} disabled={!editor.canUndo}>Undo</button>
      <button onClick={() => editor.redo()} disabled={!editor.canRedo}>Redo</button>
      <K3EditorView editor={editor} />
    </>
  );
}`,
  },
];

export default function ManipulatingBlocks({ theme }: { theme?: "light" | "dark" }) {
  const [, setTick] = useState(0);
  const editor = useK3Editor({
    initialContent: sampleDocument().slice(0, 6),
    onChange: () => setTick((v) => v + 1), // 文档变更后重渲染按钮禁用态
  });
  const [note, setNote] = useState<string | null>(null);

  /** 当前块 = 选区覆盖的第一个块；无选区时回退到末块。 */
  const currentId = (): string | null =>
    editor.getSelection()?.blockIds[0] ??
    editor.document[editor.document.length - 1]?.id ??
    null;

  const insertAfterSelection = () => {
    const refId = currentId();
    const [b] = editor.insertBlocks(
      [{ type: "paragraph", content: [{ type: "text", text: "通过 insertBlocks 插入的新段落。" }] }],
      refId,
      "after",
    );
    setNote(`已在 ${refId ?? "文末"} 后插入 ${b.id}`);
  };

  const updateCurrent = () => {
    const id = currentId();
    if (!id) return;
    editor.updateBlock(id, {
      content: [{ type: "text", text: `此块已被 updateBlock 改写（${new Date().toLocaleTimeString()}）。` }],
    });
    setNote(`已更新块 ${id}`);
  };

  const removeLast = () => {
    const last = editor.document[editor.document.length - 1];
    if (!last) return;
    editor.removeBlocks([last.id]);
    setNote(`已删除末块 ${last.id}`);
  };

  const duplicateFirst = () => {
    const first = editor.document[0];
    if (!first) return;
    const clone: Block = JSON.parse(JSON.stringify(first));
    delete (clone as { id?: string }).id; // 让引擎生成新 id
    editor.insertBlocks([clone], first.id, "after");
    setNote(`已复制首块 ${first.id}`);
  };

  return (
    <div className="px-6 py-10 md:px-16">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <PanelLabel>BLOCK OPS</PanelLabel>
        <span className="flex-1" />
        <GhostButton onClick={insertAfterSelection}>在选中块后插入</GhostButton>
        <GhostButton onClick={updateCurrent}>更新当前块文本</GhostButton>
        <GhostButton onClick={removeLast}>删除末块</GhostButton>
        <GhostButton onClick={duplicateFirst}>复制首块</GhostButton>
        <GhostButton onClick={() => editor.undo()} disabled={!editor.canUndo}>
          Undo
        </GhostButton>
        <GhostButton onClick={() => editor.redo()} disabled={!editor.canRedo}>
          Redo
        </GhostButton>
      </div>
      <K3EditorView editor={editor} theme={theme} />
      <p className="mt-6 font-mono text-[12px] text-text-4">
        {note ?? "先在编辑器里点击一个块（建立选区），再点上方按钮。"}
      </p>
    </div>
  );
}
