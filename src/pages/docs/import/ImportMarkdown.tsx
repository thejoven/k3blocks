/**
 * /docs/import/markdown — tryParseMarkdownToBlocks / editor.insertMarkdown。
 * mono textarea 粘贴 Markdown → 导入预览；语法对照表 + 降级 Callout。
 */
import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import DocsShell from "@/components/docs/DocsShell";
import { CardStrip, DocTable, H2, InlineCode, MonoCell, P } from "@/components/docs/primitives";
import { tryParseMarkdownToBlocks } from "@/k3blocks";
import ImportDemo from "./shared";

const API_CODE = `import { tryParseMarkdownToBlocks } from "@k3/blocks";

// 纯函数：Markdown 字符串 → Block[]（行级解析，空行分块）
const blocks = tryParseMarkdownToBlocks(md);

// editor 方法：解析后 append 到文档末尾
editor.insertMarkdown(md);`;

const SAMPLE_MD = `# K3Blocks 导入演示

支持 **加粗**、*斜体*、\`行内代码\`、~~删除线~~ 与 [链接](https://github.com/thejoven/k3blocks)。

## 清单

- 无序列表项
1. 有序列表项
- [x] 已完成的待办
- [ ] 未完成的待办

> 引用一行
> 连续引用行会合并为一个 quote 块

\`\`\`ts
const blocks = tryParseMarkdownToBlocks(md);
\`\`\`

\`\`\`mermaid
flowchart LR
  A-->B
\`\`\`

$$
E = mc^2
$$

| 语法 | 目标块 |
| --- | --- |
| \`#\` | heading |
| \`- [ ]\` | checkListItem |

![占位图](https://placehold.co/640x200/1c1c1c/aeaeae?text=K3Blocks)

---`;

export default function ImportMarkdown() {
  return (
    <DocsShell
      crumbs={["Docs", "Import", "Markdown"]}
      title="Importing Markdown."
      lead="tryParseMarkdownToBlocks() 是行级解析器：标题、三种列表、引用、围栏代码（mermaid 自动转 diagram 块）、$$ 公式、pipe 表格、整行图片与行内样式全覆盖；连续文本行合并为段落，空行分块。"
    >
      <H2 id="api">API。</H2>
      <P>
        纯函数 <InlineCode>tryParseMarkdownToBlocks(md: string): Block[]</InlineCode>
        返回新块；<InlineCode>editor.insertMarkdown(md)</InlineCode>{" "}
        解析后追加到文档末尾——需要替换全文时先 <InlineCode>removeBlocks</InlineCode>{" "}
        清空（下方 demo 即是这个流程）。
      </P>
      <CodeBlock className="mt-4" code={API_CODE} language="ts" />

      <H2 id="demo">在线体验。</H2>
      <P>
        上方是预填的示例 Markdown——可直接编辑，或点「从剪贴板粘贴」换成任意 .md
        内容；点「导入」，下方编辑器实时展示解析结果（可继续编辑）。
      </P>
      <ImportDemo
        className="mt-4"
        initialSource={SAMPLE_MD}
        parse={tryParseMarkdownToBlocks}
        sourceLabel="Markdown"
      />

      <H2 id="coverage">支持的语法。</H2>
      <DocTable
        columns={["Markdown", "目标块 / 行为"]}
        rows={[
          [<MonoCell># / ## / ###</MonoCell>, "heading（更多 # 钳到 3 级）"],
          [<MonoCell>- / * / + ··· 与 1. ···</MonoCell>, "bulletListItem / numberedListItem"],
          [<MonoCell>- [ ] / - [x]</MonoCell>, "checkListItem"],
          [<MonoCell>&gt; ···</MonoCell>, "quote（连续引用行合并为一个块）"],
          [<MonoCell>```language</MonoCell>, "codeBlock（带语言；mermaid → diagram 块）"],
          [<MonoCell>$$ ··· $$</MonoCell>, "math（latex 存入 props.latex）"],
          [<MonoCell>---</MonoCell>, "divider"],
          [<MonoCell>| a | b |</MonoCell>, "table（首行表头 + 分隔行 → props.rows）"],
          [<MonoCell>![alt](src) 整行</MonoCell>, "image"],
          ["行内", <MonoCell>**bold** · *italic* · `code` · ~~strike~~ · [text](href)</MonoCell>],
          ["普通文本行", "连续行合并为一个 paragraph，空行分块"],
        ]}
      />

      <Callout className="mt-6" title="已知限制">
        这是<strong>行级解析器</strong>而非完整 CommonMark 实现：不支持缩进嵌套列表、setext
        标题（<InlineCode>===</InlineCode> 下划线式）与引用内的块级结构；无法识别的行按段落保留，
        绝不丢内容。与 <MonoCell accent>blocksToMarkdown()</MonoCell> 导出的语法严格对齐——
        导出 → 导入是无损往返。
      </Callout>

      <CardStrip
        className="mt-14"
        cards={[
          { to: "/docs/import/html", title: "Importing HTML", description: "DOMParser 管道：网页复制内容的回流入口。" },
          { to: "/docs/export/markdown", title: "Exporting to Markdown", description: "blocksToMarkdown：与导入互为无损往返。" },
        ]}
      />
    </DocsShell>
  );
}
