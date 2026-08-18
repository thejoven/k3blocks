/**
 * 示例注册表：磁贴与详情页共用的单一数据源。
 * 每个示例 = 可复用 live 组件 + 完整源码（Code 面板）+ How it works 步骤。
 */
import type { ComponentType } from "react";
import type { Block } from "@/k3blocks";
import { helloDocument, sampleDocument } from "@/lib/sampleDoc";
import BasicSetup, { SOURCE as basicSrc } from "./BasicSetup";
import ControlledEditor, { SOURCE as controlledSrc } from "./ControlledEditor";
import ReadOnlyRenderer, { SOURCE as readOnlySrc } from "./ReadOnlyRenderer";
import DarkAndLight, { SOURCE as themeSrc } from "./DarkAndLight";
import JsonRoundTrip, { SOURCE as jsonSrc } from "./JsonRoundTrip";
import MarkdownExport, { SOURCE as mdSrc } from "./MarkdownExport";
import MinimalChrome, { SOURCE as chromeSrc } from "./MinimalChrome";
import CustomPlaceholder, { SOURCE as placeholderSrc } from "./CustomPlaceholder";
import DisplayingDocumentJson, { SOURCE as docJsonSrc } from "./DisplayingDocumentJson";
import MultiColumnBlocks, { SOURCE as columnsSrc, columnsDocument } from "./MultiColumnBlocks";
import DefaultSchemaShowcase, { SOURCE as schemaSrc } from "./DefaultSchemaShowcase";
import RemovingDefaultBlocks, { SOURCE as slimSchemaSrc } from "./RemovingDefaultBlocks";
import ManipulatingBlocks, { SOURCE as manipulatingSrc } from "./ManipulatingBlocks";
import DisplayingSelectedBlocks, { SOURCE as selectionSrc } from "./DisplayingSelectedBlocks";
import UseWithAriakit, { SOURCE as ariakitSrc } from "./UseWithAriakit";
import UseWithShadcn, { SOURCE as shadcnSrc } from "./UseWithShadcn";
import LocalizationI18n, { SOURCE as i18nSrc } from "./LocalizationI18n";
import MultiEditorSetup, { SOURCE as multiEditorSrc } from "./MultiEditorSetup";
import CustomPasteHandler, { SOURCE as pasteSrc } from "./CustomPasteHandler";
import CustomSchemas, { SOURCE as customSchemasSrc } from "./CustomSchemas";
import AlertBlock, { SOURCE as alertBlockSrc } from "./AlertBlock";
import MentionsMenu, { SOURCE as mentionsSrc } from "./MentionsMenu";
import FontStyle, { SOURCE as fontStyleSrc } from "./FontStyle";
import PdfBlock, { SOURCE as pdfBlockSrc } from "./PdfBlock";
import AlertBlockFullUx, { SOURCE as alertFullSrc } from "./AlertBlockFullUx";
import ToggleableCustomBlocks, { SOURCE as toggleSrc } from "./ToggleableCustomBlocks";
import ConfiguringDefaultBlocks, { SOURCE as blockConfigSrc } from "./ConfiguringDefaultBlocks";
import MathBlock, { SOURCE as mathBlockSrc } from "./MathBlock";
import DiagramBlock, { SOURCE as diagramBlockSrc } from "./DiagramBlock";
import SourceWithPreviewBlocks, { SOURCE as srcPreviewSrc } from "./SourceWithPreviewBlocks";
import CodeBlockTheme, { SOURCE as codeThemeSrc } from "./CodeBlockTheme";

export type ExampleCategory = "Basics" | "Data" | "Theming" | "Schema" | "Integration" | "Advanced";

export interface SourceFile {
  name: string;
  language: string;
  code: string;
}

export interface HowItWorksStep {
  /** 步骤描述（可含 `inline code` 标记，详情页按 ` 切分渲染 mono） */
  text: string;
  /** 关键行 1–3 行代码 chip */
  code: string;
}

export interface ExampleMeta {
  slug: string;
  title: string;
  /** 一句话简介（磁贴 / 详情 lead） */
  blurb: string;
  category: ExampleCategory;
  tags: string[];
  /** 相关 API（回链 docs） */
  apis: string[];
  /** 磁贴活预览的种子文档 */
  thumbnail: () => Block[];
  component: ComponentType<{ theme?: "light" | "dark" }>;
  files: SourceFile[];
  steps: HowItWorksStep[];
}

const EMPTY_DOC = (): Block[] => [
  { id: "ph-1", type: "paragraph", props: {}, content: [], children: [] },
];

