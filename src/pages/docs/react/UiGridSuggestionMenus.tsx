/**
 * /docs/react/grid-suggestion-menus — ":" emoji 网格建议菜单：触发、网格键盘导航、
 * EMOJI_LIST 静态表、emojiPicker={false} 开关；live demo（可开关对照）。
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
import { txt } from "@/components/docs/utils";
import { useK3Editor, K3EditorView, EMOJI_LIST } from "@/k3blocks";
import type { Block } from "@/k3blocks";

const DEMO_DOC: Block[] = [
  {
    id: "em1",
    type: "paragraph",
    props: {},
    content: [txt("在这里输入英文冒号 : 接一个关键词，比如 :smile 或 :笑 —— ")],
    children: [],
  },
  { id: "em2", type: "paragraph", props: {}, content: [], children: [] },
];

const TOGGLE_SNIPPET = `// emoji 网格菜单默认开启；如需关闭：
const editor = useK3Editor({ emojiPicker: false });`;

const EMOJI_ITEM_SHAPE = `// EMOJI_LIST 从包入口导出，可用于自建面板
import { EMOJI_LIST } from "@k3/blocks";

interface K3EmojiItem {
  emoji: string;    // "😂"
  keywords: string; // "joy laugh tears 笑哭 爆笑"（空格分隔，中英文混合）
}`;

function EmojiDemo() {
  const [on, setOn] = useState(true);
  const editor = useK3Editor({ initialContent: DEMO_DOC, emojiPicker: on });
  return (
    <DemoFrame
      className="mt-4"
      bar={
        <>
          <SwitchRow label="emoji 网格菜单" prop="emojiPicker" checked={on} onChange={setOn} />
          <span className="font-mono text-[12px] text-text-4">
            {on ? "输入 : 触发" : "已关闭 —— : 只是普通字符"}
          </span>
        </>
      }
      bodyClassName="px-4 py-6 sm:px-6"
    >
      <K3EditorView editor={editor} placeholder="输入 : 试试 emoji 菜单" />
    </DemoFrame>
  );
}

export default function UiGridSuggestionMenus() {
  return (
    <DocsShell
      crumbs={["Docs", "React", "Grid suggestion menus"]}
      title="Grid suggestion menus."
      lead="文本块里输入 : 弹出 8 列 emoji 网格 —— 280+ 内置静态表、中英文关键词模糊过滤、全键盘网格导航。"
    >
      <H2 id="trigger">触发方式。</H2>
      <P>
        在文本块内输入 <Kbd>:</Kbd> 即弹出网格菜单。触发有守卫：
        <strong>前一个字符必须是行首、空白或标点</strong>，因此{" "}
        <InlineCode>12:30</InlineCode> 这样的时间写法不会误触发；中文输入法
        composition 期间同样不触发。随后输入的字符成为查询词，实时过滤网格。
      </P>

      <H2 id="grid">网格与键盘导航。</H2>
      <P>
        菜单是 8 列网格，一次最多展示 48 条（6 行）。导航是二维的：
      </P>
      <DocTable
        columns={["按键", "行为"]}
        rows={[
          [<span key="k"><Kbd>↑</Kbd> <Kbd>↓</Kbd> <Kbd>←</Kbd> <Kbd>→</Kbd></span>, "网格内移动选中项（跨行换列）"],
          [<span key="k"><Kbd>↵</Kbd> / <Kbd>Tab</Kbd></span>, "插入选中 emoji —— :query 被替换为普通文本 emoji"],
          [<span key="k"><Kbd>esc</Kbd></span>, "关闭菜单，:query 原样保留为文本"],
        ]}
      />
      <P>
        弹层锚定在当前光标位置（与 @ mention 菜单共用 caret 定位逻辑），
        插入的 emoji 是普通文本节点，撤销 / 重做 / onChange 天然生效。
      </P>

      <H2 id="demo">在线体验。</H2>
      <P>输入 <Kbd>:</Kbd> 再输入关键词过滤；关掉开关后 <Kbd>:</Kbd> 退化为普通字符。</P>
      <EmojiDemo />

      <H2 id="emoji-list">EMOJI_LIST 静态表。</H2>
      <P>
        候选来自内置静态表 <InlineCode>EMOJI_LIST</InlineCode>（
        {EMOJI_LIST.length} 条常用 emoji），每条带中英文混合关键词；过滤是子序列模糊匹配
        （<InlineCode>smile</InlineCode> 与 <InlineCode>笑</InlineCode>{" "}
        都能命中 😄）。表本身从包入口导出，可用于在编辑器外自建 emoji 面板：
      </P>
      <CodeBlock className="mt-4" code={EMOJI_ITEM_SHAPE} language="ts" />
      <Callout className="mt-4">
        候选集是静态数组、不可注入 —— 如果产品需要自定义 emoji 集，当前路径是关掉内置
        picker（<InlineCode>emojiPicker=&#123;false&#125;</InlineCode>）后自建。
      </Callout>

      <H2 id="disable">关闭菜单。</H2>
      <P>
        <InlineCode>emojiPicker</InlineCode> 是{" "}
        <InlineCode>useK3Editor</InlineCode> 的选项（默认{" "}
        <InlineCode>true</InlineCode>），不是视图 prop：
      </P>
      <CodeBlock className="mt-4" code={TOGGLE_SNIPPET} language="tsx" />

      <H2 id="i18n">字典键。</H2>
      <DocTable
        columns={["键", "默认文案（zhCN）"]}
        rows={[[<MonoCell key="k" accent>emoji.empty</MonoCell>, "无匹配表情"]]}
      />

      <H2 id="next">接下来。</H2>
      <CardStrip
        cards={[
          { to: "/docs/react/suggestion-menus", title: "Suggestion menus", description: "/ 与 @ 建议菜单的统一机制。" },
          { to: "/docs/react/formatting-toolbar", title: "Formatting toolbar", description: "另一个选区驱动的浮层 UI。" },
          { to: "/docs/api", title: "API reference", description: "emojiPicker 选项的表格速查。" },
        ]}
      />
    </DocsShell>
  );
}
