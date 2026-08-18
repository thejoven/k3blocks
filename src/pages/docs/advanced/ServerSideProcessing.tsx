/**
 * /docs/advanced/server-side-processing — 纯函数式 API 在 Node 端的使用说明。
 * 代码演示为主 + 浏览器/Node 能力对照表 + 同一批纯函数的 live 验证 demo。
 */
import { useState } from "react";
import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import DocsShell from "@/components/docs/DocsShell";
import {
  CardStrip,
  DocTable,
  H2,
  InlineCode,
  MonoCell,
  P,
  Segmented,
  StatusChip,
} from "@/components/docs/primitives";
import { useK3Editor, K3EditorView, blocksToHTML, blocksToEmailHTML } from "@/k3blocks";
import { richSeedDocument } from "../export/shared";

const INSTALL_CODE = `npm install @k3/blocks`;

const IMPORT_CODE = `// 转换器全部是 Block[] → string | Blob 的纯函数，不依赖 React 与编辑器实例
import {
  blocksToHTML,
  blocksToEmailHTML,
  blocksToDocxBlob,
  blocksToOdtBlob,
  tryParseMarkdownToBlocks,
} from "@k3/blocks";`;

const NODE_SCRIPT = `// scripts/render-docs.mjs —— Node 20+ 直接运行：node scripts/render-docs.mjs
import { readFile, writeFile } from "node:fs/promises";
import {
  blocksToHTML,
  blocksToEmailHTML,
  blocksToDocxBlob,
  tryParseMarkdownToBlocks,
} from "@k3/blocks";

// 1. JSON 即数据库格式：文档就是普通 JSON（库表 TEXT 列 / 文件均可）
const doc = JSON.parse(await readFile("doc.json", "utf8"));

// 2. 发布页 HTML：纯字符串拼接，无 DOM 依赖
await writeFile("dist/page.html", blocksToHTML(doc));

// 3. 事务邮件：table 布局 + inline style，直接交给 SES / Nodemailer
await writeFile("dist/welcome-email.html", blocksToEmailHTML(doc));

// 4. Word 附件：docx 包动态 import；Blob → Buffer 落盘
const blob = await blocksToDocxBlob(doc);
await writeFile("dist/report.docx", Buffer.from(await blob.arrayBuffer()));

// 5. 反向管道：Markdown 入库（HTML → Block 依赖 DOMParser，Node 端见下方说明）
const md = await readFile("post.md", "utf8");
const blocks = tryParseMarkdownToBlocks(md);
await writeFile("dist/post.json", JSON.stringify(blocks, null, 2));

console.log("done:", blocks.length, "blocks");`;

/** live demo：编辑器文档 → 纯函数输出（与 Node 端同一批函数）。 */
function PureFnDemo() {
  const [, setDocTick] = useState(0);
  const [mode, setMode] = useState<"html" | "email">("html");
  const editor = useK3Editor({
    initialContent: richSeedDocument().slice(0, 5),
    onChange: () => setDocTick((v) => v + 1),
  });
  const out =
    mode === "html" ? blocksToHTML(editor.document) : blocksToEmailHTML(editor.document);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface-1">
      <div className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-3 py-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-4">
          blocksTo{mode === "html" ? "HTML" : "EmailHTML"}(editor.document)
        </span>
        <div className="ml-auto">
          <Segmented
            options={[
              { value: "html", label: "HTML" },
              { value: "email", label: "Email HTML" },
            ]}
            value={mode}
            onChange={setMode}
          />
        </div>
      </div>
      <div className="bg-surface-inset px-5 py-8 md:px-8">
        <K3EditorView editor={editor} slashMenu formattingToolbar sideMenu />
      </div>
      <div className="border-t border-border">
        <pre className="max-h-[280px] overflow-auto whitespace-pre-wrap break-all px-4 py-3 font-mono text-[12px] leading-[1.7] text-text-2">
          {out}
        </pre>
      </div>
    </div>
  );
}

