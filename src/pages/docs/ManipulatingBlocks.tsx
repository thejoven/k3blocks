import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";
import CodeBlock from "@/components/CodeBlock";
import DocsShell from "@/components/docs/DocsShell";
import { CardStrip, DemoFrame, H2, InlineCode, P } from "@/components/docs/primitives";
import { txt, useEditorVersion } from "@/components/docs/utils";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block, K3Editor } from "@/k3blocks";

/**
 * Manipulating blocks (docs.md §3.2): method cards with live Run buttons +
 * a sandbox strip at the bottom (mini editor + mono event log, last 5 ops).
 */

const SANDBOX_DOC: Block[] = [
  { id: "s1", type: "heading", props: { level: 1 }, content: [txt("操作台")], children: [] },
  {
    id: "s2",
    type: "paragraph",
    props: {},
    content: [txt("用每个方法卡片上的 Run 按钮操作这份文档。")],
    children: [],
  },
  {
    id: "s3",
    type: "bulletListItem",
    props: {},
    content: [txt("事件日志在右侧。")],
    children: [],
  },
];

function RunButton({ onRun, label = "Run" }: { onRun: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onRun}
      className="flex h-7 items-center gap-1.5 rounded-lg border border-border px-2.5 font-mono text-[12px] text-text-2 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-1"
    >
      <Play size={12} strokeWidth={1.5} />
      {label}
    </button>
  );
}

function MethodCard({
  signature,
  description,
  code,
  action,
}: {
  signature: ReactNode;
  description: ReactNode;
  code: string;
  action?: ReactNode;
}) {
  return (
    <div className="mt-4 rounded-lg border border-border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-mono text-[15px] font-medium text-text-1">{signature}</h3>
        {action}
      </div>
      <p className="mt-2 max-w-[68ch] text-sm leading-[1.65] text-text-2">{description}</p>
      <CodeBlock className="mt-3" code={code} language="tsx" />
    </div>
  );
}

function HistoryButtons({ editor, log }: { editor: K3Editor; log: (t: string) => void }) {
  // Re-read canUndo / canRedo on every change.
  useEditorVersion(editor);
  const cls =
    "flex h-7 items-center rounded-lg border border-border px-2.5 font-mono text-[12px] transition-colors duration-150 ease-k3 disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <span className="flex gap-2">
      <button
        type="button"
        disabled={!editor.canUndo}
        onClick={() => {
          editor.undo();
          log("undo()");
        }}
        className={`${cls} text-text-2 hover:bg-hover-overlay hover:text-text-1`}
      >
        undo()
      </button>
      <button
        type="button"
        disabled={!editor.canRedo}
        onClick={() => {
          editor.redo();
          log("redo()");
        }}
        className={`${cls} text-text-2 hover:bg-hover-overlay hover:text-text-1`}
      >
        redo()
      </button>
    </span>
  );
}

