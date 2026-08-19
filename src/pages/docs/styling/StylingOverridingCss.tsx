/**
 * /docs/styling/overriding-css — 覆盖 CSS：变量覆盖（accent 品牌色 live demo）、
 * .k3-* 类名钩子清单、优先级说明。
 */
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
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";

const OVERRIDE_CSS = `/* 你的全局样式表 —— 必须在 @thejoven_com/k3blocks/style.css 之后加载 */
.k3-editor.my-brand {
  --accent: #ff5c39;
  --accent-hover: #ff7a5c;
  --accent-soft: rgba(255, 92, 57, 0.12);
  --selection: rgba(255, 92, 57, 0.28);
}`;

const OVERRIDE_TSX = `<K3EditorView editor={editor} theme="dark" className="my-brand" />

// 也可以用任意祖先元素做作用域（变量沿继承链下渗）：
<div className="my-brand">
  <K3EditorView editor={editor} theme="dark" />
</div>`;

const BRANDS = {
  k3: { label: "K3 默认", vars: {} as CSSProperties },
  ember: {
    label: "Ember 橙",
    vars: {
      "--accent": "#ff5c39",
      "--accent-hover": "#ff7a5c",
      "--accent-soft": "rgba(255,92,57,0.12)",
      "--selection": "rgba(255,92,57,0.28)",
    } as CSSProperties,
  },
  violet: {
    label: "Violet 紫",
    vars: {
      "--accent": "#8b5cf6",
      "--accent-hover": "#a78bfa",
      "--accent-soft": "rgba(139,92,246,0.14)",
      "--selection": "rgba(139,92,246,0.30)",
    } as CSSProperties,
  },
};
type BrandKey = keyof typeof BRANDS;

const DEMO_DOC: Block[] = [
  {
    id: "oc1",
    type: "paragraph",
    props: {},
    content: [
      txt("选中这段文字 —— 选区底色、工具栏激活态、"),
      txt("行内代码", { code: true }),
      txt(" 与链接色全都来自 accent 一族变量。"),
    ],
    children: [],
  },
  {
    id: "oc2",
    type: "quote",
    props: {},
    content: [txt("引用块的左边条也是 var(--accent)。")],
    children: [],
  },
  {
    id: "oc3",
    type: "checkListItem",
    props: { checked: true },
    content: [txt("勾选框的填充色同样跟随。")],
    children: [],
  },
];

function BrandDemo() {
  const [brand, setBrand] = useState<BrandKey>("k3");
  const editor = useK3Editor({ initialContent: DEMO_DOC });
  return (
    <DemoFrame
      className="mt-4"
      bar={
        <>
          <Segmented
            options={(Object.keys(BRANDS) as BrandKey[]).map((k) => ({ value: k, label: BRANDS[k].label }))}
            value={brand}
            onChange={setBrand}
          />
          <span className="font-mono text-[12px] text-text-4">
            {brand === "k3" ? "无覆盖" : "祖先作用域注入 4 个 accent 变量"}
          </span>
        </>
      }
      bodyClassName="px-4 py-6 sm:px-6"
    >
      {/* demo 用内联 custom properties 注入；等价于 .k3-editor.my-brand 作用域覆盖 */}
      <div style={BRANDS[brand].vars}>
        <K3EditorView editor={editor} theme="dark" placeholder="输入 '/' 查看命令" />
      </div>
    </DemoFrame>
  );
}

/** .k3-* 类名钩子（节选自 src/k3blocks/theme.css）。 */
const HOOK_ROWS: { cls: string; target: string }[] = [
  { cls: ".k3-editor", target: "组件根元素 —— 变量作用域、字体、选区色都挂在这里" },
  { cls: ".k3-blocks", target: "块列表容器（上下 4px 内边距）" },
  { cls: ".k3-block-row", target: "每个块的行容器（flex：gutter + 主体）" },
  { cls: ".k3-block-children", target: "嵌套子块的 24px 缩进容器" },
  { cls: ".k3-editable", target: "所有 contenteditable 文本区（占位符、光标色）" },
  { cls: ".k3-paragraph / .k3-heading", target: "段落 / 标题块（.k3-h1…h3 分级字号）" },
  { cls: ".k3-quote", target: "引用块（2px accent 左边条）" },
  { cls: ".k3-list-item / .k3-marker", target: "列表块与序号 / 圆点 marker" },
  { cls: ".k3-checkbox / .k3-check-item", target: "待办勾选框（.k3-checked 为完成态）" },
  { cls: ".k3-codeblock", target: "代码块外壳（-bar / -lang / -copy / -body 子件）" },
  { cls: ".k3-divider", target: "分割线（.k3-divider-selected 为选中态）" },
  { cls: ".k3-image / .k3-image-empty", target: "图片块与空占位框（-caption 为说明文字）" },
  { cls: ".k3-mention", target: "mention 原子 chip（行内）" },
  { cls: ".k3-toolbar / .k3-tb-btn", target: "格式化工具栏与按钮（.k3-on 激活态）" },
  { cls: ".k3-slash-menu / .k3-slash-item", target: "斜杠菜单与条目（.k3-active 选中态）" },
  { cls: ".k3-mention-menu", target: "@ mention 建议菜单" },
  { cls: ".k3-side-menu / .k3-side-btn", target: "块 gutter 侧边菜单（.k3-visible 可见态）" },
  { cls: ".k3-menu-item / .k3-grip-menu", target: "⠿ 点击菜单与通用菜单条目" },
  { cls: ".k3-columns", target: "分栏 grid（--k3-cols 由视图按栏数注入）" },
  { cls: ".k3-table / .k3-table-cell", target: "表格块与可编辑单元格" },
  { cls: ".k3-math / .k3-diagram", target: "公式 / 图表块外壳" },
  { cls: ".k3-embed-frame / .k3-embed-empty", target: "嵌入块 iframe 框与占位框" },
  { cls: ".k3-drop-indicator", target: "拖拽落点的 2px accent 指示线" },
];