export default function ServerSideProcessing() {
  return (
    <DocsShell
      crumbs={["Docs", "Advanced", "Server-side processing"]}
      title="Server-side processing."
      lead="所有导入 / 导出函数都是 Block[] 进、string 或 Blob 出的纯函数——不依赖 React、不依赖编辑器实例。文档模型是普通 JSON（即数据库格式），因此同一套转换器可以在 Node 端跑：定时渲染发布页、批量生成事务邮件、把 Markdown 仓库回灌为文档。"
    >
      <H2 id="install">安装与导入。</H2>
      <P>
        包同时是 React 组件与纯函数库——服务端只需要后者，tree-shaking
        后编辑器本体不会进入服务端 bundle。
      </P>
      <CodeBlock className="mt-4" code={INSTALL_CODE} language="bash" />
      <CodeBlock className="mt-3" code={IMPORT_CODE} language="ts" />

      <H2 id="node-script">完整 Node 脚本。</H2>
      <P>
        可直接复制运行的 <InlineCode>.mjs</InlineCode> 脚本：从 JSON 读文档 → 产出发布页
        HTML、邮件 HTML、.docx 附件 → 再把一篇 Markdown 解析回 Block[] 入库。
      </P>
      <CodeBlock className="mt-4" code={NODE_SCRIPT} language="ts" />

      <H2 id="compatibility">浏览器 / Node 能力对照。</H2>
      <DocTable
        columns={["函数", "浏览器", "Node 20+", "说明"]}
        rows={[
          [<MonoCell>blocksToHTML</MonoCell>, <StatusChip status="stable" />, <StatusChip status="stable" />, "纯字符串拼接"],
          [<MonoCell>blocksToEmailHTML</MonoCell>, <StatusChip status="stable" />, <StatusChip status="stable" />, "纯字符串拼接"],
          [<MonoCell>blocksToDocxBlob</MonoCell>, <StatusChip status="stable" />, <StatusChip status="stable" />, "docx 包动态 import；Node 18+ 内置 Blob"],
          [<MonoCell>blocksToOdtBlob</MonoCell>, <StatusChip status="stable" />, <StatusChip status="stable" />, "jszip 动态 import"],
          [<MonoCell>tryParseMarkdownToBlocks</MonoCell>, <StatusChip status="stable" />, <StatusChip status="stable" />, "行级解析，无 DOM 依赖"],
          [<MonoCell>tryParseHTMLToBlocks</MonoCell>, <StatusChip status="stable" />, <StatusChip status="beta" />, "依赖 DOMParser——Node 端需 jsdom 注入或改用 Markdown 管道"],
          [<MonoCell>printBlocks</MonoCell>, <StatusChip status="stable" />, <StatusChip status="roadmap" />, "依赖 window.open / window.print"],
          [<MonoCell>downloadBlob</MonoCell>, <StatusChip status="stable" />, <StatusChip status="roadmap" />, "依赖 DOM（<a download>）；Node 端用 Buffer 落盘"],
        ]}
      />

      <H2 id="demo">在线验证。</H2>
      <P>
        下面调用的就是 <InlineCode>blocksToHTML</InlineCode> /{" "}
        <InlineCode>blocksToEmailHTML</InlineCode> 纯函数本身（不是 editor
        方法）——在浏览器里看到的输出，与 Node 端喂同一份 JSON 得到的结果逐字节一致。
      </P>
      <PureFnDemo />

      <Callout className="mt-6" title="Node 端注意事项">
        <strong>HTML 导入是唯一有 DOM 依赖的转换</strong>：
        <InlineCode>tryParseHTMLToBlocks</InlineCode> 内部使用{" "}
        <InlineCode>DOMParser</InlineCode>——Node 端要么注入 jsdom
        的全局实现，要么改用 Markdown 管道（推荐，语法与导出严格对齐）。
        <InlineCode>printBlocks</InlineCode> / <InlineCode>downloadBlob</InlineCode>{" "}
        是浏览器专属工具：服务端生成 PDF 请用 headless 浏览器渲染{" "}
        <InlineCode>blocksToHTML</InlineCode> 的输出。
      </Callout>

      <CardStrip
        className="mt-14"
        cards={[
          { to: "/docs/export/html", title: "Exporting to HTML", description: "blocksToHTML 的输出形态与覆盖范围。" },
          { to: "/docs/foundations/document-structure", title: "Document structure", description: "Block[] JSON 模型——即数据库存储格式。" },
        ]}
      />
    </DocsShell>
  );
}
