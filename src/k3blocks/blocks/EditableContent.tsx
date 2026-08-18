/**
 * K3Blocks — 单个块的 contenteditable 区域。
 * React 只管块级结构：挂载/外部变更时把模型写入 DOM，
 * 输入期间 DOM 是唯一事实来源（避免光标跳动）。
 * 未知 inline type（data-k3-inline 原子 span）经 ctx.inlineRenderers 用 portal 渲染；
 * 自定义行内样式键经 ctx.inlineStyleRenderers 转成内联 CSS。
 */
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { inlineToHtml } from "../inline";
import type { Block, InlineContent, K3CustomInlineContent } from "../types";
import type { ViewContext } from "../viewContext";

export interface EditableContentProps {
  ctx: ViewContext;
  block: Block;
  className?: string;
  placeholder?: string;
}

interface InlineTarget {
  el: HTMLElement;
  node: K3CustomInlineContent;
}

function parseInlineJson(el: HTMLElement): K3CustomInlineContent | null {
  const json = el.getAttribute("data-k3-inline-json");
  if (json) {
    try {
      const parsed = JSON.parse(json);
      if (parsed && typeof parsed === "object" && typeof parsed.type === "string") return parsed;
    } catch {
      /* fallthrough */
    }
  }
  const type = el.getAttribute("data-k3-inline");
  return type ? { type } : null;
}

export function EditableContent({ ctx, block, className, placeholder }: EditableContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const html = inlineToHtml(block.content, ctx.inlineStyleRenderers);
  const renderers = ctx.inlineRenderers;
  const [targets, setTargets] = useState<InlineTarget[]>([]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // 聚焦中的块以 DOM 为准（onInput 已同步模型），不做回写
    const focused = document.activeElement === el || el.contains(document.activeElement);
    if (!focused && el.innerHTML !== html) el.innerHTML = html;
    // 收集自定义行内容锚点：清空占位文本，交给 portal 渲染
    const next: InlineTarget[] = [];
    if (renderers) {
      const spans = Array.from(el.querySelectorAll<HTMLElement>("[data-k3-inline]"));
      for (const span of spans) {
        const node = parseInlineJson(span);
        if (!node || !renderers[node.type]) continue;
        if (span.textContent) span.textContent = "";
        next.push({ el: span, node });
      }
    }
    // 锚点状态更新推迟到微任务（避免 effect 内同步 setState 造成级联渲染）
    queueMicrotask(() => {
      setTargets((prev) => (prev.length === next.length && prev.every((t, i) => t.el === next[i].el) ? prev : next));
    });
  });

  return (
    <>
      <div
        ref={ref}
        className={className ? `k3-editable ${className}` : "k3-editable"}
        contentEditable={ctx.editable}
        suppressContentEditableWarning
        spellCheck={false}
        data-placeholder={placeholder ?? ""}
      />
      {targets.map((t, i) =>
        createPortal(
          renderers![t.node.type](t.node as unknown as InlineContent & { type: string }, ctx.editor),
          t.el,
          `k3-inline-${i}`
        )
      )}
    </>
  );
}
