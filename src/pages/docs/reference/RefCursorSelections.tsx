/**
 * /docs/reference/cursor-selections — focus / setTextCursor / getSelection /
 * onSelectionChange 四件套、光标模型（块 id + 文本偏移）、跨块选区；live 选区状态面板。
 */
import { useEffect, useState } from "react";
import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import DocsShell from "@/components/docs/DocsShell";
import {
  CardStrip,
  DemoFrame,
  DocTable,
  H2,
  InlineCode,
  MonoCell,
  P,
} from "@/components/docs/primitives";
import { txt } from "@/components/docs/utils";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block, K3Selection } from "@/k3blocks";

const DEMO_DOC: Block[] = [
  { id: "cs-a", type: "paragraph", props: {}, content: [txt("第一块：点击我，状态面板显示光标落点。")], children: [] },
  { id: "cs-b", type: "paragraph", props: {}, content: [txt("第二块：从我拖到第三块，看看跨块选区。")], children: [] },
  { id: "cs-c", type: "quote", props: {}, content: [txt("第三块：跨块选区按文档顺序给出所有覆盖块 id。")], children: [] },
];

const panelBtn =
  "flex h-7 items-center rounded-lg border border-border px-2.5 font-mono text-[12px] text-text-2 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-1";

function SelectionDemo() {
  const editor = useK3Editor({ initialContent: DEMO_DOC });
  const [sel, setSel] = useState<K3Selection | null>(null);

  useEffect(() => editor.onSelectionChange(setSel), [editor]);

  return (
    <DemoFrame
      className="mt-4"
      bar={
        <>
          <button type="button" className={panelBtn} onClick={() => editor.focus()}>
            focus()
          </button>
          <button
            type="button"
            className={panelBtn}
            onClick={() => editor.setTextCursor("cs-c", 3)}
          >
            setTextCursor("cs-c", 3)
          </button>
          <button
            type="button"
            className={panelBtn}
            onClick={() => {
              const s = editor.getSelection();
              setSel(s);
            }}
          >
            getSelection()
          </button>
        </>
      }
      bodyClassName="p-0"
    >
      <div className="px-4 py-5 sm:px-6">
        <K3EditorView editor={editor} placeholder="输入 '/' 查看命令" />
      </div>
      <div className="grid gap-px border-t border-border bg-border sm:grid-cols-3">
        <div className="bg-surface-inset px-4 py-3">
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-4">selection</div>
          <div className="mt-1 font-mono text-[12px] text-text-1">
            {sel ? JSON.stringify(sel) : "null（选区不在编辑器内）"}
          </div>
        </div>
        <div className="bg-surface-inset px-4 py-3">
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-4">blockIds</div>
          <div className="mt-1 font-mono text-[12px] text-text-1">
            {sel ? sel.blockIds.join(" , ") : "—"}
          </div>
        </div>
        <div className="bg-surface-inset px-4 py-3">
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-4">覆盖块数</div>
          <div className="mt-1 font-mono text-[12px] text-text-1">{sel ? sel.blockIds.length : 0}</div>
        </div>
      </div>
    </DemoFrame>
  );
}

const CURSOR_SNIPPET = `// 光标模型：块 id + 纯文本字符偏移（不含行内标签）
editor.setTextCursor("cs-c", 3);   // 第三块第 3 个字符之后
editor.setTextCursor("cs-c");      // offset 缺省 0 —— 块首

// 典型链路：插入新块后立刻把光标放进去
const [b] = editor.insertBlocks([{ type: "paragraph" }], null);
editor.setTextCursor(b.id, 0);`;

const SUBSCRIBE_SNIPPET = `useEffect(() => {
  // 订阅即推当前值之后的每次变化；返回退订函数
  return editor.onSelectionChange((sel) => {
    setSelection(sel); // { blockIds: string[] } | null
  });
}, [editor]);`;

