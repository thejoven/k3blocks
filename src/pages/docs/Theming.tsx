import { useState, type CSSProperties } from "react";
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
  Segmented,
} from "@/components/docs/primitives";
import { txt } from "@/components/docs/utils";
import { useTheme } from "@/hooks/useTheme";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";

/**
 * Theming (docs.md §3.3): live theme switcher demo + CSS variable table +
 * override snippet. Editor tokens mirror src/k3blocks/theme.css exactly.
 */

const THEME_DOC: Block[] = [
  { id: "t1", type: "heading", props: { level: 2 }, content: [txt("主题来自变量")], children: [] },
  {
    id: "t2",
    type: "paragraph",
    props: {},
    content: [
      txt("切换上面的分段控件 —— 只有这个面板的 "),
      txt("data-theme", { code: true }),
      txt(" 变了，页面其余部分不动。"),
    ],
    children: [],
  },
  {
    id: "t3",
    type: "quote",
    props: {},
    content: [txt("选中这段文字，看看格式化工具栏的颜色。")],
    children: [],
  },
  {
    id: "t4",
    type: "codeBlock",
    props: { language: "css" },
    content: [txt(".k3-editor { color: var(--text-1); }")],
    children: [],
  },
];

/** Frame chrome follows the demo theme too — same tokens, inline on the frame. */
const LIGHT_VARS = {
  "--bg": "#ffffff",
  "--surface-1": "#fafafa",
  "--surface-2": "#f2f2f2",
  "--surface-inset": "#f5f5f5",
  "--border": "#dbdbdb",
  "--text-1": "#1a1a1a",
  "--text-2": "#555555",
  "--text-3": "#8f8f8f",
  "--text-4": "#aeaeae",
  "--hover-overlay": "rgba(0,0,0,0.04)",
} as CSSProperties;

const DARK_VARS = {
  "--bg": "#111111",
  "--surface-1": "#161616",
  "--surface-2": "#1c1c1c",
  "--surface-inset": "#0a0a0a",
  "--border": "#2a2a2a",
  "--text-1": "#ededed",
  "--text-2": "#aeaeae",
  "--text-3": "#8f8f8f",
  "--text-4": "#636363",
  "--hover-overlay": "rgba(255,255,255,0.05)",
} as CSSProperties;

function ThemeDemo() {
  const [mode, setMode] = useState<"dark" | "light" | "system">("dark");
  const { theme: siteTheme } = useTheme();
  const editor = useK3Editor({ initialContent: THEME_DOC });

  const effective = mode === "system" ? siteTheme : mode;
  // system → inherit the page; explicit → swap this frame's data-theme only.
  const frameVars = mode === "system" ? undefined : effective === "light" ? LIGHT_VARS : DARK_VARS;

  return (
    <DemoFrame
      className="mt-4"
      style={frameVars}
      bodyClassName="px-4 py-4 sm:px-6"
      bar={
        <>
          <Segmented
            options={[
              { value: "light", label: "light" },
              { value: "dark", label: "dark" },
              { value: "system", label: "system" },
            ]}
            value={mode}
            onChange={setMode}
          />
          <span className="font-mono text-[12px] text-text-4">
            {mode === "system" ? `继承页面（当前 ${siteTheme}）` : `data-theme="${mode}"`}
          </span>
        </>
      }
    >
      <K3EditorView
        editor={editor}
        theme={mode === "system" ? undefined : mode}
        placeholder="输入 '/' 查看命令"
      />
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

/** Rows mirror src/k3blocks/theme.css. */
const VAR_ROWS: { token: string; dark: string; light: string; usage: string }[] = [
  { token: "--bg", dark: "#111111", light: "#ffffff", usage: "编辑器底色" },
  { token: "--surface-1", dark: "#161616", light: "#fafafa", usage: "凸起一级的表面" },
  { token: "--surface-2", dark: "#1c1c1c", light: "#f2f2f2", usage: "菜单、工具栏、hover 态" },
  { token: "--surface-inset", dark: "#0a0a0a", light: "#f5f5f5", usage: "代码块等凹陷井" },
  { token: "--border", dark: "#2a2a2a", light: "#dbdbdb", usage: "全部 1px 发丝线" },
  { token: "--text-1", dark: "#ededed", light: "#1a1a1a", usage: "标题与正文主色" },
  { token: "--text-2", dark: "#aeaeae", light: "#555555", usage: "次级文本" },
  { token: "--text-3", dark: "#8f8f8f", light: "#8f8f8f", usage: "占位符、辅助文本" },
  { token: "--text-4", dark: "#636363", light: "#aeaeae", usage: "最弱元信息" },
  { token: "--accent", dark: "#388aff", light: "#388aff", usage: "链接、聚焦、勾选、主按钮" },
  { token: "--accent-hover", dark: "#5c9fff", light: "#5c9fff", usage: "强调色 hover" },
  { token: "--accent-soft", dark: "rgba(56,138,255,0.12)", light: "rgba(56,138,255,0.12)", usage: "强调色浅底" },
  { token: "--selection", dark: "rgba(56,138,255,0.28)", light: "rgba(56,138,255,0.28)", usage: "文本选区" },
  { token: "--hover-overlay", dark: "rgba(255,255,255,0.05)", light: "rgba(0,0,0,0.04)", usage: "通用 hover 叠加" },
];

const OVERRIDE_CSS = `/* 你的样式表里，after @k3/blocks/style.css */
.k3-editor.my-theme {
  --bg: #0d1117;
  --surface-1: #11161d;
  --accent: #0047ff;
  --selection: rgba(0, 71, 255, 0.3);
}`;

const OVERRIDE_TSX = `<K3EditorView editor={editor} theme="dark" className="my-theme" />`;

export default function Theming() {
  return (
    <DocsShell
      crumbs={["Docs", "Foundations", "Theming"]}
      title="Theming."
      lead="编辑器的每一种颜色都来自 CSS 变量。切换 data-theme，或在 .k3-editor 作用域上覆盖任意 token。"
    >
      <H2 id="demo">主题切换。</H2>
      <P>
        <InlineCode>theme</InlineCode> prop 接受 <InlineCode>"light" | "dark"</InlineCode>
        ，设置到编辑器根元素的 <InlineCode>data-theme</InlineCode> 上；不传则继承宿主页面
        （也就是 system 行为）。切换是即时的 —— 只是一次变量交换。
      </P>
      <ThemeDemo />

      <H2 id="variables">CSS 变量。</H2>
      <P>
        全部令牌如下，变量名与宿主页面同名。这意味着默认情况下编辑器直接融入你的设计系统；
        也意味着覆盖时注意作用域（见下一节）。
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

      <H2 id="override">覆盖主题。</H2>
      <P>
        在 <InlineCode>@k3/blocks/style.css</InlineCode> 之后声明你的覆盖。用{" "}
        <InlineCode>className</InlineCode> 把作用域类挂到编辑器根元素上：
      </P>
      <CodeBlock className="mt-4" code={OVERRIDE_CSS} language="css" />
      <CodeBlock className="mt-3" code={OVERRIDE_TSX} language="tsx" />
      <Callout className="mt-4">
        组件样式 100% 由 CSS 变量驱动 —— 无内联色值，可被宿主设计系统完全接管。
      </Callout>

      <H2 id="examples">相关示例。</H2>
      <CardStrip
        cards={[
          { to: "/examples/dark-theme", title: "Dark Theme", description: "暗色主题下的完整编辑器。" },
          { to: "/examples/minimal", title: "Minimal Setup", description: "最少配置，继承宿主的全部样式。" },
        ]}
      />
    </DocsShell>
  );
}
