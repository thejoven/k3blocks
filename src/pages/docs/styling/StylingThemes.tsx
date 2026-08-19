/**
 * /docs/styling/themes — 主题页：theme prop / data-theme / 系统跟随三模式、
 * CSS 变量全表（dark/light 双列色板）、编辑器与宿主的变量共享；live 双主题对照。
 */
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
} from "@/components/docs/primitives";
import { txt } from "@/components/docs/utils";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";

const THEME_SNIPPET = `// 显式主题：写到编辑器根元素的 data-theme 上
<K3EditorView editor={editor} theme="dark" />
<K3EditorView editor={editor} theme="light" />

// 省略 theme：完全继承宿主页面（跟随站点的 <html data-theme> 或
// 任何祖先元素上的同名 CSS 变量）—— 这就是「系统跟随」
<K3EditorView editor={editor} />`;

const DEMO_DOC: Block[] = [
  {
    id: "st1",
    type: "heading",
    props: { level: 3 },
    content: [txt("同一份文档，两套主题")],
    children: [],
  },
  {
    id: "st2",
    type: "paragraph",
    props: {},
    content: [
      txt("选中这段文字看看工具栏，或者输入 "),
      txt("/", { code: true }),
      txt(" 打开斜杠菜单 —— 所有浮层都跟随各自的主题。"),
    ],
    children: [],
  },
  {
    id: "st3",
    type: "codeBlock",
    props: { language: "css" },
    content: [txt(".k3-editor { color: var(--text-1); }")],
    children: [],
  },
];

/** 双主题对照：两份独立实例并排，各自锁定 data-theme。 */
function DualThemeDemo() {
  const darkEditor = useK3Editor({ initialContent: DEMO_DOC });
  const lightEditor = useK3Editor({ initialContent: DEMO_DOC });
  return (
    <DemoFrame className="mt-4" bodyClassName="p-0">
      <div className="grid md:grid-cols-2">
        {(
          [
            { editor: darkEditor, theme: "dark" as const, label: 'theme="dark"' },
            { editor: lightEditor, theme: "light" as const, label: 'theme="light"' },
          ]
        ).map((pane, i) => (
          <div
            key={pane.theme}
            className={i === 0 ? "border-b border-border md:border-b-0 md:border-r" : ""}
            data-theme={pane.theme}
            style={{
              background: pane.theme === "dark" ? "#111111" : "#ffffff",
            }}
          >
            <div
              className="border-b px-4 py-2 font-mono text-[12px]"
              style={{
                borderColor: pane.theme === "dark" ? "#2a2a2a" : "#dbdbdb",
                color: pane.theme === "dark" ? "#8f8f8f" : "#8f8f8f",
              }}
            >
              {pane.label}
            </div>
            <div className="px-5 py-5">
              <K3EditorView editor={pane.editor} theme={pane.theme} placeholder="输入 '/' 查看命令" />
            </div>
          </div>
        ))}
      </div>
    </DemoFrame>
  );
}

function Swatch({ value }: { value: string }) {
  return (
    <span
      className="mr-1.5 inline-block h-3 w-3 rounded-[4px] border border-border align-[-1px]"
      style={{ backgroundColor: value }}
    />
  );
}

/** 与 src/k3blocks/theme.css 逐行对应。 */
const VAR_ROWS: { token: string; dark: string; light: string; usage: string }[] = [
  { token: "--bg", dark: "#111111", light: "#ffffff", usage: "编辑器底色" },
  { token: "--surface-1", dark: "#161616", light: "#fafafa", usage: "凸起一级的表面（占位框、表格表头）" },
  { token: "--surface-2", dark: "#1c1c1c", light: "#f2f2f2", usage: "菜单、工具栏、弹出层" },
  { token: "--surface-inset", dark: "#0a0a0a", light: "#f5f5f5", usage: "代码块、输入框等凹陷井" },
  { token: "--border", dark: "#2a2a2a", light: "#dbdbdb", usage: "全部 1px 发丝线" },
  { token: "--text-1", dark: "#ededed", light: "#1a1a1a", usage: "标题与正文主色" },
  { token: "--text-2", dark: "#aeaeae", light: "#555555", usage: "次级文本、菜单项" },
  { token: "--text-3", dark: "#8f8f8f", light: "#8f8f8f", usage: "占位符、辅助文本" },
  { token: "--text-4", dark: "#636363", light: "#aeaeae", usage: "最弱元信息" },
  { token: "--accent", dark: "#388aff", light: "#388aff", usage: "链接、聚焦、光标、激活态" },
  { token: "--accent-hover", dark: "#5c9fff", light: "#5c9fff", usage: "强调色 hover" },
  { token: "--accent-soft", dark: "rgba(56,138,255,0.12)", light: "rgba(56,138,255,0.12)", usage: "行内 code / mention 浅底" },
  { token: "--selection", dark: "rgba(56,138,255,0.28)", light: "rgba(56,138,255,0.28)", usage: "文本选区底色" },
  { token: "--hover-overlay", dark: "rgba(255,255,255,0.05)", light: "rgba(0,0,0,0.04)", usage: "通用 hover 叠加" },
];

