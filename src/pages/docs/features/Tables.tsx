/**
 * /docs/features/tables — table 块：props.rows 结构、单元格编辑、工具条、
 * Tab 跳格、pipe-table Markdown 导出；live demo + 已知限制 Callout。
 */
import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import Kbd from "@/components/Kbd";
import DocsShell from "@/components/docs/DocsShell";
import LiveDemo from "@/components/docs/LiveDemo";
import {
  CardStrip,
  DocTable,
  H2,
  InlineCode,
  P,
} from "@/components/docs/primitives";
import type { Block } from "@/k3blocks";

/* ------------------------------- live demo ------------------------------- */

const DEMO_DOC: Block[] = [
  {
    id: "tb1",
    type: "table",
    props: {
      rows: [
        ["能力", "状态", "备注"],
        ["单元格编辑", "✓", "纯文本 contenteditable"],
        ["工具条", "✓", "hover 块右上角浮出"],
      ],
    },
    content: [],
    children: [],
  },
  { id: "tb2", type: "paragraph", props: {}, content: [], children: [] },
];

/* ---------------------------------- 页面 ---------------------------------- */

const ROWS_CODE = `{
  "type": "table",
  "props": {
    "rows": [
      ["名称", "状态"],   // rows[0] 恒为表头
      ["表格", "✓ stable"]
    ]
  },
  "content": [],           // table 块的 content 恒为空数组
  "children": []
}`;

const MD_CODE = `| 名称 | 状态 |
| --- | --- |
| 表格 | ✓ stable |`;

export default function Tables() {
  return (
    <DocsShell
      crumbs={["Docs", "Features", "Tables"]}
      title="Tables."
      lead="表格块以 props.rows 承载二维纯文本单元格——真实 <table> 渲染，hover 浮出增删行列工具条。"
    >
      <H2 id="data-model">数据模型。</H2>
      <P>
        表格不走 <InlineCode>content</InlineCode>：全部单元格存在{" "}
        <InlineCode>props.rows: string[][]</InlineCode> 中，<InlineCode>rows[0]</InlineCode>{" "}
        恒为表头（<InlineCode>--surface-1</InlineCode> 底 + 600 字重）。斜杠菜单{" "}
        <InlineCode>/table</InlineCode>（别名 <InlineCode>grid/表格/biaoge</InlineCode>）插入
        3×3 种子。
      </P>
      <CodeBlock className="mt-4" code={ROWS_CODE} language="json" />

      <H2 id="demo">在线体验。</H2>
      <P>点击任意单元格直接编辑；hover 表格，右上角浮出 28px 迷你工具条。</P>
      <LiveDemo
        className="mt-4"
        seed={DEMO_DOC}
        hints={[
          { keys: ["Tab"], text: "跳到下一格，行尾换行" },
          { keys: ["Backspace"], text: "首格为空时删除整块" },
          { text: "工具条：+行 +列 −行 −列" },
        ]}
      />

      <H2 id="keyboard">键盘行为。</H2>
      <DocTable
        columns={["按键", "行为"]}
        rows={[
          [<span className="flex gap-1"><Kbd>Tab</Kbd></span>, "下一格；行尾到下行首格；表尾自动新增一行"],
          [<span className="flex gap-1"><Kbd>Enter</Kbd></span>, "不拆块（单元格内换行被忽略）"],
          [<span className="flex gap-1"><Kbd>Backspace</Kbd></span>, "首格为空时删除整个表格块"],
        ]}
      />
      <P>
        单元格输入经 <InlineCode>onInput</InlineCode> 回写 <InlineCode>props.rows</InlineCode>
        ，连续打字合并为一条历史；工具条的 +行 +列 −行 −列每次{" "}
        <InlineCode>updateBlock</InlineCode> 记一条历史，保底至少 1 行 1 列。
      </P>

      <H2 id="markdown-export">Markdown 导出。</H2>
      <P>
        <InlineCode>blocksToMarkdown()</InlineCode> 将表格导出为标准 pipe table
        （首行表头 + <InlineCode>---</InlineCode> 分隔行）：
      </P>
      <CodeBlock className="mt-4" code={MD_CODE} language="markdown" />

      <Callout className="mt-6" title="已知限制">
        单元格只支持纯文本——不支持行内样式与嵌套块；列宽均分（
        <InlineCode>table-layout: fixed</InlineCode>）不可调；表格不参与「转换为」菜单。
      </Callout>

      <CardStrip
        className="mt-14"
        cards={[
          { to: "/docs/features/math", title: "Math equations", description: "KaTeX 公式块：latex 编辑与渲染双态。" },
          { to: "/docs/features/built-in-blocks", title: "Built-in blocks", description: "全部内置块总览与白名单语义。" },
        ]}
      />
    </DocsShell>
  );
}
