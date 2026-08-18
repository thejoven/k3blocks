import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import Kbd from "@/components/Kbd";
import DocsShell from "@/components/docs/DocsShell";
import {
  CardStrip,
  DemoFrame,
  DocTable,
  H2,
  InlineCode,
  MonoCell,
  P,
  Segmented,
} from "@/components/docs/primitives";
import { txt, useEditorVersion } from "@/components/docs/utils";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";

/* ---------------------------- anatomy diagram ---------------------------- */

function Field({ name, value, accent = false }: { name: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline gap-2 font-mono text-[13px]">
      <span className="text-text-3">{name}:</span>
      <span className={accent ? "text-accent" : "text-text-1"}>{value}</span>
    </div>
  );
}

/** docs.md §3.1 — block anatomy, built in DOM (not an image). */
function AnatomyDiagram() {
  return (
    <div className="mt-6 rounded-xl border border-border bg-surface-1 p-5 sm:p-6">
      {/* Outer block box */}
      <div className="rounded-lg border border-border bg-surface-2 p-4">
        <div className="font-mono text-[12px] uppercase tracking-[0.08em] text-text-3">Block</div>
        <div className="mt-3 flex flex-col gap-1.5">
          <Field name="id" value='"a1f…"' accent />
          <Field name="type" value='"paragraph"' accent />
          <Field name="props" value="{}" />
        </div>

        {/* content box */}
        <div className="mt-4 rounded-lg border border-border bg-surface-1 p-4">
          <div className="font-mono text-[12px] text-text-3">
            content: <span className="text-text-1">InlineContent[]</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-md border border-border bg-surface-inset px-2 py-1 font-mono text-[12px] text-text-2">
              text(<span className="text-code-green">"Hello"</span>, {"{ bold }"})
            </span>
            <span className="rounded-md border border-border bg-surface-inset px-2 py-1 font-mono text-[12px] text-text-2">
              link(<span className="text-code-green">"K3"</span>, <span className="text-accent">href</span>)
            </span>
          </div>
        </div>
      </div>

      {/* connector hairline */}
      <div className="flex h-6 items-stretch pl-8" aria-hidden="true">
        <div className="w-px bg-border" />
      </div>

      {/* children box */}
      <div className="ml-8 rounded-lg border border-dashed border-border p-4">
        <div className="font-mono text-[12px] text-text-3">
          children: <span className="text-text-1">Block[]</span>
          <span className="ml-2 text-text-4">{"// 0..n 个子块，同样的形状"}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- live demo ------------------------------- */

const LIVE_DOC: Block[] = [
  { id: "d1", type: "heading", props: { level: 2 }, content: [txt("编辑即修改 JSON")], children: [] },
  {
    id: "d2",
    type: "paragraph",
    props: {},
    content: [txt("在左侧输入任何内容，右侧的 "), txt("Block[]", { code: true }), txt(" 实时变化。")],
    children: [],
  },
  {
    id: "d3",
    type: "bulletListItem",
    props: {},
    content: [txt("嵌套一层"),],
    children: [
      { id: "d3a", type: "bulletListItem", props: {}, content: [txt("children 里的子块")], children: [] },
    ],
  },
];

function EditJsonDemo() {
  const [view, setView] = useState<"edit" | "json">("edit");
  const editor = useK3Editor({ initialContent: LIVE_DOC });
  const version = useEditorVersion(editor);
  const json = useMemo(
    () => JSON.stringify(editor.document, null, 2),
    // version ticks on every change; editor.document is re-read each time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, version],
  );

  return (
    <DemoFrame
      className="mt-4"
      bodyClassName="px-4 py-4 sm:px-6"
      bar={
        <Segmented
          options={[
            { value: "edit", label: "Edit" },
            { value: "json", label: "JSON" },
          ]}
          value={view}
          onChange={setView}
        />
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {view === "edit" ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <K3EditorView editor={editor} placeholder="输入 '/' 查看命令" />
          </motion.div>
        ) : (
          <motion.div
            key="json"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <CodeBlock code={json} language="json" className="max-h-[360px] overflow-y-auto" />
          </motion.div>
        )}
      </AnimatePresence>
    </DemoFrame>
  );
}

/* --------------------------------- page ---------------------------------- */

const JSON_SAMPLE = `[
  {
    "id": "h1",
    "type": "heading",
    "props": { "level": 1 },
    "content": [{ "type": "text", "text": "季度复盘" }],
    "children": []
  },
  {
    "id": "p1",
    "type": "paragraph",
    "props": {},
    "content": [
      { "type": "text", "text": "本周 shipped " },
      { "type": "text", "text": "三个功能", "styles": { "bold": true } },
      { "type": "text", "text": "，详见 " },
      {
        "type": "link",
        "href": "https://example.com/changelog",
        "content": [{ "type": "text", "text": "changelog" }]
      }
    ],
    "children": []
  },
  {
    "id": "l1",
    "type": "bulletListItem",
    "props": {},
    "content": [{ "type": "text", "text": "编辑器" }],
    "children": [
      {
        "id": "l1a",
        "type": "bulletListItem",
        "props": {},
        "content": [{ "type": "text", "text": "斜杠菜单上线" }],
        "children": []
      }
    ]
  }
]`;

export default function DocumentStructure() {
  return (
    <DocsShell
      crumbs={["Docs", "Foundations", "Document structure"]}
      title="Document structure."
      lead="文档即 Block[]。每个块有 id、type、props、content 与 children。"
    >
      <H2 id="anatomy">块的解剖。</H2>
      <P>
        一个块就是五个字段。<InlineCode>id</InlineCode> 全文档唯一；
        <InlineCode>type</InlineCode> 决定渲染与行为（如 <InlineCode>paragraph</InlineCode>、
        <InlineCode>heading</InlineCode>）；<InlineCode>props</InlineCode> 存块级配置（标题层级、待办勾选、代码语言）；
        <InlineCode>content</InlineCode> 是行内内容数组；<InlineCode>children</InlineCode> 是嵌套的子块。
      </P>
      <AnatomyDiagram />

      <H2 id="json">JSON 表示。</H2>
      <P>一份「标题 + 带加粗与链接的段落 + 嵌套列表」的文档，完整长这样：</P>
      <CodeBlock className="mt-4" code={JSON_SAMPLE} language="json" />
      <Callout className="mt-4">
        JSON 是无损格式：序列化 → 存储 → 反序列化，文档逐字节一致。
      </Callout>

      <H2 id="inline-content">InlineContent 与样式。</H2>
      <P>
        块内文本不是 HTML 字符串，而是结构化数组。两种节点：
      </P>
      <DocTable
        columns={["类型", "形状", "说明"]}
        rows={[
          [
            <MonoCell key="t" accent>text</MonoCell>,
            <MonoCell key="s">{'{ type: "text", text, styles? }'}</MonoCell>,
            <>纯文本。styles 可选：<MonoCell>bold · italic · underline · strike · code</MonoCell></>,
          ],
          [
            <MonoCell key="t" accent>link</MonoCell>,
            <MonoCell key="s">{'{ type: "link", href, content }'}</MonoCell>,
            <>链接。content 是嵌套的 InlineContent[]，链接文字本身可以带样式。</>,
          ],
        ]}
      />

      <H2 id="nesting">嵌套与 children。</H2>
      <P>
        列表项、引用等块可以拥有子块：在编辑器里按 <Kbd>Tab</Kbd> 缩进、
        <Kbd>Shift+Tab</Kbd> 提升，本质上就是把一个块移入或移出另一个块的{" "}
        <InlineCode>children</InlineCode>。层级深度没有上限，但渲染时每层缩进 24px。
      </P>

      <H2 id="live">编辑即修改 JSON。</H2>
      <P>下面这个编辑器与右侧 JSON 视图共享同一个 editor 实例：</P>
      <EditJsonDemo />

      <H2 id="examples">相关示例。</H2>
      <CardStrip
        cards={[
          { to: "/examples/json-round-trip", title: "JSON Round-trip", description: "导出 → 存储 → 重新挂载，逐字节一致。" },
          { to: "/docs/foundations/manipulating-blocks", title: "Manipulating blocks", description: "用实例方法读写这棵树。" },
        ]}
      />
    </DocsShell>
  );
}
