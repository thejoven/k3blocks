/**
 * K3Blocks — Markdown input rules。
 * 行首规则（输入空格触发）：#/##/###、-/*、1.、[]/[x]、>；
 * Enter 触发：```（代码块）、---（分割线）；
 * 行内规则（输入闭合符触发）：**bold**、`code`。
 * 中文输入法 composition 期间由调用方跳过。
 */
import { domToInline, plainText, removeInlineRange, replaceCharRangeWithNode } from "../inline";
import { createBlock } from "../store";
import type { EditorCore } from "../useK3Editor";
import type { Block } from "../types";

interface LineRule {
  pattern: RegExp;
  type: string;
  props?: (m: RegExpMatchArray) => Record<string, any>;
}

const LINE_RULES: LineRule[] = [
  { pattern: /^(#{1,3}) $/, type: "heading", props: (m) => ({ level: m[1].length }) },
  { pattern: /^[-*] $/, type: "bulletListItem" },
  { pattern: /^1\. $/, type: "numberedListItem" },
  { pattern: /^\[([x ])\] $/, type: "checkListItem", props: (m) => ({ checked: m[1] === "x" }) },
  { pattern: /^> $/, type: "quote" },
];

/** 行首规则：在 onInput 中、空格刚输入后调用；命中返回 true */
export function applyLineInputRule(editor: EditorCore, block: Block, cursorOffset: number): boolean {
  if (block.type !== "paragraph" && block.type !== "heading") return false;
  const text = plainText(block.content);
  const before = text.slice(0, cursorOffset);
  for (const rule of LINE_RULES) {
    if (!editor.isTypeAllowed(rule.type)) continue; // 白名单外类型的行首规则失效
    const m = before.match(rule.pattern);
    if (!m) continue;
    const props = rule.props ? rule.props(m) : {};
    // blockConfig.heading.levels 未允许的标题级别：规则失效（如 levels:[1,2] 时 ### 不转 H3）
    if (rule.type === "heading" && !editor.isHeadingLevelAllowed(Number(props.level))) continue;
    const markerLen = m[0].length;
    const content = removeInlineRange(block.content, 0, markerLen);
    editor.store.commit(() => {
      editor.store.applyUpdate(block.id, { type: rule.type, props, content });
    });
    editor.setTextCursor(block.id, 0);
    return true;
  }
  return false;
}

/** Enter 键规则：``` → 代码块，--- → 分割线。命中返回 true */
export function applyEnterRule(editor: EditorCore, block: Block): boolean {
  if (block.type !== "paragraph") return false;
  const text = plainText(block.content).trim();
  if (text === "```" && editor.isTypeAllowed("codeBlock")) {
    editor.store.commit(() => {
      editor.store.applyUpdate(block.id, { type: "codeBlock", props: { language: editor.codeDefaultLanguage }, content: [] });
    });
    editor.setTextCursor(block.id, 0);
    return true;
  }
  if (text === "---" && editor.isTypeAllowed("divider")) {
    const paragraph = createBlock();
    editor.store.commit(() => {
      editor.store.applyUpdate(block.id, { type: "divider", props: {}, content: [] });
      editor.store.insertRaw([paragraph], block.id, "after");
    });
    editor.setTextCursor(paragraph.id, 0);
    return true;
  }
  return false;
}

/** 行内规则：**bold** / `code`，光标紧跟闭合符时触发。命中返回 true */
export function applyInlineInputRule(editor: EditorCore, block: Block, el: HTMLElement, cursorOffset: number): boolean {
  if (block.type === "codeBlock") return false;
  const text = plainText(block.content);
  const before = text.slice(0, cursorOffset);

  let m = before.match(/\*\*([^*\n]+)\*\*$/);
  if (m) {
    const node = document.createElement("strong");
    node.textContent = m[1];
    replaceCharRangeWithNode(el, cursorOffset - m[0].length, cursorOffset, node);
    syncAfterRule(editor, block.id, el);
    return true;
  }

  m = before.match(/(^|[^`])`([^`\n]+)`$/);
  if (m) {
    const full = m[0];
    const inner = m[2];
    const start = cursorOffset - full.length + m[1].length;
    const node = document.createElement("code");
    node.textContent = inner;
    replaceCharRangeWithNode(el, start, cursorOffset, node);
    syncAfterRule(editor, block.id, el);
    return true;
  }
  return false;
}

function syncAfterRule(editor: EditorCore, blockId: string, el: HTMLElement): void {
  editor.store.beginTyping(blockId);
  editor.store.updateBlockSilent(blockId, { content: domToInline(el) });
}
