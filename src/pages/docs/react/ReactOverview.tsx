/**
 * /docs/react/overview — React 集成总览：useK3Editor 创建实例、非受控哲学、
 * K3EditorView props 全景表、受控持久化模式、SSR 注意事项。
 */
import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import DocsShell from "@/components/docs/DocsShell";
import LiveDemo from "@/components/docs/LiveDemo";
import {
  CardStrip,
  DocLink,
  DocTable,
  H2,
  InlineCode,
  MonoCell,
  P,
} from "@/components/docs/primitives";
import { txt } from "@/components/docs/utils";
import type { Block } from "@/k3blocks";

const QUICKSTART = `import { useK3Editor, K3EditorView } from "@k3/blocks";

export default function App() {
  const editor = useK3Editor({
    initialContent: [
      { id: "1", type: "heading", props: { level: 1 }, content: [{ type: "text", text: "Hello." }], children: [] },
      { id: "2", type: "paragraph", props: {}, content: [], children: [] },
    ],
    onChange: (e) => localStorage.setItem("doc", JSON.stringify(e.document)),
  });

  return <K3EditorView editor={editor} theme="dark" slashMenu formattingToolbar sideMenu />;
}`;

const DEMO_DOC: Block[] = [
  {
    id: "ro1",
    type: "heading",
    props: { level: 2 },
    content: [txt("一个 hook，一个视图组件")],
    children: [],
  },
  {
    id: "ro2",
    type: "paragraph",
    props: {},
    content: [txt("这就是上面那段代码跑出来的编辑器 —— 输入 "), txt("/"), txt(" 试试斜杠菜单。")],
    children: [],
  },
  { id: "ro3", type: "paragraph", props: {}, content: [], children: [] },
];

const UNCONTROLLED = `const editor = useK3Editor({
  initialContent: restored,          // 只在实例创建时读取一次
  onChange: (e) => {
    // 每次变更输出一份完整 JSON 快照 —— 持久化的唯一出口
    save(e.document);
  },
});

// editor 引用在整个组件生命周期内稳定，可以直接传给
// 工具栏按钮、侧边栏大纲等任意深层组件。`;

const CONTROLLED = `// 「受控」的正确姿势：快照只出不进。
// 需要把外部文档「灌回」编辑器时，重挂载持有 hook 的组件
//（editor 实例由 hook 内的 ref 持有 —— key 必须打在调用
//  useK3Editor 的组件上，打在 K3EditorView 上无效）：
function Editor({ docId }: { docId: string }) {
  const restored = loadFromStorage(docId); // Block[] | undefined
  const editor = useK3Editor({
    initialContent: restored,
    onChange: (e) => saveToStorage(docId, e.document),
  });
  return <K3EditorView editor={editor} />;
}

// 父组件侧：
<Editor key={docId} docId={docId} />`;

const SSR = `// Next.js 等 SSR 框架：contenteditable 依赖 DOM，
// 编辑器视图应在客户端挂载后再渲染。
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

if (!mounted) return <div className="h-40" />; // 占位，避免 hydration 不一致
return <K3EditorView editor={editor} />;`;