export default function StylingThemes() {
  return (
    <DocsShell
      crumbs={["Docs", "Styling", "Themes"]}
      title="Themes."
      lead="编辑器的每种颜色都来自与宿主同名的 CSS 变量。theme prop 设置 data-theme，省略即跟随宿主 —— 双主题对照是即时的变量交换。"
      wide
    >
      <H2 id="modes">三种主题模式。</H2>
      <DocTable
        columns={["模式", "写法", "行为"]}
        rows={[
          [
            <MonoCell key="m" accent>显式 dark / light</MonoCell>,
            <MonoCell key="w">{`theme="dark"`}</MonoCell>,
            "组件根元素设置 data-theme，对应一组内置变量值（见下表）",
          ],
          [
            <MonoCell key="m" accent>系统跟随</MonoCell>,
            <MonoCell key="w">省略 theme</MonoCell>,
            "不写 data-theme，变量沿 DOM 树继承 —— 宿主切主题（如 <html data-theme>）编辑器即时跟随",
          ],
          [
            <MonoCell key="m" accent>自定义作用域</MonoCell>,
            <MonoCell key="w">{`className="my-theme"`}</MonoCell>,
            "在 .k3-editor 作用域上覆盖任意变量（详见 Overriding CSS）",
          ],
        ]}
      />
      <CodeBlock className="mt-4" code={THEME_SNIPPET} language="tsx" />
      <P>
        叙事式讲解与交互切换器见{" "}
        <DocLink to="/docs/foundations/theming">Foundations → Theming</DocLink>
        ；本页是速查与对照。动效遵循 <InlineCode>prefers-reduced-motion</InlineCode>。
      </P>

      <H2 id="demo">双主题对照。</H2>
      <P>两个独立实例渲染同一份种子文档，各自锁定一套主题 —— 交互互不影响：</P>
      <DualThemeDemo />

      <H2 id="variables">CSS 变量全表。</H2>
      <P>
        全部 14 个令牌，dark / light 双列色板。变量名与宿主页面同名 ——
        编辑器默认直接融入你的设计系统，无需任何映射层。
      </P>
      <DocTable
        columns={["变量", "Dark", "Light", "用途"]}
        rows={VAR_ROWS.map((r) => [
          <MonoCell key="t" accent>
            {r.token}
          </MonoCell>,
          <span key="d" className="whitespace-nowrap font-mono text-[12px] text-text-2">
            <Swatch value={r.dark} />
            {r.dark}
          </span>,
          <span key="l" className="whitespace-nowrap font-mono text-[12px] text-text-2">
            <Swatch value={r.light} />
            {r.light}
          </span>,
          r.usage,
        ])}
      />

      <H2 id="sharing">与宿主的变量共享。</H2>
      <P>
        组件样式表（<InlineCode>@thejoven_com/k3blocks/style.css</InlineCode>）里变量只声明在{" "}
        <InlineCode>.k3-editor[data-theme="…"]</InlineCode>{" "}
        两个选择器上；不传 theme 时组件本身一个变量都不定义，全部取值沿继承链来自宿主。
        这意味着：
      </P>
      <DocTable
        columns={["场景", "结果"]}
        rows={[
          ["宿主已有同名设计令牌", "零配置融入：编辑器直接吃宿主的 --bg / --accent 等"],
          ["宿主用别的命名体系", "传 theme 用内置值，或在 .k3-editor 作用域做一次变量映射"],
          ["页面多实例、主题各异", "每个实例各自的 theme prop / 局部 className 作用域互不影响"],
        ]}
      />
      <Callout className="mt-4">
        字体同样走变量：编辑器继承 <InlineCode>--font-sans</InlineCode> /{" "}
        <InlineCode>--font-mono</InlineCode>（未定义时回退 Geist / Geist Mono 栈）。
      </Callout>

      <H2 id="next">接下来。</H2>
      <CardStrip
        cards={[
          { to: "/docs/styling/overriding-css", title: "Overriding CSS", description: "变量覆盖与 .k3- 类名钩子清单。" },
          { to: "/docs/styling/dom-attributes", title: "DOM attributes", description: "测试锚点与埋点属性注入。" },
          { to: "/docs/foundations/theming", title: "Theming（指南）", description: "主题机制的叙事式讲解与切换 demo。" },
        ]}
      />
    </DocsShell>
  );
}
