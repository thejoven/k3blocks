/**
 * /docs/export/html — blocksToHTML() 导出完整语义化 HTML + 下载 .html。
 */
import { Download } from "lucide-react";
import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import DocsShell from "@/components/docs/DocsShell";
import { CardStrip, DocTable, H2, InlineCode, MonoCell, P } from "@/components/docs/primitives";
import { downloadBlob } from "@/k3blocks";
import ExportDemo, { ActionButton, FeedbackChip, useFeedback } from "./shared";

const API_CODE = `import { blocksToHTML, downloadBlob } from "@k3/blocks";

// editor 实例方法（读当前文档）或纯函数（任意 Block[]）均可
const html = editor.blocksToHTML();
// const html = blocksToHTML(blocks);

downloadBlob(new Blob([html], { type: "text/html;charset=utf-8" }), "document.html");`;

export default function ExportHtml() {
  const { feedback, show } = useFeedback();

  return (
    <DocsShell
      crumbs={["Docs", "Export", "HTML"]}
      title="Exporting to HTML."
      lead="editor.blocksToHTML() 输出完整语义化 HTML 片段：h1-h3、task-list、blockquote、pre>code、figure、table 一应俱全，行内颜色与 mention 以 span 保留——可直接粘贴进任何 CMS。"
    >
      <H2 id="api">API。</H2>
      <P>
        同步纯函数：<InlineCode>blocksToHTML(blocks: Block[]): string</InlineCode>，editor
        实例挂同名方法 <InlineCode>editor.blocksToHTML()</InlineCode>
        。返回值是<strong>片段</strong>（不含 <InlineCode>&lt;html&gt;/&lt;head&gt;</InlineCode>{" "}
        外壳），方便嵌入宿主模板；需要整页文档时自行包裹。
      </P>
      <CodeBlock className="mt-4" code={API_CODE} language="ts" />

      <H2 id="demo">在线体验。</H2>
      <P>
        编辑文档，下方 mono 面板实时显示 HTML 源码；点「下载 .html」保存当前片段。
      </P>
      <ExportDemo
        className="mt-4"
        previewLabel="HTML — editor.blocksToHTML()"
        renderPreview={(editor) => editor.blocksToHTML()}
        actions={(editor) => (
          <>
            <FeedbackChip feedback={feedback} />
            <ActionButton
              onClick={() => {
                const html = editor.blocksToHTML();
                downloadBlob(
                  new Blob([html], { type: "text/html;charset=utf-8" }),
                  "k3-document.html",
                );
                show({ kind: "ok", text: `已下载 k3-document.html · ${(html.length / 1024).toFixed(1)} KB` });
              }}
            >
              <Download size={13} strokeWidth={1.5} />
              下载 .html
            </ActionButton>
          </>
        )}
      />

      <H2 id="coverage">覆盖范围。</H2>
      <DocTable
        columns={["块 / 行内", "HTML 形态"]}
        rows={[
          ["heading / paragraph", <MonoCell>&lt;h1&gt;-&lt;h3&gt; / &lt;p&gt;</MonoCell>],
          ["bullet / numbered list", <MonoCell>&lt;ul&gt; / &lt;ol&gt;（嵌套保留）</MonoCell>],
          ["checkListItem", <MonoCell>&lt;li&gt;&lt;input type="checkbox"&gt;（task-list）</MonoCell>],
          ["quote", <MonoCell>&lt;blockquote&gt;</MonoCell>],
          ["codeBlock", <MonoCell>&lt;pre&gt;&lt;code class="language-x"&gt;</MonoCell>],
          ["divider", <MonoCell>&lt;hr&gt;</MonoCell>],
          ["image", <MonoCell>&lt;figure&gt;&lt;img&gt;+&lt;figcaption&gt;</MonoCell>],
          ["table", <MonoCell>真实 &lt;table&gt;（&lt;th&gt; 表头行）</MonoCell>],
          ["math", <MonoCell>&lt;div class="k3-math" data-latex&gt;（KaTeX 文本占位）</MonoCell>],
          ["embed / pdf", <MonoCell>&lt;iframe&gt;</MonoCell>],
          ["mention", <MonoCell>&lt;span class="k3-mention"&gt;</MonoCell>],
          ["行内样式", <MonoCell>&lt;strong&gt; &lt;em&gt; &lt;u&gt; &lt;s&gt; &lt;code&gt; &lt;a&gt;</MonoCell>],
          ["textColor / backgroundColor", <MonoCell>&lt;span style&gt;（inline color / background）</MonoCell>],
          ["columnList", <MonoCell>&lt;div&gt; + CSS grid</MonoCell>],
        ]}
      />

      <Callout className="mt-6" title="已知限制">
        输出不含 CSS——<InlineCode>k3-math</InlineCode> 只是带{" "}
        <InlineCode>data-latex</InlineCode> 的占位节点（页面需自行引入 KaTeX 渲染）；columnList
        的分栏宽度依赖宿主样式。需要「开箱即读」的排版请用打印导出，需要邮件客户端兼容性请用{" "}
        <MonoCell accent>blocksToEmailHTML()</MonoCell>。
      </Callout>

      <CardStrip
        className="mt-14"
        cards={[
          { to: "/docs/export/email", title: "Exporting to Email HTML", description: "table 布局 + 全 inline style 的邮件安全版本。" },
          { to: "/docs/import/html", title: "Importing HTML", description: "tryParseHTMLToBlocks：HTML 粘贴回流为块。" },
        ]}
      />
    </DocsShell>
  );
}
