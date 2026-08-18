/**
 * K3Blocks — 列表类块渲染器：bulletListItem / numberedListItem / checkListItem。
 */
import { Check } from "lucide-react";
import { EditableContent } from "./EditableContent";
import type { BlockRendererProps } from "./textBlocks";

export function BulletListItemBlock({ ctx, block }: BlockRendererProps) {
  return (
    <div className="k3-list-item">
      <span className="k3-marker k3-bullet" aria-hidden>
        •
      </span>
      <EditableContent ctx={ctx} block={block} className="k3-list-content" />
    </div>
  );
}

export function NumberedListItemBlock({ ctx, block, order }: BlockRendererProps) {
  return (
    <div className="k3-list-item">
      <span className="k3-marker k3-number" aria-hidden>
        {order}.
      </span>
      <EditableContent ctx={ctx} block={block} className="k3-list-content" />
    </div>
  );
}

export function CheckListItemBlock({ ctx, block }: BlockRendererProps) {
  const checked = !!block.props.checked;
  return (
    <div className={`k3-list-item k3-check-item${checked ? " k3-checked" : ""}`}>
      <button
        type="button"
        className="k3-checkbox"
        role="checkbox"
        aria-checked={checked}
        tabIndex={-1}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          if (!ctx.editable) return;
          ctx.editor.updateBlock(block.id, { props: { checked: !checked } });
        }}
      >
        {checked ? <Check size={12} strokeWidth={3} /> : null}
      </button>
      <EditableContent ctx={ctx} block={block} className="k3-list-content" />
    </div>
  );
}
