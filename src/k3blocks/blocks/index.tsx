/**
 * K3Blocks — 块类型 → 渲染器映射（9 种 P0 块 + 分栏 + table/math/embed/diagram）。
 */
import type { ComponentType } from "react";
import { HeadingBlock, ParagraphBlock, QuoteBlock } from "./textBlocks";
import type { BlockRendererProps } from "./textBlocks";
import { BulletListItemBlock, CheckListItemBlock, NumberedListItemBlock } from "./ListItemBlocks";
import { CodeBlock } from "./CodeBlock";
import { DividerBlock } from "./DividerBlock";
import { ImageBlock } from "./ImageBlock";
import { ColumnBlock, ColumnListBlock } from "./ColumnBlocks";
import { TableBlock } from "./TableBlock";
import { MathBlock } from "./MathBlock";
import { EmbedBlock } from "./EmbedBlock";
import { DiagramBlock } from "./DiagramBlock";
import { PdfBlock } from "./PdfBlock";

export type { BlockRendererProps } from "./textBlocks";
export { EditableContent } from "./EditableContent";

export const BLOCK_RENDERERS: Record<string, ComponentType<BlockRendererProps>> = {
  paragraph: ParagraphBlock,
  heading: HeadingBlock,
  bulletListItem: BulletListItemBlock,
  numberedListItem: NumberedListItemBlock,
  checkListItem: CheckListItemBlock,
  quote: QuoteBlock,
  codeBlock: CodeBlock,
  divider: DividerBlock,
  image: ImageBlock,
  columnList: ColumnListBlock,
  column: ColumnBlock,
  table: TableBlock,
  math: MathBlock,
  embed: EmbedBlock,
  diagram: DiagramBlock,
  pdf: PdfBlock,
};
