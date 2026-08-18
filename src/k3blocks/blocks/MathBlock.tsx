/**
 * K3Blocks — math：KaTeX 展示模式公式块（props.latex）。
 * 渲染态点击（可编辑时）进入编辑态：mono inset 输入框，失焦 / Cmd+Enter 回渲染态。
 * 渲染失败不抛异常：显示原始源码 + 红色小标提示。右上角常驻 mono "TeX" 小标。
 */
import { useMemo, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import type { BlockRendererProps } from "./textBlocks";

export function MathBlock({ ctx, block }: BlockRendererProps) {
  const latex = String(block.props.latex ?? "");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(latex);
  const dict = ctx.dict.math;

  const { html, error } = useMemo(() => {
    try {
      return {
        html: katex.renderToString(latex, { throwOnError: true, displayMode: true }),
        error: false,
      };
    } catch {
      // 不抛异常：以 throwOnError:false 兜底渲染（katex 会以红色显示原始源码）
      try {
        return {
          html: katex.renderToString(latex, { throwOnError: false, displayMode: true }),
          error: true,
        };
      } catch {
        return { html: "", error: true };
      }
    }
  }, [latex]);

  const commit = () => {
    const value = draft.trim();
    if (value !== latex) ctx.editor.updateBlock(block.id, { props: { latex: value } });
    setEditing(false);
  };

  if (editing && ctx.editable) {
    return (
      <div className="k3-math">
        <span className="k3-block-badge">TeX</span>
        <textarea
          className="k3-math-input"
          value={draft}
          rows={Math.min(8, Math.max(1, draft.split("\n").length))}
          placeholder={dict.inputPlaceholder}
          autoFocus
          spellCheck={false}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              commit();
            } else if (e.key === "Escape") {
              setDraft(latex);
              setEditing(false);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`k3-math${error ? " k3-math-error" : ""}`}
      onClick={() => {
        if (!ctx.editable) return;
        setDraft(latex);
        setEditing(true);
      }}
    >
      <span className="k3-block-badge">TeX</span>
      {error ? <span className="k3-math-error-badge">{dict.renderError}</span> : null}
      {html ? (
        <div className="k3-math-render" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre className="k3-math-source">{latex}</pre>
      )}
      {error ? <pre className="k3-math-source">{latex}</pre> : null}
    </div>
  );
}
