/**
 * K3Blocks — 行内内容（InlineContent[]）与 DOM 之间的转换、
 * 纯文本光标偏移定位、以及行内内容的纯函数操作。
 * 内部模块：不进入公共导出。
 */
import type { CSSProperties } from "react";
import type { InlineContent, InlineStyles, K3CustomInlineContent, K3InlineStyleRenderer } from "./types";

/* ---------------------------------- HTML ---------------------------------- */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\u00a0/g, "&nbsp;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/"/g, "&quot;");
}

/** React CSSProperties → 内联 style 文本（camelCase → kebab-case） */
export function cssPropsToString(css: CSSProperties): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(css)) {
    if (v === undefined || v === null) continue;
    const prop = k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
    parts.push(`${prop}:${String(v)}`);
  }
  return parts.join(";");
}

/** 内置行内样式键（其余键交给 inlineStyleRenderers） */
const KNOWN_STYLE_KEYS = new Set(["bold", "italic", "underline", "strike", "code", "textColor", "backgroundColor"]);

function stylesToHtml(
  textHtml: string,
  styles?: InlineStyles,
  styleRenderers?: Record<string, K3InlineStyleRenderer>
): string {
  if (!styles) return textHtml;
  let s = textHtml;
  if (styles.code) s = `<code>${s}</code>`;
  if (styles.bold) s = `<strong>${s}</strong>`;
  if (styles.italic) s = `<em>${s}</em>`;
  if (styles.underline) s = `<u>${s}</u>`;
  if (styles.strike) s = `<s>${s}</s>`;
  const css: string[] = [];
  if (styles.textColor) css.push(`color:${styles.textColor}`);
  if (styles.backgroundColor) css.push(`background-color:${styles.backgroundColor}`);
  if (css.length) s = `<span style="${escapeAttr(css.join(";"))}">${s}</span>`;
  // 自定义样式键：经 inlineStyleRenderers 转 CSS（未注册的键忽略，不影响渲染）
  if (styleRenderers) {
    for (const [key, value] of Object.entries(styles)) {
      if (KNOWN_STYLE_KEYS.has(key) || value === undefined || value === null || value === false || value === "")
        continue;
      const fn = styleRenderers[key];
      if (!fn) continue;
      const cssText = cssPropsToString(fn(String(value)));
      if (cssText) s = `<span style="${escapeAttr(cssText)}">${s}</span>`;
    }
  }
  return s;
}

/** 未知 inline type 的纯文本降级（text / label / props.label） */
export function customInlineText(node: K3CustomInlineContent): string {
  const v = node.text ?? node.label ?? node.props?.label;
  return v == null ? "" : String(v);
}

/** 未知 inline type → 原子 span：data-k3-inline 标注 + JSON 全量嵌入（DOM 往返无损） */
export function customInlineToHtml(node: K3CustomInlineContent): string {
  let json = "";
  try {
    json = JSON.stringify(node);
  } catch {
    json = "";
  }
  const fallback = escapeHtml(customInlineText(node)).replace(/\n/g, "<br>");
  return (
    `<span data-k3-inline="${escapeAttr(node.type)}"` +
    (json ? ` data-k3-inline-json="${escapeAttr(json)}"` : "") +
    ` contenteditable="false">${fallback}</span>`
  );
}

export function inlineToHtml(
  content: InlineContent[],
  styleRenderers?: Record<string, K3InlineStyleRenderer>
): string {
  let out = "";
  for (const item of content) {
    if (item.type === "text") {
      out += stylesToHtml(escapeHtml(item.text).replace(/\n/g, "<br>"), item.styles, styleRenderers);
    } else if (item.type === "mention") {
      out += `<span class="k3-mention" data-k3-mention="${escapeAttr(item.props.id)}" contenteditable="false">@${escapeHtml(item.props.label)}</span>`;
    } else if (item.type === "link") {
      out += `<a href="${escapeAttr(item.href)}" target="_blank" rel="noopener noreferrer">${inlineToHtml(item.content, styleRenderers)}</a>`;
    } else {
      out += customInlineToHtml(item as K3CustomInlineContent);
    }
  }
  return out;
}

/* -------------------------------- DOM → 模型 ------------------------------- */

/** 颜色规范化：rgb()/rgba() → hex（带 alpha 时 8 位）；hex 原样小写返回；其余原样返回 */
export function normalizeColor(value: string): string {
  const v = value.trim().toLowerCase();
  if (!v) return v;
  if (v.startsWith("#")) return v;
  const m = v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
  if (!m) return v;
  const hex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  let out = `#${hex(Number(m[1]))}${hex(Number(m[2]))}${hex(Number(m[3]))}`;
  if (m[4] !== undefined) {
    const a = Math.round(parseFloat(m[4]) * 255);
    if (a < 255) out += a.toString(16).padStart(2, "0");
  }
  return out;
}

