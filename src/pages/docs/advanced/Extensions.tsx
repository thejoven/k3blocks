/**
 * /docs/advanced/extensions — 扩展点总览：每个扩展点一张卡
 * （一句说明 + mono 签名 + 回链对应示例 / 文档页）+ chrome 开关 live demo。
 */
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import CodeBlock from "@/components/CodeBlock";
import DocsShell from "@/components/docs/DocsShell";
import {
  CardStrip,
  DemoFrame,
  DocLink,
  H2,
  InlineCode,
  MonoCell,
  P,
  SwitchRow,
} from "@/components/docs/primitives";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";

/* ------------------------------- live demo ------------------------------- */

const DEMO_DOC: Block[] = [
  {
    id: "ext-1",
    type: "heading",
    props: { level: 2 },
    content: [{ type: "text", text: "三个 chrome 开关，独立生效" }],
    children: [],
  },
  {
    id: "ext-2",
    type: "paragraph",
    props: {},
    content: [
      { type: "text", text: "关掉全部开关后是纯净书写模式——内核的 Markdown 规则与快捷键照常工作。" },
    ],
    children: [],
  },
  { id: "ext-3", type: "paragraph", props: {}, content: [], children: [] },
];

/** slashMenu / formattingToolbar / sideMenu 布尔开关的即时效果。 */
function ChromeDemo() {
  const [slashMenu, setSlashMenu] = useState(true);
  const [formattingToolbar, setFormattingToolbar] = useState(true);
  const [sideMenu, setSideMenu] = useState(true);
  const editor = useK3Editor({ initialContent: DEMO_DOC });

  return (
    <DemoFrame
      bar={
        <>
          <SwitchRow label="斜杠菜单" prop="slashMenu" checked={slashMenu} onChange={setSlashMenu} />
          <SwitchRow
            label="格式化工具栏"
            prop="formattingToolbar"
            checked={formattingToolbar}
            onChange={setFormattingToolbar}
          />
          <SwitchRow label="侧边手柄" prop="sideMenu" checked={sideMenu} onChange={setSideMenu} />
        </>
      }
      bodyClassName="bg-surface-inset"
    >
      <K3EditorView
        editor={editor}
        slashMenu={slashMenu}
        formattingToolbar={formattingToolbar}
        sideMenu={sideMenu}
      />
    </DemoFrame>
  );
}

/* ------------------------------- 扩展点卡片 ------------------------------- */

interface ExtensionPoint {
  name: string;
  /** 所在 API 面 */
  surface: "useK3Editor 选项" | "K3EditorView prop";
  description: string;
  signature: string;
  link: { to: string; label: string };
}

const EXTENSION_POINTS: ExtensionPoint[] = [
  {
    name: "slashMenu",
    surface: "K3EditorView prop",
    description: "「/」斜杠菜单开关（默认开）——关掉后仍可用 Markdown 行首规则。",
    signature: "slashMenu?: boolean",
    link: { to: "/examples/minimal-chrome", label: "Minimal Chrome 示例" },
  },
  {
    name: "formattingToolbar",
    surface: "K3EditorView prop",
    description: "选中文字浮出的格式化工具栏开关（默认开）。",
    signature: "formattingToolbar?: boolean",
    link: { to: "/examples/minimal-chrome", label: "Minimal Chrome 示例" },
  },
  {
    name: "sideMenu",
    surface: "K3EditorView prop",
    description: "块左侧「+ 插入 / ⠿ 拖拽」手柄开关（默认开）。",
    signature: "sideMenu?: boolean",
    link: { to: "/examples/minimal-chrome", label: "Minimal Chrome 示例" },
  },
  {
    name: "mentions",
    surface: "useK3Editor 选项",
    description: "「@」提及建议菜单：候选集 + 触发字符；插入原子 mention chip。",
    signature: "mentions?: { items: K3MentionItem[]; trigger?: string }",
    link: { to: "/examples/mentions-menu", label: "Mentions Menu 示例" },
  },
  {
    name: "emojiPicker",
    surface: "useK3Editor 选项",
    description: "「:」emoji 网格建议菜单（默认 true），内置 280+ 静态表。",
    signature: "emojiPicker?: boolean",
    link: { to: "/docs/react/grid-suggestion-menus", label: "Grid suggestion menus" },
  },
  {
    name: "pasteHandler",
    surface: "useK3Editor 选项",
    description: "自定义粘贴管道：捕获阶段优先调用，返回 true 拦截默认粘贴。",
    signature: "pasteHandler?: (e: ClipboardEvent, editor: K3Editor) => boolean",
    link: { to: "/examples/custom-paste-handler", label: "Custom Paste Handler 示例" },
  },
  {
    name: "uploadFile",
    surface: "useK3Editor 选项",
    description: "文件上传管道：image/pdf/embed 选择文件与图片粘贴/拖拽共用；缺省回退 FileReader dataURL。",
    signature: "uploadFile?: (file: File) => Promise<string>",
    link: { to: "/docs/react/file-panel", label: "File panel" },
  },
  {
    name: "blockTypes",
    surface: "useK3Editor 选项",
    description: "块类型白名单：收窄斜杠菜单、「转换为」与 Markdown 规则；白名单外插入降级为段落。",
    signature: 'blockTypes?: string[]  // 如 ["paragraph", "heading", "image"]',
    link: { to: "/examples/removing-default-blocks", label: "Removing Default Blocks 示例" },
  },
  {
    name: "blockConfig",
    surface: "useK3Editor 选项",
    description: "默认块配置：限定 heading 可选级别、新代码块的默认语言。",
    signature: "blockConfig?: { heading?: { levels?: (1|2|3)[] }; codeBlock?: { defaultLanguage?: string } }",
    link: { to: "/examples/configuring-default-blocks", label: "Configuring Default Blocks 示例" },
  },
  {
    name: "blockRenderers",
    surface: "K3EditorView prop",
    description: "自定义块渲染口：schema 未注册的 type 由你的函数接管渲染（只读渲染口）。",
    signature: "blockRenderers?: Record<string, (block: Block, editor: K3Editor) => ReactNode>",
    link: { to: "/docs/features/custom-blocks", label: "Custom blocks 文档" },
  },
  {
    name: "inlineRenderers",
    surface: "K3EditorView prop",
    description: "自定义行内类型渲染口（如 tag chip）：JSON 往返无损，DOM 以 data-k3-inline 标注。",
    signature: "inlineRenderers?: Record<string, K3InlineRenderer>",
    link: { to: "/docs/customization/custom-inline-content", label: "Custom inline content" },
  },
  {
    name: "inlineStyleRenderers",
    surface: "K3EditorView prop",
    description: "自定义行内样式键 → CSS：让 styles 里的任意键（如 fontSize）参与渲染。",
    signature: "inlineStyleRenderers?: Record<string, (value: string) => CSSProperties>",
    link: { to: "/docs/customization/custom-styles", label: "Custom styles" },
  },
  {
    name: "domAttributes",
    surface: "K3EditorView prop",
    description: "附加 DOM 属性：editor 贴根元素、block 贴每个块行容器——测试锚点 / 分析埋点。",
    signature: "domAttributes?: { editor?: Record<string, string>; block?: Record<string, string> }",
    link: { to: "/docs/styling/dom-attributes", label: "DOM attributes 文档" },
  },
];

