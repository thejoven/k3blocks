/**
 * /docs/react/suggestion-menus — 建议菜单统一机制：/ 斜杠与 @ mention 的触发字符、
 * 模糊过滤、分组、键盘、定位；菜单项结构；白名单与 blockConfig 的影响；live demo。
 */
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
} from "@/components/docs/primitives";
import { txt } from "@/components/docs/utils";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";

const DEMO_DOC: Block[] = [
  {
    id: "sg1",
    type: "paragraph",
    props: {},
    content: [txt("输入 / 打开斜杠菜单，输入 @ 提及一位成员 —— 两个菜单是同一套机制。")],
    children: [],
  },
  { id: "sg2", type: "paragraph", props: {}, content: [], children: [] },
];

const MENTIONS = [
  { id: "u1", label: "张三", subtext: "zhangsan@k3.io" },
  { id: "u2", label: "李四", subtext: "lisi@k3.io" },
  { id: "u3", label: "Alice", subtext: "alice@k3.io" },
  { id: "u4", label: "Bob" },
];

function SuggestionDemo() {
  const editor = useK3Editor({ initialContent: DEMO_DOC, mentions: { items: MENTIONS } });
  return (
    <DemoFrame className="mt-4" bodyClassName="px-4 py-6 sm:px-6">
      <K3EditorView editor={editor} placeholder="输入 / 或 @ 触发建议菜单" />
    </DemoFrame>
  );
}

const MENTIONS_SNIPPET = `const editor = useK3Editor({
  mentions: {
    items: [
      { id: "u1", label: "张三", subtext: "zhangsan@k3.io" },
      { id: "u2", label: "Alice" },
    ],
    trigger: "@", // 默认 "@"，可自定义（单字符）
  },
});`;

const SLASH_ITEM_SHAPE = `// 斜杠菜单条目（内置 SLASH_ITEMS，共 17 项）：
interface SlashItem {
  id: string;                 // "h1" | "table" | …
  label: string;              // 展示名（走 slashMenu.items.* 字典）
  group: "basic" | "media";   // 分组小标
  keywords: string;           // 过滤关键词（含拼音/英文别名）
  hint?: string;              // 右侧 mono 提示（如 "#"、"\`\`\`"）
  icon: string;               // 28px 图标格
  type: string;               // 插入的块 type
  props: Record<string, any>; // 插入的初始 props
}`;

const WHITELIST_SNIPPET = `useK3Editor({
  // 白名单：斜杠菜单与「转换为」只显示列出的类型，
  // 被移除类型的 Markdown 行首规则（如 \`#\`、\`-\`）同步失效
  blockTypes: ["paragraph", "heading", "image"],
  blockConfig: {
    // 标题级别裁剪：H3 菜单项隐藏，"###"+空格 规则失效
    heading: { levels: [1, 2] },
  },
});`;

