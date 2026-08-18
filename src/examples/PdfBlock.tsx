/**
 * pdf-block — 内置 pdf 块演示：props.url 指向 /sample.pdf（public 已备）。
 * 右上角浮条含「新窗口打开」「编辑链接」；空 url 时显示占位输入框。
 */
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";
import { PanelLabel } from "./shared";

function pdfDoc(): Block[] {
  return [
    {
      id: "pdf-1",
      type: "heading",
      props: { level: 2 },
      content: [{ type: "text" as const, text: "PDF 文档块" }],
      children: [],
    },
    {
      id: "pdf-2",
      type: "paragraph",
      props: {},
      content: [
        { type: "text" as const, text: "下面的 pdf 块内嵌 /sample.pdf；斜杠菜单 Media 组「PDF 文档」可再插入一个（空 url 显示占位输入框）。" },
      ],
      children: [],
    },
    {
      id: "pdf-3",
      type: "pdf",
      props: { url: "/sample.pdf" },
      content: [],
      children: [],
    },
    {
      id: "pdf-4",
      type: "paragraph",
      props: {},
      content: [],
      children: [],
    },
  ];
}

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useK3Editor, K3EditorView } from "@k3/blocks";

const doc = [
  // pdf 块：props.url 为 PDF 地址；空串时显示占位输入框
  { id: "p1", type: "pdf", props: { url: "/sample.pdf" }, content: [], children: [] },
];

export default function App() {
  const editor = useK3Editor({ initialContent: doc });
  // 斜杠菜单 Media 组「PDF 文档」也可插入；
  // 浮条按钮：「新窗口打开」「编辑链接」换 URL
  return <K3EditorView editor={editor} />;
}`,
  },
];

export default function PdfBlock({ theme }: { theme?: "light" | "dark" }) {
  const editor = useK3Editor({ initialContent: pdfDoc() });

  return (
    <div>
      <div className="px-6 py-10 md:px-10">
        <div className="mb-6">
          <PanelLabel>EDITOR — PDF 块 · /sample.pdf</PanelLabel>
        </div>
        <K3EditorView editor={editor} theme={theme} />
      </div>
      <div className="border-t border-border px-6 py-4 md:px-10">
        <p className="font-mono text-[12px] leading-[1.7] text-text-4">
          预览为固定 560px 高的 iframe（url#toolbar=0&navpanes=0）。已知限制：渲染依赖浏览器内置
          PDF viewer（各浏览器外观不同）；跨域文件受目标站 CSP / X-Frame-Options 限制；不参与「转换为」菜单。
          Markdown 导出为链接行 [url](url)。
        </p>
      </div>
    </div>
  );
}