function ExtensionCard({ point }: { point: ExtensionPoint }) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-surface-1 p-4 transition-colors duration-150 ease-k3 hover:bg-surface-2">
      <div className="flex items-center justify-between gap-2">
        <MonoCell accent>{point.name}</MonoCell>
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-4">
          {point.surface}
        </span>
      </div>
      <p className="mt-2 text-sm leading-[1.65] text-text-2">{point.description}</p>
      <code className="mt-3 block overflow-x-auto rounded-md border border-border bg-surface-inset px-2.5 py-2 font-mono text-[12px] leading-relaxed text-text-1">
        {point.signature}
      </code>
      <span className="mt-3 inline-flex items-baseline gap-0.5 text-sm">
        <DocLink to={point.link.to}>{point.link.label}</DocLink>
        <ArrowUpRight size={12} strokeWidth={1.5} className="translate-y-px text-text-4" />
      </span>
    </div>
  );
}

/* ---------------------------------- 页面 ---------------------------------- */

const OVERVIEW_CODE = `const editor = useK3Editor({
  blockTypes,        // 块类型白名单
  blockConfig,       // 默认块配置
  mentions,          // @ 提及
  emojiPicker,       // : emoji 菜单（默认 true）
  pasteHandler,      // 自定义粘贴
  uploadFile,        // 文件上传管道
  dictionary,        // i18n 文案覆盖
});

<K3EditorView
  editor={editor}
  slashMenu formattingToolbar sideMenu   // chrome 三开关
  blockRenderers={…}                     // 自定义块
  inlineRenderers={…}                    // 自定义行内类型
  inlineStyleRenderers={…}               // 自定义行内样式键
  domAttributes={…}                      // 测试锚点 / 埋点
/>;`;

export default function Extensions() {
  return (
    <DocsShell
      crumbs={["Docs", "Advanced", "Extensions"]}
      title="Extensions."
      lead="K3Blocks 的定制面分两层：useK3Editor 选项决定「文档能装什么」（白名单、提及、上传、粘贴），K3EditorView props 决定「界面长什么样」（chrome 开关、渲染口、DOM 属性）。本页是全部扩展点的索引。"
      wide
    >
      <H2 id="demo">在线体验：chrome 三开关。</H2>
      <P>
        三个布尔 prop 各自独立、即时生效——关掉就是纯净书写模式（内核的 Markdown
        规则与 <InlineCode>⌘B</InlineCode> 等快捷键照常工作）。
      </P>
      <ChromeDemo />

      <H2 id="overview">一图总览。</H2>
      <CodeBlock className="mt-4" code={OVERVIEW_CODE} language="tsx" />

      <H2 id="points">全部扩展点。</H2>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {EXTENSION_POINTS.map((p) => (
          <ExtensionCard key={p.name} point={p} />
        ))}
      </div>

      <CardStrip
        className="mt-14"
        cards={[
          { to: "/docs/advanced/localization", title: "Localization", description: "dictionary：文案层的扩展点。" },
          { to: "/docs/customization/custom-schemas", title: "Custom schemas", description: "blockTypes + blockRenderers + dictionary 三件套教程。" },
        ]}
      />
    </DocsShell>
  );
}
