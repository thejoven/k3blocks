import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import DocsShell from "@/components/docs/DocsShell";
import {
  CardStrip,
  DemoFrame,
  DocLink,
  DocTable,
  H2,
  InlineCode,
  MonoCell,
  P,
  Segmented,
  SwitchRow,
} from "@/components/docs/primitives";
import { txt } from "@/components/docs/utils";
import { cn } from "@/lib/utils";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";

/**
 * API Reference (docs.md §4) — dense, hairline-tabled, 880px content column.
 */

/* ------------------------------ useK3Editor ------------------------------ */

const HOOK_SNIPPET = `import { useK3Editor, K3EditorView } from "@k3/blocks";

const editor = useK3Editor({
  initialContent: [
    {
      id: "1",
      type: "paragraph",
      props: {},
      content: [{ type: "text", text: "Hello." }],
      children: [],
    },
  ],
  placeholder: "输入 '/' 查看命令",
  onChange: (e) => save(e.document),
});

return <K3EditorView editor={editor} />;`;

const HOOK_DEMO_DOC: Block[] = [
  {
    id: "a1",
    type: "paragraph",
    props: {},
    content: [txt("这就是上面那段代码跑出来的编辑器。")],
    children: [],
  },
  { id: "a2", type: "paragraph", props: {}, content: [], children: [] },
];

function HookDemo() {
  const editor = useK3Editor({
    initialContent: HOOK_DEMO_DOC,
    placeholder: "输入 '/' 查看命令",
  });
  return (
    <DemoFrame className="mt-4" bodyClassName="px-4 py-3 sm:px-6">
      <div className="max-h-[240px] overflow-y-auto">
        <K3EditorView editor={editor} placeholder="输入 '/' 查看命令" />
      </div>
    </DemoFrame>
  );
}

/* ----------------------------- prop playground ---------------------------- */

const PLAYGROUND_DOC: Block[] = [
  { id: "v1", type: "heading", props: { level: 2 }, content: [txt("Prop playground")], children: [] },
  {
    id: "v2",
    type: "paragraph",
    props: {},
    content: [txt("关掉 sideMenu，我左边的「+」和拖拽手柄就消失了。")],
    children: [],
  },
  {
    id: "v3",
    type: "bulletListItem",
    props: {},
    content: [txt("关掉 slashMenu，输入 / 就只是普通字符。")],
    children: [],
  },
];

function PropPlayground() {
  const [editable, setEditable] = useState(true);
  const [slashMenu, setSlashMenu] = useState(true);
  const [formattingToolbar, setFormattingToolbar] = useState(true);
  const [sideMenu, setSideMenu] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const editor = useK3Editor({ initialContent: PLAYGROUND_DOC });

  return (
    <DemoFrame className="mt-4" bodyClassName="p-0">
      <div className="grid sm:grid-cols-[220px_1fr]">
        {/* toggles rail */}
        <div className="flex flex-col gap-2 border-b border-border p-4 sm:border-b-0 sm:border-r">
          <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-text-4">
            Props
          </span>
          <SwitchRow label="可编辑" prop="editable" checked={editable} onChange={setEditable} />
          <SwitchRow label="斜杠菜单" prop="slashMenu" checked={slashMenu} onChange={setSlashMenu} />
          <SwitchRow
            label="格式化工具栏"
            prop="formattingToolbar"
            checked={formattingToolbar}
            onChange={setFormattingToolbar}
          />
          <SwitchRow label="侧边菜单" prop="sideMenu" checked={sideMenu} onChange={setSideMenu} />
          <div className="mt-1 flex h-7 items-center gap-2">
            <Segmented
              options={[
                { value: "dark", label: "dark" },
                { value: "light", label: "light" },
              ]}
              value={theme}
              onChange={setTheme}
            />
            <span className="font-mono text-[12px] text-text-4">theme</span>
          </div>
        </div>
        {/* live editor */}
        <div className="px-4 py-4 sm:px-6">
          <K3EditorView
            editor={editor}
            editable={editable}
            slashMenu={slashMenu}
            formattingToolbar={formattingToolbar}
            sideMenu={sideMenu}
            theme={theme}
            placeholder="输入 '/' 查看命令"
          />
        </div>
      </div>
    </DemoFrame>
  );
}

/* ------------------------------ method tables ----------------------------- */

