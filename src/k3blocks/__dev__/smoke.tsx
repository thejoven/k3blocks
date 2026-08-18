/**
 * K3Blocks — 开发自测组件（不被 App 引用）。
 * 手动挂载：在任意页面 import { K3BlocksSmoke } from "@/k3blocks/__dev__/smoke"。
 */
import { useState } from "react";
import { K3EditorView } from "../K3EditorView";
import { useK3Editor } from "../useK3Editor";
import type { Block } from "../types";

const SEED: Block[] = [
  { id: "b1", type: "heading", props: { level: 1 }, content: [{ type: "text", text: "K3Blocks 冒烟测试" }], children: [] },
  {
    id: "b2",
    type: "paragraph",
    props: {},
    content: [
      { type: "text", text: "支持 " },
      { type: "text", text: "加粗", styles: { bold: true } },
      { type: "text", text: "、" },
      { type: "text", text: "行内代码", styles: { code: true } },
      { type: "text", text: " 与 " },
      { type: "link", href: "https://example.com", content: [{ type: "text", text: "链接" }] },
      { type: "text", text: "。输入 / 唤起菜单。" },
    ],
    children: [],
  },
  { id: "b3", type: "bulletListItem", props: {}, content: [{ type: "text", text: "无序列表" }], children: [] },
  { id: "b4", type: "checkListItem", props: { checked: true }, content: [{ type: "text", text: "已完成事项" }], children: [] },
  { id: "b5", type: "quote", props: {}, content: [{ type: "text", text: "Surfaces, not shadows." }], children: [] },
  { id: "b6", type: "codeBlock", props: { language: "ts" }, content: [{ type: "text", text: "const editor = useK3Editor()" }], children: [] },
  { id: "b7", type: "divider", props: {}, content: [], children: [] },
  { id: "b8", type: "paragraph", props: {}, content: [], children: [] },
];

export function K3BlocksSmoke() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const editor = useK3Editor({
    initialContent: SEED,
    onChange: (e) => {
      // 冒烟：console 验证 onChange 触发
      console.debug("[k3blocks] change, blocks =", e.document.length);
    },
  });
  return (
    <div style={{ padding: 24, background: "var(--bg, #111)" }}>
      <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
        <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          theme: {theme}
        </button>
        <button type="button" onClick={() => editor.undo()} disabled={!editor.canUndo}>
          undo
        </button>
        <button type="button" onClick={() => editor.redo()} disabled={!editor.canRedo}>
          redo
        </button>
        <button type="button" onClick={() => console.log(editor.blocksToMarkdown())}>
          log markdown
        </button>
      </div>
      <K3EditorView editor={editor} theme={theme} />
    </div>
  );
}
