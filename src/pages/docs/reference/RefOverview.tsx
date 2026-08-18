/**
 * /docs/reference/overview — editor 实例方法全景分组表（Document/History/Export/
 * Import/Events/Focus）+ 每个方法一句话 + 获取 editor 的两种方式；回链 /docs/api。
 */
import type { ReactNode } from "react";
import CodeBlock from "@/components/CodeBlock";
import DocsShell from "@/components/docs/DocsShell";
import LiveDemo from "@/components/docs/LiveDemo";
import {
  CardStrip,
  DocLink,
  DocTable,
  H2,

  MonoCell,
  P,
} from "@/components/docs/primitives";
import { txt } from "@/components/docs/utils";
import type { Block } from "@/k3blocks";

const OBTAIN_SNIPPET = `// 方式一：hook 返回值 —— 实例在组件生命周期内引用稳定，
// 可传给任意深层组件、事件回调与 useEffect。
const editor = useK3Editor({ initialContent });
editor.insertBlocks([{ type: "paragraph", content: "hi" }], null);

// 方式二：onChange 回调参数 —— 回调里的 editor 就是触发变更的实例，
// 等价于闭包里的那个，适合在模块级函数里使用。
useK3Editor({
  onChange: (e) => save(e.document),
});`;

const DEMO_DOC: Block[] = [
  {
    id: "rf1",
    type: "paragraph",
    props: {},
    content: [txt("编辑几行字，控制条上的块数与 undo 状态会实时变化 —— 它们都读自 editor 实例。")],
    children: [],
  },
  { id: "rf2", type: "paragraph", props: {}, content: [], children: [] },
];

type Row = [ReactNode, ReactNode, string];

function Group({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <>
      <P className="mt-8 font-mono text-[12px] uppercase tracking-[0.08em] text-text-4">{title}</P>
      <DocTable columns={["成员", "签名", "一句话"]} rows={rows} />
    </>
  );
}

const M = ({ children }: { children: string }) => <MonoCell accent>{children}</MonoCell>;
const S = ({ children }: { children: string }) => <MonoCell>{children}</MonoCell>;

export default function RefOverview() {
  return (
    <DocsShell
      crumbs={["Docs", "Editor reference", "Overview"]}
      title="Editor reference."
      lead="K3Editor 实例的全部成员，按用途分六组 —— 每组一句话定位，详细参数与示例去对应专页；表格速查见 API reference。"
      wide
    >
      <H2 id="obtain">获取 editor 的两种方式。</H2>
      <CodeBlock className="mt-4" code={OBTAIN_SNIPPET} language="tsx" />
      <LiveDemo
        className="mt-6"
        seed={DEMO_DOC}
        barExtra={(e) => (
          <span className="font-mono text-[12px] text-text-4">
            blocks: {e.document.length} · canUndo: {String(e.canUndo)}
          </span>
        )}
      />

      <H2 id="groups">方法全景。</H2>

      <Group
        title="Document — 读写文档结构"
        rows={[
          [<M key="m">document</M>, <S key="s">Block[]（getter）</S>, "当前完整文档快照，持久化与导出的数据源"],
          [<M key="m">insertBlocks</M>, <S key="s">(blocks, refId?, placement?) =&gt; Block[]</S>, "在参照块前 / 后 / 内部插入，返回落库后的块"],
          [<M key="m">updateBlock</M>, <S key="s">(id, partial) =&gt; void</S>, "按 id 更新 type / props / content / children"],
          [<M key="m">removeBlocks</M>, <S key="s">(ids: string[]) =&gt; void</S>, "按 id 批量删除（子块一并删除）"],
          [<M key="m">getBlock</M>, <S key="s">(id) =&gt; Block | undefined</S>, "按 id 查询单个块（含嵌套）"],
        ]}
      />

      <Group
        title="History — 自维护撤销栈"
        rows={[
          [<M key="m">undo / redo</M>, <S key="s">() =&gt; void</S>, "撤销 / 重做一步（用户输入与 API 调用都入栈）"],
          [<M key="m">canUndo / canRedo</M>, <S key="s">boolean（getter）</S>, "历史栈状态，驱动按钮可用态"],
        ]}
      />

      <Group
        title="Export — 六种出口"
        rows={[
          [<M key="m">blocksToMarkdown</M>, <S key="s">() =&gt; string</S>, "导出 Markdown"],
          [<M key="m">blocksToHTML</M>, <S key="s">() =&gt; string</S>, "导出完整语义化 HTML"],
          [<M key="m">blocksToEmailHTML</M>, <S key="s">() =&gt; string</S>, "导出 email-safe HTML（table + inline style）"],
          [<M key="m">blocksToDocxBlob</M>, <S key="s">() =&gt; Promise&lt;Blob&gt;</S>, "导出 .docx（docx 包动态加载）"],
          [<M key="m">blocksToOdtBlob</M>, <S key="s">() =&gt; Promise&lt;Blob&gt;</S>, "导出最小 .odt（jszip 动态加载）"],
          [<M key="m">print</M>, <S key="s">{"(opts?: { title?: string }) => void"}</S>, "打印窗口渲染 + window.print()，可另存 PDF"],
        ]}
      />

      <Group
        title="Import — 两种入口（append 到文档末尾）"
        rows={[
          [<M key="m">insertHTML</M>, <S key="s">(html: string) =&gt; void</S>, "DOMParser 解析 HTML，无法识别的结构降级为段落"],
          [<M key="m">insertMarkdown</M>, <S key="s">(md: string) =&gt; void</S>, "行级解析 Markdown（围栏 / 列表 / 表格 / 公式…）"],
        ]}
      />

      <Group
        title="Events — 订阅与退订"
        rows={[
          [<M key="m">onChange</M>, <S key="s">(cb) =&gt; unsubscribe</S>, "订阅文档变更（用户输入与 API 调用都触发）"],
          [<M key="m">onSelectionChange</M>, <S key="s">(cb) =&gt; unsubscribe</S>, "订阅选区变化，回调覆盖块 id 集或 null"],
        ]}
      />

      <Group
        title="Focus — 光标与选区"
        rows={[
          [<M key="m">focus</M>, <S key="s">() =&gt; void</S>, "聚焦编辑器（第一个文本块）"],
          [<M key="m">setTextCursor</M>, <S key="s">(blockId, offset?) =&gt; void</S>, "把文本光标放到指定块的指定偏移"],
          [<M key="m">getSelection</M>, <S key="s">() =&gt; K3Selection | null</S>, "当前选区覆盖的块 id 集（按文档顺序）"],
        ]}
      />

      <P className="mt-8">
        深入阅读：
        <DocLink to="/docs/reference/manipulating-content">Manipulating content</DocLink> ·{" "}
        <DocLink to="/docs/reference/cursor-selections">Cursor &amp; selections</DocLink> ·{" "}
        <DocLink to="/docs/reference/events">Events</DocLink> ·{" "}
        <DocLink to="/docs/api">API reference（表格速查）</DocLink>
      </P>

      <H2 id="next">接下来。</H2>
      <CardStrip
        cards={[
          { to: "/docs/reference/manipulating-content", title: "Manipulating content", description: "insert / update / remove 与导入导出。" },
          { to: "/docs/reference/events", title: "Events", description: "订阅范式与防抖持久化。" },
          { to: "/docs/api", title: "API reference", description: "全部成员的表格速查。" },
        ]}
      />
    </DocsShell>
  );
}