function MethodRow({
  signature,
  description,
  snippet,
}: {
  signature: ReactNode;
  description: string;
  snippet: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-b-0">
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <div className="font-mono text-[13px] leading-relaxed text-text-1">{signature}</div>
          <div className="mt-1 text-sm text-text-2">{description}</div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mt-0.5 flex h-6 shrink-0 items-center gap-1 rounded-md border border-border px-2 font-mono text-[11px] text-text-3 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-2"
        >
          示例
          <ChevronDown
            size={12}
            strokeWidth={1.5}
            className={cn("transition-transform duration-150 ease-k3", open && "rotate-180")}
          />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3">
              <CodeBlock code={snippet} language="tsx" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MethodGroup({
  title,
  rows,
}: {
  title: string;
  rows: { signature: ReactNode; description: string; snippet: string }[];
}) {
  return (
    <div className="mt-6">
      <h3 className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-text-4">
        {title}
      </h3>
      <div className="mt-2 rounded-lg border border-border">
        {rows.map((r, i) => (
          <MethodRow key={i} {...r} />
        ))}
      </div>
    </div>
  );
}

const A = ({ children }: { children: string }) => (
  <span className="text-accent">{children}</span>
);

/* --------------------------------- types ---------------------------------- */

const TYPES_CODE = `interface Block {
  id: string;
  type: string;                 // "paragraph" | "heading" | "bulletListItem" | …
  props: Record<string, any>;   // heading.level, checkListItem.checked, codeBlock.language…
  content: InlineContent[];
  children: Block[];
}

type InlineContent =
  | { type: "text"; text: string; styles?: InlineStyles }
  | { type: "link"; href: string; content: InlineContent[] };

interface InlineStyles {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  code?: boolean;
}

// insertBlocks 接受 PartialBlock —— 缺省字段自动补齐
interface PartialBlock {
  id?: string;
  type?: string;
  props?: Record<string, any>;
  content?: InlineContent[] | string;
  children?: PartialBlock[];
}

type Placement = "before" | "after" | "nested";`;

/* ---------------------------------- page ---------------------------------- */

export default function ApiReference() {
  return (
    <DocsShell
      crumbs={["Docs", "API reference"]}
      title="API reference."
      lead="一个 hook、一个视图组件、一组实例方法 —— 这就是 K3Blocks 的全部 API 表面。"
      wide
    >
      <H2 id="use-k3-editor">useK3Editor(options)。</H2>
      <P>
        创建编辑器实例。返回的 <InlineCode>K3Editor</InlineCode> 在整个组件生命周期内引用稳定。
      </P>
      <DocTable
        columns={["参数", "类型", "默认", "说明"]}
        rows={[
          [
            <MonoCell key="p" accent>initialContent?</MonoCell>,
            <MonoCell key="t">Block[]</MonoCell>,
            <MonoCell key="d">一个空段落</MonoCell>,
            "初始文档",
          ],
          [
            <MonoCell key="p" accent>editable?</MonoCell>,
            <MonoCell key="t">boolean</MonoCell>,
            <MonoCell key="d">true</MonoCell>,
            "false 时只读",
          ],
          [
            <MonoCell key="p" accent>placeholder?</MonoCell>,
            <MonoCell key="t">string</MonoCell>,
            <MonoCell key="d">输入 '/' 查看命令</MonoCell>,
            "空段落占位符",
          ],
          [
            <MonoCell key="p" accent>onChange?</MonoCell>,
            <MonoCell key="t">(editor: K3Editor) =&gt; void</MonoCell>,
            <MonoCell key="d">—</MonoCell>,
            "文档变更回调；在这里做持久化",
          ],
        ]}
      />
      <P>
        返回值：<InlineCode>K3Editor</InlineCode> 实例，方法见下文{" "}
        <DocLink to="/docs/api#editor-methods">Editor methods</DocLink>。
      </P>
      <CodeBlock className="mt-4" code={HOOK_SNIPPET} language="tsx" />
      <HookDemo />

      <H2 id="k3-editor-view">&lt;K3EditorView /&gt;。</H2>
      <P>渲染编辑器并接管全部交互。除 editor 外所有 prop 都有默认值。</P>
      <DocTable
        columns={["prop", "类型", "默认", "说明"]}
        rows={[
          [
            <MonoCell key="p" accent>editor</MonoCell>,
            <MonoCell key="t">K3Editor</MonoCell>,
            <MonoCell key="d">必填</MonoCell>,
            "useK3Editor 返回的实例",
          ],
          [
            <MonoCell key="p" accent>editable?</MonoCell>,
            <MonoCell key="t">boolean</MonoCell>,
            <MonoCell key="d">true</MonoCell>,
            "false 时只读渲染（菜单与工具栏同时关闭）",
          ],
          [
            <MonoCell key="p" accent>theme?</MonoCell>,
            <MonoCell key="t">"light" | "dark"</MonoCell>,
            <MonoCell key="d">继承页面</MonoCell>,
            "设置根元素 data-theme",
          ],
          [
            <MonoCell key="p" accent>slashMenu?</MonoCell>,
            <MonoCell key="t">boolean</MonoCell>,
            <MonoCell key="d">true</MonoCell>,
            "/ 斜杠菜单",
          ],
          [
            <MonoCell key="p" accent>formattingToolbar?</MonoCell>,
            <MonoCell key="t">boolean</MonoCell>,
            <MonoCell key="d">true</MonoCell>,
            "选区悬浮格式化工具栏",
          ],
          [
            <MonoCell key="p" accent>sideMenu?</MonoCell>,
            <MonoCell key="t">boolean</MonoCell>,
            <MonoCell key="d">true</MonoCell>,
            "块悬停「+」与拖拽手柄",
          ],
          [
            <MonoCell key="p" accent>placeholder?</MonoCell>,
            <MonoCell key="t">string</MonoCell>,
            <MonoCell key="d">输入 '/' 查看命令</MonoCell>,
            "覆盖实例级占位符",
          ],
          [
            <MonoCell key="p" accent>className?</MonoCell>,
            <MonoCell key="t">string</MonoCell>,
            <MonoCell key="d">—</MonoCell>,
            "追加到根元素（配合 CSS 变量覆盖主题）",
          ],
        ]}
      />
      <P>每个布尔 prop 都可以实时切换 —— 下面这个 playground 是真实渲染：</P>
      <PropPlayground />

      <H2 id="editor-methods">Editor methods。</H2>
      <P>
        实例方法按用途分组。叙事式的用法演示见{" "}
        <DocLink to="/docs/foundations/manipulating-blocks">Foundations → Manipulating blocks</DocLink>
        。
      </P>

      <MethodGroup
        title="Document"
        rows={[
          {
            signature: <><A>document</A>: Block[]</>,
            description: "当前完整文档（getter）。",
            snippet: `const doc = editor.document;
localStorage.setItem("doc", JSON.stringify(doc));`,
          },
          {
            signature: <><A>getBlock</A>(id: string): Block | undefined</>,
            description: "按 id 查询单个块（含嵌套）。",
            snippet: `const block = editor.getBlock("s1");
console.log(block?.type, block?.props);`,
          },
          {
            signature: (
              <>
                <A>insertBlocks</A>(blocks: PartialBlock[], refId?: string | null, placement?: Placement): Block[]
              </>
            ),
            description: "在参照块前 / 后 / 内部插入；省略 refId 追加到末尾。",
            snippet: `editor.insertBlocks(
  [{ type: "heading", props: { level: 2 }, content: "新章节" }],
  null,
);`,
          },
          {
            signature: <><A>updateBlock</A>(id: string, partial): void</>,
            description: "更新块的 type / props / content，只传需要改的字段。",
            snippet: `editor.updateBlock("s1", {
  props: { checked: true },
});`,
          },
          {
            signature: <><A>removeBlocks</A>(ids: string[]): void</>,
            description: "按 id 批量删除，子块一并删除。",
            snippet: `editor.removeBlocks(["s2", "s3"]);`,
          },
        ]}
      />

      <MethodGroup
        title="History"
        rows={[
          {
            signature: <><A>undo</A>(): void</>,
            description: "撤销一步（用户输入与 API 调用都入栈）。",
            snippet: `if (editor.canUndo) editor.undo();`,
          },
          {
            signature: <><A>redo</A>(): void</>,
            description: "重做一步。",
            snippet: `if (editor.canRedo) editor.redo();`,
          },
          {
            signature: <><A>canUndo</A> / <A>canRedo</A>: boolean</>,
            description: "历史栈状态（getter），用于驱动按钮可用态。",
            snippet: `editor.onChange((e) => {
  setCanUndo(e.canUndo);
  setCanRedo(e.canRedo);
});`,
          },
        ]}
      />

      <MethodGroup
        title="Export"
        rows={[
          {
            signature: <><A>blocksToMarkdown</A>(): string</>,
            description: "把当前文档导出为 Markdown。",
            snippet: `const md = editor.blocksToMarkdown();
download("note.md", md);`,
          },
        ]}
      />

      <MethodGroup
        title="Events & focus"
        rows={[
          {
            signature: <><A>onChange</A>(cb: (editor: K3Editor) =&gt; void): () =&gt; void</>,
            description: "订阅文档变更，返回取消订阅函数。",
            snippet: `useEffect(() => {
  return editor.onChange((e) => save(e.document));
}, [editor]);`,
          },
          {
            signature: <><A>focus</A>(): void</>,
            description: "聚焦编辑器（第一个文本块末尾）。",
            snippet: `editor.focus();`,
          },
          {
            signature: <><A>setTextCursor</A>(blockId: string, offset?: number): void</>,
            description: "把文本光标放到指定块的指定偏移处。",
            snippet: `const [b] = editor.insertBlocks([{ type: "paragraph" }], null);
editor.setTextCursor(b.id, 0);`,
          },
        ]}
      />

      <Callout className="mt-6">
        完整的应用级用法见 <DocLink to="/examples">Examples</DocLink> —— 受控编辑器、JSON
        往返、只读渲染都是整页可运行的。
      </Callout>

      <H2 id="types">类型。</H2>
      <P>公共类型全部从 <InlineCode>@k3/blocks</InlineCode> 导出：</P>
      <CodeBlock className="mt-4" code={TYPES_CODE} language="ts" />

      <H2 id="examples">相关示例。</H2>
      <CardStrip
        cards={[
          { to: "/examples/controlled", title: "Controlled Editor", description: "onChange 驱动宿主状态的完整示例。" },
          { to: "/examples/json-round-trip", title: "JSON Round-trip", description: "document 导出与 initialContent 恢复。" },
        ]}
      />
    </DocsShell>
  );
}
