/**
 * K3Blocks — 悬浮格式化工具栏：选中文本（同一 contenteditable 内）时弹出，
 * B / I / U / S / 行内 code / 链接，28px 按钮，200ms 过冲弹出。
 */
import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { Baseline, Bold, Check, Code, Highlighter, Italic, Link as LinkIcon, Strikethrough, Underline } from "lucide-react";
import type { K3Dictionary } from "../i18n";
import { normalizeColor } from "../inline";
import type { EditorCore } from "../useK3Editor";

/* ------------------------------ 选区 DOM 工具 ------------------------------ */

function selectionEditable(root: HTMLElement | null): HTMLElement | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
  const range = sel.getRangeAt(0);
  const node = range.commonAncestorContainer;
  const el = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
  const editable = el?.closest<HTMLElement>(".k3-editable");
  if (!editable || (root && !root.contains(editable))) return null;
  // 选区必须完整落在同一 contenteditable 内
  if (!editable.contains(range.startContainer) || !editable.contains(range.endContainer)) return null;
  return editable;
}

function unwrapElement(el: Element): void {
  const parent = el.parentNode;
  if (!parent) return;
  while (el.firstChild) parent.insertBefore(el.firstChild, el);
  parent.removeChild(el);
}

/** 把当前选区包进/剥出指定标签（行内 code / 链接用），返回所在的 editable */
export function wrapSelectionTag(tag: "code" | "a", href?: string): HTMLElement | null {
  const editable = selectionEditable(null);
  if (!editable) return null;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
  const range = sel.getRangeAt(0);
  const container = range.commonAncestorContainer;
  const containerEl = container.nodeType === Node.ELEMENT_NODE ? (container as Element) : container.parentElement;
  const existing = containerEl?.closest(tag);
  if (existing && editable.contains(existing)) {
    unwrapElement(existing);
    sel.collapseToEnd();
  } else {
    const node = document.createElement(tag);
    if (tag === "a") {
      node.setAttribute("href", href ?? "");
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
    const frag = range.extractContents();
    if (!frag.textContent) return null;
    node.appendChild(frag);
    range.insertNode(node);
    sel.removeAllRanges();
    const r = document.createRange();
    r.selectNodeContents(node);
    sel.addRange(r);
  }
  return editable;
}

/** 选区是否已在指定标签内 */
export function selectionInTag(tag: string): boolean {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  const node = sel.getRangeAt(0).commonAncestorContainer;
  const el = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
  return !!el?.closest(tag);
}

function currentLinkHref(): string {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return "";
  const node = sel.getRangeAt(0).commonAncestorContainer;
  const el = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
  return el?.closest("a")?.getAttribute("href") ?? "";
}

function notifyInput(el: HTMLElement): void {
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

/* ------------------------------ 颜色（文字 / 高亮） ------------------------------ */

/** 文字色板：hex；null = 默认（清除颜色） */
const TEXT_COLORS: { key: "colorDefault" | "colorRed" | "colorOrange" | "colorGreen" | "colorBlue" | "colorGray"; value: string | null }[] = [
  { key: "colorDefault", value: null },
  { key: "colorRed", value: "#e03131" },
  { key: "colorOrange", value: "#e8590c" },
  { key: "colorGreen", value: "#2f9e44" },
  { key: "colorBlue", value: "#1971c2" },
  { key: "colorGray", value: "#868e96" },
];

/** 高亮色板：同色系 20% 透明（rgba 传给 execCommand，模型侧归一化为 hex8） */
const HIGHLIGHT_COLORS: { key: (typeof TEXT_COLORS)[number]["key"]; value: string | null }[] = [
  { key: "colorDefault", value: null },
  { key: "colorRed", value: "rgba(224, 49, 49, 0.2)" },
  { key: "colorOrange", value: "rgba(232, 89, 12, 0.2)" },
  { key: "colorGreen", value: "rgba(47, 158, 68, 0.2)" },
  { key: "colorBlue", value: "rgba(25, 113, 194, 0.2)" },
  { key: "colorGray", value: "rgba(134, 142, 150, 0.2)" },
];

/** 选区当前的文字/背景色（规范化 hex；无则 ""） */
function currentColor(kind: "text" | "highlight"): string {
  try {
    const v = document.queryCommandValue(kind === "text" ? "foreColor" : "hiliteColor");
    const s = String(v ?? "");
    if (!s || s === "transparent") return "";
    return normalizeColor(s);
  } catch {
    return "";
  }
}

/** 清除颜色：剥掉选区所在元素上的 color / background-color（空的 span/font 一并解包） */
function clearColor(editable: HTMLElement, kind: "text" | "highlight"): void {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const node = sel.getRangeAt(0).commonAncestorContainer;
  let el: Element | null = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
  while (el && el !== editable) {
    if (el instanceof HTMLElement) {
      if (kind === "text") {
        el.style.color = "";
        if (el.tagName === "FONT") el.removeAttribute("color");
      } else {
        el.style.backgroundColor = "";
      }
      // 已无残留样式的 span/font 一并解包（style 清空后属性为 style=""）
      const onlyEmptyStyle =
        el.attributes.length === 0 ||
        (el.attributes.length === 1 && el.getAttribute("style") === "");
      if ((el.tagName === "SPAN" || el.tagName === "FONT") && onlyEmptyStyle) {
        const target = el;
        el = el.parentElement;
        unwrapElement(target);
        continue;
      }
    }
    el = el.parentElement;
  }
}

/* -------------------------------- 组件本体 -------------------------------- */

export interface ToolbarApi {
  openLink: () => void;
}

export interface FormattingToolbarProps {
  editor: EditorCore;
  onRegister: (api: ToolbarApi | null) => void;
  dict: K3Dictionary;
}

interface ToolbarState {
  top: number;
  left: number;
}

export function FormattingToolbar({ editor, onRegister, dict }: FormattingToolbarProps) {
  const [pos, setPos] = useState<ToolbarState | null>(null);
  const [mode, setMode] = useState<"buttons" | "link">("buttons");
  const [colorMenu, setColorMenu] = useState<"text" | "highlight" | null>(null);
  const [active, setActive] = useState({ bold: false, italic: false, underline: false, strike: false, code: false, link: false, textColor: "", backgroundColor: "" });
  const linkInputRef = useRef<HTMLInputElement>(null);
  const root = editor.rootEl;

  useEffect(() => {
    const update = () => {
      const editable = selectionEditable(editor.rootEl);
      if (!editable || !editor.editable) {
        setPos(null);
        setMode("buttons");
        setColorMenu(null);
        return;
      }
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      if (!rect || (rect.width === 0 && rect.height === 0)) return;
      setPos({
        top: Math.max(8, rect.top - 44),
        left: Math.max(8, rect.left + rect.width / 2 - 120),
      });
      setActive({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strike: document.queryCommandState("strikeThrough"),
        code: selectionInTag("code"),
        link: selectionInTag("a"),
        textColor: currentColor("text"),
        backgroundColor: currentColor("highlight"),
      });
    };
    const hide = () => setPos(null);
    document.addEventListener("selectionchange", update);
    document.addEventListener("scroll", hide, true);
    return () => {
      document.removeEventListener("selectionchange", update);
      document.removeEventListener("scroll", hide, true);
    };
  }, [editor]);

  useEffect(() => {
    onRegister({
      openLink: () => {
        if (!selectionEditable(editor.rootEl)) return;
        setMode("link");
        window.setTimeout(() => linkInputRef.current?.focus(), 0);
      },
    });
    return () => onRegister(null);
  }, [editor, onRegister]);

  useEffect(() => {
    if (mode === "link") {
      const input = linkInputRef.current;
      if (input) input.value = currentLinkHref();
    }
  }, [mode]);

  if (!pos || !root) return null;

  const exec = (command: string) => {
    document.execCommand(command);
  };

  const toggleCode = () => {
    const el = wrapSelectionTag("code");
    if (el) notifyInput(el);
  };

  const applyLink = (href: string) => {
    const url = href.trim();
    const el = url ? wrapSelectionTag("a", url) : null;
    if (el) notifyInput(el);
    setMode("buttons");
  };

  /** 应用 / 清除文字颜色或高亮；value 为 null 时清除 */
  const applyColor = (kind: "text" | "highlight", value: string | null) => {
    const editable = selectionEditable(editor.rootEl);
    setColorMenu(null);
    if (!editable) return;
    if (value) {
      document.execCommand("styleWithCSS", false, "true");
      if (kind === "text") {
        document.execCommand("foreColor", false, value);
      } else {
        // hiliteColor 在部分浏览器别名 backColor
        if (!document.execCommand("hiliteColor", false, value)) {
          document.execCommand("backColor", false, value);
        }
      }
    } else {
      clearColor(editable, kind);
    }
    notifyInput(editable);
  };

  const palette = (kind: "text" | "highlight") => {
    const colors = kind === "text" ? TEXT_COLORS : HIGHLIGHT_COLORS;
    const current = kind === "text" ? active.textColor : active.backgroundColor;
    const paletteValues = colors.filter((c) => c.value).map((c) => normalizeColor(c.value!));
    const hasMatch = current !== "" && paletteValues.includes(current);
    return (
      <div className="k3-tb-colors k3-pop" onMouseDown={(e) => e.preventDefault()}>
        {colors.map((c) => {
          const on = c.value ? normalizeColor(c.value) === current && hasMatch : !hasMatch;
          return (
            <button
              key={c.key}
              type="button"
              className={`k3-tb-color${on ? " k3-on" : ""}`}
              title={dict.formattingToolbar[c.key]}
              aria-label={dict.formattingToolbar[c.key]}
              onClick={() => applyColor(kind, c.value)}
            >
              <span
                className="k3-tb-swatch"
                style={
                  c.value
                    ? { background: c.value }
                    : { background: "transparent" }
                }
              />
              {on ? <Check size={12} /> : null}
            </button>
          );
        })}
      </div>
    );
  };

  const btn = (
    key: string,
    on: boolean,
    label: string,
    onClick: () => void,
    icon: ReactElement
  ) => (
    <button
      key={key}
      type="button"
      className={`k3-tb-btn${on ? " k3-on" : ""}`}
      title={label}
      aria-label={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {icon}
    </button>
  );

  return (
    <div
      className="k3-toolbar k3-pop"
      style={{ top: pos.top, left: pos.left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {mode === "buttons" ? (
        <>
          {btn("b", active.bold, dict.formattingToolbar.bold, () => exec("bold"), <Bold size={14} />)}
          {btn("i", active.italic, dict.formattingToolbar.italic, () => exec("italic"), <Italic size={14} />)}
          {btn("u", active.underline, dict.formattingToolbar.underline, () => exec("underline"), <Underline size={14} />)}
          {btn("s", active.strike, dict.formattingToolbar.strike, () => exec("strikeThrough"), <Strikethrough size={14} />)}
          <span className="k3-tb-sep" />
          {btn("code", active.code, dict.formattingToolbar.inlineCode, toggleCode, <Code size={14} />)}
          {btn("link", active.link, dict.formattingToolbar.link, () => { setColorMenu(null); setMode("link"); }, <LinkIcon size={14} />)}
          <span className="k3-tb-sep" />
          <span className="k3-tb-color-wrap">
            {btn(
              "textColor",
              colorMenu === "text" || active.textColor !== "",
              dict.formattingToolbar.textColor,
              () => setColorMenu((v) => (v === "text" ? null : "text")),
              <Baseline size={14} />
            )}
            {colorMenu === "text" ? palette("text") : null}
          </span>
          <span className="k3-tb-color-wrap">
            {btn(
              "highlight",
              colorMenu === "highlight" || active.backgroundColor !== "",
              dict.formattingToolbar.highlight,
              () => setColorMenu((v) => (v === "highlight" ? null : "highlight")),
              <Highlighter size={14} />
            )}
            {colorMenu === "highlight" ? palette("highlight") : null}
          </span>
        </>
      ) : (
        <input
          ref={linkInputRef}
          className="k3-tb-link-input"
          type="text"
          placeholder={dict.formattingToolbar.linkInputPlaceholder}
          defaultValue={currentLinkHref()}
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") {
              e.preventDefault();
              applyLink((e.target as HTMLInputElement).value);
            } else if (e.key === "Escape") {
              e.preventDefault();
              setMode("buttons");
            }
          }}
        />
      )}
    </div>
  );
}