/** 浅比较全部样式键（含自定义键；布尔键按 !! 归一，其余按 ?? "" 归一） */
function sameStyles(a?: InlineStyles, b?: InlineStyles): boolean {
  const ka = a ?? {};
  const kb = b ?? {};
  const keys = new Set([...Object.keys(ka), ...Object.keys(kb)]);
  for (const k of keys) {
    const va = ka[k];
    const vb = kb[k];
    if (typeof va === "boolean" || typeof vb === "boolean") {
      if (!!va !== !!vb) return false;
    } else if ((va ?? "") !== (vb ?? "")) {
      return false;
    }
  }
  return true;
}

function pushText(out: InlineContent[], text: string, styles: InlineStyles): void {
  if (!text) return;
  const last = out[out.length - 1];
  // 保留全部样式键（含自定义键），颜色值规范化
  const clean: InlineStyles = {};
  for (const [k, v] of Object.entries(styles)) {
    if (v === undefined || v === null || v === false || v === "") continue;
    if (k === "textColor" || k === "backgroundColor") clean[k] = normalizeColor(String(v));
    else clean[k] = v;
  }
  if (last && last.type === "text" && sameStyles(last.styles, clean)) {
    last.text += text;
  } else {
    out.push({ type: "text", text, ...(Object.keys(clean).length ? { styles: clean } : {}) });
  }
}

/** 合并相邻同样式 text 节点、剔除空文本；未知 inline type 原样保留 */
export function normalizeInline(content: InlineContent[]): InlineContent[] {
  const out: InlineContent[] = [];
  for (const item of content) {
    if (item.type === "text") {
      if (!item.text) continue;
      pushText(out, item.text, item.styles ?? {});
    } else if (item.type === "mention") {
      out.push({ type: "mention", props: { id: item.props.id, label: item.props.label } });
    } else if (item.type === "link") {
      const inner = normalizeInline(item.content);
      if (!inner.length) continue;
      out.push({ type: "link", href: item.href, content: inner });
    } else {
      out.push({ ...(item as K3CustomInlineContent) } as unknown as InlineContent);
    }
  }
  return out;
}

/** 解析 contenteditable 元素的子树为 InlineContent[] */
export function domToInline(root: HTMLElement): InlineContent[] {
  const out: InlineContent[] = [];

  const walk = (node: Node, styles: InlineStyles, isFirst: boolean): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      pushText(out, node.textContent ?? "", styles);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName;
    // mention 原子 chip：id 取属性，label 取文本（剥掉前导 @）
    const mentionId = el.getAttribute("data-k3-mention");
    if (mentionId !== null) {
      const label = (el.textContent ?? "").replace(/^@/, "");
      out.push({ type: "mention", props: { id: mentionId, label } });
      return;
    }
    // 自定义行内容原子节点：JSON 属性原样还原（无损往返），解析失败降级为文本
    const customType = el.getAttribute("data-k3-inline");
    if (customType !== null) {
      const json = el.getAttribute("data-k3-inline-json");
      let node: K3CustomInlineContent | null = null;
      if (json) {
        try {
          const parsed = JSON.parse(json);
          if (parsed && typeof parsed === "object" && typeof parsed.type === "string") node = parsed;
        } catch {
          node = null;
        }
      }
      if (node) out.push(node as unknown as InlineContent);
      else pushText(out, el.textContent ?? "", styles);
      return;
    }
    if (tag === "BR") {
      pushText(out, "\n", styles);
      return;
    }
    if ((tag === "DIV" || tag === "P") && el !== root) {
      if (!isFirst) pushText(out, "\n", styles);
      el.childNodes.forEach((n, i) => walk(n, styles, i === 0));
      return;
    }
    if (tag === "A") {
      const inner: InlineContent[] = [];
      const tmp: InlineContent[] = [];
      el.childNodes.forEach((n, i) => {
        const before = out.length;
        walk(n, styles, i === 0);
        tmp.push(...out.splice(before));
      });
      inner.push(...tmp);
      const href = el.getAttribute("href") ?? "";
      if (inner.length) {
        out.push({ type: "link", href, content: normalizeInline(inner) });
      }
      return;
    }
    const next: InlineStyles = { ...styles };
    if (tag === "STRONG" || tag === "B") next.bold = true;
    else if (tag === "EM" || tag === "I") next.italic = true;
    else if (tag === "U" || tag === "INS") next.underline = true;
    else if (tag === "S" || tag === "STRIKE" || tag === "DEL") next.strike = true;
    else if (tag === "CODE") next.code = true;
    // 颜色：内联样式（span style）与 <font color>
    const color = el.style?.color || (tag === "FONT" ? el.getAttribute("color") : null);
    if (color) next.textColor = color;
    const bg = el.style?.backgroundColor;
    if (bg) next.backgroundColor = bg;
    el.childNodes.forEach((n, i) => walk(n, next, i === 0));
  };

  root.childNodes.forEach((n, i) => walk(n, {}, i === 0));
  return normalizeInline(out);
}

