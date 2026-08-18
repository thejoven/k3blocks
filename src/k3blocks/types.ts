/**
 * K3Blocks — 公共类型定义。
 * 文档模型：Block[] = { id, type, props, content, children }，JSON 即无损存储格式。
 */
import type { CSSProperties, ReactNode } from "react";
import type { DeepPartial, K3Dictionary } from "./i18n";

/**
 * 行内样式：bold / italic / underline / strike / code + 文字颜色 / 背景色（令牌名或 hex）。
 * 索引签名允许任意额外键：JSON 往返无损保留，渲染时经
 * K3EditorView.inlineStyleRenderers 转成 CSS（未注册的键不影响渲染）。
 */
export interface InlineStyles {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  code?: boolean;
  /** 文字颜色（hex，如 "#e03131"） */
  textColor?: string;
  /** 背景（高亮）颜色（hex，如 "#e0313133"） */
  backgroundColor?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * mention 行内变体。索引签名为向后兼容而存在：旧代码常以
 * `c.type === "text" ? … : recurse(c.content)` 方式收窄 InlineContent，
 * 索引签名保证 else 分支上 `c.content` 访问仍然合法（mention 无子内容，运行时不读取）。
 */
export interface K3MentionInlineContent {
  type: "mention";
  props: { id: string; label: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export type InlineContent =
  | { type: "text"; text: string; styles?: InlineStyles }
  | { type: "link"; href: string; content: InlineContent[] }
  | K3MentionInlineContent;

/**
 * 自定义行内内容（未知 inline type）：不在 InlineContent 联合中（保持判别联合收窄
 * 向后兼容），作为运行时扩展由 inline.ts 原样保留（JSON 进出无损），DOM 中以
 * data-k3-inline="type" 标注，渲染走 K3EditorView.inlineRenderers；
 * Markdown 导出降级取其 text / label 字段。构造自定义节点时按此类型断言即可。
 */
export interface K3CustomInlineContent {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/** mentions 候选项 */
export interface K3MentionItem {
  id: string;
  label: string;
  subtext?: string;
}

/** 默认块配置（非法项静默忽略并 console.warn） */
export interface K3BlockConfig {
  heading?: { levels?: (1 | 2 | 3)[] };
  codeBlock?: { defaultLanguage?: string };
}

export interface Block {
  id: string;
  type: string;
  props: Record<string, any>;
  content: InlineContent[];
  children: Block[];
}

/** insertBlocks 接受的部分块（缺省字段自动补齐） */
export interface PartialBlock {
  id?: string;
  type?: string;
  props?: Record<string, any>;
  content?: InlineContent[] | string;
  children?: PartialBlock[];
}

export type Placement = "before" | "after" | "nested";

/** 文本光标位置（块 id + 纯文本字符偏移） */
export interface CursorPosition {
  blockId: string;
  offset: number;
}

/** 选区快照：选区（或光标）覆盖的块 id，按文档顺序 */
export interface K3Selection {
  blockIds: string[];
}

/** 自定义粘贴处理：返回 true 表示已处理（阻止默认粘贴） */
export type K3PasteHandler = (e: ClipboardEvent, editor: K3Editor) => boolean;

/** 文件上传管道：接收本地文件，返回可用 URL（未提供时回退 FileReader dataURL） */
export type K3FileUploader = (file: File) => Promise<string>;

/** 自定义行内内容渲染器（未知 inline type → ReactNode，只读渲染） */
export type K3InlineRenderer = (node: InlineContent & { type: string }, editor: K3Editor) => ReactNode;

/** 自定义行内样式渲染器：styles[key] 的值 → CSS 属性 */
export type K3InlineStyleRenderer = (value: string) => CSSProperties;

/** useK3Editor 选项 */
export interface UseK3EditorOptions {
  initialContent?: Block[];
  editable?: boolean;
  placeholder?: string;
  /** i18n 字典覆盖（与 zhCN 深合并）；默认 zhCN */
  dictionary?: DeepPartial<K3Dictionary>;
  /** 块类型白名单：未列出类型的菜单项隐藏、Markdown 行首规则失效、insertBlocks 降级为 paragraph */
  blockTypes?: string[];
  /** 自定义粘贴处理（组件根 paste 捕获阶段优先调用） */
  pasteHandler?: K3PasteHandler;
  /** @ 提及：items 为候选集，trigger 默认 "@" */
  mentions?: { items: K3MentionItem[]; trigger?: string };
  /** 默认块配置：heading.levels 限定可选标题级别；codeBlock.defaultLanguage 新代码块默认语言 */
  blockConfig?: K3BlockConfig;
  /** ":" emoji 网格建议菜单（默认 true） */
  emojiPicker?: boolean;
  /** 文件上传管道：image/pdf/embed 占位框「选择文件」与图片粘贴/拖拽均走此管道；缺省回退 FileReader dataURL */
  uploadFile?: K3FileUploader;
  onChange?: (editor: K3Editor) => void;
}

/** 编辑器实例公共 API（下游页面严格依赖，勿偏离） */
export interface K3Editor {
  readonly document: Block[];
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly editable: boolean;
  insertBlocks(blocks: PartialBlock[], refId?: string | null, placement?: Placement): Block[];
  updateBlock(id: string, partial: Partial<Omit<Block, "id" | "children">> & { children?: Block[] }): void;
  removeBlocks(ids: string[]): void;
  getBlock(id: string): Block | undefined;
  undo(): void;
  redo(): void;
  blocksToMarkdown(): string;
  /** 导出完整语义化 HTML */
  blocksToHTML(): string;
  /** 导出 email-safe HTML（table 布局 + 全 inline style） */
  blocksToEmailHTML(): string;
  /** 导出 .docx（docx 包动态加载） */
  blocksToDocxBlob(): Promise<Blob>;
  /** 导出 .odt（jszip 动态加载，最小 ODT 结构） */
  blocksToOdtBlob(): Promise<Blob>;
  /** 打开打印窗口渲染当前文档并调 window.print()（可另存为 PDF） */
  print(opts?: { title?: string }): void;
  /** 解析 HTML 并 append 到文档末尾（无法识别的结构降级为段落，不执行脚本） */
  insertHTML(html: string): void;
  /** 解析 Markdown 并 append 到文档末尾 */
  insertMarkdown(md: string): void;
  onChange(cb: (editor: K3Editor) => void): () => void;
  /** 订阅选区变化：选区在编辑器内时回调覆盖块 id 集，清空/移出时回调 null */
  onSelectionChange(cb: (selection: K3Selection | null) => void): () => void;
  /** 当前选区（选区不在编辑器内时为 null） */
  getSelection(): K3Selection | null;
  focus(): void;
  setTextCursor(blockId: string, offset?: number): void;
}

/** K3EditorView props */
export interface K3EditorViewProps {
  editor: K3Editor;
  editable?: boolean;
  theme?: "light" | "dark";
  slashMenu?: boolean;
  formattingToolbar?: boolean;
  sideMenu?: boolean;
  placeholder?: string;
  /** i18n 字典覆盖（优先级高于 useK3Editor 的 dictionary） */
  dictionary?: DeepPartial<K3Dictionary>;
  /**
   * 自定义块渲染口：遇到 schema 未注册的 type 时优先用对应函数渲染（只读渲染即可）。
   * 已注册的内置 type 始终走内置渲染器，不受此表影响。
   */
  blockRenderers?: Record<string, (block: Block, editor: K3Editor) => ReactNode>;
  /**
   * 自定义行内内容渲染口：遇到未知 inline type（非 text/link/mention）时优先用
   * 对应函数渲染（只读）。DOM 中以 data-k3-inline="type" 标注，JSON 往返无损。
   */
  inlineRenderers?: Record<string, K3InlineRenderer>;
  /**
   * 自定义行内样式渲染口：InlineStyles 的额外键（styles[key]）经此表转 CSS
   * 应用到 text 节点，例：`{ fontSize: (v) => ({ fontSize: v }) }`。
   */
  inlineStyleRenderers?: Record<string, K3InlineStyleRenderer>;
  /** 附加 DOM 属性：editor 贴到组件根元素，block 贴到每个块行容器（测试锚点 / 埋点） */
  domAttributes?: { editor?: Record<string, string>; block?: Record<string, string> };
  className?: string;
}

/** 内置块类型名（9 种 P0 块 + 分栏容器 + table/math/embed/diagram/pdf） */
export type BlockType =
  | "paragraph"
  | "heading"
  | "bulletListItem"
  | "numberedListItem"
  | "checkListItem"
  | "quote"
  | "codeBlock"
  | "divider"
  | "image"
  | "columnList"
  | "column"
  | "table"
  | "math"
  | "embed"
  | "diagram"
  | "pdf";

/** 块是否为“文本类”（拥有可编辑行内内容） */
export const TEXT_BLOCK_TYPES: ReadonlySet<string> = new Set([
  "paragraph",
  "heading",
  "bulletListItem",
  "numberedListItem",
  "checkListItem",
  "quote",
  "codeBlock",
]);

export const LIST_BLOCK_TYPES: ReadonlySet<string> = new Set([
  "bulletListItem",
  "numberedListItem",
  "checkListItem",
]);

export function isTextBlock(type: string): boolean {
  return TEXT_BLOCK_TYPES.has(type);
}

export function isListBlock(type: string): boolean {
  return LIST_BLOCK_TYPES.has(type);
}
