/**
 * font-style — 文字颜色 / 背景色（InlineStyles.textColor / backgroundColor）。
 * 种子文档含预染色文字；选中文字后用格式化工具栏尾部 Text color / Highlight 下拉改色。
 */
import { useState } from "react";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";
import { CopyButton, PanelLabel } from "./shared";

function fontStyleDoc(): Block[] {
  return [
    {
      id: "fs-1",
      type: "heading",
      props: { level: 2 },
      content: [{ type: "text" as const, text: "文字颜色与高亮" }],
      children: [],
    },
    {
      id: "fs-2",
      type: "paragraph",
      props: {},
      content: [
        { type: "text" as const, text: "这段文字里有 " },
        { type: "text" as const, text: "红色重点", styles: { textColor: "#e03131" } },
        { type: "text" as const, text: "、" },
        { type: "text" as const, text: "蓝色引用", styles: { textColor: "#1971c2" } },
        { type: "text" as const, text: " 和一段 " },
        {
          type: "text" as const,
          text: "橙色高亮背景",
          styles: { backgroundColor: "#e8590c33" },
        },
        { type: "text" as const, text: "。" },
      ],
      children: [],
    },
    {
      id: "fs-3",
      type: "paragraph",
      props: {},
      content: [
        { type: "text" as const, text: "选中任意文字，格式化工具栏尾部会出现 " },
        { type: "text" as const, text: "Text color", styles: { code: true } },
        { type: "text" as const, text: " 与 " },
        { type: "text" as const, text: "Highlight", styles: { code: true } },
        { type: "text" as const, text: " 两个下拉——改色后右侧 JSON 面板实时更新。" },
      ],
      children: [],
    },
    {
      id: "fs-4",
      type: "quote",
      props: {},
      content: [
        { type: "text" as const, text: "绿色同样可用：", styles: { textColor: "#2f9e44" } },
        { type: "text" as const, text: "颜色存在 styles 里，JSON 无损序列化。" },
      ],
      children: [],
    },
  ];
}

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useK3Editor, K3EditorView } from "@thejoven_com/k3blocks";

// 颜色写在 InlineStyles 上：textColor（hex）/ backgroundColor（hex8）
const doc = [
  {
    id: "p1",
    type: "paragraph",
    props: {},
    content: [
      { type: "text", text: "红色重点", styles: { textColor: "#e03131" } },
      { type: "text", text: "高亮背景", styles: { backgroundColor: "#e8590c33" } },
    ],
    children: [],
  },
];

export default function App() {
  const editor = useK3Editor({ initialContent: doc });
  // 选中文字 → 工具栏尾部 Text color / Highlight 下拉改色
  return <K3EditorView editor={editor} />;
}`,
  },
];

export default function FontStyle({ theme }: { theme?: "light" | "dark" }) {
  const [json, setJson] = useState("");
  const editor = useK3Editor({
    initialContent: fontStyleDoc(),
    onChange: (e) =>
      setJson(JSON.stringify(e.document[1]?.content ?? [], null, 2)),
  });

  return (
    <div className="grid md:grid-cols-[minmax(0,1fr)_340px]">
      <div className="px-6 py-10 md:px-10">
        <div className="mb-6">
          <PanelLabel>EDITOR — 选中文字改色</PanelLabel>
        </div>
        <K3EditorView editor={editor} theme={theme} />
      </div>
      <div className="border-t border-border md:border-l md:border-t-0">
        <div className="flex h-9 items-center justify-between border-b border-border px-4">
          <PanelLabel>STYLES — 第 2 段 content</PanelLabel>
          <CopyButton text={json || "…"} />
        </div>
        <pre className="max-h-[360px] overflow-auto p-4 font-mono text-[12px] leading-[1.7] text-text-3">
          {json || "改色后这里实时更新 styles.textColor / backgroundColor。"}
        </pre>
        <p className="border-t border-border p-4 font-mono text-[12px] leading-[1.7] text-text-4">
          色板：default / red / orange / green / blue / gray；default 清除颜色。Markdown 导出忽略颜色。
        </p>
      </div>
    </div>
  );
}