export const EXAMPLES: ExampleMeta[] = [
  {
    slug: "basic-setup",
    title: "Basic Setup.",
    blurb: "五行代码的最小编辑器。",
    category: "Basics",
    tags: ["quickstart", "minimal"],
    apis: ["useK3Editor", "K3EditorView"],
    thumbnail: helloDocument,
    component: BasicSetup,
    files: basicSrc,
    steps: [
      {
        text: "`useK3Editor()` 创建一个编辑器实例——文档模型、undo/redo 栈、变更订阅都在里面。",
        code: `const editor = useK3Editor();`,
      },
      {
        text: "把实例传给 `<K3EditorView>` 即完成渲染。斜杠菜单、格式化工具栏、拖拽手柄默认全部开启。",
        code: `return <K3EditorView editor={editor} />;`,
      },
      {
        text: "组件不做持久化。需要保存时在 `onChange` 里读 `editor.document`——JSON 即存储格式。",
        code: `onChange: (e) => save(e.document)`,
      },
    ],
  },
  {
    slug: "controlled-editor",
    title: "Controlled Editor.",
    blurb: "`initialContent` + `onChange` 受控模式，外部 state 实时同步。",
    category: "Data",
    tags: ["controlled", "onChange", "localStorage"],
    apis: ["useK3Editor", "initialContent", "onChange"],
    thumbnail: () => sampleDocument().slice(0, 4),
    component: ControlledEditor,
    files: controlledSrc,
    steps: [
      {
        text: "`onChange` 在每次文档变更时触发（含每次击键），把 `editor.document` 写进 React state。",
        code: `onChange: (e) => setDoc(e.document)`,
      },
      {
        text: "旁栏的 pretty JSON 就是这份外部 state——它同时被持久化到 `localStorage`。",
        code: `localStorage.setItem("doc", JSON.stringify(e.document));`,
      },
      {
        text: "由外向内更新：`Load sample doc` 用公共 API 整包替换文档，编辑器立刻重渲染。",
        code: `editor.removeBlocks(all);\neditor.insertBlocks(sampleDoc);`,
      },
    ],
  },
  {
    slug: "read-only-renderer",
    title: "Read-only Renderer.",
    blurb: "`editable={false}` 把 K3Blocks 当渲染器用。",
    category: "Basics",
    tags: ["editable", "renderer"],
    apis: ["K3EditorView", "editable"],
    thumbnail: () => sampleDocument().slice(0, 7),
    component: ReadOnlyRenderer,
    files: readOnlySrc,
    steps: [
      {
        text: "同一份文档渲染两次：左边可编辑（数据源），右边 `editable={false}`（渲染器）。",
        code: `<K3EditorView editor={renderer} editable={false} />`,
      },
      {
        text: "只读模式自动隐藏侧边手柄与 `+` 按钮、禁止输入——纯渲染，无编辑痕迹。",
        code: `ctx.sideMenu && ctx.editable  // 只读时手柄不渲染`,
      },
      {
        text: "数据源每次 `onChange`，用公共 API 把文档同步给渲染器实例。",
        code: `source.onChange((e) => sync(renderer, e.document));`,
      },
    ],
  },
  {
    slug: "dark-and-light",
    title: "Dark & Light Themes.",
    blurb: "`theme` prop + CSS 变量覆盖的双主题切换。",
    category: "Theming",
    tags: ["theme", "css-vars", "dark"],
    apis: ["theme", "CSS variables"],
    thumbnail: () => sampleDocument().slice(0, 5),
    component: DarkAndLight,
    files: themeSrc,
    steps: [
      {
        text: "`theme` prop 在编辑器根元素上设置 `data-theme`，组件内全部颜色由 CSS 变量驱动。",
        code: `<K3EditorView editor={editor} theme="dark" />`,
      },
      {
        text: "省略 `theme` 时组件继承宿主页面的变量——你的应用是什么主题，编辑器就是什么主题。",
        code: `<K3EditorView editor={editor} />  <!-- 继承宿主 -->`,
      },
      {
        text: "`custom` 段演示品牌色覆盖：不改组件，只换变量，accent 从 `#388aff` 变成 `#0047ff`。",
        code: `.brand-canvas { --accent: #0047ff; }`,
      },
    ],
  },
  {
    slug: "json-round-trip",
    title: "JSON Round-trip.",
    blurb: "导出 JSON → 清空 → 导入复原，证明无损存储。",
    category: "Data",
    tags: ["json", "export", "storage"],
    apis: ["document", "insertBlocks", "removeBlocks"],
    thumbnail: () => sampleDocument().slice(0, 6),
    component: JsonRoundTrip,
    files: jsonSrc,
    steps: [
      {
        text: "`editor.document` 是普通 JSON——`Export JSON` 就是一次 `JSON.stringify` 快照。",
        code: `const snapshot = editor.document;`,
      },
      {
        text: "`Clear` 调 `removeBlocks` 删掉全部根块（编辑器自动补一个空段落）。",
        code: `editor.removeBlocks(editor.document.map(b => b.id));`,
      },
      {
        text: "`Import` 用 `insertBlocks` 把快照插回来。步骤里的校验证明复原逐字节一致。",
        code: `editor.insertBlocks(snapshot);  // 无损复原`,
      },
    ],
  },
  {
    slug: "markdown-export",
    title: "Markdown Export.",
    blurb: "`blocksToMarkdown()` 一键导出，旁栏实时预览。",
    category: "Data",
    tags: ["markdown", "export"],
    apis: ["blocksToMarkdown", "onChange"],
    thumbnail: () => sampleDocument().slice(0, 9),
    component: MarkdownExport,
    files: mdSrc,
    steps: [
      {
        text: "`blocksToMarkdown()` 把当前文档序列化为 Markdown：标题、列表、待办、引用、代码块全覆盖。",
        code: `const md = editor.blocksToMarkdown();`,
      },
      {
        text: "挂进 `onChange`，右侧 mono 预览跟随每次击键实时刷新。",
        code: `onChange: (e) => setMarkdown(e.blocksToMarkdown())`,
      },
    ],
  },
  {
    slug: "minimal-chrome",
    title: "Minimal Chrome.",
    blurb: "关掉 slashMenu / sideMenu / formattingToolbar 后的纯净书写模式。",
    category: "Theming",
    tags: ["chrome", "prose", "focus"],
    apis: ["K3EditorView", "slashMenu", "sideMenu", "formattingToolbar"],
    thumbnail: () => [
      {
        id: "mc-thumb",
        type: "paragraph",
        props: {},
        content: [{ type: "text" as const, text: "没有菜单，没有工具栏，没有手柄。只剩下你和文字。" }],
        children: [],
      },
    ],
    component: MinimalChrome,
    files: chromeSrc,
    steps: [
      {
        text: "三个 chrome prop 各自独立：`slashMenu` 关斜杠菜单，`formattingToolbar` 关悬浮工具栏，`sideMenu` 关手柄。",
        code: `slashMenu={false}\nformattingToolbar={false}\nsideMenu={false}`,
      },
      {
        text: "chrome 全关后编辑器仍是完整内核——Markdown 输入规则与快捷键（`⌘B`、`⌘Z`）照常工作。",
        code: `# 标题  ·  **粗体**  ·  ⌘Z 撤销`,
      },
    ],
  },
  {
    slug: "custom-placeholder",
    title: "Custom Placeholder.",
    blurb: "占位符与空文档状态定制。",
    category: "Basics",
    tags: ["placeholder", "empty-state"],
    apis: ["placeholder"],
    thumbnail: EMPTY_DOC,
    component: CustomPlaceholder,
    files: placeholderSrc,
    steps: [
      {
        text: "`placeholder` prop（或 `useK3Editor` 的同名选项）替换空段落的占位文案。",
        code: `placeholder="开始你的 RFC… 输入 '/' 插入块"`,
      },
      {
        text: "空文档状态是宿主的事：示例用 dashed hairline 容器做一个 call-to-action 框。",
        code: `border: 1px dashed var(--border);`,
      },
    ],
  },
  {
    slug: "multi-editor-setup",
    title: "Multi-Editor Setup.",
    blurb: "同页三个独立编辑器：不同种子 / 主题 / placeholder，各自独立 undo 栈。",
    category: "Basics",
    tags: ["multi-instance", "undo"],
    apis: ["useK3Editor", "K3EditorView", "placeholder"],
    thumbnail: () => [
      {
        id: "me-thumb-1",
        type: "heading",
        props: { level: 3 },
        content: [{ type: "text" as const, text: "编辑器 A · B · C" }],
        children: [],
      },
      {
        id: "me-thumb-2",
        type: "paragraph",
        props: {},
        content: [{ type: "text" as const, text: "三个实例，三份文档，三条历史。" }],
        children: [],
      },
    ],
    component: MultiEditorSetup,
    files: multiEditorSrc,
    steps: [
      {
        text: "每个编辑器 = 一次独立的 `useK3Editor` 调用——文档模型、undo/redo 栈、选区互不共享。",
        code: `function NotesEditor() {\n  const editor = useK3Editor();\n  return <K3EditorView editor={editor} />;\n}`,
      },
      {
        text: "三个实例用不同种子文档、`theme` 与 `placeholder`：A 继承宿主，B 强制 light，C 强制 dark。",
        code: `<K3EditorView editor={b} theme="light" placeholder="写一条规范…" />`,
      },
      {
        text: "在 A 里输入再 `⌘Z`——B/C 的历史纹丝不动，证明实例完全隔离。",
        code: `editor.undo();  // 只影响自己的栈`,
      },
    ],
  },
  {
    slug: "displaying-document-json",
    title: "Displaying Document JSON.",
    blurb: "编辑器 + 右侧实时 pretty JSON 面板，`onChange` 订阅驱动，当前块高亮。",
    category: "Data",
    tags: ["json", "onChange", "live"],
    apis: ["onChange", "document", "onSelectionChange"],
    thumbnail: () => sampleDocument().slice(0, 4),
    component: DisplayingDocumentJson,
    files: docJsonSrc,
    steps: [
      {
        text: "`editor.onChange(cb)` 订阅文档变更——每次击键都把 `editor.document` pretty-print 到右侧面板。",
        code: `useEffect(() => editor.onChange((e) => setJson(JSON.stringify(e.document, null, 2))), [editor]);`,
      },
      {
        text: "面板是只读 mono 视图：滚动容器 + `Copy` 按钮，块计数随文档实时刷新。",
        code: `<pre className="overflow-auto font-mono">{json}</pre>`,
      },
        {
        text: "可选增强：`onSelectionChange` 取选区第一个块，在面板头部高亮当前块 id 与 type。",
        code: `editor.onSelectionChange((sel) => setCurrent(editor.getBlock(sel?.blockIds[0])));`,
      },
    ],
  },
  {
    slug: "manipulating-blocks",
    title: "Manipulating Blocks.",
    blurb: "外置按钮条驱动公共 API：插入 / 更新 / 删除 / 复制 / Undo / Redo。",
    category: "Data",
    tags: ["insertBlocks", "updateBlock", "undo"],
    apis: ["insertBlocks", "updateBlock", "removeBlocks", "undo", "redo", "canUndo"],
    thumbnail: () => sampleDocument().slice(0, 6),
    component: ManipulatingBlocks,
    files: manipulatingSrc,
    steps: [
      {
        text: "「在选中块后插入」用 `getSelection()` 拿当前块 id，作为 `insertBlocks` 的 refId。",
        code: `editor.insertBlocks([{ type: "paragraph", content: "…" }], refId, "after");`,
      },
      {
        text: "「更新当前块」调 `updateBlock(id, { content })` 整块改写行内容；「复制首块」深拷贝后删掉 id 再插回。",
        code: `editor.updateBlock(id, { content: [{ type: "text", text: "已更新" }] });`,
      },
      {
        text: "Undo / Redo 按钮按 `editor.canUndo` / `canRedo` 禁用；`onChange` 里 bump 一个 tick 让禁用态随文档刷新。",
        code: `onChange: () => setTick((v) => v + 1)`,
      },
    ],
  },
  {
    slug: "default-schema-showcase",
    title: "Default Schema Showcase.",
    blurb: "一份文档依次展示全部内置块：9 种内容块 + columnList 分栏。",
    category: "Schema",
    tags: ["schema", "blocks", "showcase"],
    apis: ["useK3Editor", "Block", "initialContent"],
    thumbnail: () => sampleDocument().slice(0, 9),
    component: DefaultSchemaShowcase,
    files: schemaSrc,
    steps: [
      {
        text: "内置 schema 共 10 种块：paragraph / heading(1-3) / bullet / numbered / check / quote / code / divider / image / columnList。",
        code: `const TYPES = ["paragraph", "heading", …, "columnList"];`,
      },
      {
        text: "每种块一个磁贴：mono 标签 + 独立 `useK3Editor` 实例，单块种子文档，全部可编辑。",
        code: `const editor = useK3Editor({ initialContent: [block] });`,
      },
    ],
  },
  {
    slug: "removing-default-blocks",
    title: "Removing Default Blocks from Schema.",
    blurb: "`blockTypes` 白名单：右侧编辑器只留 paragraph / heading / image。",
    category: "Schema",
    tags: ["blockTypes", "whitelist", "slash-menu"],
    apis: ["blockTypes", "useK3Editor"],
    thumbnail: helloDocument,
    component: RemovingDefaultBlocks,
    files: slimSchemaSrc,
    steps: [
      {
        text: "`blockTypes` 白名单同时收窄三处：斜杠菜单、「转换为」菜单、Markdown 行首规则。",
        code: `useK3Editor({ blockTypes: ["paragraph", "heading", "image"] });`,
      },
      {
        text: "右侧编辑器输入 `/` 只剩 4 个命令（段落、标题 1-3、图片）；`-`+空格不再转列表。",
        code: `// 白名单外类型的 input rules 全部失效`,
      },
      {
        text: "`insertBlocks` 遇到非白名单 type 时递归降级为 `paragraph`——导入外部文档不会崩。",
        code: `// quote → paragraph（保留 content）`,
      },
    ],
  },
  {
    slug: "use-with-ariakit",
    title: "Use with Ariakit.",
    blurb: "Ariakit 的 Button / Popover / Dialog 做编辑器外置 chrome，外观全走设计令牌。",
    category: "Integration",
    tags: ["ariakit", "popover", "dialog", "a11y"],
    apis: ["insertBlocks", "removeBlocks", "undo", "redo"],
    thumbnail: () => sampleDocument().slice(0, 5),
    component: UseWithAriakit,
    files: ariakitSrc,
    steps: [
      {
        text: "Ariakit 组件无样式——`className` 用宿主令牌（1px 发丝线、28px 刻度、不投影不发亮）。",
        code: `<Ariakit.PopoverDisclosure className="h-7 rounded-lg border border-border …">`,
      },
      {
        text: "Popover 里放块操作按钮：insertBlocks / removeBlocks / undo / redo 直接驱动编辑器。",
        code: `<Ariakit.Button onClick={() => editor.undo()}>Undo</Ariakit.Button>`,
      },
      {
        text: "Dialog 里放 JSON 导出；focus trap、esc、点击外部关闭都由 Ariakit 负责。",
        code: `<Ariakit.Dialog backdrop={…}><pre>{json}</pre></Ariakit.Dialog>`,
      },
    ],
  },
  {
    slug: "use-with-shadcn",
    title: "Use with ShadCN.",
    blurb: "shadcn/ui 的 Button / Popover / Dialog 做外置 chrome；编辑器 theme 继承宿主。",
    category: "Integration",
    tags: ["shadcn", "popover", "dialog", "theming"],
    apis: ["insertBlocks", "undo", "K3EditorView"],
    thumbnail: () => sampleDocument().slice(0, 5),
    component: UseWithShadcn,
    files: shadcnSrc,
    steps: [
      {
        text: "直接复用 `src/components/ui/` 的 button / popover / dialog——编辑器与 shadcn chrome 同页共存。",
        code: `import { Button } from "@/components/ui/button";`,
      },
      {
        text: "Popover 内放块操作、Dialog 内放 JSON 导出，全部通过公共 API 驱动编辑器。",
        code: `<Button variant="ghost" onClick={() => editor.undo()}>Undo</Button>`,
      },
      {
        text: "编辑器不传 `theme` 时继承宿主 CSS 变量——宿主切换 shadcn 主题，编辑器跟随换肤。",
        code: `<K3EditorView editor={editor} />  <!-- 继承宿主 -->`,
      },
    ],
  },
  {
    slug: "localization-i18n",
    title: "Localization (i18n).",
    blurb: "中文 / English / 自定义字典即时切换：placeholder、斜杠菜单、右键菜单全覆盖。",
    category: "Integration",
    tags: ["i18n", "dictionary", "zhCN", "enUS"],
    apis: ["dictionary", "zhCN", "enUS", "mergeDictionary"],
    thumbnail: helloDocument,
    component: LocalizationI18n,
    files: i18nSrc,
    steps: [
      {
        text: "内置 `zhCN`（默认）与 `enUS` 两套字典，涵盖 placeholder、斜杠菜单、侧边菜单、格式化工具栏全部文案。",
        code: `import { zhCN, enUS } from "@k3/blocks";`,
      },
      {
        text: "`<K3EditorView dictionary>` 优先级最高且随渲染即时生效——分段开关切换无需重建编辑器。",
        code: `<K3EditorView editor={editor} dictionary={enUS} />`,
      },
      {
        text: "`mergeDictionary(zhCN, {…})` 深合并覆盖单条文案，其余键沿用默认值。",
        code: `mergeDictionary(zhCN, { placeholder: "写下你的 RFC 草案…" })`,
      },
    ],
  },
  {
    slug: "multi-column-blocks",
    title: "Multi-Column Blocks.",
    blurb: "columnList 分栏块：左栏段落+清单、右栏引用；斜杠菜单「分栏」一键插入。",
    category: "Advanced",
    tags: ["columnList", "columns", "layout"],
    apis: ["columnList", "insertBlocks"],
    thumbnail: columnsDocument,
    component: MultiColumnBlocks,
    files: columnsSrc,
    steps: [
      {
        text: "`columnList` 的 children 只能是 `column`；`column` 的 children 是任意常规块，栏内正常编辑与撤销。",
        code: `{ type: "columnList", children: [{ type: "column", children: […] }, …] }`,
      },
      {
        text: "在空行输入 `/`，Media 组选「分栏」即插入一个 2 栏 columnList（各栏一个空段落）。",
        code: `// 斜杠菜单 → Media → 分栏 / Columns`,
      },
      {
        text: "已知限制：栏内不能再嵌套分栏；拖拽排序不支持跨栏移动；窄屏退化为单列堆叠。",
        code: `// <768px 时 CSS grid 退化为单列`,
      },
    ],
  },
  {
    slug: "displaying-selected-blocks",
    title: "Displaying Selected Blocks.",
    blurb: "`onSelectionChange` 驱动右侧面板：实时显示选区覆盖的块 id 与 type。",
    category: "Advanced",
    tags: ["selection", "onSelectionChange", "panel"],
    apis: ["onSelectionChange", "getSelection", "getBlock"],
    thumbnail: () => sampleDocument().slice(0, 9),
    component: DisplayingSelectedBlocks,
    files: selectionSrc,
    steps: [
      {
        text: "`editor.onSelectionChange(cb)` 在选区（含折叠光标）进入 / 移动 / 离开编辑器时回调，重复值自动去重。",
        code: `useEffect(() => editor.onSelectionChange(setSel), [editor]);`,
      },
      {
        text: "回调给 `{ blockIds }`（按文档顺序，跨块选区含全部覆盖块）；移出编辑器时回调 `null`，面板显示空态。",
        code: `sel?.blockIds.map((id) => editor.getBlock(id)?.type)`,
      },
    ],
  },
  {
    slug: "custom-paste-handler",
    title: "Custom Paste Handler.",
    blurb: "`pasteHandler` 拦截粘贴：图片 URL 变 image 块，多行文本按行拆块。",
    category: "Advanced",
    tags: ["paste", "clipboard", "image"],
    apis: ["pasteHandler", "insertBlocks", "getSelection"],
    thumbnail: helloDocument,
    component: CustomPasteHandler,
    files: pasteSrc,
    steps: [
      {
        text: "`pasteHandler(e, editor)` 在组件根 paste 捕获阶段优先调用；返回 `true` 表示已处理，阻止默认粘贴。",
        code: `useK3Editor({ pasteHandler: (e, editor) => boolean });`,
      },
      {
        text: "剪贴板文本匹配图片 URL（.png/.jpg/.svg/.webp）时插入 image 块；多行文本按行拆成多个 paragraph。",
        code: `editor.insertBlocks([{ type: "image", props: { src: url } }], refId, "after");`,
      },
      {
        text: "其余情况返回 `false` 走默认：单行块内插入，多行按行拆块（代码块内不拆）。",
        code: `return false;  // 走默认粘贴`,
      },
    ],
  },
  {
    slug: "custom-schemas",
    title: "Custom Schemas.",
    blurb: "schema 定制三件套：blockTypes 白名单 + blockRenderers 自定义块 + 精简 dictionary。",
    category: "Schema",
    tags: ["schema", "blockTypes", "blockRenderers", "dictionary"],
    apis: ["blockTypes", "blockRenderers", "dictionary"],
    thumbnail: () => [
      {
        id: "cs-thumb",
        type: "paragraph",
        props: {},
        content: [{ type: "text" as const, text: "白名单 + 渲染口 + 字典 = 迷你 schema。" }],
        children: [],
      },
    ],
    component: CustomSchemas,
    files: customSchemasSrc,
    steps: [
      {
        text: "`blockTypes: [\"paragraph\", \"heading\"]` 收窄内置块：斜杠菜单、「转换为」、Markdown 规则同步只剩这两项。",
        code: `useK3Editor({ blockTypes: ["paragraph", "heading"] });`,
      },
      {
        text: "`blockRenderers.note` 注册 schema 外的自定义块——自定义 type 不受白名单降级影响，始终放行。",
        code: `blockRenderers={{ note: (block) => <aside>{block.props.text}</aside> }}`,
      },
      {
        text: "`dictionary` 深合并覆盖 placeholder 与斜杠菜单空态，未覆盖的键沿用 zhCN 默认。",
        code: `dictionary: { placeholder: "只能写段落和标题…" }`,
      },
    ],
  },
  {
    slug: "alert-block",
    title: "Alert Block.",
    blurb: "自定义 alert 块：四种 variant 的左色变条 + 图标 + 文本，blockRenderers 渲染。",
    category: "Schema",
    tags: ["custom-block", "blockRenderers", "alert"],
    apis: ["blockRenderers", "insertBlocks"],
    thumbnail: () => [
      {
        id: "al-thumb",
        type: "alert",
        props: { variant: "info", text: "自定义块的渲染完全由宿主决定。" },
        // content 是磁贴预览（无 blockRenderers 时降级为段落）的回退文本
        content: [{ type: "text" as const, text: "ⓘ alert — 自定义块，四种 variant。" }],
        children: [],
      },
    ],
    component: AlertBlock,
    files: alertBlockSrc,
    steps: [
      {
        text: "种子文档里的 `type: \"alert\"` 不在内置 schema 中——`blockRenderers.alert` 接管渲染：左 2px 色变条 + 图标 + 文本。",
        code: `blockRenderers={{ alert: renderAlert }}`,
      },
      {
        text: "斜杠菜单只列内置块；schema 外的 alert 用外置按钮 `insertBlocks` 插入，拖拽 / 删除 / 撤销照常生效。",
        code: `editor.insertBlocks([{ type: "alert", props: { variant: "info", text: "…" } }]);`,
      },
    ],
  },
  {
    slug: "mentions-menu",
    title: "Mentions Menu.",
    blurb: "mentions 配置：文本内输入 @ 弹建议菜单，插入原子 mention chip。",
    category: "Advanced",
    tags: ["mentions", "@", "inline"],
    apis: ["mentions", "K3MentionItem"],
    thumbnail: () => [
      {
        id: "mn-thumb",
        type: "paragraph",
        props: {},
        content: [
          { type: "text" as const, text: "请 " },
          { type: "mention" as const, props: { id: "u1", label: "张三" } },
          { type: "text" as const, text: " 看一下。" },
        ],
        children: [],
      },
    ],
    component: MentionsMenu,
    files: mentionsSrc,
    steps: [
      {
        text: "`mentions.items` 给出候选集（label / subtext / id）；文本内输入 `@` 弹出建议菜单，模糊过滤、↑↓ 选择、↵ 插入。",
        code: `useK3Editor({ mentions: { items, trigger: "@" } });`,
      },
      {
        text: "触发有约束：`@` 前必须是行首 / 空白 / 标点——写邮箱 `user@host.com` 不弹菜单；中文输入 composition 期间也不触发。",
        code: `// zhangsan@k3.io → 不弹菜单`,
      },
      {
        text: "mention 是原子 chip：`contenteditable=false`，Backspace 整体删除；模型为 `{ type: \"mention\", props: { id, label } }`，Markdown 导出为 `@label`。",
        code: `{ type: "mention", props: { id: "u1", label: "张三" } }`,
      },
    ],
  },
  {
    slug: "font-style",
    title: "Font Style.",
    blurb: "文字颜色与高亮：工具栏 Text color / Highlight 下拉，JSON 里的 textColor / backgroundColor。",
    category: "Theming",
    tags: ["textColor", "backgroundColor", "toolbar"],
    apis: ["InlineStyles", "textColor", "backgroundColor", "formattingToolbar"],
    thumbnail: () => [
      {
        id: "fs-thumb",
        type: "paragraph",
        props: {},
        content: [
          { type: "text" as const, text: "红色", styles: { textColor: "#e03131" } },
          { type: "text" as const, text: " 与 " },
          { type: "text" as const, text: "高亮", styles: { backgroundColor: "#e8590c33" } },
        ],
        children: [],
      },
    ],
    component: FontStyle,
    files: fontStyleSrc,
    steps: [
      {
        text: "种子文档的 text 节点带 `styles.textColor` / `styles.backgroundColor`（hex / hex8），渲染为外包 span。",
        code: `{ type: "text", text: "红色重点", styles: { textColor: "#e03131" } }`,
      },
      {
        text: "选中文字，格式化工具栏尾部两个 28px 下拉：Text color 与 Highlight；当前生效色带勾，default 清除。",
        code: `// 色板：default / red / orange / green / blue / gray`,
      },
      {
        text: "右侧 JSON 面板实时显示 styles 变化——颜色随文档 JSON 无损存储；Markdown 导出忽略颜色。",
        code: `onChange: (e) => setJson(JSON.stringify(e.document[1].content))`,
      },
    ],
  },
  {
    slug: "pdf-block",
    title: "PDF Block.",
    blurb: "内置 pdf 块：iframe 预览 /sample.pdf，「编辑链接」换 URL、「新窗口打开」。",
    category: "Advanced",
    tags: ["pdf", "iframe", "media"],
    apis: ["pdf", "props.url"],
    thumbnail: () => [
      { id: "pdf-thumb", type: "pdf", props: { url: "/sample.pdf" }, content: [], children: [] },
    ],
    component: PdfBlock,
    files: pdfBlockSrc,
    steps: [
      {
        text: "`type: \"pdf\"` + `props.url` 即嵌入 PDF：固定 560px 高的 iframe（`#toolbar=0&navpanes=0`），右上角浮条含「新窗口打开」「编辑链接」。",
        code: `{ type: "pdf", props: { url: "/sample.pdf" } }`,
      },
      {
        text: "已知限制：预览依赖浏览器内置 PDF viewer（外观因浏览器而异）；跨域文件受目标站 CSP / X-Frame-Options 限制；Markdown 导出为链接行。",
        code: `// url 为空串时显示占位输入框（同 image / embed 块模式）`,
      },
    ],
  },
  {
    slug: "alert-block-full-ux",
    title: "Alert Block with Full UX.",
    blurb: "完整版 alert：variant segmented 控件、可编辑文本、键盘可达，全部 updateBlock 回写。",
    category: "Advanced",
    tags: ["custom-block", "updateBlock", "a11y", "ux"],
    apis: ["blockRenderers", "updateBlock"],
    thumbnail: () => [
      {
        id: "ax-thumb",
        type: "alert",
        props: { variant: "warning", text: "点级别按钮和文本——全部可交互。" },
        content: [],
        children: [],
      },
    ],
    component: AlertBlockFullUx,
    files: alertFullSrc,
    steps: [
      {
        text: "variant 切换是 segmented 控件：`aria-pressed` 表示当前值，点击调 `updateBlock` 写回 `props.variant`，可撤销。",
        code: `editor.updateBlock(block.id, { props: { ...block.props, variant: k } });`,
      },
      {
        text: "文本用 contenteditable 直接编辑，失焦一次性 `updateBlock` 回写（只产生一条撤销历史）。",
        code: `onBlur={(e) => editor.updateBlock(block.id, { props: { text: e.currentTarget.textContent } })}`,
      },
      {
        text: "键盘可达：按钮与文本均可 Tab 聚焦（focus-visible 高亮）；自定义块内的按键不会误触编辑器热键。",
        code: `// 编辑器热键只作用于 .k3-editable 内部`,
      },
    ],
  },
  {
    slug: "toggleable-custom-blocks",
    title: "Toggleable Custom Blocks.",
    blurb: "自定义 toggle 块：chevron 展开 / 收起，状态存 props.expanded。",
    category: "Advanced",
    tags: ["custom-block", "toggle", "blockRenderers"],
    apis: ["blockRenderers", "updateBlock", "props"],
    thumbnail: () => [
      {
        id: "tg-thumb",
        type: "toggle",
        props: { title: "点我展开", text: "展开区内容。", expanded: true },
        content: [{ type: "text" as const, text: "▸ toggle — chevron 展开 / 收起。" }],
        children: [],
      },
    ],
    component: ToggleableCustomBlocks,
    files: toggleSrc,
    steps: [
      {
        text: "chevron 按钮（`aria-expanded`）切换 `props.expanded`：展开态旋转 90°，内容区随状态显隐。",
        code: `editor.updateBlock(block.id, { props: { expanded: !expanded } });`,
      },
      {
        text: "对应 Notion 的 toggle 块；Notion 用 children 嵌套子块，此示例简化为 `props.text`——状态随 JSON 持久化、可撤销。",
        code: `{ type: "toggle", props: { title, text, expanded: true } }`,
      },
    ],
  },
  {
    slug: "configuring-default-blocks",
    title: "Configuring Default Blocks.",
    blurb: "blockConfig 对比：heading.levels [1,2] + codeBlock.defaultLanguage \"ts\"。",
    category: "Schema",
    tags: ["blockConfig", "heading", "codeBlock"],
    apis: ["blockConfig", "heading.levels", "codeBlock.defaultLanguage"],
    thumbnail: () => [
      {
        id: "cfg-thumb",
        type: "heading",
        props: { level: 1 },
        content: [{ type: "text" as const, text: "只有 H1 / H2 的编辑器" }],
        children: [],
      },
    ],
    component: ConfiguringDefaultBlocks,
    files: blockConfigSrc,
    steps: [
      {
        text: "右侧编辑器配 `heading.levels: [1, 2]`：斜杠菜单与「转换为」只剩 H1/H2，`###`+空格 行首规则失效（已有 H3 不受影响）。",
        code: `blockConfig: { heading: { levels: [1, 2] } }`,
      },
      {
        text: "`codeBlock.defaultLanguage: \"ts\"` 让新代码块（斜杠菜单 / ``` 规则 / 转换为）初始语言与右上角标签默认 ts。",
        code: `blockConfig: { codeBlock: { defaultLanguage: "ts" } }`,
      },
      {
        text: "非法配置（如 `levels: []`、`defaultLanguage: \"\"`）静默忽略并 `console.warn`，其余部分照常生效。",
        code: `// levels: [4] → console.warn + 忽略`,
      },
    ],
  },
  {
    slug: "math-block",
    title: "Math Block.",
    blurb: "KaTeX 公式块：点击渲染态进入编辑，改 latex 实时重渲染。",
    category: "Advanced",
    tags: ["math", "katex", "latex"],
    apis: ["math", "props.latex"],
    thumbnail: () => [
      { id: "ma-thumb", type: "math", props: { latex: "E = mc^2" }, content: [], children: [] },
    ],
    component: MathBlock,
    files: mathBlockSrc,
    steps: [
      {
        text: "`type: \"math\"` + `props.latex`：KaTeX 展示模式（displayMode）渲染，渲染态右上角常驻 mono TeX 小标。",
        code: `{ type: "math", props: { latex: "\\\\sum_{i=1}^{n} i = \\\\frac{n(n+1)}{2}" } }`,
      },
      {
        text: "点击渲染态进入编辑态：mono inset 输入框改 latex，失焦 / `⌘/Ctrl+Enter` 回渲染态，Esc 放弃；渲染失败显示源码 + 红色小标。",
        code: `// 编辑态 → 失焦提交 → 实时重渲染`,
      },
      {
        text: "Markdown 导出为 `$$...$$` 围栏；支持 KaTeX 子集，暂无行内公式块。",
        code: `// $$E = mc^2$$`,
      },
    ],
  },
  {
    slug: "diagram-block",
    title: "Diagram Block.",
    blurb: "Mermaid 图表块：flowchart / sequenceDiagram / gantt 一键切换，编辑源码重渲染。",
    category: "Advanced",
    tags: ["diagram", "mermaid", "flowchart"],
    apis: ["diagram", "props.code", "updateBlock"],
    thumbnail: () => [
      {
        id: "dg-thumb",
        type: "diagram",
        props: { code: "flowchart LR\n  A-->B" },
        content: [],
        children: [],
      },
    ],
    component: DiagramBlock,
    files: diagramBlockSrc,
    steps: [
      {
        text: "`type: \"diagram\"` + `props.code`（Mermaid 源码）：mermaid 按需动态 import，不进首屏 bundle，主题跟随 `data-theme`。",
        code: `{ type: "diagram", props: { code: "flowchart LR\\n  A-->B" } }`,
      },
      {
        text: "外置按钮 `updateBlock` 写回 `props.code` 即整图切换；块内「编辑源码」进编辑态，`⌘/Ctrl+Enter` / 失焦提交重渲染。",
        code: `editor.updateBlock(id, { props: { code: sequenceDiagramSrc } });`,
      },
      {
        text: "`securityLevel: \"strict\"` 禁用图内 HTML / 脚本；渲染失败显示 mono 错误条；Markdown 导出为 ```mermaid 围栏。",
        code: `// 失败 → 错误条，不炸页面`,
      },
    ],
  },
  {
    slug: "code-block-theme",
    title: "Code Block Theme.",
    blurb: "CSS 变量覆盖代码高亮配色：默认与定制主题左右对照。",
    category: "Theming",
    tags: ["codeBlock", "highlight", "css-vars"],
    apis: ["theme", "CSS variables"],
    thumbnail: () => [
      {
        id: "ct-thumb",
        type: "codeBlock",
        props: { language: "tsx" },
        content: [
          { type: "text" as const, text: `const editor = useK3Editor();\n// string → 品牌橙` },
        ],
        children: [],
      },
    ],
    component: CodeBlockTheme,
    files: codeThemeSrc,
    steps: [
      {
        text: "代码块高亮的每个 token 颜色都是 CSS 变量：`--k3-code-keyword/string/comment/function/number/operator/punctuation`。",
        code: `--k3-code-string: #e8590c;`,
      },
      {
        text: "在编辑器容器上覆盖变量即可——层叠作用到内部代码块，不改组件、不动主题文件。",
        code: `.brand-code { --k3-code-keyword: #0047ff; }`,
      },
      {
        text: "左右两个编辑器挂同一份 tsx 种子代码：左边默认配色，右边 string 变品牌橙、keyword 变 #0047ff。",
        code: `<div className="brand-code"><K3EditorView … /></div>`,
      },
    ],
  },
  {
    slug: "source-with-preview-blocks",
    title: "Source with Preview Blocks.",
    blurb: "自定义 htmlPreview 块：左源码 textarea、右 sandboxed iframe 实时预览。",
    category: "Advanced",
    tags: ["custom-block", "iframe", "srcdoc", "preview"],
    apis: ["blockRenderers", "updateBlock", "props"],
    thumbnail: () => [
      {
        id: "sp-thumb",
        type: "htmlPreview",
        props: { code: "<p>Hello, preview.</p>" },
        content: [],
        children: [],
      },
    ],
    component: SourceWithPreviewBlocks,
    files: srcPreviewSrc,
    steps: [
      {
        text: "「源码 + 预览」模式：状态只有 `props.code` 一个字段——textarea 受控于块 props，每次击键 `updateBlock` 回写。",
        code: `onChange={(e) => editor.updateBlock(block.id, { props: { code: e.target.value } })}`,
      },
      {
        text: "右侧 `<iframe sandbox=\"allow-scripts\" srcDoc={code}>` 同帧刷新；不带 `allow-same-origin`，脚本可运行但碰不到宿主页面。",
        code: `<iframe sandbox="allow-scripts" srcDoc={code} />`,
      },
      {
        text: "同模式可迁移到 Markdown / SVG / 图表配置等任意「源码 → 渲染」自定义块——JSON 持久化与撤销天然生效。",
        code: `{ type: "htmlPreview", props: { code: "<p>…</p>" } }`,
      },
    ],
  },
];

export function getExample(slug: string | undefined): ExampleMeta | undefined {
  return EXAMPLES.find((e) => e.slug === slug);
}
