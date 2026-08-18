/**
 * MiniEditor — 活的只读迷你编辑器预览（blocks.md §2.6：渲染为真实只读编辑器，
 * 而非截图）。用于索引磁贴与 light/dark 缩略预览。
 */
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";

export default function MiniEditor({
  seed,
  theme,
  className,
}: {
  seed: Block[];
  /** 省略时继承宿主页面的 CSS 变量（索引磁贴跟随站点主题） */
  theme?: "light" | "dark";
  className?: string;
}) {
  const editor = useK3Editor({ initialContent: seed, editable: false });
  return (
    <K3EditorView
      editor={editor}
      editable={false}
      theme={theme}
      slashMenu={false}
      formattingToolbar={false}
      sideMenu={false}
      className={className}
    />
  );
}
