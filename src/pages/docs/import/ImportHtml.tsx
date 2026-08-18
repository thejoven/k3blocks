/**
 * /docs/import/html — tryParseHTMLToBlocks / editor.insertHTML。
 * mono textarea 粘贴 HTML → 导入预览；支持标签对照表 + 安全与降级 Callout。
 */
import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import DocsShell from "@/components/docs/DocsShell";
import { CardStrip, DocTable, H2, InlineCode, MonoCell, P } from "@/components/docs/primitives";
import { tryParseHTMLToBlocks } from "@/k3blocks";
import ImportDemo from "./shared";

const API_CODE = `import { tryParseHTMLToBlocks } from "@k3/blocks";

// 纯函数：HTML 字符串 → Block[]（DOMParser 解析，不执行任何脚本）
const blocks = tryParseHTMLToBlocks(html);

// editor 方法：解析后 append 到文档末尾
editor.insertHTML(html);`;

const SAMPLE_HTML = `<h1>K3Blocks 导入演示</h1>
<p>粘贴任意 <strong>HTML</strong>——无法识别的结构会<em>降级为段落</em>，<span style="color:#e03131">行内颜色</span>也会保留。</p>
<h2>清单</h2>
<ul>
  <li>普通列表项</li>
  <li><input type="checkbox" checked> 已完成的待办</li>
  <li><input type="checkbox"> 未完成的待办</li>
</ul>
<blockquote>简单是可靠的先决条件。</blockquote>
<pre><code class="language-ts">const blocks = tryParseHTMLToBlocks(html);</code></pre>
<table>
  <tr><th>标签</th><th>目标块</th></tr>
  <tr><td>h1-h3</td><td>heading</td></tr>
  <tr><td>li + checkbox</td><td>checkListItem</td></tr>
</table>
<hr>
<img src="https://placehold.co/640x200/1c1c1c/aeaeae?text=K3Blocks" alt="占位图">
<script>alert("这段脚本不会执行")</script>`;

export default function ImportHtml() {
  return (
    <DocsShell
      crumbs={["Docs", "Import", "HTML"]}
      title="Importing HTML."
      lead="tryParseHTMLToBlocks() 用浏览器 DOMParser 把 HTML 解析为 Block[]——不执行任何脚本，script/style/template 直接丢弃；无法识别的结构一律降级为段落。editor.insertHTML() 是同管道的编辑器方法（解析后 append 到文档末尾）。"
    >
      <H2 id="api">API。</H2>
      <P>
        纯函数 <InlineCode>tryParseHTMLToBlocks(html: string): Block[]</InlineCode>
        返回新块（可用于受控插入）；<InlineCode>editor.insertHTML(html)</InlineCode>{" "}
        则解析后追加到文档末尾——需要替换全文时先{" "}
        <InlineCode>removeBlocks</InlineCode> 清空（下方 demo 即是这个流程）。
      </P>
      <CodeBlock className="mt-4" code={API_CODE} language="ts" />

      <H2 id="demo">在线体验。</H2>
      <P>
        上方是预填的示例 HTML——可直接编辑，或点「从剪贴板粘贴」换成真实网页复制来的
        HTML；点「导入」，下方编辑器实时展示解析结果（可继续编辑）。
      </P>
      <ImportDemo
        className="mt-4"
        initialSource={SAMPLE_HTML}
        parse={tryParseHTMLToBlocks}
        sourceLabel="HTML"
      />

      <H2 id="coverage">支持的标签。</H2>
      <DocTable
        columns={["HTML", "目标块 / 行为"]}
        rows={[
          [<MonoCell>&lt;h1&gt;-&lt;h6&gt;</MonoCell>, "heading（h4-h6 钳到 3 级）"],
          [<MonoCell>&lt;p&gt;</MonoCell>, "paragraph"],
          [<MonoCell>&lt;ul&gt; / &lt;ol&gt;</MonoCell>, "bulletListItem / numberedListItem（嵌套列表保留为 children）"],
          [<MonoCell>&lt;li&gt;&lt;input type="checkbox"&gt;</MonoCell>, "checkListItem（task-list，读 checked 状态）"],
          [<MonoCell>&lt;blockquote&gt;</MonoCell>, "quote"],
          [<MonoCell>&lt;pre&gt;&lt;code class="language-x"&gt;</MonoCell>, "codeBlock（language-x 类名识别语言）"],
          [<MonoCell>&lt;hr&gt;</MonoCell>, "divider"],
          [<MonoCell>&lt;img&gt; / &lt;figure&gt;</MonoCell>, "image（figcaption → props.caption）"],
          [<MonoCell>&lt;table&gt;</MonoCell>, "table（th/td 文本 → props.rows）"],
          [<MonoCell>&lt;iframe&gt;</MonoCell>, "embed（src → props.url）"],
          [<MonoCell>&lt;div&gt; 等容器</MonoCell>, "有块级子元素则递归，否则按段落处理"],
          ["行内", <MonoCell>b/strong · i/em · u · s/strike · code · a · font/span 的 color·background</MonoCell>],
        ]}
      />

      <Callout className="mt-6" title="安全与降级">
        解析走 <InlineCode>DOMParser</InlineCode>，<strong>不执行任何脚本</strong>：
        <InlineCode>script / style / template</InlineCode> 直接丢弃，事件属性不生效——粘贴不可信来源的
        HTML 是安全的。任何无法识别的标签只要含文本就降级为 paragraph，绝不丢内容。
      </Callout>

      <CardStrip
        className="mt-14"
        cards={[
          { to: "/docs/import/markdown", title: "Importing Markdown", description: "行级 Markdown 解析：围栏、$$、pipe 表格。" },
          { to: "/docs/export/html", title: "Exporting to HTML", description: "blocksToHTML：导出与导入正好互为往返。" },
        ]}
      />
    </DocsShell>
  );
}
