/**
 * K3Blocks — useK3Editor：创建稳定的编辑器实例（hook）。
 */
import { useRef } from "react";
import { mergeDictionary, zhCN } from "./i18n";
import type { K3Dictionary } from "./i18n";
import { BLOCK_SPECS } from "./schema";
import { EditorStore } from "./store";
import {
  blocksToDocxBlob,
  blocksToEmailHTML,
  blocksToHTML,
  blocksToOdtBlob,
  printBlocks,
} from "./exporters";
import { tryParseHTMLToBlocks, tryParseMarkdownToBlocks } from "./importers";
import type {
  Block,
  K3BlockConfig,
  K3Editor,
  K3FileUploader,
  K3MentionItem,
  K3PasteHandler,
  K3Selection,
  PartialBlock,
  Placement,
  UseK3EditorOptions,
} from "./types";

/** 校验并归一化 mentions 选项；非法配置静默忽略并 console.warn */
function parseMentions(opt: UseK3EditorOptions["mentions"]): { items: K3MentionItem[]; trigger: string } | null {
  if (!opt) return null;
  const items = Array.isArray(opt.items)
    ? opt.items.filter((it) => it && typeof it.id === "string" && typeof it.label === "string")
    : [];
  if (!Array.isArray(opt.items)) {
    console.warn("[k3blocks] mentions.items 必须是数组，已忽略 mentions 配置");
    return null;
  }
  const trigger = opt.trigger ?? "@";
  if (typeof trigger !== "string" || !trigger) {
    console.warn("[k3blocks] mentions.trigger 非法，已回退为 \"@\"");
    return { items, trigger: "@" };
  }
  return { items, trigger };
}

const ALL_HEADING_LEVELS: (1 | 2 | 3)[] = [1, 2, 3];

/** 校验并归一化 blockConfig；非法项静默忽略并 console.warn */
function parseBlockConfig(cfg: K3BlockConfig | undefined): {
  headingLevels: (1 | 2 | 3)[];
  codeDefaultLanguage: string;
} {
  let headingLevels = ALL_HEADING_LEVELS;
  let codeDefaultLanguage = "text";
  if (!cfg) return { headingLevels, codeDefaultLanguage };
  if (cfg.heading?.levels !== undefined) {
    const levels = cfg.heading.levels;
    if (
      Array.isArray(levels) &&
      levels.length > 0 &&
      levels.every((l) => l === 1 || l === 2 || l === 3)
    ) {
      headingLevels = ALL_HEADING_LEVELS.filter((l) => levels.includes(l));
    } else {
      console.warn("[k3blocks] blockConfig.heading.levels 必须是 (1|2|3) 的非空数组，已忽略");
    }
  }
  if (cfg.codeBlock?.defaultLanguage !== undefined) {
    const lang = cfg.codeBlock.defaultLanguage;
    if (typeof lang === "string" && lang.trim()) codeDefaultLanguage = lang.trim();
    else console.warn("[k3blocks] blockConfig.codeBlock.defaultLanguage 必须是非空字符串，已忽略");
  }
  return { headingLevels, codeDefaultLanguage };
}

/** 内部实例类型：视图层可访问 store / composing 等内部状态 */
export class EditorCore implements K3Editor {
  readonly store: EditorStore;
  editable: boolean;
  placeholder: string;
  /** 当前生效的字典（zhCN + 选项覆盖深合并） */
  dictionary: K3Dictionary;
  /** 块类型白名单（null = 不限制） */
  blockTypes: string[] | null;
  /** 自定义粘贴处理（paste 捕获阶段优先调用，返回 true 阻止默认） */
  pasteHandler?: K3PasteHandler;
  /** @ 提及配置（null = 未启用） */
  mentions: { items: K3MentionItem[]; trigger: string } | null;
  /** heading 可选级别（blockConfig.heading.levels，默认 [1,2,3]） */
  headingLevels: (1 | 2 | 3)[];
  /** 新代码块默认语言（blockConfig.codeBlock.defaultLanguage，默认 "text"） */
  codeDefaultLanguage: string;
  /** ":" emoji 网格建议菜单（默认 true） */
  emojiPicker: boolean;
  /** 文件上传管道（缺省回退 FileReader dataURL） */
  uploadFile?: K3FileUploader;
  /** 输入法组合中（compositionstart/end 之间） */
  composing = false;
  /** 编辑器根元素（视图挂载时注入） */
  rootEl: HTMLElement | null = null;
  private optionCb?: (editor: K3Editor) => void;
  private changeCbs = new Set<(editor: K3Editor) => void>();
  private selection: K3Selection | null = null;
  private selectionCbs = new Set<(selection: K3Selection | null) => void>();

  constructor(options: UseK3EditorOptions = {}) {
    this.store = new EditorStore(options.initialContent);
    this.editable = options.editable ?? true;
    this.dictionary = mergeDictionary(zhCN, options.dictionary);
    this.placeholder = options.placeholder ?? this.dictionary.placeholder;
    this.blockTypes = options.blockTypes ? [...options.blockTypes] : null;
    this.pasteHandler = options.pasteHandler;
    this.mentions = parseMentions(options.mentions);
    const bc = parseBlockConfig(options.blockConfig);
    this.headingLevels = bc.headingLevels;
    this.codeDefaultLanguage = bc.codeDefaultLanguage;
    this.emojiPicker = options.emojiPicker ?? true;
    this.uploadFile = options.uploadFile;
    this.optionCb = options.onChange;
    this.store.subscribe(() => this.emitChange());
  }

