/**
 * K3Blocks — 分栏块渲染器：columnList / column。
 * 容器自身无可编辑内容；布局由 K3EditorView 的子块容器类名承担：
 * columnList 的子块包进 .k3-columns（CSS grid 均分 N 栏），
 * column 的子块包进 .k3-column-blocks（无缩进垂直堆叠）。
 * 窄屏（<768px）由 CSS 退化为单列堆叠。
 */
import type { BlockRendererProps } from "./textBlocks";

export function ColumnListBlock(_props: BlockRendererProps) {
  return null;
}

export function ColumnBlock(_props: BlockRendererProps) {
  return null;
}
