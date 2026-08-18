/**
 * K3Blocks — 块规格注册表：9 种 P0 块的默认 props、斜杠菜单条目与模糊搜索关键词。
 */

export interface BlockSpec {
  type: string;
  /** 中文显示名 */
  label: string;
  defaultProps: Record<string, any>;
  /** 斜杠菜单分组 */
  group: "basic" | "media";
  /** 模糊搜索关键词（含中英文别名） */
  keywords: string;
  /** 菜单右侧的 Markdown 提示（如 "# "） */
  hint?: string;
}

export const BLOCK_SPECS: Record<string, BlockSpec> = {
  paragraph: {
    type: "paragraph",
    label: "段落",
    defaultProps: {},
    group: "basic",
    keywords: "text paragraph duanluo 段落 正文 plain",
  },
  heading: {
    type: "heading",
    label: "标题",
    defaultProps: { level: 1 },
    group: "basic",
    keywords: "heading h1 h2 h3 biaoti 标题 title",
    hint: "#",
  },
  bulletListItem: {
    type: "bulletListItem",
    label: "无序列表",
    defaultProps: {},
    group: "basic",
    keywords: "bullet list ul wuxu liebiao 无序 列表",
    hint: "-",
  },
  numberedListItem: {
    type: "numberedListItem",
    label: "有序列表",
    defaultProps: {},
    group: "basic",
    keywords: "numbered list ol youxu liebiao 有序 列表 number",
    hint: "1.",
  },
  checkListItem: {
    type: "checkListItem",
    label: "待办列表",
    defaultProps: { checked: false },
    group: "basic",
    keywords: "todo check task daiban liebiao 待办 任务 checkbox",
    hint: "[]",
  },
  quote: {
    type: "quote",
    label: "引用",
    defaultProps: {},
    group: "basic",
    keywords: "quote blockquote yinyong 引用",
    hint: ">",
  },
  codeBlock: {
    type: "codeBlock",
    label: "代码块",
    defaultProps: { language: "text" },
    group: "basic",
    keywords: "code daima 代码 代码块 pre",
    hint: "```",
  },
  divider: {
    type: "divider",
    label: "分割线",
    defaultProps: {},
    group: "basic",
    keywords: "divider hr fenge 分割 分隔线 line",
    hint: "---",
  },
  image: {
    type: "image",
    label: "图片",
    defaultProps: { src: "", caption: "", alt: "" },
    group: "media",
    keywords: "image img picture tupian 图片 图像 media",
  },
  columnList: {
    type: "columnList",
    label: "分栏",
    defaultProps: {},
    group: "media",
    keywords: "columns column layout fenlan 分栏 多列 两列",
  },
  /** 分栏内的列容器：仅作为 columnList 的子块存在，不出现于斜杠菜单 */
  column: {
    type: "column",
    label: "列",
    defaultProps: {},
    group: "media",
    keywords: "column lie 列",
  },
  table: {
    type: "table",
    label: "表格",
    defaultProps: { rows: [["", "", ""], ["", "", ""], ["", "", ""]] },
    group: "media",
    keywords: "table grid biaoge 表格 栅格 excel",
  },
  math: {
    type: "math",
    label: "数学公式",
    defaultProps: { latex: "E = mc^2" },
    group: "media",
    keywords: "math katex latex gongshi 公式 数学 方程式 tex",
  },
  embed: {
    type: "embed",
    label: "嵌入",
    defaultProps: { url: "" },
    group: "media",
    keywords: "embed iframe qianru 嵌入 视频 youtube vimeo bilibili",
  },
  diagram: {
    type: "diagram",
    label: "图表",
    defaultProps: { code: "graph LR; A[想法] --> B{可行?}; B -->|是| C[发布]; B -->|否| D[迭代];" },
    group: "media",
    keywords: "mermaid diagram tubiao 图表 流程图 flowchart",
  },
  pdf: {
    type: "pdf",
    label: "PDF 文档",
    defaultProps: { url: "" },
    group: "media",
    keywords: "pdf document wendang 文档 文件 file",
  },
};

/** 斜杠菜单条目（heading 展开为三级） */
export interface SlashItem {
  id: string;
  label: string;
  group: "basic" | "media";
  keywords: string;
  hint?: string;
  icon: string;
  /** 选中后目标块类型与 props */
  type: string;
  props: Record<string, any>;
}