  /** 每轮渲染同步易变选项（不改 identity） */
  syncOptions(options: UseK3EditorOptions): void {
    if (options.editable !== undefined) this.editable = options.editable;
    if (options.dictionary !== undefined) this.dictionary = mergeDictionary(zhCN, options.dictionary);
    this.placeholder = options.placeholder ?? this.dictionary.placeholder;
    if (options.blockTypes !== undefined) this.blockTypes = options.blockTypes ? [...options.blockTypes] : null;
    this.pasteHandler = options.pasteHandler;
    if (options.mentions !== undefined) this.mentions = parseMentions(options.mentions);
    if (options.blockConfig !== undefined) {
      const bc = parseBlockConfig(options.blockConfig);
      this.headingLevels = bc.headingLevels;
      this.codeDefaultLanguage = bc.codeDefaultLanguage;
    }
    if (options.emojiPicker !== undefined) this.emojiPicker = options.emojiPicker;
    this.uploadFile = options.uploadFile;
    this.optionCb = options.onChange;
  }

  /** heading 级别是否被 blockConfig.heading.levels 允许 */
  isHeadingLevelAllowed(level: number): boolean {
    return this.headingLevels.includes(level as 1 | 2 | 3);
  }

  /** 块类型是否被白名单允许（column 随 columnList 隐式允许；未注册的自定义 type 放行，交给 blockRenderers） */
  isTypeAllowed(type: string): boolean {
    if (!this.blockTypes) return true;
    if (this.blockTypes.includes(type)) return true;
    if (type === "column" && this.blockTypes.includes("columnList")) return true;
    if (!BLOCK_SPECS[type]) return true; // schema 未注册的自定义 type 不被白名单误杀
    return false;
  }

  private emitChange(): void {
    this.optionCb?.(this);
    for (const cb of this.changeCbs) cb(this);
  }

  get document(): Block[] {
    return this.store.getDocument();
  }

  get canUndo(): boolean {
    return this.store.canUndo;
  }

  get canRedo(): boolean {
    return this.store.canRedo;
  }

  /** 白名单裁剪：非允许类型递归降级为 paragraph（保留 content 与已允许的子块） */
  private sanitizePartial(b: PartialBlock): PartialBlock {
    const children = b.children?.map((c) => this.sanitizePartial(c));
    const type = b.type ?? "paragraph";
    if (this.isTypeAllowed(type)) return { ...b, children };
    return { ...b, type: "paragraph", props: {}, children };
  }

  insertBlocks(blocks: PartialBlock[], refId?: string | null, placement: Placement = "after"): Block[] {
    return this.store.insertBlocks(blocks.map((b) => this.sanitizePartial(b)), refId, placement);
  }

  updateBlock(id: string, partial: Partial<Omit<Block, "id">>): void {
    this.store.updateBlock(id, partial);
  }

  removeBlocks(ids: string[]): void {
    this.store.removeBlocks(ids);
  }

  getBlock(id: string): Block | undefined {
    return this.store.getBlock(id);
  }

  undo(): void {
    this.store.undo();
  }

  redo(): void {
    this.store.redo();
  }

  blocksToMarkdown(): string {
    return this.store.blocksToMarkdown();
  }

  blocksToHTML(): string {
    return blocksToHTML(this.document);
  }

  blocksToEmailHTML(): string {
    return blocksToEmailHTML(this.document);
  }

  blocksToDocxBlob(): Promise<Blob> {
    return blocksToDocxBlob(this.document);
  }

  blocksToOdtBlob(): Promise<Blob> {
    return blocksToOdtBlob(this.document);
  }

  print(opts?: { title?: string }): void {
    printBlocks(this.document, opts);
  }

  insertHTML(html: string): void {
    const blocks = tryParseHTMLToBlocks(html);
    if (blocks.length) this.insertBlocks(blocks, null, "after");
  }

  insertMarkdown(md: string): void {
    const blocks = tryParseMarkdownToBlocks(md);
    if (blocks.length) this.insertBlocks(blocks, null, "after");
  }

  onChange(cb: (editor: K3Editor) => void): () => void {
    this.changeCbs.add(cb);
    return () => this.changeCbs.delete(cb);
  }

  onSelectionChange(cb: (selection: K3Selection | null) => void): () => void {
    this.selectionCbs.add(cb);
    return () => this.selectionCbs.delete(cb);
  }

  getSelection(): K3Selection | null {
    return this.selection;
  }

  /** 视图层上报选区（内部用；去重后才通知订阅者） */
  _setSelection(sel: K3Selection | null): void {
    const prev = this.selection;
    const same =
      prev === sel ||
      (!!prev &&
        !!sel &&
        prev.blockIds.length === sel.blockIds.length &&
        prev.blockIds.every((id, i) => id === sel.blockIds[i]));
    if (same) return;
    this.selection = sel;
    for (const cb of this.selectionCbs) cb(sel);
  }

  focus(): void {
    const root = this.rootEl;
    const el = root?.querySelector<HTMLElement>(".k3-editable");
    if (el) {
      this.store.pendingCursor = null;
      el.focus();
      return;
    }
    const first = this.store.getDocument()[0];
    if (first) this.setTextCursor(first.id, 0);
  }

  setTextCursor(blockId: string, offset = 0): void {
    this.store.pendingCursor = { blockId, offset };
    this.store.bump();
  }
}

export function useK3Editor(options: UseK3EditorOptions = {}): K3Editor {
  const ref = useRef<EditorCore | null>(null);
  if (!ref.current) ref.current = new EditorCore(options);
  ref.current.syncOptions(options);
  return ref.current;
}
