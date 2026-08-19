/**
 * use-with-ariakit — Ariakit 外置 chrome：Button / Popover（块操作）/
 * Dialog（JSON 导出）。Ariakit 无样式，外观完全由 design.md 令牌驱动
 * （1px 发丝线、28px 刻度、不发亮、不投影）。
 */
import { useState } from "react";
import * as Ariakit from "@ariakit/react";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import { sampleDocument } from "@/lib/sampleDoc";
import { PanelLabel } from "./shared";

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import * as Ariakit from "@ariakit/react";
import { useK3Editor, K3EditorView } from "@thejoven_com/k3blocks";

export default function App() {
  const editor = useK3Editor({ initialContent: doc });

  return (
    <>
      {/* Ariakit 无样式——className 用宿主设计令牌 */}
      <Ariakit.PopoverProvider>
        <Ariakit.PopoverDisclosure className="ak-btn">块操作</Ariakit.PopoverDisclosure>
        <Ariakit.Popover className="ak-panel">
          <Ariakit.Button
            className="ak-btn"
            onClick={() =>
              editor.insertBlocks([{ type: "paragraph", content: "来自 Ariakit Popover" }])
            }
          >
            文末插入段落
          </Ariakit.Button>
          <Ariakit.Button className="ak-btn" onClick={() => editor.undo()}>
            Undo
          </Ariakit.Button>
        </Ariakit.Popover>
      </Ariakit.PopoverProvider>

      <Ariakit.DialogProvider>
        <Ariakit.DialogDisclosure className="ak-btn">导出 JSON</Ariakit.DialogDisclosure>
        <Ariakit.Dialog className="ak-dialog">
          <pre>{JSON.stringify(editor.document, null, 2)}</pre>
        </Ariakit.Dialog>
      </Ariakit.DialogProvider>

      <K3EditorView editor={editor} />
    </>
  );
}`,
  },
];

/** 28px ghost 按钮（design.md 令牌：border / hover-overlay / text-2 → text-1）。 */
const AK_BTN =
  "flex h-7 items-center rounded-lg border border-border px-2.5 text-[12px] text-text-2 transition-colors duration-150 hover:bg-hover-overlay hover:text-text-1";
const AK_ITEM =
  "flex h-7 w-full items-center rounded-md px-2.5 text-left text-[12px] text-text-2 transition-colors duration-150 hover:bg-hover-overlay hover:text-text-1";

export default function UseWithAriakit({ theme }: { theme?: "light" | "dark" }) {
  const editor = useK3Editor({
    initialContent: sampleDocument().slice(0, 5),
    onChange: () => setJson(JSON.stringify(editor.document, null, 2)),
  });
  const [json, setJson] = useState(() => JSON.stringify(editor.document, null, 2));

  const insertParagraph = () =>
    editor.insertBlocks([
      { type: "paragraph", content: [{ type: "text", text: "这段来自 Ariakit Popover 按钮。" }] },
    ]);

  return (
    <div className="px-6 py-10 md:px-16">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <PanelLabel>ARIAKIT CHROME</PanelLabel>
        <span className="flex-1" />
        <Ariakit.PopoverProvider placement="bottom-start">
          <Ariakit.PopoverDisclosure className={AK_BTN}>块操作</Ariakit.PopoverDisclosure>
          <Ariakit.Popover
            gutter={6}
            className="z-50 flex w-44 flex-col gap-0.5 rounded-lg border border-border bg-surface-1 p-1"
          >
            <Ariakit.Button className={AK_ITEM} onClick={insertParagraph}>
              文末插入段落
            </Ariakit.Button>
            <Ariakit.Button
              className={AK_ITEM}
              onClick={() => {
                const last = editor.document[editor.document.length - 1];
                if (last) editor.removeBlocks([last.id]);
              }}
            >
              删除末块
            </Ariakit.Button>
            <Ariakit.Button className={AK_ITEM} onClick={() => editor.undo()}>
              Undo
            </Ariakit.Button>
            <Ariakit.Button className={AK_ITEM} onClick={() => editor.redo()}>
              Redo
            </Ariakit.Button>
          </Ariakit.Popover>
        </Ariakit.PopoverProvider>
        <Ariakit.DialogProvider>
          <Ariakit.DialogDisclosure className={AK_BTN}>导出 JSON</Ariakit.DialogDisclosure>
          <Ariakit.Dialog
            backdrop={<div className="fixed inset-0 bg-black/60" />}
            className="fixed left-1/2 top-1/2 z-50 flex max-h-[70vh] w-[min(560px,90vw)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border border-border bg-surface-1"
          >
            <div className="flex h-9 items-center justify-between border-b border-border px-4">
              <Ariakit.DialogHeading className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-4">
                DOCUMENT JSON
              </Ariakit.DialogHeading>
              <Ariakit.DialogDismiss className={AK_BTN}>关闭</Ariakit.DialogDismiss>
            </div>
            <pre className="overflow-auto p-4 font-mono text-[12px] leading-[1.7] text-text-3">
              {json}
            </pre>
          </Ariakit.Dialog>
        </Ariakit.DialogProvider>
      </div>
      <K3EditorView editor={editor} theme={theme} />
      <p className="mt-6 font-mono text-[12px] leading-[1.7] text-text-4">
        Ariakit 只负责可访问性与交互（focus trap / esc / 点击外部关闭），视觉完全走宿主令牌。
      </p>
    </div>
  );
}
