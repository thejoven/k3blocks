/**
 * /docs/customization/custom-schemas — schema 定制三件套完整教程：
 * blockTypes 白名单 + blockConfig 行为配置 + dictionary 文案定制，
 * 组合出一个「公告编辑器」迷你 schema（paragraph / heading / quote + 自定义文案）。
 * 与 /docs/features/custom-blocks 错位互补：那页讲块级渲染口（加），本页讲整体 schema（减与改）。
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
  H3,
  InlineCode,
  MonoCell,
  P,
} from "@/components/docs/primitives";
import { txt } from "@/components/docs/utils";
import { cn } from "@/lib/utils";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";

/* ------------------------------ 公告编辑器 demo ------------------------------ */

const SEED: Block[] = [
  {
    id: "an1",
    type: "heading",
    props: { level: 1 },
    content: [txt("K3Blocks v0.2 发布公告")],
    children: [],
  },
  {
    id: "an2",
    type: "paragraph",
    props: {},
    content: [
      txt("这是一台「公告编辑器」：块集合被收窄到 paragraph / heading / quote，输入 "),
      txt("/", { code: true }),
      txt(" 查看被白名单过滤后的斜杠菜单。"),
    ],
    children: [],
  },
  {
    id: "an3",
    type: "quote",
    props: {},
    content: [txt("quote 保留——适合放升级注意事项与 breaking change 提示。")],
    children: [],
  },
  { id: "an4", type: "paragraph", props: {}, content: [], children: [] },
];

function cloneSeed(): Block[] {
  return JSON.parse(JSON.stringify(SEED)) as Block[];
}

/** 迷你 schema 的 useK3Editor 配置（demo 与下方教程代码一致）。 */
const SCHEMA_OPTIONS = {
  blockTypes: ["paragraph", "heading", "quote"],
  blockConfig: { heading: { levels: [1, 2] as (1 | 2)[] } },
  dictionary: {
    placeholder: "撰写公告正文…",
    slashMenu: { groupBasic: "公告块", empty: "公告 schema 没有这个块" },
  },
};

