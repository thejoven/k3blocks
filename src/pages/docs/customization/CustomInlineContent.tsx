/**
 * /docs/customization/custom-inline-content — inlineRenderers 教程：
 * 定义行内 `tag` 类型（{ type:"tag", props:{ label:"发布" } }，按 K3CustomInlineContent
 * 断言构造），inlineRenderers 渲染为 chip；强调 JSON 无损往返与 Markdown 降级。
 */
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import Kbd from "@/components/Kbd";
import SectionLabel from "@/components/SectionLabel";
import DocsShell from "@/components/docs/DocsShell";
import {
  CardStrip,
  DocTable,
  H2,
  InlineCode,
  MonoCell,
  P,
} from "@/components/docs/primitives";
import { txt } from "@/components/docs/utils";
import { cn } from "@/lib/utils";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type {
  Block,
  InlineContent,
  K3CustomInlineContent,
  K3InlineRenderer,
} from "@/k3blocks";

/* ------------------------------ tag 行内节点 ------------------------------ */

/** 构造一个 tag 行内节点：type 避开 text/link/mention，数据放 props。 */
function tag(label: string): InlineContent {
  return { type: "tag", props: { label } } as K3CustomInlineContent as InlineContent;
}

/** tag 渲染器：只读 chip。参数需按 K3CustomInlineContent 断言取 props。 */
const renderTag: K3InlineRenderer = (node) => {
  const label = String((node as K3CustomInlineContent).props?.label ?? "");
  return (
    <span className="mx-0.5 inline-flex h-5 items-center rounded-md border border-border bg-accent-soft px-1.5 font-mono text-[11px] leading-none text-accent">
      {label}
    </span>
  );
};

const SEED: Block[] = [
  {
    id: "tg1",
    type: "paragraph",
    props: {},
    content: [
      txt("本迭代 "),
      tag("发布"),
      txt(" 已完成，"),
      tag("回归"),
      txt(" 进行中——chip 是行内原子节点，随文字一起参与选区、删除与撤销。"),
    ],
    children: [],
  },
  { id: "tg2", type: "paragraph", props: {}, content: [], children: [] },
];

function cloneSeed(): Block[] {
  return JSON.parse(JSON.stringify(SEED)) as Block[];
}

/* ------------------------------ live demo ------------------------------ */

