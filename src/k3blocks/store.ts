/**
 * K3Blocks — 编辑器状态核心：文档模型（Block[] 树）、自维护 undo/redo 操作栈、
 * 文本光标（块 id + 字符偏移）与变更订阅。
 * 纯数据层，不依赖 React / DOM。
 */
import { defaultPropsFor } from "./schema";
import { inlineToMarkdown, plainText } from "./inline";
import type { Block, CursorPosition, InlineContent, PartialBlock, Placement } from "./types";

let counter = 0;
export function genId(): string {
  counter = (counter + 1) % 0xffff;
  return `${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function clone<T>(v: T): T {
  return typeof structuredClone === "function" ? structuredClone(v) : JSON.parse(JSON.stringify(v));
}

export function createBlock(partial: PartialBlock = {}): Block {
  const type = partial.type ?? "paragraph";
  let content: InlineContent[];
  if (typeof partial.content === "string") {
    content = partial.content ? [{ type: "text", text: partial.content }] : [];
  } else {
    content = partial.content ?? [];
  }
  return {
    id: partial.id ?? genId(),
    type,
    props: { ...defaultPropsFor(type), ...(partial.props ?? {}) },
    content,
    children: (partial.children ?? []).map(createBlock),
  };
}

/** 创建分栏块：N 个 column，各含一个空 paragraph（默认 2 栏） */
export function createColumnList(columnCount = 2): Block {
  const count = Math.max(2, Math.floor(columnCount));
  return createBlock({
    type: "columnList",
    children: Array.from({ length: count }, () => ({
      type: "column",
      children: [{ type: "paragraph" }],
    })),
  });
}

/* --------------------------------- 树查询 --------------------------------- */

export interface BlockLocation {
  block: Block;
  /** block 所在的数组（根数组或某个父块的 children） */
  siblings: Block[];
  index: number;
  /** 父块（根层为 null） */
  parent: Block | null;
}

export function findLocation(blocks: Block[], id: string, parent: Block | null = null): BlockLocation | null {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.id === id) return { block: b, siblings: blocks, index: i, parent };
    const inner = findLocation(b.children, id, b);
    if (inner) return inner;
  }
  return null;
}

export interface FlatBlock {
  block: Block;
  depth: number;
  parent: Block | null;
}

/** 前序遍历扁平化（可见顺序） */
export function flattenBlocks(blocks: Block[], depth = 0, parent: Block | null = null, out: FlatBlock[] = []): FlatBlock[] {
  for (const b of blocks) {
    out.push({ block: b, depth, parent });
    flattenBlocks(b.children, depth + 1, b, out);
  }
  return out;
}

/** id 是否为 ancestor 的后代 */
export function isDescendant(ancestor: Block, id: string): boolean {
  return findLocation(ancestor.children, id, ancestor) !== null;
}

/* --------------------------------- 历史栈 --------------------------------- */

interface Snapshot {
  doc: Block[];
  cursor: CursorPosition | null;
}

const HISTORY_LIMIT = 100;
/** 同一 block 连续输入在该时间窗内合并为一条历史 */
const TYPING_MERGE_MS = 1000;

export class EditorStore {
  private doc: Block[];
  private past: Snapshot[] = [];
  private future: Snapshot[] = [];
  private listeners = new Set<() => void>();
  private lastTypingId: string | null = null;
  private lastTypingTime = 0;
  /** 视图层在下一次渲染后需要恢复的光标 */
  pendingCursor: CursorPosition | null = null;
  /** 视图层记录的当前光标（undo/redo 恢复用） */
  cursor: CursorPosition | null = null;
  version = 0;

  constructor(initial?: Block[]) {
    this.doc = initial && initial.length ? clone(initial).map((b) => createBlock(b)) : [createBlock()];
  }

  getDocument(): Block[] {
    return this.doc;
  }

  get canUndo(): boolean {
    return this.past.length > 0;
  }

  get canRedo(): boolean {
    return this.future.length > 0;
  }

  subscribe = (cb: () => void): (() => void) => {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  };

  bump(): void {
    this.version++;
    for (const cb of this.listeners) cb();
  }

  /** 输入式变更：按时间窗合并历史条目 */
  beginTyping(blockId: string): void {
    const now = Date.now();
    if (this.lastTypingId !== blockId || now - this.lastTypingTime > TYPING_MERGE_MS) {
      this.pushHistory();
    }
    this.lastTypingId = blockId;
    this.lastTypingTime = now;
  }

  private pushHistory(): void {
    this.past.push({ doc: clone(this.doc), cursor: this.cursor });
    if (this.past.length > HISTORY_LIMIT) this.past.shift();
    this.future = [];
  }

  /** 结构性提交：记录历史 + 触发渲染 */
  commit(mutate: () => void): void {
    this.pushHistory();
    this.lastTypingId = null;
    mutate();
    this.bump();
  }

  /** 静默变更：不进历史，仅刷新视图（输入同步用；历史由 beginTyping 管理） */
  silent(mutate: () => void): void {
    mutate();
    this.bump();
  }

  undo(): void {
    const snap = this.past.pop();
    if (!snap) return;
    this.future.push({ doc: clone(this.doc), cursor: this.cursor });
    this.doc = snap.doc;
    this.lastTypingId = null;
    this.pendingCursor = snap.cursor;
    this.bump();
  }

  redo(): void {
    const snap = this.future.pop();
    if (!snap) return;
    this.past.push({ doc: clone(this.doc), cursor: this.cursor });
    this.doc = snap.doc;
    this.lastTypingId = null;
    this.pendingCursor = snap.cursor;
    this.bump();
  }

  /* -------------------------------- 文档操作 ------------------------------- */

  getBlock(id: string): Block | undefined {
    return findLocation(this.doc, id)?.block;
  }

  insertBlocks(blocks: PartialBlock[], refId?: string | null, placement: Placement = "after"): Block[] {
    const created = blocks.map((b) => createBlock(b));
    if (!created.length) return created;
    this.commit(() => {
      if (refId) {
        const loc = findLocation(this.doc, refId);
        if (loc) {
          if (placement === "nested") {
            loc.block.children.push(...created);
          } else {
            const at = placement === "before" ? loc.index : loc.index + 1;
            loc.siblings.splice(at, 0, ...created);
          }
          return;
        }
      }
      this.doc.push(...created);
    });
    return created;
  }

  updateBlock(id: string, partial: Partial<Omit<Block, "id">>): void {
    this.commit(() => this.applyUpdate(id, partial));
  }

  /** 静默更新（不产生历史条目），配合 beginTyping 或视图层 DOM 手术 */
  updateBlockSilent(id: string, partial: Partial<Omit<Block, "id">>): void {
    this.silent(() => this.applyUpdate(id, partial));
  }

  /** 低层查询（视图层组合操作用，不做历史） */
  locate(id: string): BlockLocation | null {
    return findLocation(this.doc, id);
  }

  /** 低层更新（配合 commit 组合进单条历史） */
  applyUpdate(id: string, partial: Partial<Omit<Block, "id">>): void {
    const loc = findLocation(this.doc, id);
    if (!loc) return;
    if (partial.type !== undefined) loc.block.type = partial.type;
    if (partial.props !== undefined) loc.block.props = { ...loc.block.props, ...partial.props };
    if (partial.content !== undefined) loc.block.content = partial.content;
    if (partial.children !== undefined) loc.block.children = partial.children;
  }

  /** 低层插入已创建的块（不做历史、不 bump，配合 commit 组合操作） */
  insertRaw(blocks: Block[], refId: string | null, placement: Placement = "after"): void {
    if (!blocks.length) return;
    if (refId) {
      const loc = findLocation(this.doc, refId);
      if (loc) {
        if (placement === "nested") loc.block.children.push(...blocks);
        else loc.siblings.splice(placement === "before" ? loc.index : loc.index + 1, 0, ...blocks);
        return;
      }
    }
    this.doc.push(...blocks);
  }

  /** 低层删除（不做历史、不 bump），返回被删的块 */
  removeRaw(id: string): Block | null {
    const loc = findLocation(this.doc, id);
    if (!loc) return null;
    loc.siblings.splice(loc.index, 1);
    return loc.block;
  }

  removeBlocks(ids: string[]): void {
    if (!ids.length) return;
    this.commit(() => {
      for (const id of ids) {
        const loc = findLocation(this.doc, id);
        if (loc) loc.siblings.splice(loc.index, 1);
      }
      if (!this.doc.length) this.doc.push(createBlock());
    });
  }

  /** 移动块到目标块前/后（拖拽排序），单条历史 */
  moveBlock(id: string, targetId: string, placement: "before" | "after"): void {
    if (id === targetId) return;
    const from = findLocation(this.doc, id);
    const to = findLocation(this.doc, targetId);
    if (!from || !to) return;
    if (isDescendant(from.block, targetId)) return;
    this.commit(() => {
      from.siblings.splice(from.index, 1);
      const t = findLocation(this.doc, targetId);
      if (!t) {
        this.doc.push(from.block);
        return;
      }
      t.siblings.splice(placement === "before" ? t.index : t.index + 1, 0, from.block);
    });
  }

  /** Tab 缩进：成为上一个兄弟块的最后一个子块 */
  indentBlock(id: string): boolean {
    const loc = findLocation(this.doc, id);
    if (!loc || loc.index === 0) return false;
    this.commit(() => {
      const l = findLocation(this.doc, id);
      if (!l || l.index === 0) return;
      const prev = l.siblings[l.index - 1];
      l.siblings.splice(l.index, 1);
      prev.children.push(l.block);
    });
    return true;
  }

  /** Shift+Tab 提升：移到父块之后 */
  outdentBlock(id: string): boolean {
    const loc = findLocation(this.doc, id);
    if (!loc || !loc.parent) return false;
    this.commit(() => {
      const l = findLocation(this.doc, id);
      if (!l || !l.parent) return;
      const parentLoc = findLocation(this.doc, l.parent.id);
      if (!parentLoc) return;
      l.siblings.splice(l.index, 1);
      parentLoc.siblings.splice(parentLoc.index + 1, 0, l.block);
    });
    return true;
  }

  /* ------------------------------- Markdown ------------------------------- */

  blocksToMarkdown(): string {
    return serializeBlocks(this.doc, 0).trimEnd();
  }
}

function serializeBlocks(blocks: Block[], depth: number): string {
  const indent = "  ".repeat(depth);
  let out = "";
  let numbered = 0;
  for (const b of blocks) {
    if (b.type !== "numberedListItem") numbered = 0;
    // 分栏容器无文本行：栏内容按文档顺序平铺输出
    if (b.type === "columnList" || b.type === "column") {
      if (b.children.length) out += serializeBlocks(b.children, depth);
      continue;
    }
    const text = inlineToMarkdown(b.content);
    let line = "";
    switch (b.type) {
      case "heading": {
        const level = Math.min(3, Math.max(1, Number(b.props.level) || 1));
        line = `${"#".repeat(level)} ${text}`;
        break;
      }
      case "bulletListItem":
        line = `- ${text}`;
        break;
      case "numberedListItem":
        numbered += 1;
        line = `${numbered}. ${text}`;
        break;
      case "checkListItem":
        line = `- [${b.props.checked ? "x" : " "}] ${text}`;
        break;
      case "quote":
        line = `> ${text}`;
        break;
      case "codeBlock":
        line = "```" + (b.props.language && b.props.language !== "text" ? b.props.language : "") + "\n" + plainText(b.content) + "\n```";
        break;
      case "divider":
        line = "---";
        break;
      case "image": {
        if (!b.props.src) break;
        line = `![${b.props.alt ?? ""}](${b.props.src})`;
        if (b.props.caption) line += `\n*${b.props.caption}*`;
        break;
      }
      case "table": {
        const rows = (Array.isArray(b.props.rows) ? b.props.rows : [])
          .filter((r: unknown) => Array.isArray(r))
          .map((r: unknown[]) => r.map((c: unknown) => (c == null ? "" : String(c))));
        if (!rows.length) break;
        const cols = Math.max(1, ...rows.map((r: string[]) => r.length));
        const cell = (v: string) => v.replace(/\|/g, "\\|").replace(/\n+/g, " ");
        const rowLine = (r: string[]) =>
          `| ${Array.from({ length: cols }, (_, i) => cell(r[i] ?? "")).join(" | ")} |`;
        line = [rowLine(rows[0]), `| ${Array(cols).fill("---").join(" | ")} |`, ...rows.slice(1).map(rowLine)].join("\n");
        break;
      }
      case "math": {
        const latex = String(b.props.latex ?? "").trim();
        if (!latex) break;
        line = `$$\n${latex}\n$$`;
        break;
      }
      case "embed": {
        if (!b.props.url) break;
        line = `[${b.props.url}](${b.props.url})`;
        break;
      }
      case "pdf": {
        if (!b.props.url) break;
        line = `[${b.props.url}](${b.props.url})`;
        break;
      }
      case "diagram": {
        const code = String(b.props.code ?? "").trim();
        if (!code) break;
        line = "```mermaid\n" + code + "\n```";
        break;
      }
      default:
        line = text;
    }
    out += indent + line + "\n";
    if (b.children.length) out += serializeBlocks(b.children, depth + 1);
  }
  return out;
}
