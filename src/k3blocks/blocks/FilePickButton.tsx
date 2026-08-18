/**
 * K3Blocks — 「选择文件」按钮（28px ghost）：选本地文件 →
 * 有 uploadFile 用 uploadFile（28px loading 态）→ 否则 FileReader dataURL。
 * image / pdf / embed 块的 URL 占位框共用。
 */
import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { resolveFileUrl } from "../upload";
import type { ViewContext } from "../viewContext";

export interface FilePickButtonProps {
  ctx: ViewContext;
  /** input[type=file] 的 accept，如 "image/*" */
  accept?: string;
  /** 上传 / 读取完成后的 URL 回调 */
  onUrl: (url: string, file: File) => void;
}

export function FilePickButton({ ctx, accept, onUrl }: FilePickButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const dict = ctx.dict.upload;

  const handleFile = async (file: File) => {
    setLoading(true);
    try {
      const url = await resolveFileUrl(ctx.editor, file);
      if (url) onUrl(url, file);
    } catch (err) {
      console.error("[k3blocks] uploadFile error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="k3-filepick"
        title={loading ? dict.uploading : dict.chooseFile}
        aria-label={loading ? dict.uploading : dict.chooseFile}
        disabled={loading}
        tabIndex={-1}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.stopPropagation();
          inputRef.current?.click();
        }}
      >
        {loading ? <Loader2 size={14} className="k3-spin" /> : <Upload size={14} />}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void handleFile(file);
        }}
      />
    </>
  );
}