export default function StylingOverridingCss() {
  return (
    <DocsShell
      crumbs={["Docs", "Styling", "Overriding CSS"]}
      title="Overriding CSS."
      lead="组件样式 100% 由 CSS 变量驱动、零内联色值 —— 换品牌色只需覆盖四个 accent 变量；需要更细的改造时，所有 .k3- 类名都是稳定钩子。"
      wide
    >
      <H2 id="variables">变量覆盖。</H2>
      <P>
        覆盖声明必须落在 <InlineCode>@thejoven_com/k3blocks/style.css</InlineCode>{" "}
        <strong>之后</strong>加载的样式表里，作用域选择器用{" "}
        <InlineCode>.k3-editor</InlineCode> 加上你自己的类（经{" "}
        <InlineCode>className</InlineCode> 挂到根元素），或任意祖先元素：
      </P>
      <CodeBlock className="mt-4" code={OVERRIDE_CSS} language="css" />
      <CodeBlock className="mt-3" code={OVERRIDE_TSX} language="tsx" />
      <P>
        主题令牌全表（14 个变量、双主题色值）见{" "}
        <MonoCell accent>Themes</MonoCell> 一章 —— 任意变量都可以这样覆盖。
      </P>

      <H2 id="demo">品牌色变体。</H2>
      <P>
        下面是真实编辑器：切换分段控件，在编辑器祖先作用域注入不同的 accent
        变量组 —— 选区、引用边条、勾选框、行内代码底色一次换完。
      </P>
      <BrandDemo />

      <H2 id="hooks">.k3- 类名钩子清单。</H2>
      <P>
        变量覆盖搞不定的结构性微调（间距、圆角、排版），直接对以下类名写规则。
        全部类名以 <InlineCode>k3-</InlineCode> 前缀保留，视为公共 API：
      </P>
      <DocTable
        columns={["类名", "挂载目标"]}
        rows={HOOK_ROWS.map((r) => [
          <MonoCell key="c" accent>
            {r.cls}
          </MonoCell>,
          r.target,
        ])}
      />

      <H2 id="specificity">优先级说明。</H2>
      <DocTable
        columns={["层级", "选择器 / 来源", "优先级要点"]}
        rows={[
          [
            "内置主题",
            <MonoCell key="s">{`.k3-editor[data-theme="dark|light"]`}</MonoCell>,
            "组件样式表内声明，最低层；被任何同优先级的后续声明覆盖",
          ],
          [
            "你的覆盖",
            <MonoCell key="s">.k3-editor.my-brand</MonoCell>,
            "0-2-0 优先级高于内置的 0-2-0 时靠加载顺序 —— 必须 after style.css；更稳妥是再加一层（如 .my-app .k3-editor）",
          ],
          [
            "domAttributes / className",
            <MonoCell key="s">prop 注入</MonoCell>,
            "className 只是追加类，不直接产生优先级；优先级由你的选择器写法决定",
          ],
          [
            "运行时注入变量",
            <MonoCell key="s">{`style={{ "--accent": … }}`}</MonoCell>,
            "内联 custom property 优先级最高（demo 即此方式），适合按租户/文档动态换色",
          ],
        ]}
      />
      <Callout className="mt-4">
        不要用 <InlineCode>!important</InlineCode> 覆盖组件内部布局属性（flex
        结构、gutter 宽度）—— 侧边菜单、拖拽指示线的几何依赖这些值。优先改变量，
        其次改外观属性（颜色 / 圆角 / 字距），结构性覆写自担回归风险。
      </Callout>

      <H2 id="next">接下来。</H2>
      <CardStrip
        cards={[
          { to: "/docs/styling/themes", title: "Themes", description: "14 个主题令牌的双主题全表。" },
          { to: "/docs/styling/dom-attributes", title: "DOM attributes", description: "给根元素与块行注入自定义属性。" },
          { to: "/docs/foundations/theming", title: "Theming（指南）", description: "主题机制的叙事式讲解。" },
        ]}
      />
    </DocsShell>
  );
}
