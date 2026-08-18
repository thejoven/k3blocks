/**
 * K3Blocks — image：URL 嵌入 + 本地上传（useK3Editor({ uploadFile })，缺省 dataURL）。
 * 无 src 时显示凹陷虚线占位（URL 输入框 +「选择文件」按钮），支持直接粘贴图片文件；
 * 有 src 时渲染图片 + caption 输入。
 */
import { useEffect, useRef } from "react";
import { ImageIcon } from "lucide-react";
import { resolveFileUrl } from "../upload";
import { FilePickButton } from "./FilePickButton";
import type { BlockRendererProps } from "./textBlocks";

export function ImageBlock({ ctx, block }: BlockRendererProps) {
  const src = String(block.props.src ?? "");
  const caption = String(block.props.caption ?? "");
  const alt = String(block.props.alt ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  // 新建（斜杠菜单插入）后自动聚焦 URL 输入框
  useEffect(() => {
    if (!src && ctx.editable && inputRef.current) {
      const el = inputRef.current;
      if (document.activeElement !== el) el.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commitUrl = (value: string) => {
    const url = value.trim();
    if (url) ctx.editor.updateBlock(block.id, { props: { src: url, alt: alt || url.split("/").pop() || "image" } });
  };

  // 占位框内直接粘贴图片文件（clipboardData.files）：走 uploadFile 管道
  const handlePaste = (e: React.ClipboardEvent) => {
    const file = Array.from(e.clipboardData?.files ?? []).find((f) => f.type.startsWith("image/"));
    if (!file) return;
    e.preventDefault();
    e.stopPropagation();
    void resolveFileUrl(ctx.editor, file)
      .then((url) => {
        if (url) ctx.editor.updateBlock(block.id, { props: { src: url, alt: file.name || "image" } });
      })
      .catch((err) => console.error("[k3blocks] uploadFile error", err));
  };

  if (!src) {
    if (!ctx.editable) {
      return (
        <div className="k3-image-empty">
          <ImageIcon size={20} />
          <span className="k3-image-empty-text">image.png</span>
        </div>
      );
    }
    return (
      <div className="k3-image-empty" onPaste={handlePaste}>
        <ImageIcon size={20} />
        <input
          ref={inputRef}
          className="k3-image-url"
          type="text"
          placeholder="粘贴图片 URL，回车确认"
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") {
              e.preventDefault();
              commitUrl((e.target as HTMLInputElement).value);
            }
          }}
          onBlur={(e) => commitUrl(e.target.value)}
        />
        <FilePickButton
          ctx={ctx}
          accept="image/*"
          onUrl={(url, file) => ctx.editor.updateBlock(block.id, { props: { src: url, alt: file.name || "image" } })}
        />
      </div>
    );
  }

  return (
    <figure className="k3-image">
      <img src={src} alt={alt} draggable={false} />
      {ctx.editable ? (
        <input
          className="k3-image-caption"
          type="text"
          value={caption}
          placeholder="添加说明文字"
          onKeyDown={(e) => e.stopPropagation()}
          onChange={(e) => {
            ctx.editor.store.beginTyping(block.id);
            ctx.editor.store.updateBlockSilent(block.id, { props: { caption: e.target.value } });
          }}
        />
      ) : caption ? (
        <figcaption className="k3-image-caption-static">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
