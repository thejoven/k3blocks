/**
 * /docs/export/docx — blocksToDocxBlob() 导出 .docx（docx 包动态 import）。
 */
import { useState } from "react";
import { Download } from "lucide-react";
import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import DocsShell from "@/components/docs/DocsShell";
import { CardStrip, DocTable, H2, InlineCode, MonoCell, P } from "@/components/docs/primitives";
import { downloadBlob } from "@/k3blocks";
import ExportDemo, { ActionButton, FeedbackChip, useFeedback } from "./shared";

const API_CODE = `import { blocksToDocxBlob, downloadBlob } from "@thejoven_com/k3blocks";

// docx 包按需动态 import——不进主 chunk
const blob = await editor.blocksToDocxBlob();
downloadBlob(blob, "report.docx");`;

export default function ExportDocx() {
  const { feedback, show } = useFeedback();
  const [busy, setBusy] = useState(false);

  return (
    <DocsShell
      crumbs={["Docs", "Export", "DOCX"]}
      title="Exporting to DOCX."
      lead="editor.blocksToDocxBlob() 基于 docx 库在浏览器端生成真正的 .docx 文件——Word、WPS、Pages 直接打开；docx 依赖按需动态 import，不拖累首屏 bundle。"
    >
      <H2 id="api">API。</H2>
      <P>
        异步函数：
        <InlineCode>blocksToDocxBlob(blocks: Block[]): Promise&lt;Blob&gt;</InlineCode>
        （editor 实例挂同名方法）。首次调用时动态加载 <InlineCode>docx</InlineCode>{" "}
        包，拿到 Blob 后交给 <InlineCode>downloadBlob</InlineCode> 触发下载。
      </P>
      <CodeBlock className="mt-4" code={API_CODE} language="ts" />

      <H2 id="demo">在线体验。</H2>
      <P>
        编辑文档后点「下载 .docx」——按钮进入 loading 态，生成完成后浏览器直接保存文件。
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
                  const blob = await editor.blocksToDocxBlob();
                  downloadBlob(blob, "k3-document.docx");
                  show({ kind: "ok", text: `已下载 k3-document.docx · ${(blob.size / 1024).toFixed(1)} KB` });
                } catch {
                  show({ kind: "err", text: "生成失败，请查看 console" });
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Download size={13} strokeWidth={1.5} />
              {busy ? "生成中…" : "下载 .docx"}
            </ActionButton>
          </>
        )}
      />

      <H2 id="coverage">覆盖范围。</H2>
      <DocTable
        columns={["块 / 行内", "DOCX 形态"]}
        rows={[
          ["paragraph / heading", "原生段落与 Heading 1-3 样式"],
          ["bullet / numbered list", "项目符号 / 编号段落"],
          ["checkListItem", <MonoCell>☐ / ☑ 前缀文本</MonoCell>],
          ["quote", "引用样式段落"],
          ["codeBlock", "等宽字体段落"],
          ["divider", "水平分隔"],
          ["table", "管道分隔文本行（非原生表格）"],
          ["math", "LaTeX 源码文本"],
          ["image", "本地图可嵌入；远程图为占位文本"],
          ["mention", <MonoCell>@label 文本</MonoCell>],
          ["行内样式", "bold / italic / underline / strike / code 保留"],
        ]}
      />

      <Callout className="mt-6" title="已知限制">
        <strong>远程图片无法同步取字节</strong>，导出为{" "}
        <InlineCode>[image: …]</InlineCode> 占位文本（dataURL / 同源图片可正常嵌入）；
        表格降级为<MonoCell>管道分隔的文本行</MonoCell>而非 Word 原生表格；textColor /
        backgroundColor 染色暂不写入。排版要求高的场景建议先用{" "}
        <MonoCell accent>blocksToHTML()</MonoCell> 打印为 PDF。
      </Callout>

      <CardStrip
        className="mt-14"
        cards={[
          { to: "/docs/export/odt", title: "Exporting to ODT", description: "LibreOffice / OpenOffice 的最小 .odt 导出。" },
          { to: "/docs/export/pdf", title: "Exporting to PDF", description: "打印管道：排版最忠实的导出方式。" },
        ]}
      />
    </DocsShell>
  );
}
