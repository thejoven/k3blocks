/**
 * /docs/react/formatting-toolbar — 选区悬浮格式化工具栏：触发机制、按钮清单、
 * 颜色下拉、formattingToolbar={false} 开关；live demo（可开关对照）。
 */
import { useState } from "react";
import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import Kbd from "@/components/Kbd";
import DocsShell from "@/components/docs/DocsShell";
import {
  CardStrip,
  DemoFrame,

  DocTable,
  H2,
  InlineCode,
  MonoCell,
  P,
  SwitchRow,
} from "@/components/docs/primitives";
import { lnk, txt } from "@/components/docs/utils";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";

const DEMO_DOC: Block[] = [
  {
    id: "ft1",
    type: "paragraph",
    props: {},
    content: [
      txt("选中这段文字的任意一部分 —— 工具栏会在选区上方浮出。"),
    ],
    children: [],
  },
  {
    id: "ft2",
    type: "paragraph",
    props: {},
    content: [
      txt("已经存在的格式会点亮对应按钮，比如"),
      txt("粗体", { bold: true }),
      txt("、"),
      txt("行内代码", { code: true }),
      txt(" 和 "),
      lnk("https://github.com/thejoven/k3blocks", "链接"),
      txt("。"),
    ],
    children: [],
  },
  {
    id: "ft3",
    type: "paragraph",
    props: {},
    content: [txt("还可以给文字上"), txt("颜色", { textColor: "#e03131" }), txt("和"), txt("高亮", { backgroundColor: "#1971c233" }), txt("。")],
    children: [],
  },
];

const TOGGLE_SNIPPET = `// 关闭悬浮工具栏（快捷键 ⌘B/I/U/E/K 仍然有效）
<K3EditorView editor={editor} formattingToolbar={false} />`;

function ToolbarDemo() {
  const [on, setOn] = useState(true);
  const editor = useK3Editor({ initialContent: DEMO_DOC });
  return (
    <DemoFrame
      className="mt-4"
      bar={
        <>
          <SwitchRow label="格式化工具栏" prop="formattingToolbar" checked={on} onChange={setOn} />
          <span className="font-mono text-[12px] text-text-4">
            {on ? "选中文字即可浮出" : "已关闭 —— 快捷键仍可用"}
          </span>
        </>
      }
      bodyClassName="px-4 py-6 sm:px-6"
    >
      <K3EditorView editor={editor} formattingToolbar={on} placeholder="输入 '/' 查看命令" />
    </DemoFrame>
  );
}