/* ------------------------------- 纯文本 / 拆分 ------------------------------ */

export function plainText(content: InlineContent[]): string {
  let s = "";
  for (const item of content) {
    if (item.type === "text") s += item.text;
    else if (item.type === "mention") s += `@${item.props.label}`;
    else if (item.type === "link") s += plainText(item.content);
    else s += customInlineText(item as K3CustomInlineContent);
  }
  return s;
}

/** 在字符偏移处拆分为两段（样式随文本切开） */
export function splitInline(content: InlineContent[], offset: number): [InlineContent[], InlineContent[]] {
  const before: InlineContent[] = [];
  const after: InlineContent[] = [];
  let pos = 0;
  for (const item of content) {
    if (item.type === "text") {
      const len = item.text.length;
      if (pos + len <= offset) {
        before.push(item);
      } else if (pos >= offset) {
        after.push(item);
      } else {
        const cut = offset - pos;
        before.push({ ...item, text: item.text.slice(0, cut) });
        after.push({ ...item, text: item.text.slice(cut) });
      }
      pos += len;
    } else if (item.type === "mention") {
      // mention 为原子节点：不可切分，整体归入一侧
      const len = item.props.label.length + 1;
      if (pos + len <= offset) before.push(item);
      else after.push(item);
      pos += len;
    } else if (item.type === "link") {
      const len = plainText(item.content).length;
      if (pos + len <= offset) {
        before.push(item);
      } else if (pos >= offset) {
        after.push(item);
      } else {
        const [b, a] = splitInline(item.content, offset - pos);
        if (b.length) before.push({ ...item, content: b });
        if (a.length) after.push({ ...item, content: a });
      }
      pos += len;
    } else {
      // 未知 inline type：原子节点，不可切分，整体归入一侧
      const len = customInlineText(item as K3CustomInlineContent).length;
      if (pos + len <= offset) before.push(item);
      else after.push(item);
      pos += len;
    }
  }
  return [normalizeInline(before), normalizeInline(after)];
}

/** 删除 [from, to) 区间 */
export function removeInlineRange(content: InlineContent[], from: number, to: number): InlineContent[] {
  const [before, rest] = splitInline(content, from);
  const [, after] = splitInline(rest, to - from);
  return normalizeInline([...before, ...after]);
}

export function concatInline(a: InlineContent[], b: InlineContent[]): InlineContent[] {
  return normalizeInline([...a, ...b]);
}

/* ------------------------------- Markdown 导出 ------------------------------ */

function stylesToMarkdown(text: string, styles?: InlineStyles): string {
  if (!styles) return text;
  let s = text;
  if (styles.code) s = `\`${s}\``;
  if (styles.bold) s = `**${s}**`;
  if (styles.italic) s = `*${s}*`;
  if (styles.strike) s = `~~${s}~~`;
  if (styles.underline) s = `<u>${s}</u>`;
  return s;
}

export function inlineToMarkdown(content: InlineContent[]): string {
  let out = "";
  for (const item of content) {
    if (item.type === "text") out += stylesToMarkdown(item.text, item.styles);
    else if (item.type === "mention") out += `@${item.props.label}`;
    else if (item.type === "link") out += `[${inlineToMarkdown(item.content)}](${item.href})`;
    // 未知 inline type：降级取其 text / label
    else out += customInlineText(item as K3CustomInlineContent);
  }
  return out;
}

/* -------------------------------- 光标偏移 --------------------------------- */

/** 节点子树的“可视文本长度”（BR 计 1） */
function nodeTextLength(node: Node): number {
  if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? "").length;
  if (node.nodeType !== Node.ELEMENT_NODE) return 0;
  const el = node as HTMLElement;
  if (el.tagName === "BR") return 1;
  let len = 0;
  el.childNodes.forEach((n) => {
    len += nodeTextLength(n);
  });
  return len;
}

