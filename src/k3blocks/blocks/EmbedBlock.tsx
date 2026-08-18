/**
 * K3Blocks — embed：通用 iframe 嵌入块（props.url）。
 * 无 url 时显示占位输入框（同 image 块模式），回车 / 失焦确认。
 * 识别 YouTube / Vimeo / B 站链接转嵌入地址，其余原样加载。
 * 16:9 预览，sandbox + lazy，右上角 mono 域名标签 +「编辑链接」按钮。
 */
import { useEffect, useRef, useState } from "react";
import { Link2, Pencil } from "lucide-react";
import { FilePickButton } from "./FilePickButton";
import type { BlockRendererProps } from "./textBlocks";

/** 常见视频站链接 → 嵌入地址；无法识别时原样返回 */
export function toEmbedUrl(url: string): string {
  let m = url.match(/(?:youtube\.com\/watch\?[^\s]*\bv=|youtube\.com\/shorts\/)([\w-]+)/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  m = url.match(/youtu\.be\/([\w-]+)/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  m = url.match(/vimeo\.com\/(\d+)/);
  if (m) return `https://player.vimeo.com/video/${m[1]}`;
  m = url.match(/bilibili\.com\/video\/(BV[\w]+)/);
  if (m) return `https://player.bilibili.com/player.html?bvid=${m[1]}&autoplay=0`;
  return url;
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function EmbedBlock({ ctx, block }: BlockRendererProps) {
  const url = String(block.props.url ?? "");
  const [editing, setEditing] = useState(!url);
  const inputRef = useRef<HTMLInputElement>(null);
  const dict = ctx.dict.embed;

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
          <Link2 size={20} />
          <span className="k3-embed-empty-text">embed</span>
        </div>
      );
    }
    return (
      <div className="k3-embed-empty">
        <Link2 size={20} />
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
        <FilePickButton ctx={ctx} onUrl={(url) => commit(url)} />
      </div>
    );
  }

  return (
    <div className="k3-embed">
      <div className="k3-embed-frame">
        <iframe
          src={toEmbedUrl(url)}
          title={domainOf(url)}
          sandbox="allow-scripts allow-same-origin allow-presentation"
          loading="lazy"
          allowFullScreen
        />
      </div>
      <div className="k3-embed-bar">
        <span className="k3-block-badge">{domainOf(url)}</span>
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
  );
}