function SchemaDemo() {
  const [view, setView] = useState<"edit" | "json">("edit");
  const [version, setVersion] = useState(0);
  const editor = useK3Editor({
    initialContent: cloneSeed(),
    ...SCHEMA_OPTIONS,
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
              <K3EditorView editor={editor} slashMenu formattingToolbar sideMenu />
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
        <span className="flex items-center gap-1.5">
          <Kbd>/</Kbd>斜杠菜单只剩三个命令
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>###</Kbd>
          <Kbd>Space</Kbd>H3 行首规则已被 blockConfig 禁用
        </span>
        <span className="flex items-center gap-1.5">placeholder 与菜单文案来自 dictionary</span>
      </div>
    </div>
  );
}

/* -------------------------------- 教程代码 -------------------------------- */

const STEP_BLOCK_TYPES = `// 1. blockTypes：内置块白名单
const editor = useK3Editor({
  blockTypes: ["paragraph", "heading", "quote"],
});
// 斜杠菜单 / 「转换为」菜单只剩这三项；其它类型的
// Markdown 行首规则（如 \`- \`、\`> \` 之外的 \`\`\`）同步失效；
// insertBlocks 遇到白名单外类型递归降级为 paragraph。`;

const STEP_BLOCK_CONFIG = `// 2. blockConfig：块行为配置
const editor = useK3Editor({
  blockConfig: {
    heading: { levels: [1, 2] }, // H3 菜单项隐藏，"###"+空格 规则失效
    // codeBlock: { defaultLanguage: "ts" }, // 本 schema 无代码块，无需配置
  },
});`;

const STEP_DICTIONARY = `// 3. dictionary：文案定制（与 zhCN 深合并，未覆盖键沿用默认）
const editor = useK3Editor({
  dictionary: {
    placeholder: "撰写公告正文…",
    slashMenu: {
      groupBasic: "公告块",
      empty: "公告 schema 没有这个块",
    },
  },
});`;

const STEP_COMBINED = `// 三件套叠加 = 面向公告场景的迷你 schema
const editor = useK3Editor({
  initialContent: doc,
  blockTypes: ["paragraph", "heading", "quote"],
  blockConfig: { heading: { levels: [1, 2] } },
  dictionary: {
    placeholder: "撰写公告正文…",
    slashMenu: { groupBasic: "公告块", empty: "公告 schema 没有这个块" },
  },
});

return <K3EditorView editor={editor} slashMenu formattingToolbar sideMenu />;`;

/* ---------------------------------- 页面 ---------------------------------- */

export default function CustomSchemas() {
  return (
    <DocsShell
      crumbs={["Docs", "Customization", "Custom schemas"]}
      title="Custom schemas."
      lead="blockTypes、blockConfig、dictionary 是 schema 定制三件套：一个收窄块集合，一个约束块行为，一个改写全部文案——叠加即可拼出面向特定场景的迷你编辑器。"
    >
      <H2 id="trio">三件套。</H2>
      <P>
        三者都挂在 <InlineCode>useK3Editor</InlineCode> 选项上，各司其职、可独立使用也可叠加：
      </P>
      <DocTable
        columns={["手段", "签名", "作用"]}
        rows={[
          [
            <MonoCell accent>blockTypes</MonoCell>,
            <MonoCell>string[]</MonoCell>,
            "内置块白名单：斜杠菜单、「转换为」、Markdown 行首规则同步收窄；insertBlocks 对白名单外类型递归降级为 paragraph。",
          ],
          [
            <MonoCell accent>blockConfig</MonoCell>,
            <MonoCell>K3BlockConfig</MonoCell>,
            "块行为配置：heading.levels 限定可选标题级别；codeBlock.defaultLanguage 指定新代码块默认语言。非法项静默忽略并 console.warn。",
          ],
          [
            <MonoCell accent>dictionary</MonoCell>,
            <MonoCell>{"DeepPartial<K3Dictionary>"}</MonoCell>,
            "文案定制：placeholder、斜杠菜单、侧边菜单、格式化工具栏等全部用户可见文案，与 zhCN 深合并。K3EditorView 的同名 prop 优先级更高。",
          ],
        ]}
      />

      <H2 id="demo">公告编辑器。</H2>
      <P>
        把三件套叠加到一个真实场景：公告只需要标题、正文与引用，标题最多到 H2，
        文案全部换成公告语境——下面这台编辑器就是完整可运行的结果。
      </P>
      <SectionLabel className="mt-6">LIVE DEMO — 迷你公告 schema</SectionLabel>
      <SchemaDemo />

      <H2 id="tutorial">四步接入。</H2>
      <H3 id="step-block-types">1. blockTypes 收窄块集合。</H3>
      <P>
        白名单是「减」的第一刀：未列出的内置块从所有入口消失。不设置时全部放行。
      </P>
      <CodeBlock className="mt-3" code={STEP_BLOCK_TYPES} language="ts" />

      <H3 id="step-block-config">2. blockConfig 约束块行为。</H3>
      <P>
        白名单决定「有哪些块」，<InlineCode>blockConfig</InlineCode> 决定「块怎么表现」——
        这里把 heading 限定为 H1/H2，已有 H3 不受影响，只是不再新增。
      </P>
      <CodeBlock className="mt-3" code={STEP_BLOCK_CONFIG} language="ts" />

      <H3 id="step-dictionary">3. dictionary 改写文案。</H3>
      <P>
        字典是深合并：只覆盖你关心的键，其余沿用默认 <InlineCode>zhCN</InlineCode>。
        想整体切换英文，直接传内置的 <InlineCode>enUS</InlineCode>。
      </P>
      <CodeBlock className="mt-3" code={STEP_DICTIONARY} language="ts" />

      <H3 id="step-combined">4. 组合成迷你 schema。</H3>
      <P>三件套写在同一次 <InlineCode>useK3Editor</InlineCode> 调用里，视图层无需任何特殊处理：</P>
      <CodeBlock className="mt-3" code={STEP_COMBINED} language="tsx" />

      <Callout className="mt-6" title="与 Custom blocks 的分工">
        <InlineCode>/docs/features/custom-blocks</InlineCode> 的{" "}
        <InlineCode>blockRenderers</InlineCode> 做的是「加」——给 schema 未注册的块型一个
        React 渲染口；本页三件套做的是「减与改」——收窄内置块、约束行为、改写文案。
        两者可安全叠加：白名单只收敛内置块，自定义 type 始终放行、不会被降级误杀。
      </Callout>

      <CardStrip
        className="mt-14"
        cards={[
          { to: "/docs/features/custom-blocks", title: "Custom blocks", description: "块级渲染口 blockRenderers——schema 定制的另一半。" },
          { to: "/examples/custom-schemas", title: "示例：Custom schemas", description: "三件套 + 自定义 note 块的完整可运行示例。" },
          { to: "/docs/api", title: "API reference", description: "useK3Editor 选项与 K3Dictionary 的完整签名。" },
        ]}
      />
    </DocsShell>
  );
}
