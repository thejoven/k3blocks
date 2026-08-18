/**
 * IMPORT 栏目共用 demo：mono 源码 textarea（预填示例 + 「从剪贴板粘贴」）+
 * 「导入」按钮 → 下方编辑器实时展示解析结果。
 * 导入流程：tryParse*ToBlocks() → removeBlocks 清空 → insertBlocks 插入
 * （清空时编辑器自动补的空段落会被清掉）。
 */
import { useState, type ReactNode } from "react";
import { ArrowDownToLine, ClipboardPaste } from "lucide-react";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";
import { cn } from "@/lib/utils";
import { ActionButton, FeedbackChip, useFeedback } from "../export/shared";

/** 28px ghost 按钮（与 ActionButton 同刻度，描边版）。 */
export function GhostAction({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-7 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[12px] text-text-2 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-1",
        className,
      )}
    >
      {children}
    </button>
  );
}

export default function ImportDemo({
  initialSource,
  parse,
  sourceLabel,
  className,
}: {
  /** 预填在 textarea 里的示例源码 */
  initialSource: string;
  /** 解析器：tryParseHTMLToBlocks / tryParseMarkdownToBlocks */
  parse: (src: string) => Block[];
  /** mono 标：HTML / Markdown */
  sourceLabel: string;
  className?: string;
}) {
  const [source, setSource] = useState(initialSource);
  const [count, setCount] = useState<number | null>(null);
  const { feedback, show } = useFeedback();
  const editor = useK3Editor({
    initialContent: [
      { id: "im-empty", type: "paragraph", props: {}, content: [], children: [] },
    ],
  });

  const doImport = () => {
    const parsed = parse(source);
    if (parsed.length === 0) {
      show({ kind: "err", text: "未解析出任何块——请检查源码" });
      return;
    }
    editor.removeBlocks(editor.document.map((b) => b.id));
    editor.insertBlocks(parsed);
    // removeBlocks 清空文档时编辑器自动补一个空段落：若它排在解析结果之前则移除
    const first = editor.document[0];
    if (
      first &&
      first.type === "paragraph" &&
      first.content.length === 0 &&
      editor.document.length > parsed.length
    ) {
      editor.removeBlocks([first.id]);
    }
    setCount(parsed.length);
    show({ kind: "ok", text: `已导入 ${parsed.length} 个块` });
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        show({ kind: "err", text: "剪贴板为空" });
        return;
      }
      setSource(text);
      show({ kind: "ok", text: `已读取剪贴板 · ${text.length} 字符` });
    } catch {
      show({ kind: "err", text: "剪贴板读取被拒绝——请手动粘贴" });
    }
  };

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-surface-1", className)}>
      {/* 操作条（44px） */}
      <div className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-3 py-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-4">
          {sourceLabel} source
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <FeedbackChip feedback={feedback} />
          <GhostAction onClick={pasteFromClipboard}>
            <ClipboardPaste size={13} strokeWidth={1.5} />
            从剪贴板粘贴
          </GhostAction>
          <ActionButton onClick={doImport}>
            <ArrowDownToLine size={13} strokeWidth={1.5} />
            导入
          </ActionButton>
        </div>
      </div>

      {/* 源码输入井 */}
      <textarea
        value={source}
        onChange={(e) => setSource(e.target.value)}
        spellCheck={false}
        placeholder={`粘贴 ${sourceLabel} 源码…`}
        className="h-44 w-full resize-y border-b border-border bg-surface-inset px-4 py-3 font-mono text-[12px] leading-[1.7] text-text-2 outline-none placeholder:text-text-4"
      />

      {/* 解析结果 */}
      <div className="flex h-9 items-center justify-between border-b border-border px-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-4">
          解析结果{count !== null ? ` — ${count} 个块 · 可继续编辑` : " — 等待导入"}
        </span>
      </div>
      <div className="bg-surface-inset px-5 py-8 md:px-8">
        <K3EditorView
          editor={editor}
          slashMenu
          formattingToolbar
          sideMenu
          placeholder="点「导入」查看解析结果…"
        />
      </div>
    </div>
  );
}
