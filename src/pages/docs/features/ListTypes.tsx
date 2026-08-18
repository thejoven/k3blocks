/**
 * /docs/features/list-types — 无序 / 有序 / 待办三种列表：
 * 嵌套缩进、Enter/Backspace 行为、checked 写回 props；live demo + 快捷键表。
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
import { txt } from "@/components/docs/utils";
import type { Block } from "@/k3blocks";

/* ------------------------------- live demo ------------------------------- */

const DEMO_DOC: Block[] = [
  { id: "li1", type: "bulletListItem", props: {}, content: [txt("无序列表项")], children: [] },
  {
    id: "li2",
    type: "bulletListItem",
    props: {},
    content: [txt("按 Tab 缩进的父项")],
    children: [
      { id: "li2a", type: "bulletListItem", props: {}, content: [txt("嵌套子项")], children: [] },
    ],
  },
  { id: "li3", type: "numberedListItem", props: {}, content: [txt("第一步")], children: [] },
  { id: "li4", type: "numberedListItem", props: {}, content: [txt("第二步（编号自动算）")], children: [] },
  { id: "li5", type: "checkListItem", props: { checked: true }, content: [txt("已完成的事项")], children: [] },
  { id: "li6", type: "checkListItem", props: { checked: false }, content: [txt("待办事项")], children: [] },
  { id: "li7", type: "paragraph", props: {}, content: [], children: [] },
];

/* ---------------------------------- 页面 ---------------------------------- */

const CHECKED_CODE = `// 勾选状态实时写回 props.checked —— JSON 即存储格式
{ "type": "checkListItem", "props": { "checked": true }, "content": [...] }`;

export default function ListTypes() {
  return (
    <DocsShell
      crumbs={["Docs", "Features", "List types"]}
      title="List types."
      lead="无序、有序、待办三种列表共享同一套树形行为：Tab 缩进成嵌套，Enter 延续，Backspace 收敛。"
    >
      <H2 id="three-types">三种列表。</H2>
      <P>
        <InlineCode>bulletListItem</InlineCode>、<InlineCode>numberedListItem</InlineCode> 与{" "}
        <InlineCode>checkListItem</InlineCode> 是三个独立块类型，编号由文档结构实时推导——
        拖动 ⠿ 手柄重排或增删任意一项，有序编号即刻重算；待办列表的勾选态存于{" "}
        <InlineCode>props.checked</InlineCode>，勾选后标签以删除线淡出。
      </P>

      <H2 id="demo">在线体验。</H2>
      <LiveDemo
        className="mt-4"
        seed={DEMO_DOC}
        hints={[
          { keys: ["Tab"], text: "缩进一层" },
          { keys: ["Shift", "Tab"], text: "提升一层" },
          { keys: ["Enter"], text: "空项上降级为段落" },
        ]}
      />

      <H2 id="nesting">嵌套与缩进。</H2>
      <P>
        列表项上按 <Kbd>Tab</Kbd> 缩进为上一项的子块（写入 <InlineCode>children</InlineCode>），
        <Kbd>Shift</Kbd>+<Kbd>Tab</Kbd> 提升一层。嵌套的有序列表各自独立计数。
      </P>
      <DocTable
        columns={["按键", "行为"]}
        rows={[
          [<span className="flex gap-1"><Kbd>Tab</Kbd></span>, "缩进一层，成为上一项的子块"],
          [<span className="flex gap-1"><Kbd>Shift</Kbd><Kbd>Tab</Kbd></span>, "提升一层，回到父级序列"],
          [<span className="flex gap-1"><Kbd>Enter</Kbd></span>, "非空项：在同层新增同类列表项；空项：降级为段落"],
          [<span className="flex gap-1"><Kbd>Backspace</Kbd></span>, "块首按下：先降级为段落，再按合并入上一块"],
          [<span className="flex gap-1"><Kbd>-</Kbd><Kbd>1.</Kbd><Kbd>[</Kbd><Kbd>]</Kbd></span>, "行首输入 + Space 转换为对应列表"],
        ]}
      />

      <H2 id="checked-state">checked 写回。</H2>
      <P>
        待办列表的 16px 复选框是纯受控的：点击即调用{" "}
        <InlineCode>editor.updateBlock(id, {"{ props: { checked } }"})</InlineCode>
        ，状态实时落进文档 JSON，随 <InlineCode>onChange</InlineCode> 一起交给宿主持久化。
      </P>
      <CodeBlock className="mt-4" code={CHECKED_CODE} language="json" />
      <Callout className="mt-4">
        新待办项由 <Kbd>Enter</Kbd> 创建时自动继承未勾选态（
        <InlineCode>checked: false</InlineCode>）；勾选态不参与 Markdown 行首规则的往返。
      </Callout>

      <CardStrip
        className="mt-14"
        cards={[
          { to: "/blocks/bullet-list", title: "Bullet List", description: "无序列表块专页，逐 props 讲解。" },
          { to: "/blocks/todo-list", title: "To-do List", description: "待办列表块专页与勾选动效。" },
        ]}
      />
    </DocsShell>
  );
}
