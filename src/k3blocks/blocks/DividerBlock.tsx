/**
 * K3Blocks — divider：1px 发丝线，24px 垂直节奏；可选中（accent 描边），
 * 选中后 Backspace/Delete 删除。
 */
import type { BlockRendererProps } from "./textBlocks";

export function DividerBlock({ ctx, block }: BlockRendererProps) {
  const selected = ctx.selectedId === block.id;
  return (
    <div
      className={`k3-divider-wrap${selected ? " k3-divider-selected" : ""}`}
      onMouseDown={(e) => {
        if (!ctx.editable) return;
        e.preventDefault();
        ctx.setSelectedId(selected ? null : block.id);
      }}
    >
      <div className="k3-divider" />
    </div>
  );
}