export default function RefCursorSelections() {
  return (
    <DocsShell
      crumbs={["Docs", "Editor reference", "Cursor & selections"]}
      title="Cursor & selections."
      lead="focus / setTextCursor / getSelection / onSelectionChange 四件套：光标以「块 id + 文本偏移」定位，选区以覆盖块 id 集上报。"
      wide
    >
      <H2 id="demo">选区状态面板。</H2>
      <P>
        在编辑器里点击、拖选（单块与跨块都试），面板实时显示{" "}
        <InlineCode>onSelectionChange</InlineCode> 推来的快照；三个按钮分别演示另外三个方法：
      </P>
      <SelectionDemo />

      <H2 id="methods">四个方法。</H2>
      <DocTable
        columns={["方法", "签名", "说明"]}
        rows={[
          [
            <MonoCell key="m" accent>focus</MonoCell>,
            <MonoCell key="s">() =&gt; void</MonoCell>,
            "聚焦编辑器：优先聚焦现有文本区，否则把光标放到第一个块开头",
          ],
          [
            <MonoCell key="m" accent>setTextCursor</MonoCell>,
            <MonoCell key="s">(blockId: string, offset?: number) =&gt; void</MonoCell>,
            "把文本光标放到指定块的指定字符偏移（缺省 0）；目标块渲染完成后生效",
          ],
          [
            <MonoCell key="m" accent>getSelection</MonoCell>,
            <MonoCell key="s">() =&gt; K3Selection | null</MonoCell>,
            "主动读一次当前选区；选区不在编辑器内时为 null",
          ],
          [
            <MonoCell key="m" accent>onSelectionChange</MonoCell>,
            <MonoCell key="s">(cb: (sel: K3Selection | null) =&gt; void) =&gt; () =&gt; void</MonoCell>,
            "订阅选区变化，返回退订函数；重复值去重，不重复触发",
          ],
        ]}
      />

      <H2 id="cursor-model">光标模型。</H2>
      <P>
        文本光标用 <InlineCode>CursorPosition</InlineCode> 描述 ——{" "}
        <InlineCode>{`{ blockId: string; offset: number }`}</InlineCode>。
        offset 是<strong>纯文本字符偏移</strong>：按块内可见文字计，不携带行内标签
        （链接、mention 等原子节点各占其文本宽度）。选区与光标都落在「块」这个粒度上，
        不提供块内像素级坐标。
      </P>
      <CodeBlock className="mt-4" code={CURSOR_SNIPPET} language="ts" />

      <H2 id="selection-model">选区模型与跨块选区。</H2>
      <P>
        <InlineCode>K3Selection</InlineCode> 是{" "}
        <InlineCode>{`{ blockIds: string[] }`}</InlineCode>：选区（含折叠光标）覆盖的块
        id，<strong>按文档顺序</strong>给出。跨块拖选时包含起点到终点之间的所有覆盖块；
        选区移出编辑器或被清空时回调 <InlineCode>null</InlineCode>。
      </P>
      <CodeBlock className="mt-4" code={SUBSCRIBE_SNIPPET} language="tsx" />

      <Callout className="mt-6">
        选区上报是「块粒度」的 —— 它回答「哪些块被覆盖」，不回答「块内选了哪几个字符」。
        需要精确字符区间时，在 onSelectionChange 里自行读{" "}
        <InlineCode>window.getSelection()</InlineCode> 配合{" "}
        <InlineCode>data-block-id</InlineCode> 定位。
      </Callout>

      <H2 id="next">接下来。</H2>
      <CardStrip
        cards={[
          { to: "/docs/reference/events", title: "Events", description: "onSelectionChange 的订阅范式与触发时机。" },
          { to: "/docs/reference/manipulating-content", title: "Manipulating content", description: "insertBlocks 返回值接 setTextCursor。" },
          { to: "/docs/reference/overview", title: "Reference overview", description: "实例方法全景分组表。" },
        ]}
      />
    </DocsShell>
  );
}
