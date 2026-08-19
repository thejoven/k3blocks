/**
 * use-with-shadcn — shadcn/ui 外置 chrome：Button + Popover（块操作）+
 * Dialog（JSON 导出）。编辑器不传 theme，完全继承宿主页面 CSS 变量，
 * 与 shadcn 主题共存。
 */
import { useState } from "react";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import { sampleDocument } from "@/lib/sampleDoc";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PanelLabel } from "./shared";

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useK3Editor, K3EditorView } from "@thejoven_com/k3blocks";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function App() {
  const editor = useK3Editor({ initialContent: doc });

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">块操作</Button>
        </PopoverTrigger>
        <PopoverContent className="w-44">
          <Button variant="ghost" size="sm" onClick={() => editor.undo()}>Undo</Button>
        </PopoverContent>
      </Popover>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">导出 JSON</Button>
        </DialogTrigger>
        <DialogContent>
          <pre>{JSON.stringify(editor.document, null, 2)}</pre>
        </DialogContent>
      </Dialog>

      {/* 不传 theme —— 编辑器继承宿主（含 shadcn 主题变量） */}
      <K3EditorView editor={editor} />
    </>
  );
}`,
  },
];

export default function UseWithShadcn({ theme }: { theme?: "light" | "dark" }) {
  const editor = useK3Editor({
    initialContent: sampleDocument().slice(0, 5),
    onChange: () => setJson(JSON.stringify(editor.document, null, 2)),
  });
  const [json, setJson] = useState(() => JSON.stringify(editor.document, null, 2));

  const insertParagraph = () =>
    editor.insertBlocks([
      { type: "paragraph", content: [{ type: "text", text: "这段来自 shadcn Popover 按钮。" }] },
    ]);

  return (
    <div className="px-6 py-10 md:px-16">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <PanelLabel>SHADCN CHROME</PanelLabel>
        <span className="flex-1" />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">块操作</Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="flex w-44 flex-col gap-1 p-1">
            <Button variant="ghost" size="sm" className="justify-start" onClick={insertParagraph}>
              文末插入段落
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => {
                const last = editor.document[editor.document.length - 1];
                if (last) editor.removeBlocks([last.id]);
              }}
            >
              删除末块
            </Button>
            <Button variant="ghost" size="sm" className="justify-start" onClick={() => editor.undo()}>
              Undo
            </Button>
            <Button variant="ghost" size="sm" className="justify-start" onClick={() => editor.redo()}>
              Redo
            </Button>
          </PopoverContent>
        </Popover>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">导出 JSON</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[70vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>DOCUMENT JSON</DialogTitle>
            </DialogHeader>
            <pre className="overflow-auto font-mono text-[12px] leading-[1.7] text-text-3">
              {json}
            </pre>
          </DialogContent>
        </Dialog>
      </div>
      {/* 不传 theme：编辑器继承宿主页面变量，与 shadcn 主题共存 */}
      <K3EditorView editor={editor} theme={theme} />
      <p className="mt-6 font-mono text-[12px] leading-[1.7] text-text-4">
        编辑器省略 theme 时继承宿主 CSS 变量——宿主换成 shadcn 主题，编辑器跟随换肤。
      </p>
    </div>
  );
}
