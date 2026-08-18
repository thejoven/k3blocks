/**
 * K3Blocks — 文件上传管道：优先走 useK3Editor({ uploadFile })，
 * 缺省回退 FileReader 读 dataURL。image/pdf/embed 的「选择文件」与
 * 图片粘贴/拖拽均走此管道。
 */

export interface K3UploadHost {
  uploadFile?: (file: File) => Promise<string>;
}

/** 本地文件 → 可用 URL（有 uploadFile 用 uploadFile，否则 dataURL） */
export async function resolveFileUrl(host: K3UploadHost, file: File): Promise<string> {
  if (host.uploadFile) return host.uploadFile(file);
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("FileReader failed"));
    reader.readAsDataURL(file);
  });
}
