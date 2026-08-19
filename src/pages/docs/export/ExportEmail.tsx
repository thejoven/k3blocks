/**
 * /docs/export/email — blocksToEmailHTML() 邮件安全 HTML + 复制到剪贴板。
 */
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import DocsShell from "@/components/docs/DocsShell";
import { CardStrip, DocTable, H2, InlineCode, MonoCell, P } from "@/components/docs/primitives";
import ExportDemo, { ActionButton, FeedbackChip, useFeedback } from "./shared";

const API_CODE = `import { blocksToEmailHTML } from "@thejoven_com/k3blocks";

// email-safe：全 table 布局 + 全 inline style（无 class、无 grid）
const html = editor.blocksToEmailHTML();
await navigator.clipboard.writeText(html); // 粘贴进邮件客户端`;

export default function ExportEmail() {
  const { feedback, show } = useFeedback();
  const [copied, setCopied] = useState(false);

  return (
    <DocsShell
      crumbs={["Docs", "Export", "Email"]}
      title="Exporting to Email HTML."
      lead="邮件客户端只吃 2005 年的 HTML：editor.blocksToEmailHTML() 输出全 table 布局 + 全 inline style 的邮件安全片段——无 class、无 grid、无外链样式，复制后可直接粘贴进 Gmail / Outlook 的 HTML 模板。"
    >
      <H2 id="api">API。</H2>
      <P>
        同步纯函数：<InlineCode>blocksToEmailHTML(blocks: Block[]): string</InlineCode>
        （editor 实例挂同名方法）。典型用法是复制到剪贴板，或作为事务邮件的{" "}
        <InlineCode>html</InlineCode> 字段发往邮件服务。
      </P>
      <CodeBlock className="mt-4" code={API_CODE} language="ts" />

      <H2 id="demo">在线体验。</H2>
      <P>
        编辑文档，下方 mono 面板实时显示 email HTML；点「复制 Email HTML」写入剪贴板。
      </P>
      <ExportDemo
        className="mt-4"
        previewLabel="Email HTML — editor.blocksToEmailHTML()"
        renderPreview={(editor) => editor.blocksToEmailHTML()}
        actions={(editor) => (
          <>
            <FeedbackChip feedback={feedback} />
            <ActionButton
              onClick={async () => {
                const html = editor.blocksToEmailHTML();
                try {
                  await navigator.clipboard.writeText(html);
                  show({ kind: "ok", text: `已复制 ${(html.length / 1024).toFixed(1)} KB 到剪贴板` });
                } catch {
                  show({ kind: "err", text: "复制被拒绝，请用面板的 Copy" });
                }
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1200);
              }}
            >
              {copied ? <Check size={13} strokeWidth={1.5} /> : <Copy size={13} strokeWidth={1.5} />}
              {copied ? "Copied" : "复制 Email HTML"}
            </ActionButton>
          </>
        )}
      />

      <H2 id="coverage">降级规则。</H2>
      <DocTable
        columns={["块 / 行内", "Email HTML 形态"]}
        rows={[
          ["布局", "全 <table> 布局（邮件客户端安全）"],
          ["columnList 分栏", <MonoCell>table 列（&lt;td&gt; 并排）</MonoCell>],
          ["checkListItem", <MonoCell>☐ / ☑ 文本（checkbox 在邮件中不可交互）</MonoCell>],
          ["embed / pdf", "降级为纯链接（iframe 被多数客户端剥离）"],
          ["行内样式 / 染色", "全部 inline style（无 class、无 &lt;style&gt; 块）"],
          ["字体", <MonoCell>-apple-system / Segoe UI / Helvetica / Arial</MonoCell>],
        ]}
      />

      <Callout className="mt-6" title="已知限制">
        邮件 HTML 刻意「倒退」：没有 grid / flex / class，视觉还原度低于{" "}
        <MonoCell accent>blocksToHTML()</MonoCell>
        ；math 块输出 LaTeX 文本；远程图片能否显示取决于收件客户端的远程图加载策略
        （Gmail 默认代理）。事务邮件建议控制在单栏、少图片。
      </Callout>

      <CardStrip
        className="mt-14"
        cards={[
          { to: "/docs/export/html", title: "Exporting to HTML", description: "语义化版本：保真度更高，适合 CMS。" },
          { to: "/docs/advanced/server-side-processing", title: "Server-side processing", description: "在 Node 端批量生成邮件 HTML。" },
        ]}
      />
    </DocsShell>
  );
}