function TagDemo() {
  const [view, setView] = useState<"edit" | "json">("edit");
  const [version, setVersion] = useState(0);
  const editor = useK3Editor({
    initialContent: cloneSeed(),
    onChange: () => setVersion((v) => v + 1),
  });

  const json = useMemo(
    () => JSON.stringify(editor.document, null, 2),
    // version 随每次 onChange 递增，驱动重新读取 editor.document
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, version],
  );

  const reset = () => {
    const ids = editor.document.map((blk) => blk.id);
    if (ids.length > 0) editor.removeBlocks(ids);
    editor.insertBlocks(cloneSeed());
  };

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border bg-surface-1">
      <div className="flex min-h-11 flex-wrap items-center gap-3 border-b border-border px-3 py-1.5">
        <div className="flex h-7 items-center rounded-lg border border-border p-0.5">
          {(["edit", "json"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                "flex h-6 items-center rounded-md px-2.5 font-mono text-[12px] transition-colors duration-150 ease-k3",
                view === v
                  ? "border border-border bg-surface-2 text-text-1"
                  : "border border-transparent text-text-3 hover:text-text-2",
              )}
            >
              {v === "edit" ? "Edit" : "JSON"}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={reset}
          className="ml-auto flex h-7 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[12px] text-text-2 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-1"
        >
          <RotateCcw size={13} strokeWidth={1.5} />
          Reset
        </button>
      </div>
      <div className="bg-surface-inset px-5 py-8 md:px-10 md:py-10">
        <AnimatePresence mode="wait" initial={false}>
          {view === "edit" ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <K3EditorView
                editor={editor}
                slashMenu
                formattingToolbar
                sideMenu
                inlineRenderers={{ tag: renderTag }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="json"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <CodeBlock code={json} language="json" className="max-h-[420px] overflow-y-auto" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-4 py-2.5 text-[12px] text-text-3">
        <span className="flex items-center gap-1.5">切到 JSON 视图：tag 节点原样保留</span>
        <span className="flex items-center gap-1.5">
          <Kbd>Backspace</Kbd>chip 是原子节点，整体删除
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>⌘</Kbd>
          <Kbd>Z</Kbd>撤销照常生效
        </span>
      </div>
    </div>
  );
}

/* -------------------------------- 教程代码 -------------------------------- */

const STEP_MODEL = `import type { InlineContent, K3CustomInlineContent } from "@k3/blocks";

// 1. 定义行内节点：type 是任意非 text/link/mention 的字符串，数据放 props。
//    自定义节点不进 InlineContent 联合（保持判别联合收窄向后兼容），
//    构造时按 K3CustomInlineContent 断言即可。
const tagNode = {
  type: "tag",
  props: { label: "发布" },
} as K3CustomInlineContent as InlineContent;

// 2. 放进任意文本块的 content 数组
const block = {
  id: "b1",
  type: "paragraph",
  props: {},
  content: [{ type: "text", text: "本迭代 " }, tagNode, { type: "text", text: " 完成。" }],
  children: [],
};`;

const STEP_RENDERER = `// 3. inlineRenderers：未知 inline type 的渲染口（只读）
<K3EditorView
  editor={editor}
  inlineRenderers={{
    tag: (node) => {
      const label = String((node as K3CustomInlineContent).props?.label ?? "");
      return <span className="tag-chip">{label}</span>;
    },
  }}
/>`;

/* ---------------------------------- 页面 ---------------------------------- */

export default function CustomInlineContent() {
  return (
    <DocsShell
      crumbs={["Docs", "Customization", "Custom inline content"]}
      title="Custom inline content."
      lead="inlineRenderers 是自定义行内类型的渲染口：text / link / mention 之外的 inline 节点由你的 React 组件渲染，JSON 往返原样保留，一个字段都不丢。"
    >
      <H2 id="model">数据模型。</H2>
      <P>
        内置行内联合只有 <MonoCell accent>text</MonoCell>、<MonoCell accent>link</MonoCell>、
        <MonoCell accent>mention</MonoCell> 三种。除此之外的 <InlineCode>type</InlineCode>{" "}
        都算「未知行内类型」：序列化层对它们不做任何字段裁剪——
        <InlineCode>type</InlineCode>、<InlineCode>props</InlineCode> 与任何额外键都原样进出 JSON。
      </P>
      <CodeBlock className="mt-4" code={STEP_MODEL} language="ts" />
      <P>
        类型上自定义节点不属于 <InlineCode>InlineContent</InlineCode> 联合
        （避免破坏既有代码的判别联合收窄），构造时按{" "}
        <InlineCode>K3CustomInlineContent</InlineCode> 断言；运行时由序列化层透明保留。
      </P>

      <H2 id="demo">渲染为 chip。</H2>
      <P>
        把 <InlineCode>tag</InlineCode> 节点渲染成一枚 accent chip：
        它在文本流中原子存在——不可局部编辑，Backspace 整体删除，撤销 / 重做 / onChange 天然生效。
        切到 JSON 视图，可以看到两个 tag 节点随编辑原样保留。
      </P>
      <SectionLabel className="mt-6">LIVE DEMO — tag 行内节点</SectionLabel>
      <TagDemo />

      <H2 id="renderer">接入 inlineRenderers。</H2>
      <P>
        键为行内 <InlineCode>type</InlineCode>、值为{" "}
        <InlineCode>(node, editor) =&gt; ReactNode</InlineCode> 的只读渲染函数。
        参数 <InlineCode>node</InlineCode> 的类型是{" "}
        <InlineCode>InlineContent &amp; {"{ type: string }"}</InlineCode>
        ，取自定义字段时同样按 <InlineCode>K3CustomInlineContent</InlineCode> 断言。
      </P>
      <CodeBlock className="mt-3" code={STEP_RENDERER} language="tsx" />

      <H2 id="round-trip">JSON 无损往返。</H2>
      <P>未知行内类型在四个层面的行为：</P>
      <DocTable
        columns={["层面", "行为"]}
        rows={[
          [
            <MonoCell>JSON 存储</MonoCell>,
            "节点原样保留：type、props 与任意额外键不丢失——JSON 即无损存储格式。",
          ],
          [
            <MonoCell>DOM 互转</MonoCell>,
            '导出为原子 span：data-k3-inline="tag" 标注 + data-k3-inline-json 内嵌完整 JSON，复制粘贴与 HTML 回导不丢数据。',
          ],
          [
            <MonoCell>渲染</MonoCell>,
            "inlineRenderers[type] 返回的 ReactNode（只读渲染口，经 portal 挂进文本流）。",
          ],
          [
            <MonoCell>Markdown / 纯文本</MonoCell>,
            '降级取 text ?? label ?? props.label——本例导出为纯文本 "发布"。',
          ],
        ]}
      />

      <Callout className="mt-6" title="Markdown 降级说明">
        Markdown 没有自定义行内节点的表达力：导出时未知类型降级为纯文本，依次取{" "}
        <InlineCode>text</InlineCode> → <InlineCode>label</InlineCode> →{" "}
        <InlineCode>props.label</InlineCode> 字段。需要完整保真时请走 JSON 或 HTML
        （<InlineCode>data-k3-inline</InlineCode> span 内嵌完整 JSON，可无损回导）。
      </Callout>

      <CardStrip
        className="mt-14"
        cards={[
          { to: "/docs/features/inline-content", title: "Inline content", description: "内置 text / link 行内模型与格式化工具栏。" },
          { to: "/examples/mentions-menu", title: "示例：Mentions menu", description: "内置 mention——另一种行内原子节点的完整实现参考。" },
          { to: "/docs/api", title: "API reference", description: "inlineRenderers 与 K3CustomInlineContent 的完整签名。" },
        ]}
      />
    </DocsShell>
  );
}
