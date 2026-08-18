/**
 * 共享种子文档（示例廊 / 实验室 / 详情页磁贴共用）。
 * EditorStore 构造时会深拷贝 initialContent，这里仍返回新引用以保持调用方安全。
 */
import type { Block } from "@/k3blocks";

function t(text: string, styles?: Record<string, boolean>) {
  return { type: "text" as const, text, ...(styles ? { styles } : {}) };
}

/** 最小示例：一个标题 + 一个段落 */
export function helloDocument(): Block[] {
  return [
    {
      id: "hello-1",
      type: "heading",
      props: { level: 1 },
      content: [t("Hello, K3Blocks.")],
      children: [],
    },
    {
      id: "hello-2",
      type: "paragraph",
      props: {},
      content: [t("五行代码，一个编辑器。试着在这里输入。")],
      children: [],
    },
  ];
}

/** 富示例文档：覆盖全部 9 种块类型（与首页 S2 同一份）。 */
export function sampleDocument(): Block[] {
  return [
    {
      id: "s1",
      type: "heading",
      props: { level: 1 },
      content: [t("欢迎使用 K3Blocks")],
      children: [],
    },
    {
      id: "s2",
      type: "paragraph",
      props: {},
      content: [
        t("这是一个 "),
        t("完整运行", { bold: true }),
        t(" 的编辑器：支持 "),
        t("斜杠菜单", { italic: true }),
        t("、"),
        t("inline code", { code: true }),
        t(" 和 "),
        {
          type: "link" as const,
          href: "https://github.com/thejoven/k3blocks",
          content: [t("链接")],
        },
        t("。"),
      ],
      children: [],
    },
    {
      id: "s3",
      type: "heading",
      props: { level: 2 },
      content: [t("清单")],
      children: [],
    },
    {
      id: "s4",
      type: "checkListItem",
      props: { checked: true },
      content: [t("npm install @k3/blocks")],
      children: [],
    },
    {
      id: "s5",
      type: "checkListItem",
      props: { checked: true },
      content: [t("五行代码接入 React 应用")],
      children: [],
    },
    {
      id: "s6",
      type: "checkListItem",
      props: { checked: false },
      content: [t("试着勾选我")],
      children: [],
    },
    {
      id: "s7",
      type: "quote",
      props: {},
      content: [t("Content is the interface.")],
      children: [],
    },
    {
      id: "s8",
      type: "bulletListItem",
      props: {},
      content: [t("无序列表项")],
      children: [
        {
          id: "s8a",
          type: "bulletListItem",
          props: {},
          content: [t("Tab 缩进嵌套一层")],
          children: [],
        },
      ],
    },
    {
      id: "s9",
      type: "numberedListItem",
      props: {},
      content: [t("有序列表项")],
      children: [],
    },
    {
      id: "s10",
      type: "codeBlock",
      props: { language: "tsx" },
      content: [t('const editor = useK3Editor();\nreturn <K3EditorView editor={editor} />;')],
      children: [],
    },
    { id: "s11", type: "divider", props: {}, content: [], children: [] },
    {
      id: "s12",
      type: "image",
      props: { src: "/logo.svg", alt: "K3Blocks logo", caption: "logo.svg — 三条横杠的 K3 抽象" },
      content: [],
      children: [],
    },
    { id: "s13", type: "paragraph", props: {}, content: [], children: [] },
  ];
}

/** 递归统计块数量（含嵌套子块）。 */
export function countBlocks(blocks: Block[]): number {
  let n = 0;
  for (const b of blocks) {
    n += 1 + countBlocks(b.children);
  }
  return n;
}

/** 用公共 API 整包替换文档内容（load sample / import 用）。深拷贝避免共享行内容引用。 */
export function replaceDocument(
  editor: { document: Block[]; removeBlocks(ids: string[]): void; insertBlocks(blocks: Block[]): unknown },
  next: Block[],
): void {
  const cloned: Block[] = JSON.parse(JSON.stringify(next));
  editor.removeBlocks(editor.document.map((b) => b.id));
  editor.insertBlocks(cloned);
}

/* ------------------------- 追加：展示文档与文档统计 ------------------------- */

