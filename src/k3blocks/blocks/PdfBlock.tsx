/**
 * K3Blocks — pdf：PDF 文档预览块（props.url）。
 * 无 url 时显示占位输入框（同 image/embed 块模式），回车 / 失焦确认。
 * 有 url 时渲染 iframe（#toolbar=0&navpanes=0），固定 560px 高、inset 框，
 * 右上角 mono "PDF" 标签 +「编辑链接」「新窗口打开」小按钮。
 */
import { useEffect, useRef, useState } from "react";
import { ExternalLink, FileText, Pencil } from "lucide-react";
import { FilePickButton } from "./FilePickButton";
import type { BlockRendererProps } from "./textBlocks";

export function PdfBlock({ ctx, block }: BlockRendererProps) {
  const url = String(block.props.url ?? "");
  const [editing, setEditing] = useState(!url);
  const inputRef = useRef<HTMLInputElement>(null);
  const dict = ctx.dict.pdf;

  // 新建（斜杠菜单插入，无 url）后自动聚焦输入框
  useEffect(() => {
    if (editing && ctx.editable && inputRef.current) {
      const el = inputRef.current;
      if (document.activeElement !== el) el.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commit = (value: string) => {
    const v = value.trim();
    if (!v) return; // 空值停留输入态
    if (v !== url) ctx.editor.updateBlock(block.id, { props: { url: v } });
    setEditing(false);
  };

  if (!url || (editing && ctx.editable)) {
    if (!ctx.editable) {
      return (
        <div className="k3-embed-empty">
          <FileText size={20} />
          <span className="k3-embed-empty-text">document.pdf</span>
        </div>
      );
    }
    return (
      <div className="k3-embed-empty">
        <FileText size={20} />
        <input
          ref={inputRef}
          className="k3-embed-url"
          type="text"
          defaultValue={url}
          placeholder={dict.urlPlaceholder}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") {
              e.preventDefault();
              commit((e.target as HTMLInputElement).value);
            } else if (e.key === "Escape" && url) {
              setEditing(false);
            }
          }}
          onBlur={(e) => commit(e.target.value)}
        />
        <FilePickButton ctx={ctx} accept="application/pdf,.pdf" onUrl={(url) => commit(url)} />
      </div>
    );
  }

  return (
    <div className="k3-pdf">
      <div className="k3-pdf-frame">
        <iframe src={`${url}#toolbar=0&navpanes=0`} title="PDF" loading="lazy" />
        <div className="k3-pdf-bar">
          <span className="k3-block-badge">PDF</span>
          <button
            type="button"
            className="k3-embed-edit"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink size={12} />
            <span>{dict.openInNewTab}</span>
          </button>
          {ctx.editable ? (
            <button
              type="button"
              className="k3-embed-edit"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setEditing(true)}
            >
              <Pencil size={12} />
              <span>{dict.editLink}</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