export default function UiFormattingToolbar() {
  return (
    <DocsShell
      crumbs={["Docs", "React", "Formatting toolbar"]}
      title="Formatting toolbar."
      lead="选中文字时浮出的迷你工具栏：六个格式按钮加两个颜色下拉，全部 28px 刻度，可用 formattingToolbar prop 整体关闭。"
    >
      <H2 id="trigger">触发机制。</H2>
      <P>
        工具栏监听编辑器的选区：当选区<strong>非折叠</strong>（选中了至少一个字符）且位于
        编辑器内时，工具栏浮现在选区上方居中位置（<InlineCode>position: fixed</InlineCode>，
        不受容器 overflow 裁剪）；选区折叠为空光标、移出编辑器或被清空时自动隐藏。
        选区跨块时同样生效，对覆盖到的所有行内内容应用格式。
      </P>
      <P>
        按钮的点亮态来自选区起点的行内样式 —— 选中一段已是粗体的文字，{" "}
        <MonoCell>B</MonoCell> 按钮呈现激活色。
      </P>

      <H2 id="buttons">按钮清单。</H2>
      <DocTable
        columns={["按钮", "快捷键", "写入模型", "说明"]}
        rows={[
          [<MonoCell key="b" accent>B</MonoCell>, <span key="k"><Kbd>⌘B</Kbd></span>, <MonoCell key="m">styles.bold</MonoCell>, "加粗"],
          [<MonoCell key="b" accent>I</MonoCell>, <span key="k"><Kbd>⌘I</Kbd></span>, <MonoCell key="m">styles.italic</MonoCell>, "斜体"],
          [<MonoCell key="b" accent>U</MonoCell>, <span key="k"><Kbd>⌘U</Kbd></span>, <MonoCell key="m">styles.underline</MonoCell>, "下划线"],
          [<MonoCell key="b" accent>S</MonoCell>, <MonoCell key="k">—</MonoCell>, <MonoCell key="m">styles.strike</MonoCell>, "删除线"],
          [<MonoCell key="b" accent>code</MonoCell>, <span key="k"><Kbd>⌘E</Kbd></span>, <MonoCell key="m">styles.code</MonoCell>, "行内代码（accent-soft 底 + mono）"],
          [<MonoCell key="b" accent>link</MonoCell>, <span key="k"><Kbd>⌘K</Kbd></span>, <MonoCell key="m">{`{ type: "link", href }`}</MonoCell>, "链接：展开为 28px 输入框，回车确认；详见 Link toolbar"],
          [<MonoCell key="b" accent>文字颜色 ▾</MonoCell>, <MonoCell key="k">—</MonoCell>, <MonoCell key="m">styles.textColor</MonoCell>, "下拉色板：default / red / orange / green / blue / gray"],
          [<MonoCell key="b" accent>高亮 ▾</MonoCell>, <MonoCell key="k">—</MonoCell>, <MonoCell key="m">styles.backgroundColor</MonoCell>, "同色系 20% 透明底色；default 清除"],
        ]}
      />
      <P>
        色板的五个色值：<MonoCell>#e03131</MonoCell> red · <MonoCell>#e8590c</MonoCell>{" "}
        orange · <MonoCell>#2f9e44</MonoCell> green · <MonoCell>#1971c2</MonoCell> blue ·{" "}
        <MonoCell>#868e96</MonoCell> gray。当前生效色带勾，选{" "}
        <InlineCode>default</InlineCode> 清除颜色。颜色写入模型为 hex（DOM 侧的{" "}
        <InlineCode>rgb()/rgba()</InlineCode> 会归一化为 hex / hex8）；Markdown 导出忽略颜色。
      </P>

      <H2 id="demo">在线体验。</H2>
      <P>选中任意文字触发工具栏；用开关把它关掉，验证快捷键路径仍然完整。</P>
      <ToolbarDemo />

      <H2 id="disable">关闭工具栏。</H2>
      <P>
        传 <InlineCode>formattingToolbar=&#123;false&#125;</InlineCode>{" "}
        即可整体关闭（默认 <InlineCode>true</InlineCode>）。只读渲染（
        <InlineCode>editable=&#123;false&#125;</InlineCode>）时工具栏也不会出现。
        关闭后所有格式仍可通过键盘快捷键与 Markdown 行内规则（如{" "}
        <InlineCode>**bold**</InlineCode>）写入。
      </P>
      <CodeBlock className="mt-4" code={TOGGLE_SNIPPET} language="tsx" />

      <Callout className="mt-6" title="已知限制">
        颜色基于浏览器 <InlineCode>execCommand("foreColor" / "hiliteColor")</InlineCode>{" "}
        实现：清除（default）作用于选区所在的整个同色元素 —— 选区只覆盖一部分时，
        会连带清除未选中同色文字的颜色。
      </Callout>

      <H2 id="i18n">字典键。</H2>
      <P>
        按钮提示与色板文案均可在 <InlineCode>dictionary</InlineCode> 中覆盖：
      </P>
      <DocTable
        columns={["键", "默认文案（zhCN）"]}
        rows={[
          [<MonoCell key="k" accent>formattingToolbar.bold</MonoCell>, "加粗 ⌘B"],
          [<MonoCell key="k" accent>formattingToolbar.italic</MonoCell>, "斜体 ⌘I"],
          [<MonoCell key="k" accent>formattingToolbar.underline</MonoCell>, "下划线 ⌘U"],
          [<MonoCell key="k" accent>formattingToolbar.strike</MonoCell>, "删除线"],
          [<MonoCell key="k" accent>formattingToolbar.inlineCode</MonoCell>, "行内代码 ⌘E"],
          [<MonoCell key="k" accent>formattingToolbar.link</MonoCell>, "链接 ⌘K"],
          [<MonoCell key="k" accent>formattingToolbar.linkInputPlaceholder</MonoCell>, "输入链接，回车确认"],
          [<MonoCell key="k" accent>formattingToolbar.textColor / highlight</MonoCell>, "文字颜色 / 背景色"],
          [<MonoCell key="k" accent>formattingToolbar.colorDefault … colorGray</MonoCell>, "默认 / 红色 / 橙色 / 绿色 / 蓝色 / 灰色"],
        ]}
      />

      <H2 id="next">接下来。</H2>
      <CardStrip
        cards={[
          { to: "/docs/react/link-toolbar", title: "Link toolbar", description: "⌘K 链接的创建、编辑与剥除。" },
          { to: "/docs/features/inline-content", title: "Inline content", description: "styles 写入的数据模型详解。" },
          { to: "/docs/api", title: "API reference", description: "formattingToolbar prop 的表格速查。" },
        ]}
      />
    </DocsShell>
  );
}
