/**
 * K3Blocks — 纯文本类块渲染器：paragraph / heading / quote。
 */
import { EditableContent } from "./EditableContent";
import type { Block } from "../types";
import type { ViewContext } from "../viewContext";

export interface BlockRendererProps {
  ctx: ViewContext;
  block: Block;
  /** 同级中作为有序列表的序号（从 1 开始；非有序列表为 0） */
  order: number;
}

export function ParagraphBlock({ ctx, block }: BlockRendererProps) {
  return (
    <EditableContent
      ctx={ctx}
      block={block}
      className="k3-paragraph"
      placeholder={ctx.editable ? ctx.placeholder : undefined}
    />
  );
}

export function HeadingBlock({ ctx, block }: BlockRendererProps) {
  const level = Math.min(3, Math.max(1, Number(block.props.level) || 1));
  return <EditableContent ctx={ctx} block={block} className={`k3-heading k3-h${level}`} />;
}

export function QuoteBlock({ ctx, block }: BlockRendererProps) {
  return (
    <div className="k3-quote">
      <EditableContent ctx={ctx} block={block} />
    </div>
  );
}
