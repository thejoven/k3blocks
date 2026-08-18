/**
 * K3Blocks — table：真实 <table>，props.rows 二维纯文本（首行为表头）。
 * 单元格 contenteditable（onInput 静默回写，打字合并历史）；块 hover 浮出
 * 右上角迷你工具条（28px）：+行 +列 −行 −列（保底至少 1 行 1 列）。
 * Tab → 下一格（行尾到下行首格，表尾新增一行）；Enter 忽略换行；
 * 首格为空时 Backspace 删除整块。
 * 已知限制：单元格不支持行内样式与嵌套块；列宽均分。
 */
import { useLayoutEffect, useRef } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { Minus, Plus } from "lucide-react";
import type { BlockRendererProps } from "./textBlocks";

/** 规整 rows：至少 1 行 1 列，矩形化（短行补空串） */
function normalizeRows(input: unknown): string[][] {
  const raw = Array.isArray(input) ? input : [];
  const rows = raw
    .filter((r) => Array.isArray(r))
    .map((r) => r.map((c) => (c == null ? "" : String(c))));
  if (!rows.length) rows.push([""]);
  const cols = Math.max(1, ...rows.map((r) => r.length));
  return rows.map((r) => (r.length < cols ? [...r, ...Array(cols - r.length).fill("")] : r));
}

interface CellProps {
  value: string;
  editable: boolean;
  header: boolean;
  registerRef: (key: string, el: HTMLElement | null) => void;
  cellKey: string;
  onInput: (value: string) => void;
  onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
}

/** 非受控单元格：聚焦期间以 DOM 为准（同 EditableContent 策略，避免光标跳动） */
function TableCell({ value, editable, header, registerRef, cellKey, onInput, onKeyDown }: CellProps) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const focused = document.activeElement === el;
    if (!focused && el.textContent !== value) el.textContent = value;
  });
  return (
    <div
      ref={(el) => {
        ref.current = el;
        registerRef(cellKey, el);
      }}
      className={`k3-table-cell${header ? " k3-table-cell-header" : ""}`}
      contentEditable={editable}
      suppressContentEditableWarning
      spellCheck={false}
      onInput={(e) => {
        e.stopPropagation();
        onInput((e.target as HTMLElement).textContent ?? "");
      }}
      onKeyDown={onKeyDown}
      onPaste={(e) => {
        // 纯文本粘贴（单元格不支持行内样式）
        e.stopPropagation();
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain").replace(/\s*\n+\s*/g, " ");
        if (text) document.execCommand("insertText", false, text);
      }}
    />
  );
}

export function TableBlock({ ctx, block }: BlockRendererProps) {
  const rows = normalizeRows(block.props.rows);
  const cellRefs = useRef(new Map<string, HTMLElement>());
  const pendingFocus = useRef<string | null>(null);
  const hovered = ctx.hoveredId === block.id;
  const dict = ctx.dict.table;

  useLayoutEffect(() => {
    const key = pendingFocus.current;
    if (!key) return;
    pendingFocus.current = null;
    const el = cellRefs.current.get(key);
    if (!el) return;
    el.focus();
    // 光标移到格尾
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  });

  const registerRef = (key: string, el: HTMLElement | null) => {
    if (el) cellRefs.current.set(key, el);
    else cellRefs.current.delete(key);
  };

  /** 静默回写（打字合并历史） */
  const writeCell = (r: number, c: number, value: string) => {
    const next = rows.map((row, i) => (i === r ? row.map((v, j) => (j === c ? value : v)) : row));
    ctx.editor.store.beginTyping(block.id);
    ctx.editor.store.updateBlockSilent(block.id, { props: { rows: next } });
  };

  /** 结构性行列变更（单条历史） */
  const writeRows = (next: string[][]) => {
    ctx.editor.updateBlock(block.id, { props: { rows: next } });
  };

  const addRow = () => writeRows([...rows, Array(rows[0].length).fill("")]);
  const addColumn = () => writeRows(rows.map((r) => [...r, ""]));
  const removeRow = () => {
    if (rows.length <= 1) return;
    writeRows(rows.slice(0, -1));
  };
  const removeColumn = () => {
    if (rows[0].length <= 1) return;
    writeRows(rows.map((r) => r.slice(0, -1)));
  };

  const focusCell = (r: number, c: number) => {
    const el = cellRefs.current.get(`${r}-${c}`);
    if (!el) return;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  };

  const handleCellKeyDown = (e: ReactKeyboardEvent<HTMLElement>, r: number, c: number) => {
    if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      const cols = rows[0].length;
      let nr = r;
      let nc = c + 1;
      if (nc >= cols) {
        nr = r + 1;
        nc = 0;
        if (nr >= rows.length) {
          // 表尾 Tab：新增一行并聚焦新行首格
          pendingFocus.current = `${nr}-0`;
          addRow();
          return;
        }
      }
      focusCell(nr, nc);
      return;
    }
    if (e.key === "Enter") {
      // 表格块内 Enter 不拆块：忽略换行
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (e.key === "Backspace" && r === 0 && c === 0) {
      const el = e.target as HTMLElement;
      const sel = window.getSelection();
      const atStart = sel && sel.rangeCount > 0 && sel.getRangeAt(0).collapsed && (() => {
        const range = sel.getRangeAt(0).cloneRange();
        const pre = document.createRange();
        pre.selectNodeContents(el);
        pre.setEnd(range.startContainer, range.startOffset);
        return pre.toString() === "";
      })();
      if (atStart && (el.textContent ?? "") === "") {
        // 首格为空：Backspace 删除整块
        e.preventDefault();
        e.stopPropagation();
        ctx.editor.removeBlocks([block.id]);
      }
    }
  };

  const toolBtn = (label: string, onClick: () => void, icon: "plus" | "minus") => (
    <button
      type="button"
      className="k3-table-tool"
      tabIndex={-1}
      title={label}
      aria-label={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {icon === "plus" ? <Plus size={12} /> : <Minus size={12} />}
      <span className="k3-table-tool-tag">{label}</span>
    </button>
  );

  return (
    <div className="k3-table-wrap">
      {ctx.editable && hovered ? (
        <div className="k3-table-toolbar">
          {toolBtn(dict.addRow, addRow, "plus")}
          {toolBtn(dict.addColumn, addColumn, "plus")}
          {toolBtn(dict.removeRow, removeRow, "minus")}
          {toolBtn(dict.removeColumn, removeColumn, "minus")}
        </div>
      ) : null}
      <table className="k3-table">
        <thead>
          <tr>
            {rows[0].map((cell, c) => (
              <th key={c}>
                <TableCell
                  cellKey={`0-${c}`}
                  value={cell}
                  header
                  editable={ctx.editable}
                  registerRef={registerRef}
                  onInput={(v) => writeCell(0, c, v)}
                  onKeyDown={(e) => handleCellKeyDown(e, 0, c)}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(1).map((row, i) => (
            <tr key={i}>
              {row.map((cell, c) => (
                <td key={c}>
                  <TableCell
                    cellKey={`${i + 1}-${c}`}
                    value={cell}
                    header={false}
                    editable={ctx.editable}
                    registerRef={registerRef}
                    onInput={(v) => writeCell(i + 1, c, v)}
                    onKeyDown={(e) => handleCellKeyDown(e, i + 1, c)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
