/**
 * /docs/react/block-side-menu — 块侧边菜单：「+」插入、⠿ 拖拽排序与点击菜单
 * （删除/复制/转换为）、sideMenu={false} 开关、只读自动隐藏；live demo。
 */
import { useState } from "react";
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
  SwitchRow,
} from "@/components/docs/primitives";
import { txt } from "@/components/docs/utils";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";

const DEMO_DOC: Block[] = [
  {
    id: "sm1",
    type: "paragraph",
    props: {},
    content: [txt("把鼠标悬停在这一行 —— 左侧 gutter 会浮出「+」和 ⠿ 两个按钮。")],
    children: [],
  },
  {
    id: "sm2",
    type: "quote",
    props: {},
    content: [txt("点 ⠿ 打开菜单，试试把这条引用「转换为」标题，或者复制一份。")],
    children: [],
  },
  {
    id: "sm3",
    type: "bulletListItem",
    props: {},
    content: [txt("按住 ⠿ 把我拖到第一行去 —— 落点有一条 accent 指示线。")],
    children: [],
  },
];

const TOGGLE_SNIPPET = `// 关闭侧边菜单（拖拽排序也随之关闭）
<K3EditorView editor={editor} sideMenu={false} />`;

function SideMenuDemo() {
  const [on, setOn] = useState(true);
  const editor = useK3Editor({ initialContent: DEMO_DOC });
  return (
    <DemoFrame
      className="mt-4"
      bar={
        <>
          <SwitchRow label="侧边菜单" prop="sideMenu" checked={on} onChange={setOn} />
          <span className="font-mono text-[12px] text-text-4">
            {on ? "悬停任意块查看 gutter" : "已关闭 —— gutter 不再出现"}
          </span>
        </>
      }
      bodyClassName="px-4 py-6 sm:px-6"
    >
      <K3EditorView editor={editor} sideMenu={on} placeholder="输入 '/' 查看命令" />
    </DemoFrame>
  );
}

export default function UiBlockSideMenu() {
  return (
    <DocsShell
      crumbs={["Docs", "React", "Block side menu"]}
      title="Block side menu."
      lead="块左侧 gutter 里的两个 28px 按钮：「+」在下方插入，⠿ 拖拽排序、点击打开删除 / 复制 / 转换为菜单。"
    >
      <H2 id="buttons">两个按钮。</H2>
      <P>
        鼠标悬停任意块时，其左侧 52px gutter 浮出侧边菜单（透明度过渡 150ms；
        分栏内的块用整行 hover 高亮替代 gutter）。两个按钮：
      </P>
      <DocTable
        columns={["按钮", "提示（title）", "行为"]}
        rows={[
          [
            <MonoCell key="b" accent>+</MonoCell>,
            "在下方插入块",
            "在该块下方插入一个新段落并聚焦（配合 Markdown 行首规则或 / 菜单继续塑形）",
          ],
          [
            <MonoCell key="b" accent>⠿</MonoCell>,
            "拖拽排序 / 点击打开菜单",
            "按住拖拽：移动块排序，落点显示 2px accent 指示线；点击：弹出操作菜单",
          ],
        ]}
      />

      <H2 id="menu">点击菜单。</H2>
      <P>点击 ⠿ 弹出的菜单（176px 浮层）有三个动作：</P>
      <DocTable
        columns={["菜单项", "行为"]}
        rows={[
          [<MonoCell key="m" accent>删除</MonoCell>, "删除该块（含全部子块），入撤销栈"],
          [<MonoCell key="m" accent>复制</MonoCell>, "在原块下方插入一份深拷贝（新 id）"],
          [
            <MonoCell key="m" accent>转换为 ▸</MonoCell>,
            "子菜单：段落 / 标题 1-3 / 引用 / 三种列表 / 代码块；保留文本内容换 type",
          ],
        ]}
      />
      <P>
        「转换为」的目标列表受{" "}
        <DocLink to="/docs/react/suggestion-menus">blockTypes 白名单</DocLink>{" "}
        与 <InlineCode>blockConfig.heading.levels</InlineCode>{" "}
        裁剪；容器块（分栏 / 列）与无文本块（分割线、图片、表格、公式、嵌入、图表、PDF）
        不参与「转换为」。
      </P>

      <H2 id="demo">在线体验。</H2>
      <P>悬停、点击、拖拽都试一遍；关掉开关后 gutter 完全消失。</P>
      <SideMenuDemo />

      <H2 id="disable">关闭与自动隐藏。</H2>
      <P>
        传 <InlineCode>sideMenu=&#123;false&#125;</InlineCode>{" "}
        整体关闭（默认 <InlineCode>true</InlineCode>）—— 「+」、⠿
        与拖拽排序一并消失。只读渲染（<InlineCode>editable=&#123;false&#125;</InlineCode>）
        时侧边菜单<strong>自动隐藏</strong>，无需额外处理。
      </P>
      <CodeBlock className="mt-4" code={TOGGLE_SNIPPET} language="tsx" />

      <Callout className="mt-6" title="已知限制">
        拖拽排序不支持跨栏移动（分栏内的块只能在栏内重排）；菜单文案可经{" "}
        <InlineCode>sideMenu.*</InlineCode> 字典键覆盖（
        <InlineCode>insertBelow / dragHandle / delete / duplicate / convertTo / convertItems.*</InlineCode>）。
      </Callout>

      <H2 id="next">接下来。</H2>
      <CardStrip
        cards={[
          { to: "/docs/react/suggestion-menus", title: "Suggestion menus", description: "/ 斜杠菜单 —— 另一种插入入口。" },
          { to: "/docs/foundations/manipulating-blocks", title: "Manipulating blocks", description: "用实例方法程序化地完成同样操作。" },
          { to: "/docs/api", title: "API reference", description: "sideMenu prop 的表格速查。" },
        ]}
      />
    </DocsShell>
  );
}