/** Page body — remounted via key to implement Reset document. */
function Body({ onReset }: { onReset: () => void }) {
  const editor = useK3Editor({ initialContent: SANDBOX_DOC });
  const [logs, setLogs] = useState<{ id: number; text: string }[]>([]);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const seq = useRef(0);

  const log = (text: string) =>
    setLogs((rows) => [{ id: ++seq.current, text }, ...rows].slice(0, 5));

  // Always read block ids at click time — the document mutates outside React state.

  return (
    <>
      <H2 id="reading">读取文档。</H2>
      <MethodCard
        signature={
          <>
            <span className="text-accent">editor.document</span>: Block[]
          </>
        }
        description="当前完整文档。getter —— 任何变更之后重新读取即可拿到最新值。"
        code={`const json = JSON.stringify(editor.document, null, 2);
localStorage.setItem("doc", json);`}
        action={
          <RunButton onRun={() => log(`document → Block[${editor.document.length}]（顶层块）`)} />
        }
      />

      <H2 id="inserting">插入块。</H2>
      <MethodCard
        signature={
          <>
            <span className="text-accent">insertBlocks</span>(blocks, refId?, placement?)
          </>
        }
        description={
          <>
            在参照块的之前（<InlineCode>"before"</InlineCode>）、之后（
            <InlineCode>"after"</InlineCode>）或内部（<InlineCode>"nested"</InlineCode>
            ）插入；省略 refId 时追加到文档末尾。返回插入的块。
          </>
        }
        code={`editor.insertBlocks(
  [{ type: "paragraph", content: [{ type: "text", text: "新段落" }] }],
  "s1",      // 参照块 id，可省略
  "after",   // before | after | nested
);`}
        action={
          <RunButton
            onRun={() => {
              const firstId = editor.document[0]?.id;
              if (!firstId) return;
              editor.insertBlocks(
                [{ type: "paragraph", content: [{ type: "text", text: "新插入的段落" }] }],
                firstId,
                "after",
              );
              log(`insertBlocks [paragraph] after ${firstId}`);
            }}
          />
        }
      />

      <H2 id="updating">更新块。</H2>
      <MethodCard
        signature={
          <>
            <span className="text-accent">updateBlock</span>(id, partial)
          </>
        }
        description="更新块的 type / props / content。只传需要修改的字段，其余保持不动。"
        code={`editor.updateBlock("s1", {
  type: "heading",
  props: { level: 2 },
});`}
        action={
          <RunButton
            onRun={() => {
              const h = editor.getBlock("s1");
              if (!h) {
                log("updateBlock —— 块 s1 已被删除");
                return;
              }
              const level = ((h.props.level as number) % 3) + 1;
              editor.updateBlock("s1", { props: { level } });
              log(`updateBlock s1 { props: { level: ${level} } }`);
            }}
          />
        }
      />

      <H2 id="removing">删除块。</H2>
      <MethodCard
        signature={
          <>
            <span className="text-accent">removeBlocks</span>(ids: string[])
          </>
        }
        description="按 id 批量删除。删除父块会连同 children 一起删除。"
        code={`editor.removeBlocks(["s3"]);`}
        action={
          <RunButton
            onRun={() => {
              const doc = editor.document;
              const lastId = doc[doc.length - 1]?.id;
              if (!lastId) {
                log("removeBlocks —— 文档已空");
                return;
              }
              editor.removeBlocks([lastId]);
              log(`removeBlocks ["${lastId}"]`);
            }}
          />
        }
      />

      <H2 id="history">撤销与重做。</H2>
      <MethodCard
        signature={
          <>
            <span className="text-accent">undo</span>() / <span className="text-accent">redo</span>()
          </>
        }
        description={
          <>
            自维护操作栈 —— 用户输入与 API 调用都会入栈。用 <InlineCode>canUndo</InlineCode> /{" "}
            <InlineCode>canRedo</InlineCode> 驱动按钮的可用态。
          </>
        }
        code={`if (editor.canUndo) editor.undo();
if (editor.canRedo) editor.redo();`}
        action={<HistoryButtons editor={editor} log={log} />}
      />

      <H2 id="exporting">导出。</H2>
      <MethodCard
        signature={
          <>
            <span className="text-accent">blocksToMarkdown</span>() → string
          </>
        }
        description="把当前文档导出为 Markdown —— 无损 JSON 之外的第二种交换格式。"
        code={`const md = editor.blocksToMarkdown();`}
        action={
          <RunButton
            label="Run → Markdown"
            onRun={() => {
              const md = editor.blocksToMarkdown();
              setMarkdown(md);
              log(`blocksToMarkdown → ${md.length} 字符`);
            }}
          />
        }
      />
      {markdown !== null && (
        <CodeBlock className="mt-3" code={markdown || "（空文档）"} language="md" />
      )}

      <H2 id="sandbox">实时操作台。</H2>
      <P>上面所有 Run 按钮操作的都是这份文档。事件日志记录最近 5 次 API 调用：</P>
      <DemoFrame
        className="mt-4"
        bodyClassName="p-0"
        bar={
          <>
            <span className="font-mono text-[12px] text-text-4">sandbox</span>
            <button
              type="button"
              onClick={onReset}
              className="ml-auto flex h-7 items-center gap-1.5 rounded-lg border border-border px-2.5 font-mono text-[12px] text-text-2 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-1"
            >
              <RotateCcw size={12} strokeWidth={1.5} />
              Reset document
            </button>
          </>
        }
      >
        <div className="grid md:grid-cols-2">
          <div className="px-4 py-4 sm:px-6">
            <K3EditorView editor={editor} placeholder="输入 '/' 查看命令" />
          </div>
          <div className="border-t border-border bg-surface-inset p-3 md:border-l md:border-t-0">
            <div className="font-mono text-[12px] text-text-4">event log — last 5 ops</div>
            <div className="mt-2 flex min-h-[120px] flex-col gap-1.5">
              <AnimatePresence initial={false}>
                {logs.map((l) => (
                  <motion.div
                    key={l.id}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    className="rounded-md border border-border bg-surface-1 px-2 py-1 font-mono text-[12px] text-text-2"
                  >
                    {l.text}
                  </motion.div>
                ))}
              </AnimatePresence>
              {logs.length === 0 && (
                <span className="font-mono text-[12px] text-text-4">（点任意 Run 按钮）</span>
              )}
            </div>
          </div>
        </div>
      </DemoFrame>
    </>
  );
}

export default function ManipulatingBlocks() {
  const [resetKey, setResetKey] = useState(0);

  return (
    <DocsShell
      crumbs={["Docs", "Foundations", "Manipulating blocks"]}
      title="Manipulating blocks."
      lead="编辑器实例提供一组命令式方法。每个方法卡片上都有 Run —— 点它，观察底部真实文档的变化。"
    >
      <Body key={resetKey} onReset={() => setResetKey((k) => k + 1)} />

      <H2 id="examples">相关示例。</H2>
      <CardStrip
        cards={[
          { to: "/examples/controlled", title: "Controlled Editor", description: "onChange + document 驱动宿主状态。" },
          { to: "/examples/json-round-trip", title: "JSON Round-trip", description: "导出、存储、重新挂载的完整闭环。" },
          { to: "/docs/api", title: "API Reference", description: "全部实例方法的签名与参数表。" },
        ]}
      />
    </DocsShell>
  );
}