export default function ReactOverview() {
  return (
    <DocsShell
      crumbs={["Docs", "React", "Overview"]}
      title="React overview."
      lead="useK3Editor 创建实例，K3EditorView 渲染它。编辑器是非受控的：块内 DOM 自治，文档以 JSON 快照经 onChange 流出。"
    >
      <H2 id="quickstart">创建一个编辑器。</H2>
      <P>
        所有状态都收在一个 <InlineCode>K3Editor</InlineCode> 实例里：
        <InlineCode>useK3Editor</InlineCode> 创建它（引用在组件生命周期内稳定），
        <InlineCode>K3EditorView</InlineCode> 负责渲染与全部交互。组件本身不做持久化。
      </P>
      <CodeBlock className="mt-4" code={QUICKSTART} language="tsx" />
      <LiveDemo
        className="mt-4"
        seed={DEMO_DOC}
        hints={[
          { keys: ["/"], text: "斜杠菜单" },
          { keys: ["⌘", "B"], text: "加粗" },
        ]}
      />

      <H2 id="uncontrolled">非受控哲学。</H2>
      <P>
        K3Blocks 的块内编辑基于 contenteditable，DOM 是输入过程的唯一事实来源 ——
        如果每次按键都把整份文档回填给 React，中文输入法 composition、撤销栈与光标
        都会变得脆弱。因此编辑器选择「块内 DOM 自治」：打字不触发 React 重渲染，
        一次操作完成后才向 <InlineCode>onChange</InlineCode> 输出一份完整的{" "}
        <InlineCode>Block[]</InlineCode> 快照。
      </P>
      <CodeBlock className="mt-4" code={UNCONTROLLED} language="tsx" />
      <Callout className="mt-4">
        <InlineCode>initialContent</InlineCode> 只在实例创建时读取一次 —— 之后改这个 prop
        不会重置文档（实例由 hook 内部的 ref 持有）。需要切换文档时用{" "}
        <InlineCode>key</InlineCode> 重挂载，见下节。
      </Callout>

      <H2 id="view-props">K3EditorView props 全景。</H2>
      <P>
        除 <InlineCode>editor</InlineCode> 外全部可选。表格速查版见{" "}
        <DocLink to="/docs/api">API reference</DocLink>。
      </P>
      <DocTable
        columns={["prop", "类型", "默认", "说明"]}
        rows={[
          [<MonoCell key="p" accent>editor</MonoCell>, <MonoCell key="t">K3Editor</MonoCell>, <MonoCell key="d">必填</MonoCell>, "useK3Editor 返回的实例"],
          [<MonoCell key="p" accent>editable?</MonoCell>, <MonoCell key="t">boolean</MonoCell>, <MonoCell key="d">true</MonoCell>, "false 时只读渲染（菜单与工具栏同时关闭）"],
          [<MonoCell key="p" accent>theme?</MonoCell>, <MonoCell key="t">"light" | "dark"</MonoCell>, <MonoCell key="d">继承页面</MonoCell>, "设置根元素 data-theme"],
          [<MonoCell key="p" accent>slashMenu?</MonoCell>, <MonoCell key="t">boolean</MonoCell>, <MonoCell key="d">true</MonoCell>, "/ 斜杠菜单"],
          [<MonoCell key="p" accent>formattingToolbar?</MonoCell>, <MonoCell key="t">boolean</MonoCell>, <MonoCell key="d">true</MonoCell>, "选区悬浮格式化工具栏"],
          [<MonoCell key="p" accent>sideMenu?</MonoCell>, <MonoCell key="t">boolean</MonoCell>, <MonoCell key="d">true</MonoCell>, "块悬停「+」与拖拽手柄"],
          [<MonoCell key="p" accent>placeholder?</MonoCell>, <MonoCell key="t">string</MonoCell>, <MonoCell key="d">输入 '/' 查看命令</MonoCell>, "覆盖实例级占位符"],
          [<MonoCell key="p" accent>dictionary?</MonoCell>, <MonoCell key="t">DeepPartial&lt;K3Dictionary&gt;</MonoCell>, <MonoCell key="d">继承 editor</MonoCell>, "i18n 字典覆盖（优先级最高）"],
          [<MonoCell key="p" accent>blockRenderers?</MonoCell>, <MonoCell key="t">Record&lt;string, (block, editor) =&gt; ReactNode&gt;</MonoCell>, <MonoCell key="d">—</MonoCell>, "自定义块渲染口（未注册 type）"],
          [<MonoCell key="p" accent>inlineRenderers?</MonoCell>, <MonoCell key="t">Record&lt;string, K3InlineRenderer&gt;</MonoCell>, <MonoCell key="d">—</MonoCell>, "自定义行内内容渲染口"],
          [<MonoCell key="p" accent>inlineStyleRenderers?</MonoCell>, <MonoCell key="t">Record&lt;string, K3InlineStyleRenderer&gt;</MonoCell>, <MonoCell key="d">—</MonoCell>, "自定义行内样式键 → CSS"],
          [<MonoCell key="p" accent>domAttributes?</MonoCell>, <MonoCell key="t">{`{ editor?; block? }`}</MonoCell>, <MonoCell key="d">—</MonoCell>, "附加 DOM 属性（测试锚点 / 埋点）"],
          [<MonoCell key="p" accent>className?</MonoCell>, <MonoCell key="t">string</MonoCell>, <MonoCell key="d">—</MonoCell>, "追加到根元素（配合 CSS 变量覆盖主题）"],
        ]}
      />

      <H2 id="controlled">受控模式。</H2>
      <P>
        「受控」在 K3Blocks 里意味着：快照经 <InlineCode>onChange</InlineCode>{" "}
        单向流出给宿主，宿主负责存储；反向灌入不通过 prop，而是通过{" "}
        <InlineCode>key</InlineCode> 重挂载让 <InlineCode>initialContent</InlineCode>{" "}
        重新生效。运行中的程序化修改走实例方法（
        <DocLink to="/docs/reference/manipulating-content">insertBlocks / updateBlock / removeBlocks</DocLink>）。
      </P>
      <CodeBlock className="mt-4" code={CONTROLLED} language="tsx" />
      <Callout className="mt-4">
        与常见的组装式编辑器不同，<InlineCode>K3EditorView</InlineCode> 不接受{" "}
        <InlineCode>children</InlineCode> —— 不需要在 JSX 里声明 UI 部件。工具栏、菜单的开关是
        布尔 prop，自定义渲染走 <InlineCode>blockRenderers</InlineCode> /{" "}
        <InlineCode>inlineRenderers</InlineCode> 渲染口。
      </Callout>

      <H2 id="ssr">SSR 注意事项。</H2>
      <P>
        编辑器依赖 contenteditable 与浏览器 Selection API，无法真正在服务端运行。SSR
        框架中应把视图延迟到客户端挂载后再渲染；实例创建本身（
        <InlineCode>useK3Editor</InlineCode>）是纯数据结构操作，不受影响。
      </P>
      <CodeBlock className="mt-4" code={SSR} language="tsx" />
      <Callout className="mt-4">
        导出侧无需 DOM：<InlineCode>blocksToHTML</InlineCode> /{" "}
        <InlineCode>blocksToMarkdown</InlineCode> 等纯函数可以在 Node 端直接跑
        （导入侧 <InlineCode>insertHTML</InlineCode> 使用 DOMParser，仅限客户端）。
      </Callout>

      <H2 id="next">接下来。</H2>
      <CardStrip
        cards={[
          { to: "/docs/react/formatting-toolbar", title: "Formatting toolbar", description: "选区悬浮工具栏的按钮清单与开关。" },
          { to: "/docs/react/suggestion-menus", title: "Suggestion menus", description: "/ 斜杠与 @ mention 的统一建议菜单机制。" },
          { to: "/docs/reference/overview", title: "Editor reference", description: "editor 实例方法全景分组表。" },
          { to: "/docs/api", title: "API reference", description: "全部 prop 与方法的表格速查。" },
        ]}
      />
    </DocsShell>
  );
}
