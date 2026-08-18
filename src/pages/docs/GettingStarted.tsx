import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import DocsShell from "@/components/docs/DocsShell";
import {
  CardStrip,
  DemoFrame,
  H2,
  InlineCode,
  P,
  Segmented,
  SwitchRow,
} from "@/components/docs/primitives";
import { txt } from "@/components/docs/utils";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";

const PM_COMMANDS = {
  npm: "npm install @k3/blocks",
  pnpm: "pnpm add @k3/blocks",
  yarn: "yarn add @k3/blocks",
  bun: "bun add @k3/blocks",
} as const;

type PM = keyof typeof PM_COMMANDS;

function InstallTabs() {
  const [pm, setPm] = useState<PM>("npm");
  return (
    <div className="mt-4">
      <Segmented
        options={(Object.keys(PM_COMMANDS) as PM[]).map((k) => ({ value: k, label: k }))}
        value={pm}
        onChange={setPm}
      />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pm}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="mt-3"
        >
          <CodeBlock code={PM_COMMANDS[pm]} language="bash" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-2 font-mono text-[12px] text-text-3">
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-text-1">{title}</div>
        {children}
      </div>
    </div>
  );
}

const STEP_STYLE = `import "@k3/blocks/style.css";`;

const STEP_CREATE = `import { useK3Editor } from "@k3/blocks";

const editor = useK3Editor({
  initialContent: myDoc, // 可选：Block[]
});`;

const STEP_RENDER = `import { K3EditorView } from "@k3/blocks";

return <K3EditorView editor={editor} theme="dark" />;`;

const STEP_SAVE = `const editor = useK3Editor({
  onChange: (e) => {
    localStorage.setItem("doc", JSON.stringify(e.document));
  },
});`;

const RESULT_DOC: Block[] = [
  { id: "g1", type: "heading", props: { level: 2 }, content: [txt("它活了。")], children: [] },
  {
    id: "g2",
    type: "paragraph",
    props: {},
    content: [
      txt("上面五行代码跑出来的编辑器就在这里。输入 "),
      txt("/", { code: true }),
      txt(" 插入一个块，或用 "),
      txt("⌘B", { code: true }),
      txt(" 加粗选中的文字。"),
    ],
    children: [],
  },
  { id: "g3", type: "paragraph", props: {}, content: [], children: [] },
];

function ResultDemo() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [editable, setEditable] = useState(true);
  const editor = useK3Editor({ initialContent: RESULT_DOC });

  return (
    <DemoFrame
      className="mt-4"
      bodyClassName="px-4 py-4 sm:px-6"
      bar={
        <>
          <Segmented
            options={[
              { value: "dark", label: "dark" },
              { value: "light", label: "light" },
            ]}
            value={theme}
            onChange={setTheme}
          />
          <SwitchRow label="可编辑" prop="editable" checked={editable} onChange={setEditable} />
        </>
      }
    >
      <K3EditorView
        editor={editor}
        theme={theme}
        editable={editable}
        placeholder="输入 '/' 查看命令"
      />
    </DemoFrame>
  );
}

export default function GettingStarted() {
  return (
    <DocsShell
      crumbs={["Docs", "Getting started"]}
      title="Getting started."
      lead="五分钟接入你的 React 应用：安装、引入样式、创建 editor、渲染、保存。"
    >
      <H2 id="installation">安装。</H2>
      <P>选择你的包管理器：</P>
      <InstallTabs />
      <Callout className="mt-4">
        需要 React ≥ 18。样式经 <InlineCode>@k3/blocks/style.css</InlineCode> 引入 ——
        不引入样式编辑器也能工作，但会失去全部表面与菜单样式。
      </Callout>

      <H2 id="quickstart">快速上手。</H2>
      <div className="mt-6 flex flex-col gap-8">
        <Step n={1} title="安装依赖">
          <P>见上面的安装命令。运行时依赖只有 React 与 lucide-react。</P>
        </Step>
        <Step n={2} title="引入样式">
          <P>在应用入口引入一次即可。全部样式由 CSS 变量驱动，默认继承宿主页面。</P>
          <CodeBlock className="mt-3" code={STEP_STYLE} language="ts" />
        </Step>
        <Step n={3} title="创建 editor">
          <P>
            <InlineCode>useK3Editor</InlineCode> 返回一个稳定的编辑器实例 ——
            整个生命周期内引用不变，可以安全地传给子组件。
          </P>
          <CodeBlock className="mt-3" code={STEP_CREATE} language="tsx" />
        </Step>
        <Step n={4} title="渲染视图">
          <P>
            <InlineCode>K3EditorView</InlineCode> 负责渲染与全部交互。不传{" "}
            <InlineCode>theme</InlineCode> 时继承宿主页面的 CSS 变量。
          </P>
          <CodeBlock className="mt-3" code={STEP_RENDER} language="tsx" />
        </Step>
        <Step n={5} title="保存">
          <P>
            组件不做持久化。在 <InlineCode>onChange</InlineCode> 里读取{" "}
            <InlineCode>editor.document</InlineCode> —— 它就是可以原样入库的 JSON。
          </P>
          <CodeBlock className="mt-3" code={STEP_SAVE} language="tsx" />
        </Step>
      </div>

      <H2 id="result">运行结果。</H2>
      <P>上面五步的输出如下 —— 一个真实可编辑的编辑器：</P>
      <ResultDemo />

      <H2 id="next-steps">下一步。</H2>
      <CardStrip
        cards={[
          { to: "/docs/foundations/document-structure", title: "Document structure", description: "Block[] 文档模型：id、type、props、content、children。" },
          { to: "/blocks", title: "Block types", description: "九种内置块，逐块讲解与可运行 demo。" },
          { to: "/examples", title: "Examples", description: "受控、只读、JSON 往返等完整可运行示例。" },
        ]}
      />
    </DocsShell>
  );
}