/** 展示文档：覆盖全部 14 种块（Playground「Load sample」种子），展示引擎全能力。 */
export function showcaseDocument(): Block[] {
  return [
    {
      id: "d1",
      type: "heading",
      props: { level: 1 },
      content: [t("K3Blocks 全能力展示")],
      children: [],
    },
    {
      id: "d2",
      type: "paragraph",
      props: {},
      content: [
        t("这一份文档包含全部 "),
        t("14 种块", { bold: true }),
        t("：标题、段落、三种列表、引用、代码、分割线、图片、分栏、表格、公式、嵌入与图表。支持 "),
        t("斜杠菜单", { italic: true }),
        t("、"),
        t("inline code", { code: true }),
        t(" 和 "),
        { type: "link" as const, href: "https://github.com/thejoven/k3blocks", content: [t("链接")] },
        t("。"),
      ],
      children: [],
    },
    {
      id: "d3",
      type: "heading",
      props: { level: 2 },
      content: [t("列表与引用")],
      children: [],
    },
    {
      id: "d4",
      type: "bulletListItem",
      props: {},
      content: [t("无序列表项")],
      children: [
        {
          id: "d4a",
          type: "bulletListItem",
          props: {},
          content: [t("Tab 缩进嵌套一层")],
          children: [],
        },
      ],
    },
    {
      id: "d5",
      type: "numberedListItem",
      props: {},
      content: [t("有序列表项")],
      children: [],
    },
    {
      id: "d6",
      type: "checkListItem",
      props: { checked: true },
      content: [t("npm install @k3/blocks")],
      children: [],
    },
    {
      id: "d7",
      type: "checkListItem",
      props: { checked: false },
      content: [t("试着勾选我")],
      children: [],
    },
    {
      id: "d8",
      type: "quote",
      props: {},
      content: [t("Content is the interface.")],
      children: [],
    },
    { id: "d9", type: "divider", props: {}, content: [], children: [] },
    {
      id: "d10",
      type: "heading",
      props: { level: 2 },
      content: [t("代码与媒体")],
      children: [],
    },
    {
      id: "d11",
      type: "codeBlock",
      props: { language: "tsx" },
      content: [t('const editor = useK3Editor();\nreturn <K3EditorView editor={editor} />;')],
      children: [],
    },
    {
      id: "d12",
      type: "image",
      props: { src: "/logo.svg", alt: "K3Blocks logo", caption: "logo.svg — 三条横杠的 K3 抽象" },
      content: [],
      children: [],
    },
    {
      id: "d13",
      type: "columnList",
      props: {},
      content: [],
      children: [
        {
          id: "d13a",
          type: "column",
          props: {},
          content: [],
          children: [
            {
              id: "d13a1",
              type: "paragraph",
              props: {},
              content: [t("左栏：分栏容器（columnList）按栏数均分，栏间距 24px。")],
              children: [],
            },
          ],
        },
        {
          id: "d13b",
          type: "column",
          props: {},
          content: [],
          children: [
            {
              id: "d13b1",
              type: "paragraph",
              props: {},
              content: [t("右栏：窄屏（<768px）退化为单列堆叠。")],
              children: [],
            },
          ],
        },
      ],
    },
    {
      id: "d14",
      type: "heading",
      props: { level: 2 },
      content: [t("表格、公式与图表")],
      children: [],
    },
    {
      id: "d15",
      type: "table",
      props: {
        rows: [
          ["块类型", " props ", "说明"],
          ["table", "rows", "3×3 种子，单元格可编辑"],
          ["math", "latex", "KaTeX 展示模式渲染"],
        ],
      },
      content: [],
      children: [],
    },
    {
      id: "d16",
      type: "math",
      props: { latex: "\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}" },
      content: [],
      children: [],
    },
    {
      id: "d17",
      type: "diagram",
      props: {
        code: "flowchart LR\n  A[行内输入] --> B{块模型}\n  B --> C[React 渲染]\n  C --> D[JSON / Markdown 导出]",
      },
      content: [],
      children: [],
    },
    {
      id: "d18",
      type: "embed",
      props: { url: "https://www.youtube.com/embed/aqz-KE-bpKQ" },
      content: [],
      children: [],
    },
    { id: "d19", type: "paragraph", props: {}, content: [], children: [] },
  ];
}

/* --------------------------------- 文档统计 --------------------------------- */

export interface DocStats {
  blocks: number;
  words: number;
  chars: number;
}

function inlinePlainText(content: Block["content"]): string {
  let s = "";
  for (const c of content) {
    if (c.type === "text") s += c.text;
    else s += inlinePlainText(c.content);
  }
  return s;
}

function collectDocText(blocks: Block[], out: string[] = []): string[] {
  for (const b of blocks) {
    const text = inlinePlainText(b.content);
    if (text) out.push(text);
    // 表格单元格是纯文本 props，纳入统计
    if (Array.isArray(b.props?.rows)) {
      for (const row of b.props.rows as string[][]) {
        for (const cell of row) if (cell) out.push(cell);
      }
    }
    collectDocText(b.children, out);
  }
  return out;
}

/**
 * 文档统计：块数（含嵌套）/ 词数（CJK 字符逐字计 + 英文/数字词）/ 字符数（不含空白）。
 * 供 Playground 统计条与首页 demo 工具条共用。
 */
export function docStats(blocks: Block[]): DocStats {
  const text = collectDocText(blocks).join("\n");
  const cjk = text.match(/[぀-ヿ㐀-䶿一-鿿豈-﫿]/g)?.length ?? 0;
  const latin = text.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)?.length ?? 0;
  return {
    blocks: countBlocks(blocks),
    words: cjk + latin,
    chars: text.replace(/\s+/g, "").length,
  };
}