export const SLASH_ITEMS: SlashItem[] = [
  { id: "paragraph", label: "段落", group: "basic", keywords: BLOCK_SPECS.paragraph.keywords, icon: "paragraph", type: "paragraph", props: {} },
  { id: "h1", label: "标题 1", group: "basic", keywords: "h1 heading1 biaoti 标题 yi 一", hint: "#", icon: "h1", type: "heading", props: { level: 1 } },
  { id: "h2", label: "标题 2", group: "basic", keywords: "h2 heading2 biaoti 标题 er 二", hint: "##", icon: "h2", type: "heading", props: { level: 2 } },
  { id: "h3", label: "标题 3", group: "basic", keywords: "h3 heading3 biaoti 标题 san 三", hint: "###", icon: "h3", type: "heading", props: { level: 3 } },
  { id: "bulletListItem", label: "无序列表", group: "basic", keywords: BLOCK_SPECS.bulletListItem.keywords, hint: "-", icon: "bullet", type: "bulletListItem", props: {} },
  { id: "numberedListItem", label: "有序列表", group: "basic", keywords: BLOCK_SPECS.numberedListItem.keywords, hint: "1.", icon: "numbered", type: "numberedListItem", props: {} },
  { id: "checkListItem", label: "待办列表", group: "basic", keywords: BLOCK_SPECS.checkListItem.keywords, hint: "[]", icon: "check", type: "checkListItem", props: { checked: false } },
  { id: "quote", label: "引用", group: "basic", keywords: BLOCK_SPECS.quote.keywords, hint: ">", icon: "quote", type: "quote", props: {} },
  { id: "codeBlock", label: "代码块", group: "basic", keywords: BLOCK_SPECS.codeBlock.keywords, hint: "```", icon: "code", type: "codeBlock", props: { language: "text" } },
  { id: "divider", label: "分割线", group: "basic", keywords: BLOCK_SPECS.divider.keywords, hint: "---", icon: "divider", type: "divider", props: {} },
  { id: "image", label: "图片", group: "media", keywords: BLOCK_SPECS.image.keywords, icon: "image", type: "image", props: { src: "", caption: "", alt: "" } },
  { id: "columnList", label: "分栏", group: "media", keywords: BLOCK_SPECS.columnList.keywords, icon: "columns", type: "columnList", props: {} },
  { id: "pdf", label: "PDF 文档", group: "media", keywords: BLOCK_SPECS.pdf.keywords, icon: "pdf", type: "pdf", props: { url: "" } },
  { id: "table", label: "表格", group: "media", keywords: BLOCK_SPECS.table.keywords, icon: "table", type: "table", props: defaultPropsFor("table") },
  { id: "math", label: "数学公式", group: "media", keywords: BLOCK_SPECS.math.keywords, icon: "math", type: "math", props: defaultPropsFor("math") },
  { id: "embed", label: "嵌入", group: "media", keywords: BLOCK_SPECS.embed.keywords, icon: "embed", type: "embed", props: defaultPropsFor("embed") },
  { id: "diagram", label: "图表", group: "media", keywords: BLOCK_SPECS.diagram.keywords, icon: "diagram", type: "diagram", props: defaultPropsFor("diagram") },
];

/** 简单子序列模糊匹配（大小写不敏感） */
export function fuzzyMatch(query: string, target: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const t = target.toLowerCase();
  if (t.includes(q)) return true;
  let i = 0;
  for (const ch of t) {
    if (ch === q[i]) i++;
    if (i >= q.length) return true;
  }
  return false;
}

/** 模糊过滤斜杠条目；isAllowed 提供时按块类型白名单裁剪 */
export function filterSlashItems(query: string, isAllowed?: (type: string) => boolean): SlashItem[] {
  return SLASH_ITEMS.filter(
    (it) => (!isAllowed || isAllowed(it.type)) && fuzzyMatch(query, `${it.label} ${it.keywords} ${it.id}`)
  );
}

export function defaultPropsFor(type: string): Record<string, any> {
  const spec = BLOCK_SPECS[type];
  return spec ? { ...spec.defaultProps } : {};
}
