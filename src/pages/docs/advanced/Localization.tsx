/**
 * /docs/advanced/localization — dictionary / zhCN / enUS / mergeDictionary 功能页。
 * live 切换 demo + 用法 + 完整字典键表 + /examples/localization-i18n 回链。
 */
import { useState } from "react";
import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import Kbd from "@/components/Kbd";
import DocsShell from "@/components/docs/DocsShell";
import {
  CardStrip,
  DocLink,
  DocTable,
  H2,
  InlineCode,
  MonoCell,
  P,
  Segmented,
} from "@/components/docs/primitives";
import { useK3Editor, K3EditorView, zhCN, enUS, mergeDictionary } from "@/k3blocks";
import type { Block } from "@/k3blocks";

/* ------------------------------- live demo ------------------------------- */

const DEMO_DOC: Block[] = [
  {
    id: "i18n-1",
    type: "heading",
    props: { level: 2 },
    content: [{ type: "text", text: "切换字典，菜单即刻换语言" }],
    children: [],
  },
  {
    id: "i18n-2",
    type: "paragraph",
    props: {},
    content: [
      { type: "text", text: "在这行输入 " },
      { type: "text", text: "/", styles: { code: true } },
      { type: "text", text: " 打开斜杠菜单，或选中文字看格式化工具栏。" },
    ],
    children: [],
  },
  { id: "i18n-3", type: "paragraph", props: {}, content: [], children: [] },
];

type Lang = "zh" | "en" | "custom";

const DICTS: Record<Lang, { label: string; value: typeof zhCN }> = {
  zh: { label: "中文", value: zhCN },
  en: { label: "English", value: enUS },
  custom: {
    label: "自定义",
    value: mergeDictionary(zhCN, {
      placeholder: "写下你的 RFC 草案… 输入 '/' 插入块",
      slashMenu: { empty: "没有匹配的块类型" },
      sideMenu: { delete: "移除", duplicate: "克隆" },
    }),
  },
};

function DictDemo() {
  const [lang, setLang] = useState<Lang>("zh");
  const editor = useK3Editor({ initialContent: DEMO_DOC });

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface-1">
      <div className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-3 py-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-4">
          &lt;K3EditorView dictionary&gt;
        </span>
        <div className="ml-auto">
          <Segmented
            options={([
              { value: "zh", label: DICTS.zh.label },
              { value: "en", label: DICTS.en.label },
              { value: "custom", label: DICTS.custom.label },
            ] as { value: Lang; label: string }[])}
            value={lang}
            onChange={setLang}
          />
        </div>
      </div>
      <div className="bg-surface-inset px-5 py-8 md:px-8">
        <K3EditorView
          editor={editor}
          slashMenu
          formattingToolbar
          sideMenu
          dictionary={DICTS[lang].value}
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-4 py-2.5 text-[12px] text-text-3">
        <span className="flex items-center gap-1.5">
          <Kbd>/</Kbd> 斜杠菜单条目名随字典切换
        </span>
        <span className="flex items-center gap-1.5">选中文字：工具栏提示与色板名切换</span>
        <span className="flex items-center gap-1.5">空段落：placeholder 切换</span>
      </div>
    </div>
  );
}

/* ---------------------------------- 页面 ---------------------------------- */

const USAGE_CODE = `import { useK3Editor, K3EditorView, zhCN, enUS, mergeDictionary } from "@k3/blocks";

// 自定义：与 zhCN 深合并，只覆盖要改的叶子，其余键沿用默认
const custom = mergeDictionary(zhCN, {
  placeholder: "写下你的 RFC 草案…",
  slashMenu: { empty: "没有匹配的块" },
});

const editor = useK3Editor({
  // 选项级：创建时定基调（与 zhCN 深合并；默认 zhCN）
  dictionary: custom,
});

// 视图级：优先级更高，且随渲染即时生效——切换语言无需重建编辑器
<K3EditorView editor={editor} dictionary={enUS} />;`;

