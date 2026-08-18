/**
 * /docs/react/link-toolbar — 链接工具：选中文本 ⌘K / 工具栏 link 按钮创建链接，
 * 链接编辑与剥除，已知限制（整段包裹）；live demo。
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
  MonoCell,
  P,
} from "@/components/docs/primitives";
import { lnk, txt } from "@/components/docs/utils";
import type { Block } from "@/k3blocks";

const DEMO_DOC: Block[] = [
  {
    id: "lt1",
    type: "paragraph",
    props: {},
    content: [
      txt("选中这段文字里的任意几个词，按 "),
      txt("⌘K", { code: true }),
      txt(" 或点工具栏的 link 按钮，输入 URL 回车。"),
    ],
    children: [],
  },
  {
    id: "lt2",
    type: "paragraph",
    props: {},
    content: [
      txt("这是一个"),
      lnk("https://github.com/thejoven/k3blocks", "已经存在的链接"),
      txt(" —— 把光标选区放回它上面再按 ⌘K，看看会发生什么。"),
    ],
    children: [],
  },
];

const MODEL_SNIPPET = `// 链接在文档模型里是行内容节点，可再嵌套带样式的 text：
{ type: "link", href: "https://k3.io", content: [
  { type: "text", text: "K3 官网", styles: { bold: true } },
]}

// DOM 侧渲染为：
// <a href="https://k3.io" target="_blank" rel="noopener noreferrer">…</a>
// Markdown 导出为 [K3 官网](https://k3.io)`;

export default function UiLinkToolbar() {
  return (
    <DocsShell
      crumbs={["Docs", "React", "Link toolbar"]}
      title="Link toolbar."
      lead="选中文本，⌘K 或工具栏 link 按钮，输入 URL 回车 —— 链接创建、编辑与剥除都在工具栏的链接输入态里完成。"
    >
      <H2 id="create">创建链接。</H2>
      <P>
        选中一段文字后有两种入口：<Kbd>⌘K</Kbd>（<Kbd>Ctrl+K</Kbd>）或格式化工具栏上的{" "}
        <MonoCell accent>link</MonoCell> 按钮。两者都会把工具栏切换为
        <strong>链接输入态</strong>：一个 28px 的 URL 输入框（占位文案{" "}
        <InlineCode>输入链接，回车确认</InlineCode>，可经字典键{" "}
        <InlineCode>formattingToolbar.linkInputPlaceholder</InlineCode> 覆盖）。
      </P>
      <DocTable
        columns={["按键", "行为"]}
        rows={[
          [<span key="k"><Kbd>↵</Kbd></span>, "应用链接：选区被包进 <a>，工具栏回到按钮态"],
          [<span key="k"><Kbd>esc</Kbd></span>, "放弃输入，回到按钮态，选区保持不变"],
        ]}
      />
      <P>
        渲染出的 <InlineCode>&lt;a&gt;</InlineCode> 固定带{" "}
        <InlineCode>target="_blank" rel="noopener noreferrer"</InlineCode>；样式为 accent
        色、hover 下划线（继承 <InlineCode>--accent</InlineCode> 变量）。
      </P>

      <H2 id="edit">编辑与剥除。</H2>
      <P>
        选区落在已有链接内时再次触发 link 入口：输入框会
        <strong>预填当前 href</strong>，改完回车即更新；而选区本身已处于{" "}
        <InlineCode>&lt;a&gt;</InlineCode> 内时，再次应用等效于
        <strong>剥除链接</strong>（整个 <InlineCode>&lt;a&gt;</InlineCode>{" "}
        解包，文字与样式保留）。链接是文档模型的一等节点，撤销 / 重做 / onChange
        对它天然生效。
      </P>

      <H2 id="demo">在线体验。</H2>
      <P>
        第一段从零创建链接；第二段在已有链接上练习编辑与剥除。切到 JSON
        视图可以看到 link 节点的写入。
      </P>
      <LiveDemo
        className="mt-4"
        seed={DEMO_DOC}
        hints={[
          { keys: ["⌘", "K"], text: "创建 / 编辑链接" },
          { keys: ["↵"], text: "确认" },
          { keys: ["esc"], text: "取消" },
        ]}
      />

      <H2 id="model">数据模型。</H2>
      <CodeBlock className="mt-4" code={MODEL_SNIPPET} language="ts" />
      <P>
        模型层的完整说明见{" "}
        <MonoCell accent>InlineContent</MonoCell> 一节：
        <InlineCode>link</InlineCode> 节点带 <InlineCode>href</InlineCode> 与递归的{" "}
        <InlineCode>content</InlineCode>，链接内可继续叠加粗体等行内样式。
      </P>

      <Callout className="mt-6" title="已知限制">
        链接操作基于选区<strong>整段包裹</strong>：编辑 / 剥除作用于选区所在的整个{" "}
        <InlineCode>&lt;a&gt;</InlineCode> 元素 —— 无法只修改一段链接中某几个字符的
        href；要拆开一个链接，先整段剥除再对子串重新创建。折叠光标（未选中文字）下
        link 入口不生效。
      </Callout>

      <H2 id="next">接下来。</H2>
      <CardStrip
        cards={[
          { to: "/docs/react/formatting-toolbar", title: "Formatting toolbar", description: "link 按钮所在的工具栏全貌。" },
          { to: "/docs/features/inline-content", title: "Inline content", description: "link 节点的数据模型详解。" },
          { to: "/docs/api", title: "API reference", description: "相关 prop 与字典键速查。" },
        ]}
      />
    </DocsShell>
  );
}
