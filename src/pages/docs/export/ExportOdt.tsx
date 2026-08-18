/**
 * /docs/export/odt — blocksToOdtBlob() 导出最小 .odt（jszip 动态 import）。
 */
import { useState } from "react";
import { Download } from "lucide-react";
import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import DocsShell from "@/components/docs/DocsShell";
import { CardStrip, DocTable, H2, InlineCode, MonoCell, P } from "@/components/docs/primitives";
import { downloadBlob } from "@/k3blocks";
import ExportDemo, { ActionButton, FeedbackChip, useFeedback } from "./shared";

const API_CODE = `import { blocksToOdtBlob, downloadBlob } from "@k3/blocks";

// jszip 按需动态 import——不进主 chunk
const blob = await editor.blocksToOdtBlob();
downloadBlob(blob, "report.odt");`;

export default function ExportOdt() {
  const { feedback, show } = useFeedback();
  const [busy, setBusy] = useState(false);

  return (
    <DocsShell
      crumbs={["Docs", "Export", "ODT"]}
      title="Exporting to ODT."
      lead="editor.blocksToOdtBlob() 用 jszip 在浏览器端打包最小结构的 .odt——mimetype + manifest.xml + content.xml 三个条目，LibreOffice / OpenOffice 直接打开；jszip 按需动态 import，不进主 chunk。"
    >
      <H2 id="api">API。</H2>
      <P>
        异步函数：
        <InlineCode>blocksToOdtBlob(blocks: Block[]): Promise&lt;Blob&gt;</InlineCode>
        （editor 实例挂同名方法）。<InlineCode>mimetype</InlineCode> 条目按规范以{" "}
        <InlineCode>STORE</InlineCode>（不压缩）放在包首。
      </P>
      <CodeBlock className="mt-4" code={API_CODE} language="ts" />

      <H2 id="demo">在线体验。</H2>
      <P>
        编辑文档后点「下载 .odt」——生成完成后浏览器直接保存文件，用 LibreOffice Writer 打开验证。
      </P>
      <ExportDemo
        className="mt-4"
        actions={(editor) => (
          <>
            <FeedbackChip feedback={feedback} />
            <ActionButton
              busy={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  const blob = await editor.blocksToOdtBlob();
                  downloadBlob(blob, "k3-document.odt");
                  show({ kind: "ok", text: `已下载 k3-document.odt · ${(blob.size / 1024).toFixed(1)} KB` });
                } catch {
                  show({ kind: "err", text: "生成失败，请查看 console" });
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Download size={13} strokeWidth={1.5} />
              {busy ? "生成中…" : "下载 .odt"}
            </ActionButton>
          </>
        )}
      />

      <H2 id="coverage">覆盖范围。</H2>
      <DocTable
        columns={["块 / 行内", "ODT 形态"]}
        rows={[
          ["heading", <MonoCell>&lt;text:h&gt;（1-3 级）</MonoCell>],
          ["paragraph / quote", <MonoCell>&lt;text:p&gt;</MonoCell>],
          ["三种列表", <MonoCell>&lt;text:list&gt; / &lt;text:list-item&gt;</MonoCell>],
          ["codeBlock", "等宽段落"],
          ["行内样式", "bold / italic / underline / strike / code 走自动样式（automatic styles）"],
        ]}
      />

      <Callout className="mt-6" title="已知限制">
        这是<strong>最小 ODT 结构</strong>：没有 <InlineCode>styles.xml</InlineCode>
        ，命名样式、页面设置与字体外壳全部缺省——打开后是素排文本；表格、图片、math
        暂不映射为 ODT 原生元素（按文本内容降级）。需要完整排版请用{" "}
        <MonoCell accent>blocksToDocxBlob()</MonoCell> 或打印导出。
      </Callout>

      <CardStrip
        className="mt-14"
        cards={[
          { to: "/docs/export/docx", title: "Exporting to DOCX", description: "覆盖面更全的 Office 导出。" },
          { to: "/docs/export/markdown", title: "Exporting to Markdown", description: "纯文本、零依赖的导出起点。" },
        ]}
      />
    </DocsShell>
  );
}