export default function Localization() {
  return (
    <DocsShell
      crumbs={["Docs", "Advanced", "Localization"]}
      title="Localization."
      lead="组件内所有用户可见文案都收在一份 K3Dictionary 里：内置 zhCN（默认）与 enUS 两套完整字典，useK3Editor({ dictionary }) 或 <K3EditorView dictionary> 局部覆盖——DeepPartial 深合并，只改你想改的键。"
    >
      <H2 id="demo">在线体验。</H2>
      <P>切换 中文 / English / 自定义（mergeDictionary 覆盖三条），全部 UI 文案即时切换。</P>
      <DictDemo />

      <H2 id="usage">用法。</H2>
      <P>
        <InlineCode>dictionary</InlineCode> 接受{" "}
        <InlineCode>DeepPartial&lt;K3Dictionary&gt;</InlineCode>：嵌套对象按叶子深合并。
        <InlineCode>mergeDictionary(base, override)</InlineCode>{" "}
        是纯函数，返回新对象、不改入参——适合预先构造多套字典再切换。
      </P>
      <CodeBlock className="mt-4" code={USAGE_CODE} language="tsx" />

      <Callout className="mt-6" title="优先级">
        <InlineCode>&lt;K3EditorView dictionary&gt;</InlineCode> 优先级高于{" "}
        <InlineCode>useK3Editor(&#123; dictionary &#125;)</InlineCode>
        ，且每次渲染即时生效（demo 中的即时切换即源于此）；两者都省略时使用内置{" "}
        <InlineCode>zhCN</InlineCode>。
      </Callout>

      <H2 id="keys">字典键全表。</H2>
      <P>以下为 <InlineCode>K3Dictionary</InlineCode> 全部键及两套内置字典的取值。</P>
      <DocTable
        columns={["键", "zhCN（默认）", "enUS"]}
        rows={[
          [<MonoCell accent>placeholder</MonoCell>, "输入 '/' 查看命令", "Type '/' for commands"],
          [<MonoCell>slashMenu.groupBasic</MonoCell>, "Basic blocks", "Basic blocks"],
          [<MonoCell>slashMenu.groupMedia</MonoCell>, "Media", "Media"],
          [<MonoCell>slashMenu.empty</MonoCell>, "无匹配结果", "No results"],
          [<MonoCell>slashMenu.footerSelect</MonoCell>, "选择", "Select"],
          [<MonoCell>slashMenu.footerInsert</MonoCell>, "插入", "Insert"],
          [<MonoCell>slashMenu.footerClose</MonoCell>, "关闭", "Close"],
          [<MonoCell>slashMenu.items.paragraph</MonoCell>, "段落", "Paragraph"],
          [<MonoCell>slashMenu.items.heading1 / 2 / 3</MonoCell>, "标题 1 / 2 / 3", "Heading 1 / 2 / 3"],
          [<MonoCell>slashMenu.items.bulletListItem</MonoCell>, "无序列表", "Bullet list"],
          [<MonoCell>slashMenu.items.numberedListItem</MonoCell>, "有序列表", "Numbered list"],
          [<MonoCell>slashMenu.items.checkListItem</MonoCell>, "待办列表", "To-do list"],
          [<MonoCell>slashMenu.items.quote</MonoCell>, "引用", "Quote"],
          [<MonoCell>slashMenu.items.codeBlock</MonoCell>, "代码块", "Code block"],
          [<MonoCell>slashMenu.items.divider</MonoCell>, "分割线", "Divider"],
          [<MonoCell>slashMenu.items.image</MonoCell>, "图片", "Image"],
          [<MonoCell>slashMenu.items.columnList</MonoCell>, "分栏", "Columns"],
          [<MonoCell>slashMenu.items.table</MonoCell>, "表格", "Table"],
          [<MonoCell>slashMenu.items.math</MonoCell>, "数学公式", "Math"],
          [<MonoCell>slashMenu.items.embed</MonoCell>, "嵌入", "Embed"],
          [<MonoCell>slashMenu.items.diagram</MonoCell>, "图表", "Diagram"],
          [<MonoCell>slashMenu.items.pdf</MonoCell>, "PDF 文档", "PDF"],
          [<MonoCell>mentions.empty</MonoCell>, "无匹配成员", "No matching people"],
          [<MonoCell>emoji.empty</MonoCell>, "无匹配表情", "No matching emoji"],
          [<MonoCell>upload.chooseFile</MonoCell>, "选择文件", "Choose file"],
          [<MonoCell>upload.uploading</MonoCell>, "上传中…", "Uploading…"],
          [<MonoCell>sideMenu.insertBelow</MonoCell>, "在下方插入块", "Insert block below"],
          [<MonoCell>sideMenu.dragHandle</MonoCell>, "拖拽排序 / 点击打开菜单", "Drag to reorder / click for menu"],
          [<MonoCell>sideMenu.delete</MonoCell>, "删除", "Delete"],
          [<MonoCell>sideMenu.duplicate</MonoCell>, "复制", "Duplicate"],
          [<MonoCell>sideMenu.convertTo</MonoCell>, "转换为", "Turn into"],
          [<MonoCell>sideMenu.convertItems.*</MonoCell>, "9 种文本块名（同 slashMenu.items）", "同左"],
          [<MonoCell>formattingToolbar.bold</MonoCell>, "加粗 ⌘B", "Bold ⌘B"],
          [<MonoCell>formattingToolbar.italic</MonoCell>, "斜体 ⌘I", "Italic ⌘I"],
          [<MonoCell>formattingToolbar.underline</MonoCell>, "下划线 ⌘U", "Underline ⌘U"],
          [<MonoCell>formattingToolbar.strike</MonoCell>, "删除线", "Strikethrough"],
          [<MonoCell>formattingToolbar.inlineCode</MonoCell>, "行内代码 ⌘E", "Inline code ⌘E"],
          [<MonoCell>formattingToolbar.link</MonoCell>, "链接 ⌘K", "Link ⌘K"],
          [<MonoCell>formattingToolbar.linkInputPlaceholder</MonoCell>, "输入链接，回车确认", "Paste a link and press Enter"],
          [<MonoCell>formattingToolbar.textColor</MonoCell>, "文字颜色", "Text color"],
          [<MonoCell>formattingToolbar.highlight</MonoCell>, "背景色", "Highlight"],
          [<MonoCell>formattingToolbar.colorDefault</MonoCell>, "默认", "Default"],
          [<MonoCell>formattingToolbar.colorRed … colorGray</MonoCell>, "红 / 橙 / 绿 / 蓝 / 灰", "Red / Orange / Green / Blue / Gray"],
          [<MonoCell>codeBlock.copy</MonoCell>, "复制代码", "Copy code"],
          [<MonoCell>table.addRow / addColumn</MonoCell>, "添加行 / 添加列", "Add row / Add column"],
          [<MonoCell>table.removeRow / removeColumn</MonoCell>, "删除行 / 删除列", "Remove row / Remove column"],
          [<MonoCell>math.inputPlaceholder</MonoCell>, "输入 LaTeX，⌘Enter 完成", "Type LaTeX, ⌘Enter to render"],
          [<MonoCell>math.renderError</MonoCell>, "公式渲染失败", "Failed to render formula"],
          [<MonoCell>embed.urlPlaceholder</MonoCell>, "粘贴嵌入链接…回车确认", "Paste an embed link…press Enter"],
          [<MonoCell>embed.editLink</MonoCell>, "编辑链接", "Edit link"],
          [<MonoCell>diagram.editSource</MonoCell>, "编辑源码", "Edit source"],
          [<MonoCell>diagram.renderError</MonoCell>, "图表渲染失败", "Failed to render diagram"],
          [<MonoCell>diagram.inputPlaceholder</MonoCell>, "输入 Mermaid 源码，⌘Enter 重渲染", "Type Mermaid source, ⌘Enter to re-render"],
          [<MonoCell>pdf.urlPlaceholder</MonoCell>, "粘贴 PDF 链接，回车确认", "Paste a PDF link, press Enter"],
          [<MonoCell>pdf.editLink</MonoCell>, "编辑链接", "Edit link"],
          [<MonoCell>pdf.openInNewTab</MonoCell>, "新窗口打开", "Open in new tab"],
        ]}
      />

      <P>
        完整可交互的三字典切换示例见{" "}
        <DocLink to="/examples/localization-i18n">Localization (i18n) 示例</DocLink>
        ——含全部源码与逐步讲解。
      </P>

      <CardStrip
        className="mt-14"
        cards={[
          { to: "/examples/localization-i18n", title: "Localization (i18n) 示例", description: "zh / en / 自定义字典即时切换的完整示例。" },
          { to: "/docs/advanced/extensions", title: "Extensions", description: "dictionary 之外的全部扩展点总览。" },
        ]}
      />
    </DocsShell>
  );
}