function domPositionToOffset(root: HTMLElement, node: Node, nodeOffset: number): number {
  let count = 0;
  let found = false;
  const visit = (n: Node): void => {
    if (found) return;
    if (n === node) {
      if (n.nodeType === Node.TEXT_NODE) {
        count += nodeOffset;
      } else {
        for (let i = 0; i < nodeOffset && i < n.childNodes.length; i++) {
          count += nodeTextLength(n.childNodes[i]);
        }
      }
      found = true;
      return;
    }
    if (n.nodeType === Node.TEXT_NODE) {
      count += (n.textContent ?? "").length;
      return;
    }
    if (n.nodeType === Node.ELEMENT_NODE && (n as HTMLElement).tagName === "BR") {
      count += 1;
      return;
    }
    n.childNodes.forEach(visit);
  };
  visit(root);
  return count;
}

/** 当前选区在 el 纯文本中的偏移（start/end 已排序）；选区不在 el 内返回 null */
export function getSelectionOffsets(el: HTMLElement): { start: number; end: number } | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!el.contains(range.startContainer) || !el.contains(range.endContainer)) return null;
  const a = domPositionToOffset(el, range.startContainer, range.startOffset);
  const b = domPositionToOffset(el, range.endContainer, range.endOffset);
  return { start: Math.min(a, b), end: Math.max(a, b) };
}

interface DomPos {
  node: Node;
  offset: number;
}

/** 把纯文本偏移翻译为 DOM 位置；越界时钳到末尾 */
export function locateOffset(root: HTMLElement, offset: number): DomPos {
  let remaining = Math.max(0, offset);
  let last: DomPos = { node: root, offset: 0 };
  const visit = (n: Node): boolean => {
    if (n.nodeType === Node.TEXT_NODE) {
      const len = (n.textContent ?? "").length;
      if (remaining <= len) {
        last = { node: n, offset: remaining };
        return true;
      }
      remaining -= len;
      last = { node: n, offset: len };
      return false;
    }
    if (n.nodeType === Node.ELEMENT_NODE) {
      const el = n as HTMLElement;
      if (el.tagName === "BR") {
        const parent = el.parentNode ?? root;
        const idx = Array.prototype.indexOf.call(parent.childNodes, el);
        if (remaining === 0) {
          last = { node: parent, offset: idx };
          return true;
        }
        remaining -= 1;
        last = { node: parent, offset: idx + 1 };
        return false;
      }
      // 不可编辑原子节点（mention chip）：光标落在其前/后的父级位置，不进入内部
      if (el !== root && el.getAttribute("contenteditable") === "false") {
        const parent = el.parentNode ?? root;
        const idx = Array.prototype.indexOf.call(parent.childNodes, el);
        const len = nodeTextLength(el);
        if (remaining <= len) {
          last = remaining === 0 ? { node: parent, offset: idx } : { node: parent, offset: idx + 1 };
          return true;
        }
        remaining -= len;
        last = { node: parent, offset: idx + 1 };
        return false;
      }
      const kids = Array.from(el.childNodes);
      for (let i = 0; i < kids.length; i++) {
        if (visit(kids[i])) return true;
      }
      last = { node: el, offset: el.childNodes.length };
      return false;
    }
    return false;
  };
  visit(root);
  return last;
}

/** 聚焦 el 并把光标放到纯文本 offset 处 */
export function setDomCursor(el: HTMLElement, offset: number, shouldFocus = true): void {
  if (shouldFocus) el.focus();
  const pos = locateOffset(el, offset);
  const sel = window.getSelection();
  if (!sel) return;
  const range = document.createRange();
  try {
    range.setStart(pos.node, pos.offset);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  } catch {
    /* ignore invalid positions */
  }
}

/** 当前光标（折叠选区）的视口矩形；用于斜杠菜单锚点 */
export function getCaretRect(): { top: number; left: number; bottom: number } | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0).cloneRange();
  const rects = range.getClientRects();
  const r = rects.length ? rects[0] : range.getBoundingClientRect();
  if (r && (r.width || r.height || r.top || r.left)) {
    return { top: r.top, left: r.left, bottom: r.bottom };
  }
  const node = range.startContainer;
  const el = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
  if (!el) return null;
  const er = el.getBoundingClientRect();
  return { top: er.top, left: er.left, bottom: er.bottom };
}

/** 用 DOM 手术把 [start, end) 区间替换为给定元素（加粗/行内 code/链接用），光标置于节点后 */
export function replaceCharRangeWithNode(el: HTMLElement, start: number, end: number, node: Node): void {
  const from = locateOffset(el, start);
  const to = locateOffset(el, end);
  const range = document.createRange();
  try {
    range.setStart(from.node, from.offset);
    range.setEnd(to.node, to.offset);
  } catch {
    return;
  }
  range.deleteContents();
  range.insertNode(node);
  const sel = window.getSelection();
  if (sel) {
    const after = document.createRange();
    after.setStartAfter(node);
    after.collapse(true);
    sel.removeAllRanges();
    sel.addRange(after);
  }
}
