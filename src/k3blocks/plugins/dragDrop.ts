/**
 * K3Blocks — HTML5 拖拽排序辅助：根据指针 Y 坐标计算插入目标与指示位置。
 */

export interface DropTarget {
  id: string;
  placement: "before" | "after";
}

export function computeDropTarget(rootEl: HTMLElement, clientY: number, excludeId?: string | null): DropTarget | null {
  const rows = Array.from(rootEl.querySelectorAll<HTMLElement>(".k3-block-row[data-block-id]"));
  if (!rows.length) return null;
  for (const row of rows) {
    if (row.dataset.blockId === excludeId) continue;
    const r = row.getBoundingClientRect();
    if (clientY >= r.top - 3 && clientY <= r.bottom + 3) {
      return {
        id: row.dataset.blockId!,
        placement: clientY < r.top + r.height / 2 ? "before" : "after",
      };
    }
  }
  const first = rows[0];
  if (first.dataset.blockId !== excludeId && clientY < first.getBoundingClientRect().top) {
    return { id: first.dataset.blockId!, placement: "before" };
  }
  for (let i = rows.length - 1; i >= 0; i--) {
    if (rows[i].dataset.blockId !== excludeId) {
      return { id: rows[i].dataset.blockId!, placement: "after" };
    }
  }
  return null;
}
