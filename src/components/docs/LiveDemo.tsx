/**
 * LiveDemo — FEATURES 栏目统一的可运行 demo 面板（docs.md §2/§3.3 形态）：
 * 44px 控制条（Edit | JSON 分段、demo 主题开关、可选 barExtra、Reset）、
 * 凹陷画布内真实 K3EditorView、底部可选 kbd 提示条。
 * 与 blocks 区 BlockDemoPanel 同一模式，但以种子 Block[] 直接入参。
 */
import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, RotateCcw, Sun } from "lucide-react";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block, K3Editor, K3EditorViewProps } from "@/k3blocks";
import CodeBlock from "@/components/CodeBlock";
import Kbd from "@/components/Kbd";
import { cn } from "@/lib/utils";

export interface DemoHint {
  keys?: string[];
  text: string;
}

function cloneBlocks(blocks: Block[]): Block[] {
  return JSON.parse(JSON.stringify(blocks)) as Block[];
}

export default function LiveDemo({
  seed,
  hints,
  barExtra,
  blockRenderers,
  placeholder,
  className,
}: {
  /** 初始文档（内部克隆，Reset 时重播） */
  seed: Block[];
  /** 画布下方 kbd 提示条 */
  hints?: DemoHint[];
  /** 控制条右侧额外控件（语言选择、切换示例等） */
  barExtra?: (editor: K3Editor) => ReactNode;
  /** 自定义块渲染口（CustomBlocks 页） */
  blockRenderers?: K3EditorViewProps["blockRenderers"];
  placeholder?: string;
  className?: string;
}) {
  const [view, setView] = useState<"edit" | "json">("edit");
  const [demoTheme, setDemoTheme] = useState<"dark" | "light">("dark");
  const [docVersion, setDocVersion] = useState(0);
  const [resetTick, setResetTick] = useState(0);

  const editor = useK3Editor({
    initialContent: cloneBlocks(seed),
    onChange: () => setDocVersion((v) => v + 1),
  });

  const json = useMemo(
    () => JSON.stringify(editor.document, null, 2),
    // docVersion 随每次 onChange 递增，驱动重新读取 editor.document
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, docVersion],
  );

  const reset = () => {
    const ids = editor.document.map((blk) => blk.id);
    if (ids.length > 0) editor.removeBlocks(ids);
    editor.insertBlocks(cloneBlocks(seed));
    setResetTick((k) => k + 1);
  };

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-surface-1", className)}>
      {/* 控制条（44px） */}
      <div className="flex min-h-11 flex-wrap items-center gap-3 border-b border-border px-3 py-1.5">
        <div className="flex h-7 items-center rounded-lg border border-border p-0.5">
          {(["edit", "json"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                "flex h-6 items-center rounded-md px-2.5 font-mono text-[12px] transition-colors duration-150 ease-k3",
                view === v
                  ? "border border-border bg-surface-2 text-text-1"
                  : "border border-transparent text-text-3 hover:text-text-2",
              )}
            >
              {v === "edit" ? "Edit" : "JSON"}
            </button>
          ))}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {barExtra?.(editor)}

          <button
            type="button"
            aria-label="切换 demo 主题"
            onClick={() => setDemoTheme((th) => (th === "dark" ? "light" : "dark"))}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-text-2 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-1"
          >
            <span
              className="flex transition-transform duration-200 ease-k3"
              style={{ transform: demoTheme === "dark" ? "rotate(0deg)" : "rotate(180deg)" }}
            >
              {demoTheme === "dark" ? (
                <Sun size={15} strokeWidth={1.5} />
              ) : (
                <Moon size={15} strokeWidth={1.5} />
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={reset}
            className="flex h-7 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[12px] text-text-2 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-1"
          >
            <RotateCcw size={13} strokeWidth={1.5} />
            Reset
          </button>
        </div>
      </div>

      {/* 画布 / JSON 视图 */}
      <div className="bg-surface-inset px-5 py-8 md:px-10 md:py-10">
        <AnimatePresence mode="wait" initial={false}>
          {view === "edit" ? (
            <motion.div
              key={`edit-${resetTick}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: view === "edit" && resetTick > 0 ? 0.2 : 0.15 }}
            >
              <K3EditorView
                editor={editor}
                theme={demoTheme}
                slashMenu
                formattingToolbar
                sideMenu
                blockRenderers={blockRenderers}
                placeholder={placeholder}
              />
            </motion.div>
          ) : (
            <motion.div
              key="json"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <CodeBlock code={json} language="json" className="max-h-[420px] overflow-y-auto" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 提示条 */}
      {hints && hints.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-4 py-2.5 text-[12px] text-text-3">
          {hints.map((hint, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {hint.keys?.map((key) => <Kbd key={key}>{key}</Kbd>)}
              {hint.text}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
