/**
 * K3Blocks — diagram：Mermaid 图表块（props.code）。
 * mermaid 必须动态 import（避免进入首屏 bundle）；主题依当前 data-theme（dark/default）。
 * 渲染失败显示 mono 错误信息条（不炸页面）。编辑态 mono textarea（inset 深底），
 * Cmd+Enter / 失焦提交源码并重渲染。
 */
import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import type { BlockRendererProps } from "./textBlocks";

let mermaidId = 0;

export function DiagramBlock({ ctx, block }: BlockRendererProps) {
  const code = String(block.props.code ?? "");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(code);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const renderSeq = useRef(0);
  const dict = ctx.dict.diagram;

  useEffect(() => {
    if (!code.trim()) {
      setSvg("");
      setError("");
      return;
    }
    let cancelled = false;
    const seq = ++renderSeq.current;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        // 依当前 data-theme 选 mermaid 主题（默认暗色）
        const theme = ctx.editor.rootEl?.getAttribute("data-theme") === "light" ? "default" : "dark";
        mermaid.initialize({ startOnLoad: false, theme, securityLevel: "strict" });
        const id = `k3-mermaid-${++mermaidId}`;
        const { svg: out } = await mermaid.render(id, code);
        // mermaid.render 失败时也可能往 body 塞临时节点，顺手清理
        document.getElementById(`d${id}`)?.remove();
        if (!cancelled && seq === renderSeq.current) {
          setSvg(out);
          setError("");
        }
      } catch (err) {
        document.querySelectorAll(`[id^="dk3-mermaid-"]`).forEach((n) => n.remove());
        if (!cancelled && seq === renderSeq.current) {
          setSvg("");
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const commit = () => {
    const value = draft.trim();
    if (value !== code) ctx.editor.updateBlock(block.id, { props: { code: value } });
    setEditing(false);
  };

  if (editing && ctx.editable) {
    return (
      <div className="k3-diagram">
        <textarea
          className="k3-diagram-input"
          value={draft}
          rows={Math.min(16, Math.max(3, draft.split("\n").length))}
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
              setDraft(code);
              setEditing(false);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="k3-diagram">
      {ctx.editable ? (
        <div className="k3-diagram-bar">
          <span className="k3-block-badge">mermaid</span>
          <button
            type="button"
            className="k3-diagram-edit"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setDraft(code);
              setEditing(true);
            }}
          >
            <Pencil size={12} />
            <span>{dict.editSource}</span>
          </button>
        </div>
      ) : null}
      {error ? (
        <div className="k3-diagram-error">
          {dict.renderError}: {error}
        </div>
      ) : svg ? (
        <div className="k3-diagram-render" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="k3-diagram-loading" />
      )}
    </div>
  );
}
