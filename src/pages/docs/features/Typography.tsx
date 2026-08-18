/**
 * /docs/features/typography — 排版：标题 1-3、段落、引用、行内样式，
 * 字重与对齐的设计规则；live demo + Markdown 行首规则对照表。
 */
import Kbd from "@/components/Kbd";
import DocsShell from "@/components/docs/DocsShell";
import LiveDemo from "@/components/docs/LiveDemo";
import {
  CardStrip,
  DocTable,
  H2,
  InlineCode,
  MonoCell,
  P,
} from "@/components/docs/primitives";
import { lnk, txt } from "@/components/docs/utils";
import type { Block } from "@/k3blocks";

/* ------------------------------- live demo ------------------------------- */

const DEMO_DOC: Block[] = [
  { id: "ty1", type: "heading", props: { level: 1 }, content: [txt("一级标题")], children: [] },
  { id: "ty2", type: "heading", props: { level: 2 }, content: [txt("二级标题")], children: [] },
  { id: "ty3", type: "heading", props: { level: 3 }, content: [txt("三级标题")], children: [] },
  {
    id: "ty4",
    type: "paragraph",
    props: {},
    content: [
      txt("段落承载"),
      txt("粗体", { bold: true }),
      txt("、"),
      txt("斜体", { italic: true }),
      txt("、"),
      txt("下划线", { underline: true }),
      txt("、"),
      txt("删除线", { strike: true }),
      txt("、"),
      txt("行内代码", { code: true }),
      txt(" 与 "),
      lnk("https://github.com/thejoven/k3blocks", "链接"),
      txt("。"),
    ],
    children: [],
  },
  { id: "ty5", type: "quote", props: {}, content: [txt("引用：克制的强调。")], children: [] },
  { id: "ty6", type: "paragraph", props: {}, content: [], children: [] },
];

/* ---------------------------------- 页面 ---------------------------------- */

export default function Typography() {
  return (
    <DocsShell
      crumbs={["Docs", "Features", "Typography"]}
      title="Typography."
      lead="标题三级、段落一种、引用一条强调线。K3Blocks 用字号阶梯与字重建立秩序，而不是提供一排对齐按钮。"
    >
      <H2 id="scale">字号阶梯。</H2>
      <P>
        标题固定三级（<InlineCode>props.level: 1 | 2 | 3</InlineCode>
        ），统一 600 字重、顶部 12px 呼吸空间；级别越低字距收得越紧。段落 16px
        正文，引用以 2px 强调条内缩呈现。
      </P>
      <DocTable
        columns={["元素", "规格", "字重 / 字距"]}
        rows={[
          [<MonoCell>heading · level 1</MonoCell>, "32px / 1.2", "600 · -0.025em"],
          [<MonoCell>heading · level 2</MonoCell>, "24px / 1.3", "600 · -0.015em"],
          [<MonoCell>heading · level 3</MonoCell>, "17px / 1.4", "600 · 0"],
          [<MonoCell>paragraph</MonoCell>, "16px / 1.65", "400 · 0"],
          [<MonoCell>quote</MonoCell>, "16px，左侧 2px 强调条", "--text-2"],
        ]}
      />
      <P className="mt-3">
        设计规则：没有居中对齐与右对齐——所有文本左对齐，层级只靠字号与字重区分；
        强调只靠行内样式（bold / italic / underline / strike / code），不提供颜色与字号覆盖。
        这让任何文档在任何主题下都保持同一套排版秩序。
      </P>

      <H2 id="inline">行内样式。</H2>
      <P>
        行内样式存于 <InlineCode>content</InlineCode> 的 <InlineCode>styles</InlineCode>{" "}
        字段而非 props，详见 <InlineCode>InlineContent</InlineCode> 模型页。选中文本后唤出格式化工具栏，
        或使用快捷键 <Kbd>⌘B</Kbd> <Kbd>⌘I</Kbd> <Kbd>⌘U</Kbd> <Kbd>⌘E</Kbd> <Kbd>⌘K</Kbd>。
      </P>

      <H2 id="demo">在线体验。</H2>
      <P>下面的编辑器种子包含全部排版元素——直接编辑，或选中文字试试格式化工具栏。</P>
      <LiveDemo
        className="mt-4"
        seed={DEMO_DOC}
        hints={[
          { keys: ["#", "Space"], text: "行首输入切换标题级别" },
          { keys: ["⌘", "B"], text: "加粗选中文字" },
          { keys: [">", "Space"], text: "行首转换为引用" },
        ]}
      />

      <H2 id="markdown-rules">Markdown 行首规则。</H2>
      <P>在空块行首输入以下序列即可就地转换块类型，无需打开菜单：</P>
      <DocTable
        columns={["输入", "按键序列", "结果"]}
        rows={[
          [<MonoCell>#</MonoCell>, <span className="flex gap-1"><Kbd>#</Kbd><Kbd>Space</Kbd></span>, "标题 1"],
          [<MonoCell>##</MonoCell>, <span className="flex gap-1"><Kbd>##</Kbd><Kbd>Space</Kbd></span>, "标题 2"],
          [<MonoCell>###</MonoCell>, <span className="flex gap-1"><Kbd>###</Kbd><Kbd>Space</Kbd></span>, "标题 3"],
          [<MonoCell>- 或 *</MonoCell>, <span className="flex gap-1"><Kbd>-</Kbd><Kbd>Space</Kbd></span>, "无序列表"],
          [<MonoCell>1.</MonoCell>, <span className="flex gap-1"><Kbd>1.</Kbd><Kbd>Space</Kbd></span>, "有序列表"],
          [<MonoCell>[]</MonoCell>, <span className="flex gap-1"><Kbd>[</Kbd><Kbd>]</Kbd><Kbd>Space</Kbd></span>, "待办列表"],
          [<MonoCell>&gt;</MonoCell>, <span className="flex gap-1"><Kbd>&gt;</Kbd><Kbd>Space</Kbd></span>, "引用"],
          [<MonoCell>```</MonoCell>, <span className="flex gap-1"><Kbd>```</Kbd><Kbd>Enter</Kbd></span>, "代码块"],
          [<MonoCell>---</MonoCell>, <span className="flex gap-1"><Kbd>---</Kbd><Kbd>Enter</Kbd></span>, "分割线"],
          [<MonoCell>**bold**</MonoCell>, <span className="flex gap-1"><Kbd>**</Kbd></span>, "行内加粗"],
        ]}
      />

      <CardStrip
        className="mt-14"
        cards={[
          { to: "/docs/features/inline-content", title: "Inline content", description: "text / link 与 styles 的 JSON 结构解剖。" },
          { to: "/docs/features/list-types", title: "List types", description: "无序 / 有序 / 待办三种列表的行为细节。" },
        ]}
      />
    </DocsShell>
  );
}
