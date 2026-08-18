/**
 * /docs/features/custom-blocks — blockRenderers 自定义渲染口完整教程：
 * 定义 type → 种子块 → 传 blockRenderers → updateBlock 回写；
 * live demo 渲染一个自定义 callout 提示卡块（type 不在内置注册表）。
 */
import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import DocsShell from "@/components/docs/DocsShell";
import LiveDemo from "@/components/docs/LiveDemo";
import {
  CardStrip,
  H2,
  H3,
  InlineCode,
  P,
} from "@/components/docs/primitives";
import { Lightbulb } from "lucide-react";
import type { Block, K3Editor } from "@/k3blocks";

/* ---------------------------- 自定义 callout 渲染 ---------------------------- */

/** 自定义 "callout" 块渲染器：只读渲染口 + 经 editor.updateBlock 回写文本。 */
function renderCallout(block: Block, editor: K3Editor) {
  const text = String(block.props.text ?? "");
  return (
    <aside
      data-block-id={block.id}
      className="flex items-start gap-2.5 rounded-lg border border-border bg-accent-soft px-3.5 py-3"
    >
      <Lightbulb size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-accent" />
      {editor.editable ? (
        <input
          value={text}
          onChange={(e) =>
            editor.updateBlock(block.id, { props: { ...block.props, text: e.target.value } })
          }
          placeholder="提示卡内容…"
          className="w-full bg-transparent text-sm text-text-1 outline-none placeholder:text-text-4"
        />
      ) : (
        <span className="text-sm text-text-1">{text}</span>
      )}
    </aside>
  );
}

const DEMO_DOC: Block[] = [
  {
    id: "cu1",
    type: "callout",
    props: { text: "这是一个 schema 未注册的自定义块——由 blockRenderers 渲染。" },
    content: [],
    children: [],
  },
  {
    id: "cu2",
    type: "paragraph",
    props: {},
    content: [{ type: "text", text: "上下都是内置块；提示卡可以拖拽、删除，照常参与历史。" }],
    children: [],
  },
  { id: "cu3", type: "paragraph", props: {}, content: [], children: [] },
];

/* -------------------------------- 教程代码 -------------------------------- */

const STEP_TYPE = `// 1. 自定义块的 type 只需是一个 schema 未注册的字符串。
//    内置注册表：paragraph / heading / *ListItem / quote / codeBlock /
//    divider / image / columnList / column / table / math / embed / diagram
const CALLOUT_TYPE = "callout";`;

const STEP_SEED = `// 2. 种子块与内置块形状完全一致：id / type / props / content / children
const seed: Block[] = [
  {
    id: "cu1",
    type: "callout",
    props: { text: "发布前记得跑一遍 tsc。" },
    content: [],
    children: [],
  },
];`;

const STEP_RENDER = `// 3. 把渲染函数传给 K3EditorView 的 blockRenderers
<K3EditorView
  editor={editor}
  blockRenderers={{
    callout: (block, editor) => (
      <aside data-block-id={block.id}>{block.props.text}</aside>
    ),
  }}
/>`;

const STEP_UPDATE = `// 4. 渲染口是只读的——块内交互自行实现，经 updateBlock 回写
editor.updateBlock(block.id, {
  props: { ...block.props, text: "新的提示内容" },
});`;

/* ---------------------------------- 页面 ---------------------------------- */

export default function CustomBlocks() {
  return (
    <DocsShell
      crumbs={["Docs", "Features", "Custom blocks"]}
      title="Custom blocks."
      lead="blockRenderers 是自定义块的渲染口：schema 未注册的 type 由你的 React 组件接管渲染，结构编辑照常由编辑器负责。"
    >
      <H2 id="demo">先看效果。</H2>
      <P>
        下面的「提示卡」块 type 为 <InlineCode>callout</InlineCode>——不在内置注册表中，
        由 <InlineCode>blockRenderers</InlineCode> 渲染；卡内输入经{" "}
        <InlineCode>updateBlock</InlineCode> 实时回写，切到 JSON 视图可见。
      </P>
      <LiveDemo
        className="mt-4"
        seed={DEMO_DOC}
        blockRenderers={{ callout: renderCallout }}
        hints={[
          { text: "提示卡内直接输入，updateBlock 回写" },
          { keys: ["⠿"], text: "拖拽、删除照常生效" },
        ]}
      />

      <H2 id="tutorial">四步接入。</H2>
      <H3 id="step-type">1. 定义 type。</H3>
      <P>
        自定义块的 <InlineCode>type</InlineCode> 只需避开内置注册表的名字，无需注册 schema。
      </P>
      <CodeBlock className="mt-3" code={STEP_TYPE} language="ts" />

      <H3 id="step-seed">2. 准备种子块。</H3>
      <P>
        自定义块与内置块同形：<InlineCode>id / type / props / content / children</InlineCode>。
        数据全放 <InlineCode>props</InlineCode>，JSON 照常序列化存储。
      </P>
      <CodeBlock className="mt-3" code={STEP_SEED} language="ts" />

      <H3 id="step-renderers">3. 传 blockRenderers。</H3>
      <P>
        键为 type、值为 <InlineCode>(block, editor) =&gt; ReactNode</InlineCode>{" "}
        的渲染函数。已注册的内置 type 始终走内置渲染器——这张表无法覆盖内置块。
      </P>
      <CodeBlock className="mt-3" code={STEP_RENDER} language="tsx" />

      <H3 id="step-update">4. updateBlock 回写。</H3>
      <P>
        渲染口定位是只读渲染：拖拽、删除、侧边菜单照常生效，但块内交互需自行实现，
        任何编辑都经 <InlineCode>editor.updateBlock</InlineCode> 回写以进入历史栈。
      </P>
      <CodeBlock className="mt-3" code={STEP_UPDATE} language="ts" />

      <Callout className="mt-6" title="白名单语义">
        <InlineCode>blockTypes</InlineCode> 白名单只收敛内置块：未设置时全部放行；
        即使设置了白名单，schema 未注册的自定义 type 也不会被{" "}
        <InlineCode>isTypeAllowed</InlineCode> / <InlineCode>insertBlocks</InlineCode>{" "}
        降级误杀——自定义块始终放行。
      </Callout>

      <CardStrip
        className="mt-14"
        cards={[
          { to: "/docs/features/built-in-blocks", title: "Built-in blocks", description: "全部内置块总览与 blockTypes 白名单。" },
          { to: "/docs/api", title: "API reference", description: "K3EditorView 与 updateBlock 的完整签名。" },
        ]}
      />
    </DocsShell>
  );
}
