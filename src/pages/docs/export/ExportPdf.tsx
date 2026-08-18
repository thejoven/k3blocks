/**
 * /docs/export/pdf — editor.print() 打印导出（另存为 PDF）。
 */
import { Printer } from "lucide-react";
import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import DocsShell from "@/components/docs/DocsShell";
import { CardStrip, DocTable, H2, InlineCode, MonoCell, P } from "@/components/docs/primitives";
import ExportDemo, { ActionButton, FeedbackChip, useFeedback } from "./shared";

const API_CODE = `// 打开新窗口渲染 blocksToHTML + 内联打印样式，随后调 window.print()
editor.print({ title: "产品周报" });

// 纯函数形态（任意 Block[]）
import { printBlocks } from "@k3/blocks";
printBlocks(blocks, { title: "产品周报" });`;

export default function ExportPdf() {
  const { feedback, show } = useFeedback();

  return (
    <DocsShell
      crumbs={["Docs", "Export", "PDF"]}
      title="Exporting to PDF."
      lead="PDF 导出走浏览器打印管道：editor.print() 打开新窗口，用 blocksToHTML + 内联打印样式（A4、衬线标题、代码块灰底）渲染文档并调起 window.print()——在打印对话框里选「另存为 PDF」即可。"
    >
      <H2 id="api">API。</H2>
      <P>
        <InlineCode>editor.print(opts?: {"{ title?: string }"}): void</InlineCode>
        。<InlineCode>title</InlineCode> 会成为打印窗口的文档标题（也即另存 PDF
        时的默认文件名）。纯函数形态 <InlineCode>printBlocks(blocks, opts)</InlineCode>{" "}
        同样从包入口导出。
      </P>
      <CodeBlock className="mt-4" code={API_CODE} language="ts" />

      <H2 id="demo">在线体验。</H2>
      <P>
        编辑文档后点「打印 / 另存为 PDF」——新窗口中是排好版的文档，浏览器打印对话框随即弹出。
      </P>
      <ExportDemo
        className="mt-4"
        actions={(editor) => (
          <>
            <FeedbackChip feedback={feedback} />
            <ActionButton
              onClick={() => {
                editor.print({ title: "K3Blocks 文档" });
                show({ kind: "ok", text: "已打开打印窗口（未弹出请检查弹窗拦截）" });
              }}
            >
              <Printer size={13} strokeWidth={1.5} />
              打印 / 另存为 PDF
            </ActionButton>
          </>
        )}
      />

      <H2 id="coverage">打印样式。</H2>
      <DocTable
        columns={["项", "行为"]}
        rows={[
          ["页面", <MonoCell>A4，标准页边距</MonoCell>],
          ["标题", "衬线字重排（print-only 样式，不影响屏幕主题）"],
          ["代码块", "灰底等宽，长行折行"],
          ["待办列表", <MonoCell>☐ / ☑ 符号</MonoCell>],
          ["mention / 染色文字", "颜色以 inline style 保留"],
          ["math", "LaTeX 源码文本（打印页不加载 KaTeX）"],
        ]}
      />

      <Callout className="mt-6" title="已知限制">
        依赖 <InlineCode>window.open</InlineCode>：被浏览器弹窗拦截时仅{" "}
        <InlineCode>console.warn</InlineCode>
        ，请允许当前站点的弹窗后重试；打印窗口中的远程图片加载与否取决于网络；math
        块打印为 LaTeX 源码而非渲染图形。需要像素级 PDF 时请在后端用 headless
        浏览器渲染 <MonoCell accent>blocksToHTML()</MonoCell> 的输出。
      </Callout>

      <CardStrip
        className="mt-14"
        cards={[
          { to: "/docs/export/docx", title: "Exporting to DOCX", description: "真正的 .docx 文件：Word / WPS 直接打开。" },
          { to: "/docs/advanced/server-side-processing", title: "Server-side processing", description: "在 Node 端跑同一套纯导出函数。" },
        ]}
      />
    </DocsShell>
  );
}
