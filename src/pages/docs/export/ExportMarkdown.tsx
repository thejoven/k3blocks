/**
 * /docs/export/markdown — blocksToMarkdown() 导出 + 下载 .md。
 * live demo：富种子文档编辑器 + 实时 Markdown mono 预览 + 下载按钮。
 */
import { Download } from "lucide-react";
import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import DocsShell from "@/components/docs/DocsShell";
import { CardStrip, DocTable, H2, InlineCode, MonoCell, P } from "@/components/docs/primitives";
import { downloadBlob } from "@/k3blocks";
import ExportDemo, { ActionButton, FeedbackChip, useFeedback } from "./shared";

const API_CODE = `const md = editor.blocksToMarkdown();

// 触发浏览器下载（URL.createObjectURL + <a download>）
downloadBlob(
  new Blob([md], { type: "text/markdown;charset=utf-8" }),
  "document.md",
);`;

export default function ExportMarkdown() {
  const { feedback, show } = useFeedback();

  return (
    <DocsShell
      crumbs={["Docs", "Export", "Markdown"]}
      title="Exporting to Markdown."
      lead="editor.blocksToMarkdown() 把当前文档序列化为 GitHub 风格 Markdown——标题、三种列表、引用、代码围栏、pipe 表格、$$ 公式全覆盖；包一层 Blob 即可下载 .md 文件。"
    >
      <H2 id="api">API。</H2>
      <P>
        导出函数是同步纯函数：<InlineCode>editor.blocksToMarkdown(): string</InlineCode>
        （内部读 <InlineCode>editor.document</InlineCode>）。
        <InlineCode>downloadBlob(blob, filename)</InlineCode> 从包入口导出，负责触发浏览器下载。
      </P>
      <CodeBlock className="mt-4" code={API_CODE} language="ts" />

      <H2 id="demo">在线体验。</H2>
      <P>
        左侧文档可直接编辑——下方 mono 面板实时显示导出结果；点「下载 .md」把当前文档存为
        Markdown 文件。
      </P>
      <ExportDemo
        className="mt-4"
        previewLabel="Markdown — editor.blocksToMarkdown()"
        renderPreview={(editor) => editor.blocksToMarkdown()}
        actions={(editor) => (
          <>
            <FeedbackChip feedback={feedback} />
            <ActionButton
              onClick={() => {
                const md = editor.blocksToMarkdown();
                downloadBlob(
                  new Blob([md], { type: "text/markdown;charset=utf-8" }),
                  "k3-document.md",
                );
                show({ kind: "ok", text: `已下载 k3-document.md · ${(md.length / 1024).toFixed(1)} KB` });
              }}
            >
              <Download size={13} strokeWidth={1.5} />
              下载 .md
            </ActionButton>
          </>
        )}
      />

      <H2 id="coverage">覆盖范围。</H2>
      <DocTable
        columns={["块 / 行内", "Markdown 形态"]}
        rows={[
          ["heading（1-3 级）", <MonoCell># / ## / ###</MonoCell>],
          ["bulletListItem / numberedListItem", <MonoCell>- ··· / 1. ···（自动连续编号）</MonoCell>],
          ["checkListItem", <MonoCell>- [ ] ··· / - [x] ···</MonoCell>],
          ["quote", <MonoCell>&gt; ···</MonoCell>],
          ["codeBlock", <MonoCell>```language 围栏（带语言标记）</MonoCell>],
          ["table", <MonoCell>pipe table（首行表头 + --- 分隔行）</MonoCell>],
          ["math", <MonoCell>$$latex$$</MonoCell>],
          ["image", <MonoCell>![alt](src)</MonoCell>],
          ["divider", <MonoCell>---</MonoCell>],
          ["diagram", <MonoCell>```mermaid 围栏</MonoCell>],
          ["mention", <MonoCell>@label</MonoCell>],
          ["行内样式", <MonoCell>**bold** · *italic* · `code` · ~~strike~~ · [text](href)</MonoCell>],
          ["columnList / column", "无语法对应——栏内容按文档顺序平铺导出"],
        ]}
      />

      <Callout className="mt-6" title="已知限制">
        Markdown 是纯文本格式：<InlineCode>textColor</InlineCode> /{" "}
        <InlineCode>backgroundColor</InlineCode> 染色与分栏布局在导出中丢失（分栏子块平铺保留）；
        未知自定义行内类型降级取其 <InlineCode>text</InlineCode> / <InlineCode>label</InlineCode>{" "}
        字段。需要保色请改用 <MonoCell accent>blocksToHTML()</MonoCell>。
      </Callout>

      <CardStrip
        className="mt-14"
        cards={[
          { to: "/docs/export/html", title: "Exporting to HTML", description: "完整语义化 HTML：保留颜色、分栏与嵌入。" },
          { to: "/examples/markdown-export", title: "Markdown Export 示例", description: "onChange 驱动的实时 Markdown 旁栏预览。" },
        ]}
      />
    </DocsShell>
  );
}