export default function UiSuggestionMenus() {
  return (
    <DocsShell
      crumbs={["Docs", "React", "Suggestion menus"]}
      title="Suggestion menus."
      lead="/ 斜杠菜单与 @ mention 是同一套建议菜单机制：触发字符、模糊过滤、分组渲染、全键盘操作、光标锚点定位。"
    >
      <H2 id="mechanism">统一机制。</H2>
      <P>
        两种菜单共享一套弹层实现，只是触发字符与数据源不同：
      </P>
      <DocTable
        columns={["", "/ 斜杠菜单", "@ mention 菜单"]}
        rows={[
          [<MonoCell key="r" accent>触发</MonoCell>, "文本块内输入 /", "输入 @（需先配置 mentions）"],
          [<MonoCell key="r" accent>触发守卫</MonoCell>, "行首或块内任意位置", "前一字符须为行首 / 空白 / 标点（user@host.com 不弹）"],
          [<MonoCell key="r" accent>数据源</MonoCell>, "内置 SLASH_ITEMS（17 项块类型）", "mentions.items（宿主提供的候选数组）"],
          [<MonoCell key="r" accent>过滤</MonoCell>, "label + keywords 模糊匹配（含拼音/英文别名）", "label / subtext / id 模糊匹配"],
          [<MonoCell key="r" accent>分组</MonoCell>, "Basic blocks / Media 两组小标", "单组（圆形 avatar + label + subtext）"],
          [<MonoCell key="r" accent>插入结果</MonoCell>, "替换当前块 / 在下方插入所选块类型", "光标处插入原子 mention chip，吃掉 @query"],
          [<MonoCell key="r" accent>空态字典键</MonoCell>, <MonoCell key="m">slashMenu.empty</MonoCell>, <MonoCell key="m">mentions.empty</MonoCell>],
        ]}
      />
      <P>
        两者都在中文输入法 composition 期间不触发；弹层用{" "}
        <InlineCode>position: fixed</InlineCode> 锚定光标处，不受容器 overflow 裁剪。
      </P>

      <H2 id="keyboard">键盘操作。</H2>
      <DocTable
        columns={["按键", "行为"]}
        rows={[
          [<span key="k"><Kbd>↑</Kbd> <Kbd>↓</Kbd></span>, "移动选中项（跨分组连续移动）"],
          [<span key="k"><Kbd>↵</Kbd></span>, "插入选中项"],
          [<span key="k"><Kbd>esc</Kbd></span>, "关闭菜单，已输入的触发字符与查询保留为文本"],
          [<MonoCell key="k">继续输入</MonoCell>, "追加到查询词，实时过滤"],
        ]}
      />
      <P>
        斜杠菜单底部常驻 footer 提示条（<Kbd>↑↓</Kbd> 选择 · <Kbd>↵</Kbd> 插入 ·{" "}
        <Kbd>esc</Kbd> 关闭），文案对应字典键{" "}
        <InlineCode>slashMenu.footerSelect / footerInsert / footerClose</InlineCode>。
      </P>

      <H2 id="demo">在线体验。</H2>
      <P>下面的编辑器配置了 4 位成员的 mentions —— <Kbd>/</Kbd> 与 <Kbd>@</Kbd> 都试试。</P>
      <SuggestionDemo />

      <H2 id="items">菜单项结构。</H2>
      <P>
        斜杠菜单的每个条目对应一个块类型插入动作；mention 候选的结构更简单（
        <InlineCode>id / label / subtext?</InlineCode>）：
      </P>
      <CodeBlock className="mt-4" code={SLASH_ITEM_SHAPE} language="ts" />
      <CodeBlock className="mt-3" code={MENTIONS_SNIPPET} language="tsx" />
      <Callout className="mt-4">
        mention 插入后是<strong>原子 chip</strong>（accent-soft 底、accent 字、
        contenteditable="false"）：不可局部编辑，Backspace 整体删除；模型为{" "}
        <InlineCode>{`{ type: "mention", props: { id, label } }`}</InlineCode>，JSON
        无损序列化。候选集是静态数组 —— 异步加载需在组件外自行维护后重新传入。
      </Callout>

      <H2 id="whitelist">白名单与 blockConfig 的影响。</H2>
      <P>
        斜杠菜单的条目不是铁板一块，两个 editor 选项会直接裁剪它（「转换为」
        菜单同步裁剪）：
      </P>
      <CodeBlock className="mt-4" code={WHITELIST_SNIPPET} language="tsx" />
      <DocTable
        columns={["选项", "对菜单的影响"]}
        rows={[
          [
            <MonoCell key="o" accent>blockTypes</MonoCell>,
            "未列出类型的菜单项隐藏；这些类型的 Markdown 行首规则同时失效；insertBlocks 遇到非白名单 type 递归降级为 paragraph",
          ],
          [
            <MonoCell key="o" accent>blockConfig.heading.levels</MonoCell>,
            "按级别过滤标题条目（如 [1,2] 时 H3 隐藏）；#~### 行首规则仅对允许级别生效",
          ],
          [
            <MonoCell key="o" accent>blockConfig.codeBlock.defaultLanguage</MonoCell>,
            "新代码块的初始 language 与右上角语言标签默认",
          ],
        ]}
      />
      <P>
        关闭入口本身：斜杠菜单用视图 prop{" "}
        <InlineCode>slashMenu=&#123;false&#125;</InlineCode>；mention 菜单只要不在{" "}
        <InlineCode>useK3Editor</InlineCode> 里配置 <InlineCode>mentions</InlineCode>{" "}
        即不存在；emoji 网格菜单（<Kbd>:</Kbd> 触发）见{" "}
        <MonoCell accent>emojiPicker</MonoCell> 选项，单独成章。
      </P>

      <H2 id="next">接下来。</H2>
      <CardStrip
        cards={[
          { to: "/docs/react/grid-suggestion-menus", title: "Grid suggestion menus", description: ": 触发的 emoji 网格菜单。" },
          { to: "/docs/react/block-side-menu", title: "Block side menu", description: "「转换为」菜单与斜杠菜单共享裁剪规则。" },
          { to: "/docs/api", title: "API reference", description: "slashMenu / mentions / blockTypes 速查。" },
        ]}
      />
    </DocsShell>
  );
}
