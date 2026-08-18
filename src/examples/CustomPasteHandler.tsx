/**
 * custom-paste-handler — pasteHandler 拦截粘贴：
 * 图片 URL（.png/.jpg/.svg/.webp）→ 插入 image 块；多行文本 → 按行拆成多个
 * paragraph；其余返回 false 走默认。面板附可复制的测试字符串。
 */
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { K3PasteHandler } from "@/k3blocks";
import { helloDocument } from "@/lib/sampleDoc";
import { CopyButton, PanelLabel } from "./shared";

const IMAGE_URL = "https://example.com/assets/hero.png";
const MULTILINE = "第一行：粘贴后按行拆块\n第二行：每行一个 paragraph\n第三行：返回 true 阻止默认";

/** 图片 URL → image 块；多行文本 → 按行拆块；其余走默认。 */
const pasteHandler: K3PasteHandler = (e, editor) => {
  const text = e.clipboardData?.getData("text/plain")?.trim() ?? "";
  if (!text) return false;

  // 1) 图片 URL → 插入 image 块
  if (/^https?:\/\/\S+\.(png|jpe?g|svg|webp)$/i.test(text)) {
    const refId = editor.getSelection()?.blockIds[0] ?? null;
    editor.insertBlocks([{ type: "image", props: { src: text, alt: text } }], refId, "after");
    return true;
  }

  // 2) 多行文本 → 按行拆成多个 paragraph
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length > 1) {
    const refId = editor.getSelection()?.blockIds[0] ?? null;
    editor.insertBlocks(
      lines.map((l) => ({ type: "paragraph", content: [{ type: "text" as const, text: l }] })),
      refId,
      "after",
    );
    return true;
  }

  return false; // 其余走默认粘贴
};

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useK3Editor, K3EditorView } from "@k3/blocks";

export default function App() {
  const editor = useK3Editor({
    initialContent: doc,
    // 组件根 paste 捕获阶段优先调用；返回 true 阻止默认粘贴
    pasteHandler: (e, editor) => {
      const text = e.clipboardData?.getData("text/plain")?.trim() ?? "";

      // 图片 URL → image 块
      if (/^https?:\\/\\/\\S+\\.(png|jpe?g|svg|webp)$/i.test(text)) {
        editor.insertBlocks([{ type: "image", props: { src: text } }]);
        return true;
      }

      // 多行文本 → 按行拆成多个 paragraph
      const lines = text.split("\\n").filter(Boolean);
      if (lines.length > 1) {
        editor.insertBlocks(lines.map((l) => ({ type: "paragraph", content: l })));
        return true;
      }

      return false; // 其余走默认
    },
  });
  return <K3EditorView editor={editor} />;
}`,
  },
];

export default function CustomPasteHandler({ theme }: { theme?: "light" | "dark" }) {
  const editor = useK3Editor({ initialContent: helloDocument(), pasteHandler });

  return (
    <div className="grid md:grid-cols-[minmax(0,1fr)_340px]">
      <div className="px-6 py-10 md:px-10">
        <div className="mb-6">
          <PanelLabel>EDITOR — 自定义 pasteHandler</PanelLabel>
        </div>
        <K3EditorView editor={editor} theme={theme} placeholder="在这里粘贴（⌘V）试试…" />
      </div>
      <div className="border-t border-border md:border-l md:border-t-0">
        <div className="flex h-9 items-center border-b border-border px-4">
          <PanelLabel>TEST CLIPS — 复制后粘贴到左侧</PanelLabel>
        </div>
        <div className="flex flex-col gap-4 p-4">
          <div>
            <p className="mb-2 font-mono text-[12px] leading-[1.7] text-text-3">
              图片 URL → 插入 image 块
            </p>
            <div className="flex items-center justify-between gap-2 rounded-lg border border-border px-2.5 py-1.5">
              <code className="truncate font-mono text-[12px] text-text-2">{IMAGE_URL}</code>
              <CopyButton text={IMAGE_URL} />
            </div>
          </div>
          <div>
            <p className="mb-2 font-mono text-[12px] leading-[1.7] text-text-3">
              多行文本 → 按行拆成 paragraph
            </p>
            <div className="flex items-start justify-between gap-2 rounded-lg border border-border px-2.5 py-1.5">
              <code className="whitespace-pre-line font-mono text-[12px] leading-[1.7] text-text-2">
                {MULTILINE}
              </code>
              <CopyButton text={MULTILINE} />
            </div>
          </div>
          <p className="font-mono text-[12px] leading-[1.7] text-text-4">
            单行普通文本返回 false，走默认粘贴（块内插入）。
          </p>
        </div>
      </div>
    </div>
  );
}
