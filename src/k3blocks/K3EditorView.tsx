/**
 * K3Blocks — K3EditorView：受控渲染块树的视图组件。
 * React 只管块级结构；块内文本由 contenteditable DOM 托管，onInput 同步回模型。
 */
import "./theme.css";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type {
  ClipboardEvent as ReactClipboardEvent,
  CompositionEvent as ReactCompositionEvent,
  CSSProperties,
  DragEvent as ReactDragEvent,
  FormEvent as ReactFormEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from "react";
import { BLOCK_RENDERERS } from "./blocks";
import { ParagraphBlock } from "./blocks/textBlocks";
import type { BlockRendererProps } from "./blocks/textBlocks";
import { computeDropTarget } from "./plugins/dragDrop";
import { applyEnterRule, applyInlineInputRule, applyLineInputRule } from "./plugins/markdownRules";
import { FormattingToolbar, wrapSelectionTag } from "./plugins/formattingToolbar";
import type { ToolbarApi } from "./plugins/formattingToolbar";
import { SideMenu } from "./plugins/sideMenu";
import { SlashMenu } from "./plugins/slashMenu";
import { MentionMenu, filterMentionItems } from "./plugins/mentionMenu";
import { EmojiMenu } from "./plugins/emojiMenu";
import { EMOJI_GRID_COLUMNS, filterEmojiItems } from "./plugins/emojiData";
import type { K3EmojiItem } from "./plugins/emojiData";
import { resolveFileUrl } from "./upload";
import { defaultPropsFor, filterSlashItems } from "./schema";
import type { SlashItem } from "./schema";
import { createBlock, createColumnList, flattenBlocks } from "./store";
import { EditorCore } from "./useK3Editor";
import { mergeDictionary } from "./i18n";
import {
  concatInline,
  domToInline,
  getCaretRect,
  getSelectionOffsets,
  inlineToHtml,
  plainText,
  setDomCursor,
  splitInline,
  removeInlineRange,
} from "./inline";
import { isListBlock, isTextBlock } from "./types";
import type { Block, K3EditorViewProps, K3MentionItem } from "./types";
import type { ViewContext } from "./viewContext";

interface SlashState {
  blockId: string;
  /** "/" 在块纯文本中的偏移 */
  start: number;
  query: string;
  active: number;
}

/** mention 菜单状态（结构与 SlashState 相同，start 为 trigger 字符偏移） */
type MentionState = SlashState;

/** emoji 菜单状态（结构同上，start 为 ":" 字符偏移） */
type EmojiState = SlashState;

/* --------------------------------- 块树渲染 -------------------------------- */

function BlockRow({
  block,
  ctx,
  depth,
  order,
}: {
  block: Block;
  ctx: ViewContext;
  depth: number;
  order: number;
}) {
  const Builtin = BLOCK_RENDERERS[block.type];
  const custom = !Builtin ? ctx.blockRenderers?.[block.type] : undefined;
  const Renderer = Builtin ?? ParagraphBlock;
  const hovered = ctx.hoveredId === block.id;
  const drop = ctx.dropIndicator;
  const rendererProps: BlockRendererProps = { ctx, block, order };
  // 分栏容器：columnList 的子块用 grid 均分栏，column 的子块无缩进堆叠
  const isColumnList = block.type === "columnList";
  const isColumn = block.type === "column";
  const childrenWrap = isColumnList ? (
    <div
      className="k3-columns"
      style={{ "--k3-cols": Math.max(1, block.children.length) } as CSSProperties}
    >
      <BlockList blocks={block.children} ctx={ctx} depth={depth + 1} />
    </div>
  ) : (
    <div className={isColumn ? "k3-column-blocks" : "k3-block-children"}>
      <BlockList blocks={block.children} ctx={ctx} depth={depth + 1} />
    </div>
  );
  return (
    <div
      className={`k3-block-row${ctx.draggingId === block.id ? " k3-dragging" : ""}${isColumnList ? " k3-column-list-row" : ""}${isColumn ? " k3-column-row" : ""}`}
      data-block-id={block.id}
      data-depth={depth}
      onMouseEnter={() => ctx.setHoveredId(block.id)}
      onMouseLeave={() => ctx.setHoveredId(null)}
      {...ctx.domAttributes?.block}
    >
      {ctx.sideMenu && ctx.editable ? (
        <SideMenu ctx={ctx} block={block} visible={hovered} />
      ) : (
        <div className="k3-side-menu k3-side-menu-spacer" />
      )}
      <div className="k3-block-main">
        {custom ? custom(block, ctx.editor) : <Renderer {...rendererProps} />}
        {block.children.length > 0 ? childrenWrap : null}
      </div>
      {drop && drop.id === block.id ? (
        <div className={`k3-drop-indicator k3-drop-${drop.placement}`} />
      ) : null}
    </div>
  );
}

function BlockList({ blocks, ctx, depth }: { blocks: Block[]; ctx: ViewContext; depth: number }) {
  let order = 0;
  return (
    <>
      {blocks.map((b) => {
        order = b.type === "numberedListItem" ? order + 1 : 0;
        return <BlockRow key={b.id} block={b} ctx={ctx} depth={depth} order={order} />;
      })}
    </>
  );
}

/* --------------------------------- 视图组件 -------------------------------- */

export function K3EditorView(props: K3EditorViewProps) {
  const editor = props.editor as EditorCore;
  const store = editor.store;
  const editable = props.editable ?? editor.editable;
  const placeholder = props.placeholder ?? editor.placeholder;
  /** 字典生效顺序：zhCN → useK3Editor(dictionary) → <K3EditorView dictionary> */
  const dict = props.dictionary ? mergeDictionary(editor.dictionary, props.dictionary) : editor.dictionary;
  const slashMenuEnabled = props.slashMenu ?? true;
  const toolbarEnabled = props.formattingToolbar ?? true;
  const sideMenuEnabled = props.sideMenu ?? true;

  useSyncExternalStore(store.subscribe, () => store.version);

  const rootRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<ViewContext["dropIndicator"]>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [slash, setSlash] = useState<SlashState | null>(null);
  const [mention, setMention] = useState<MentionState | null>(null);
  const [emoji, setEmoji] = useState<EmojiState | null>(null);
  const toolbarApi = useRef<ToolbarApi | null>(null);
  const registerToolbar = useCallback((api: ToolbarApi | null) => {
    toolbarApi.current = api;
  }, []);

  useEffect(() => {
    editor.rootEl = rootRef.current;
    return () => {
      editor.rootEl = null;
    };
  }, [editor]);

  /* ------------------------- 光标恢复（undo / 结构操作） ------------------------ */
  useLayoutEffect(() => {
    const pending = store.pendingCursor;
    if (!pending) return;
    store.pendingCursor = null;
    const root = rootRef.current;
    if (!root) return;
    const row = root.querySelector(`[data-block-id="${pending.blockId}"]`);
    const el = row?.querySelector<HTMLElement>(".k3-editable");
    if (!el) return;
    // 以模型重建 DOM（undo/redo、斜杠转换、合并后）
    const block = store.getBlock(pending.blockId);
    if (block) el.innerHTML = inlineToHtml(block.content, props.inlineStyleRenderers);
    setDomCursor(el, pending.offset);
  });

  /* --------------------- 选区位置记录 + 选区事件（onSelectionChange） --------------------- */
  useEffect(() => {
    const toElement = (n: Node): Element | null =>
      n.nodeType === Node.ELEMENT_NODE ? (n as Element) : n.parentElement;
    const onSel = () => {
      const root = rootRef.current;
      if (!root) return;
      const sel = window.getSelection();
      // 选区覆盖的块 id 集（按文档顺序；含跨块选区的所有覆盖块）
      let ids: string[] | null = null;
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const startRow = toElement(range.startContainer)?.closest<HTMLElement>("[data-block-id]");
        const endRow = toElement(range.endContainer)?.closest<HTMLElement>("[data-block-id]");
        if (startRow && endRow && root.contains(startRow) && root.contains(endRow)) {
          const flat = flattenBlocks(store.getDocument());
          const i1 = flat.findIndex((f) => f.block.id === startRow.dataset.blockId);
          const i2 = flat.findIndex((f) => f.block.id === endRow.dataset.blockId);
          if (i1 >= 0 && i2 >= 0) {
            const [a, b] = i1 <= i2 ? [i1, i2] : [i2, i1];
            ids = flat.slice(a, b + 1).map((f) => f.block.id);
          }
        }
      }
      editor._setSelection(ids ? { blockIds: ids } : null);
      // 文本光标记录（undo/redo 恢复用）
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const startEl = toElement(range.startContainer);
      const el = startEl?.closest<HTMLElement>(".k3-editable");
      if (!el || !root.contains(el)) return;
      const row = el.closest<HTMLElement>("[data-block-id]");
      const blockId = row?.dataset.blockId;
      const offsets = getSelectionOffsets(el);
      if (blockId && offsets) store.cursor = { blockId, offset: offsets.start };
    };
    document.addEventListener("selectionchange", onSel);
    return () => {
      document.removeEventListener("selectionchange", onSel);
      editor._setSelection(null);
    };
  }, [store, editor]);

  /* --------------------- 分割线选中态：删除 / 点击其它处取消 --------------------- */
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest?.(".k3-editable") || t?.closest?.("input, textarea")) return;
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        editor.removeBlocks([selectedId]);
        setSelectedId(null);
      } else if (e.key === "Escape") {
        setSelectedId(null);
      }
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const row = t?.closest?.("[data-block-id]");
      if (row?.getAttribute("data-block-id") !== selectedId) setSelectedId(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [selectedId, editor]);

  /* --------------------------------- 斜杠菜单 -------------------------------- */

  // blockConfig.heading.levels：未允许的级别不出现在斜杠菜单
  const slashItems = slash
    ? filterSlashItems(slash.query, (t) => editor.isTypeAllowed(t)).filter(
        (it) => it.type !== "heading" || editor.isHeadingLevelAllowed(Number(it.props.level))
      )
    : [];
  const slashActive = Math.min(slash?.active ?? 0, Math.max(0, slashItems.length - 1));

  const updateSlash = (el: HTMLElement, block: Block) => {
    if (!slashMenuEnabled || !editable || block.type === "codeBlock") {
      setSlash(null);
      return;
    }
    const offsets = getSelectionOffsets(el);
    if (!offsets || offsets.start !== offsets.end) {
      setSlash(null);
      return;
    }
    const before = plainText(block.content).slice(0, offsets.start);
    const idx = before.lastIndexOf("/");
    const query = idx >= 0 ? before.slice(idx + 1) : "";
    if (idx < 0 || (idx > 0 && !/\s/.test(before[idx - 1])) || /\s/.test(query)) {
      setSlash(null);
      return;
    }
    setSlash((prev) => ({
      blockId: block.id,
      start: idx,
      query,
      active: prev && prev.blockId === block.id && prev.start === idx ? prev.active : 0,
    }));
  };

  const applySlashItem = (item: SlashItem) => {
    if (!slash) return;
    const block = store.getBlock(slash.blockId);
    setSlash(null);
    setMention(null);
    setEmoji(null);
    if (!block) return;
    const root = rootRef.current;
    const el = root?.querySelector(`[data-block-id="${slash.blockId}"] .k3-editable`) as HTMLElement | null;
    const offsets = el ? getSelectionOffsets(el) : null;
    const end = Math.max(offsets?.end ?? slash.start, slash.start);
    const content = removeInlineRange(block.content, slash.start, end);
    // 分栏：当前块保留（去掉 /query 文本），在其后插入 columnList（2 栏 × 空段落）
    if (item.type === "columnList") {
      const colList = createColumnList(2);
      store.commit(() => {
        store.applyUpdate(block.id, { type: "paragraph", props: {}, content });
        store.insertRaw([colList], block.id, "after");
      });
      const firstPara = colList.children[0]?.children[0];
      if (firstPara) editor.setTextCursor(firstPara.id, 0);
      return;
    }
    let focusId = block.id;
    let focusOffset = slash.start;
    // blockConfig.codeBlock.defaultLanguage：新代码块的初始语言
    const itemProps =
      item.type === "codeBlock" ? { ...item.props, language: editor.codeDefaultLanguage } : item.props;
    store.commit(() => {
      store.applyUpdate(block.id, {
        type: item.type,
        props: { ...defaultPropsFor(item.type), ...itemProps },
        content,
      });
      if (item.type === "divider") {
        const p = createBlock();
        store.insertRaw([p], block.id, "after");
        focusId = p.id;
        focusOffset = 0;
      }
    });
    if (item.type !== "image" && item.type !== "pdf") editor.setTextCursor(focusId, focusOffset);
  };

  /* --------------------------------- @ 提及菜单 -------------------------------- */

  const mentionItems = mention && editor.mentions ? filterMentionItems(editor.mentions.items, mention.query) : [];
  const mentionActive = Math.min(mention?.active ?? 0, Math.max(0, mentionItems.length - 1));

  const updateMention = (el: HTMLElement, block: Block) => {
    const conf = editor.mentions;
    if (!conf || !editable || !isTextBlock(block.type) || block.type === "codeBlock") {
      setMention(null);
      return;
    }
    const offsets = getSelectionOffsets(el);
    if (!offsets || offsets.start !== offsets.end) {
      setMention(null);
      return;
    }
    const before = plainText(block.content).slice(0, offsets.start);
    const idx = before.lastIndexOf(conf.trigger);
    if (idx < 0 || /\s/.test(before.slice(idx + conf.trigger.length))) {
      setMention(null);
      return;
    }
    // 仅当 trigger 前是行首 / 空白 / 标点时触发（兼容邮箱等场景）
    if (idx > 0 && !/[\s\p{P}]/u.test(before[idx - 1])) {
      setMention(null);
      return;
    }
    // trigger 落在既有 mention 节点内（如 "@label" 的 @）时不触发
    let pos = 0;
    for (const item of block.content) {
      const len =
        item.type === "text"
          ? item.text.length
          : item.type === "mention"
            ? item.props.label.length + 1
            : plainText(item.content).length;
      if (item.type === "mention" && idx >= pos && idx < pos + len) {
        setMention(null);
        return;
      }
      pos += len;
    }
    const query = before.slice(idx + conf.trigger.length);
    setMention((prev) => ({
      blockId: block.id,
      start: idx,
      query,
      active: prev && prev.blockId === block.id && prev.start === idx ? prev.active : 0,
    }));
  };

  const applyMention = (item: K3MentionItem) => {
    if (!mention) return;
    const block = store.getBlock(mention.blockId);
    setMention(null);
    setSlash(null);
    setEmoji(null);
    if (!block) return;
    const root = rootRef.current;
    const el = root?.querySelector(`[data-block-id="${mention.blockId}"] .k3-editable`) as HTMLElement | null;
    const offsets = el ? getSelectionOffsets(el) : null;
    const end = Math.max(offsets?.end ?? mention.start, mention.start);
    // 吃掉 @query：在 [start, end) 处替换为 mention 原子节点
    const [before] = splitInline(block.content, mention.start);
    const [, after] = splitInline(block.content, end);
    const content = concatInline(
      concatInline(before, [{ type: "mention", props: { id: item.id, label: item.label } }]),
      after
    );
    store.commit(() => store.applyUpdate(block.id, { content }));
    editor.setTextCursor(block.id, mention.start + item.label.length + 1);
  };

  /* --------------------------------- ":" emoji 菜单 -------------------------------- */

  const emojiItems = emoji && editor.emojiPicker ? filterEmojiItems(emoji.query) : [];
  const emojiActive = Math.min(emoji?.active ?? 0, Math.max(0, emojiItems.length - 1));

  const updateEmoji = (el: HTMLElement, block: Block) => {
    if (!editor.emojiPicker || !editable || !isTextBlock(block.type) || block.type === "codeBlock") {
      setEmoji(null);
      return;
    }
    const offsets = getSelectionOffsets(el);
    if (!offsets || offsets.start !== offsets.end) {
      setEmoji(null);
      return;
    }
    const before = plainText(block.content).slice(0, offsets.start);
    const idx = before.lastIndexOf(":");
    if (idx < 0 || /\s/.test(before.slice(idx + 1))) {
      setEmoji(null);
      return;
    }
    // 仅当 ":" 前是行首 / 空白 / 标点时触发（兼容时间、URL 等场景）
    if (idx > 0 && !/[\s\p{P}]/u.test(before[idx - 1])) {
      setEmoji(null);
      return;
    }
    const query = before.slice(idx + 1);
    setEmoji((prev) => ({
      blockId: block.id,
      start: idx,
      query,
      active: prev && prev.blockId === block.id && prev.start === idx ? prev.active : 0,
    }));
  };

  const applyEmoji = (item: K3EmojiItem) => {
    if (!emoji) return;
    const block = store.getBlock(emoji.blockId);
    setEmoji(null);
    if (!block) return;
    const root = rootRef.current;
    const el = root?.querySelector(`[data-block-id="${emoji.blockId}"] .k3-editable`) as HTMLElement | null;
    const offsets = el ? getSelectionOffsets(el) : null;
    const end = Math.max(offsets?.end ?? emoji.start, emoji.start);
    // 吃掉 :query：替换为普通文本 emoji
    const [before] = splitInline(block.content, emoji.start);
    const [, after] = splitInline(block.content, end);
    const content = concatInline(concatInline(before, [{ type: "text", text: item.emoji }]), after);
    store.commit(() => store.applyUpdate(block.id, { content }));
    editor.setTextCursor(block.id, emoji.start + item.emoji.length);
  };

  /* --------------------------------- 输入同步 -------------------------------- */

  const syncFromDom = (el: HTMLElement, blockId: string) => {
    store.beginTyping(blockId);
    store.updateBlockSilent(blockId, { content: domToInline(el) });
    return store.getBlock(blockId);
  };

  const handleInput = (e: ReactFormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const el = target.closest?.(".k3-editable") as HTMLElement | null;
    const root = rootRef.current;
    if (!el || !root?.contains(el)) return;
    const row = el.closest<HTMLElement>("[data-block-id]");
    const blockId = row?.dataset.blockId;
    if (!blockId) return;
    const block = syncFromDom(el, blockId);
    if (!block) return;
    // 清空浏览器填充的 <br>，保证 placeholder 生效
    if (!block.content.length && el.innerHTML !== "") {
      el.innerHTML = "";
      setDomCursor(el, 0, false);
    }
    if (editor.composing) return;
    if (isTextBlock(block.type) && block.type !== "codeBlock") {
      const offsets = getSelectionOffsets(el);
      if (offsets && offsets.start === offsets.end) {
        if (applyLineInputRule(editor, block, offsets.start)) {
          setSlash(null);
          setMention(null);
          setEmoji(null);
          return;
        }
        if (applyInlineInputRule(editor, block, el, offsets.start)) return;
      }
    }
    updateSlash(el, block);
    updateMention(el, block);
    updateEmoji(el, block);
  };

  const handleCompositionStart = () => {
    editor.composing = true;
  };

  const handleCompositionEnd = (e: ReactCompositionEvent<HTMLDivElement>) => {
    editor.composing = false;
    const target = e.target as HTMLElement;
    const el = target.closest?.(".k3-editable") as HTMLElement | null;
    if (!el) return;
    const row = el.closest<HTMLElement>("[data-block-id]");
    const blockId = row?.dataset.blockId;
    if (!blockId) return;
    const block = syncFromDom(el, blockId);
    if (block) {
      updateSlash(el, block);
      updateMention(el, block);
      updateEmoji(el, block);
    }
  };

  /* --------------------------------- 粘贴处理 -------------------------------- */

  /** 图片文件 → 走 uploadFile 管道（缺省 dataURL）插入图片块 */
  const insertImageFiles = async (files: File[], refId: string | null) => {
    const urls = await Promise.all(
      files.map(async (f) => {
        try {
          return await resolveFileUrl(editor, f);
        } catch (err) {
          console.error("[k3blocks] uploadFile error", err);
          return "";
        }
      })
    );
    const partials = urls
      .map((src, i) =>
        src ? { type: "image", props: { src, alt: files[i].name || "image", caption: "" } } : null
      )
      .filter((p): p is NonNullable<typeof p> => p !== null);
    if (partials.length) editor.insertBlocks(partials, refId, "after");
  };

  /** 根 paste 捕获：先交给自定义 pasteHandler，否则默认纯文本按行拆块 / 块内插入 */
  const handlePasteCapture = (e: ReactClipboardEvent<HTMLDivElement>) => {
    if (!editable) return;
    if (editor.pasteHandler) {
      let handled = false;
      try {
        handled = editor.pasteHandler(e.nativeEvent, editor);
      } catch (err) {
        console.error("[k3blocks] pasteHandler error", err);
      }
      if (handled) {
        e.preventDefault();
        return;
      }
    }
    const target = e.target as HTMLElement;
    const el = target.closest?.(".k3-editable") as HTMLElement | null;
    const root = rootRef.current;
    if (!el || !root?.contains(el)) return; // 例如工具栏链接输入框：走浏览器默认
    // 剪贴板图片文件：走 uploadFile 管道插入图片块（支持粘贴截图）
    const imageFiles = Array.from(e.clipboardData?.files ?? []).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length) {
      e.preventDefault();
      const row = el.closest<HTMLElement>("[data-block-id]");
      void insertImageFiles(imageFiles, row?.dataset.blockId ?? null);
      return;
    }
    const text = e.clipboardData.getData("text/plain");
    if (!text) return;
    const row = el.closest<HTMLElement>("[data-block-id]");
    const blockId = row?.dataset.blockId;
    if (!blockId) return;
    const block = store.getBlock(blockId);
    if (!block) return;
    e.preventDefault();
    const len = plainText(block.content).length;
    const offsets = getSelectionOffsets(el) ?? { start: len, end: len };
    const normalized = text.replace(/\r\n?/g, "\n");
    const [before] = splitInline(block.content, offsets.start);
    const [, after] = splitInline(block.content, offsets.end);
    // 单行 / 代码块：块内插入（代码块内保留换行，不拆块）
    if (!normalized.includes("\n") || block.type === "codeBlock") {
      const content = concatInline(concatInline(before, [{ type: "text", text: normalized }]), after);
      store.commit(() => store.applyUpdate(blockId, { content }));
      editor.setTextCursor(blockId, offsets.start + normalized.length);
      return;
    }
    // 多行：首行并入当前块，中间行各成一个段落，末行带剩余文本落到新段落
    const lines = normalized.split("\n");
    const firstContent = lines[0] ? concatInline(before, [{ type: "text", text: lines[0] }]) : before;
    const lastLine = lines[lines.length - 1];
    const lastContent = concatInline(lastLine ? [{ type: "text" as const, text: lastLine }] : [], after);
    const middle = lines.slice(1, -1).map((l) => createBlock({ type: "paragraph", content: l }));
    const lastBlock = createBlock({ type: "paragraph", content: lastContent });
    store.commit(() => {
      store.applyUpdate(blockId, { content: firstContent });
      store.insertRaw([...middle, lastBlock], blockId, "after");
    });
    editor.setTextCursor(lastBlock.id, lastLine.length);
  };

  /* --------------------------------- 键盘行为 -------------------------------- */

  const handleEnter = (e: ReactKeyboardEvent, block: Block, el: HTMLElement) => {
    e.preventDefault();
    if (block.type === "codeBlock") {
      if (e.metaKey || e.ctrlKey) {
        // Cmd/Ctrl+Enter：跳出代码块
        const p = createBlock();
        store.commit(() => store.insertRaw([p], block.id, "after"));
        editor.setTextCursor(p.id, 0);
      } else {
        document.execCommand("insertLineBreak");
      }
      return;
    }
    if (e.shiftKey) {
      document.execCommand("insertLineBreak");
      return;
    }
    if (applyEnterRule(editor, block)) return;
    if (isListBlock(block.type) && plainText(block.content) === "") {
      // 空列表项 Enter → 降级为段落（嵌套则先提升一级）
      const loc = store.locate(block.id);
      if (loc?.parent) store.outdentBlock(block.id);
      else store.updateBlock(block.id, { type: "paragraph", props: {} });
      editor.setTextCursor(block.id, 0);
      return;
    }
    const offsets = getSelectionOffsets(el);
    if (!offsets) return;
    if (offsets.start !== offsets.end) document.execCommand("delete");
    const cur = getSelectionOffsets(el);
    if (!cur) return;
    const latest = store.getBlock(block.id);
    if (!latest) return;
    const [before, after] = splitInline(latest.content, cur.start);
    // DOM 手术：删除光标之后的内容（避免重置 innerHTML 造成光标跳动）
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const r = sel.getRangeAt(0).cloneRange();
      const endRange = document.createRange();
      endRange.selectNodeContents(el);
      r.setEnd(endRange.endContainer, endRange.endOffset);
      r.deleteContents();
    }
    const newType = isListBlock(block.type) ? block.type : "paragraph";
    const newProps = block.type === "checkListItem" ? { checked: false } : {};
    const newBlock = createBlock({ type: newType, props: newProps, content: after });
    store.commit(() => {
      store.applyUpdate(block.id, { content: before });
      store.insertRaw([newBlock], block.id, "after");
    });
    editor.setTextCursor(newBlock.id, 0);
  };

  /** 块是否位于分栏组首（第一列第一个位置）；是则返回 columnList id */
  const columnListAtStart = (blockId: string): string | null => {
    let loc = store.locate(blockId);
    if (!loc || loc.index !== 0) return null;
    let parent = loc.parent;
    while (parent && parent.type === "column") {
      const pLoc = store.locate(parent.id);
      if (!pLoc || pLoc.index !== 0) return null;
      parent = pLoc.parent;
    }
    return parent && parent.type === "columnList" ? parent.id : null;
  };

  /** 分栏块首 Backspace：整组降级为普通段落序列（各栏子块按顺序提升到原位） */
  const unwrapColumnList = (id: string) => {
    let focusId: string | null = null;
    store.commit(() => {
      const loc = store.locate(id);
      if (!loc) return;
      const lifted: Block[] = [];
      for (const child of loc.block.children) {
        if (child.type === "column") lifted.push(...child.children);
        else lifted.push(child);
      }
      if (!lifted.length) lifted.push(createBlock());
      loc.siblings.splice(loc.index, 1, ...lifted);
      const first = lifted.find((b) => isTextBlock(b.type)) ?? lifted[0];
      focusId = first.id;
    });
    if (focusId) editor.setTextCursor(focusId, 0);
  };

  const handleBackspace = (e: ReactKeyboardEvent, block: Block, el: HTMLElement) => {
    const offsets = getSelectionOffsets(el);
    if (!offsets || offsets.start !== 0 || offsets.end !== 0) return; // 浏览器默认
    e.preventDefault();
    // 分栏块首：整组降级为普通段落序列
    const clId = columnListAtStart(block.id);
    if (clId) {
      unwrapColumnList(clId);
      return;
    }
    const text = plainText(block.content);
    if (block.type === "codeBlock") {
      if (text.trim() === "") {
        store.updateBlock(block.id, { type: "paragraph", props: {} });
        editor.setTextCursor(block.id, 0);
      }
      return;
    }
    if (block.type !== "paragraph") {
      const loc = store.locate(block.id);
      // 栏内不提升出列（columnList 的 children 只能是 column）
      if (loc?.parent && loc.parent.type !== "column") {
        store.outdentBlock(block.id);
      } else {
        store.updateBlock(block.id, { type: "paragraph", props: {} });
      }
      editor.setTextCursor(block.id, 0);
      return;
    }
    // paragraph：合并到上一块 / 删空块
    const flat = flattenBlocks(store.getDocument());
    const idx = flat.findIndex((f) => f.block.id === block.id);
    const prev = idx > 0 ? flat[idx - 1].block : null;
    if (!prev) return;
    if (text === "") {
      store.removeBlocks([block.id]);
      if (isTextBlock(prev.type)) editor.setTextCursor(prev.id, plainText(prev.content).length);
      else if (prev.type === "divider") setSelectedId(prev.id);
      return;
    }
    if (isTextBlock(prev.type)) {
      const joinOffset = plainText(prev.content).length;
      const merged = concatInline(prev.content, block.content);
      store.commit(() => {
        store.applyUpdate(prev.id, { content: merged });
        store.removeRaw(block.id);
      });
      editor.setTextCursor(prev.id, joinOffset);
      return;
    }
    if (prev.type === "divider") {
      store.removeBlocks([prev.id]);
      editor.setTextCursor(block.id, 0);
    }
  };

  const moveCaret = (e: ReactKeyboardEvent, block: Block, el: HTMLElement, dir: -1 | 1) => {
    const offsets = getSelectionOffsets(el);
    if (!offsets) return;
    if (block.type === "codeBlock") {
      const len = plainText(block.content).length;
      if (dir === -1 && offsets.start !== 0) return;
      if (dir === 1 && offsets.end !== len) return;
    }
    const flat = flattenBlocks(store.getDocument()).filter((f) => isTextBlock(f.block.type));
    const idx = flat.findIndex((f) => f.block.id === block.id);
    const target = idx >= 0 ? flat[idx + dir] : null;
    if (!target) return;
    e.preventDefault();
    const len = plainText(target.block.content).length;
    editor.setTextCursor(target.block.id, Math.min(offsets.start, len));
  };

  const handleTab = (e: ReactKeyboardEvent, block: Block, el: HTMLElement) => {
    if (!isListBlock(block.type)) return;
    e.preventDefault();
    const offsets = getSelectionOffsets(el);
    const ok = e.shiftKey ? store.outdentBlock(block.id) : store.indentBlock(block.id);
    if (ok) editor.setTextCursor(block.id, offsets?.start ?? 0);
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!editable || editor.composing) return;
    const target = e.target as HTMLElement;

    // emoji 网格键盘导航（↑↓←→↵esc，优先于 mention / 斜杠菜单）
    if (emoji) {
      if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Enter", "Escape", "Tab"].includes(e.key)) {
        e.preventDefault();
        const count = Math.max(1, emojiItems.length);
        if (e.key === "Escape") setEmoji(null);
        else if (e.key === "ArrowRight") setEmoji({ ...emoji, active: (emojiActive + 1) % count });
        else if (e.key === "ArrowLeft") setEmoji({ ...emoji, active: (emojiActive - 1 + count) % count });
        else if (e.key === "ArrowDown")
          setEmoji({ ...emoji, active: Math.min(count - 1, emojiActive + EMOJI_GRID_COLUMNS) });
        else if (e.key === "ArrowUp") setEmoji({ ...emoji, active: Math.max(0, emojiActive - EMOJI_GRID_COLUMNS) });
        else if (emojiItems[emojiActive]) applyEmoji(emojiItems[emojiActive]);
        return;
      }
    }

    // mention 菜单键盘导航（↑↓↵esc，优先于斜杠菜单）
    if (mention) {
      if (["ArrowDown", "ArrowUp", "Enter", "Escape", "Tab"].includes(e.key)) {
        e.preventDefault();
        if (e.key === "Escape") setMention(null);
        else if (e.key === "ArrowDown") setMention({ ...mention, active: (mentionActive + 1) % Math.max(1, mentionItems.length) });
        else if (e.key === "ArrowUp") setMention({ ...mention, active: (mentionActive - 1 + mentionItems.length) % Math.max(1, mentionItems.length) });
        else if (mentionItems[mentionActive]) applyMention(mentionItems[mentionActive]);
        return;
      }
    }

    // 斜杠菜单键盘导航（↑↓↵esc）
    if (slash) {
      if (["ArrowDown", "ArrowUp", "Enter", "Escape", "Tab"].includes(e.key)) {
        e.preventDefault();
        if (e.key === "Escape") setSlash(null);
        else if (e.key === "ArrowDown") setSlash({ ...slash, active: (slashActive + 1) % Math.max(1, slashItems.length) });
        else if (e.key === "ArrowUp") setSlash({ ...slash, active: (slashActive - 1 + slashItems.length) % Math.max(1, slashItems.length) });
        else if (slashItems[slashActive]) applySlashItem(slashItems[slashActive]);
        return;
      }
    }

    const el = target.closest?.(".k3-editable") as HTMLElement | null;
    const root = rootRef.current;
    if (!el || !root?.contains(el)) return;
    const row = el.closest<HTMLElement>("[data-block-id]");
    const blockId = row?.dataset.blockId;
    if (!blockId) return;
    const block = store.getBlock(blockId);
    if (!block) return;

    const meta = e.metaKey || e.ctrlKey;
    const key = e.key.toLowerCase();

    if (meta && key === "z" && !e.shiftKey) {
      e.preventDefault();
      setSlash(null);
      setMention(null);
      setEmoji(null);
      editor.undo();
      return;
    }
    if ((meta && key === "y") || (meta && e.shiftKey && key === "z")) {
      e.preventDefault();
      setSlash(null);
      setMention(null);
      setEmoji(null);
      editor.redo();
      return;
    }
    if (meta && !e.shiftKey && key === "b") {
      e.preventDefault();
      document.execCommand("bold");
      return;
    }
    if (meta && !e.shiftKey && key === "i") {
      e.preventDefault();
      document.execCommand("italic");
      return;
    }
    if (meta && !e.shiftKey && key === "u") {
      e.preventDefault();
      document.execCommand("underline");
      return;
    }
    if (meta && key === "e") {
      e.preventDefault();
      const wrapped = wrapSelectionTag("code");
      if (wrapped) wrapped.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }
    if (meta && key === "k") {
      e.preventDefault();
      toolbarApi.current?.openLink();
      return;
    }

    switch (e.key) {
      case "Enter":
        handleEnter(e, block, el);
        break;
      case "Backspace":
        handleBackspace(e, block, el);
        break;
      case "ArrowUp":
        moveCaret(e, block, el, -1);
        break;
      case "ArrowDown":
        moveCaret(e, block, el, 1);
        break;
      case "Tab":
        handleTab(e, block, el);
        break;
    }
  };

  /* --------------------------------- 拖拽排序 -------------------------------- */

  const handleDragOver = (e: ReactDragEvent<HTMLDivElement>) => {
    // 外部图片文件拖入：允许 drop（插入图片块）
    if (!e.dataTransfer.types.includes("text/k3-block-id")) {
      if (editable && e.dataTransfer.types.includes("Files")) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }
      return;
    }
    const root = rootRef.current;
    if (!root) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const t = computeDropTarget(root, e.clientY, draggingId);
    setDropIndicator(t);
  };

  const handleDrop = (e: ReactDragEvent<HTMLDivElement>) => {
    const id = e.dataTransfer.getData("text/k3-block-id");
    if (!id) {
      // 外部图片文件拖入编辑器：走 uploadFile 管道插入图片块
      if (!editable) return;
      const files = Array.from(e.dataTransfer?.files ?? []).filter((f) => f.type.startsWith("image/"));
      if (!files.length) return;
      e.preventDefault();
      const root = rootRef.current;
      const t = root ? computeDropTarget(root, e.clientY, null) : null;
      void insertImageFiles(files, t?.id ?? null);
      setDropIndicator(null);
      return;
    }
    e.preventDefault();
    const root = rootRef.current;
    const t = root ? computeDropTarget(root, e.clientY, id) : null;
    if (t) store.moveBlock(id, t.id, t.placement);
    setDropIndicator(null);
    setDraggingId(null);
  };

  const handleDragLeave = (e: ReactDragEvent<HTMLDivElement>) => {
    if (!rootRef.current?.contains(e.relatedTarget as Node)) setDropIndicator(null);
  };

  /* ------------------------------- 空白区域点击 ------------------------------- */

  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement;
    if (t !== rootRef.current && !t.classList.contains("k3-blocks")) return;
    e.preventDefault();
    const flat = flattenBlocks(store.getDocument()).filter((f) => isTextBlock(f.block.type));
    const last = flat[flat.length - 1];
    if (last) editor.setTextCursor(last.block.id, plainText(last.block.content).length);
  };

  /* ---------------------------------- 渲染 ---------------------------------- */

  const ctx: ViewContext = {
    editor,
    editable,
    placeholder,
    dict,
    blockRenderers: props.blockRenderers,
    inlineRenderers: props.inlineRenderers,
    inlineStyleRenderers: props.inlineStyleRenderers,
    domAttributes: props.domAttributes,
    sideMenu: sideMenuEnabled,
    hoveredId,
    setHoveredId,
    selectedId,
    setSelectedId,
    dropIndicator,
    setDropIndicator,
    draggingId,
    setDraggingId,
  };

  const caret = slash || mention || emoji ? getCaretRect() : null;
  const caretPos = (state: SlashState | null): { top: number; left: number } | null => {
    if (!state) return null;
    if (caret) return { top: caret.bottom + 6, left: caret.left };
    const row = rootRef.current?.querySelector(`[data-block-id="${state.blockId}"]`);
    const r = row?.getBoundingClientRect();
    return r ? { top: r.bottom + 6, left: r.left + 52 } : null;
  };
  const slashPos = caretPos(slash);
  const mentionPos = caretPos(mention);
  const emojiPos = caretPos(emoji);

  const className = ["k3-editor", editable ? "k3-editable-root" : "k3-readonly", props.className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={rootRef}
      className={className}
      data-theme={props.theme}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onPasteCapture={handlePasteCapture}
      onMouseDown={handleMouseDown}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
      {...props.domAttributes?.editor}
    >
      <div className="k3-blocks">
        <BlockList blocks={store.getDocument()} ctx={ctx} depth={0} />
      </div>
      {slashMenuEnabled && slash ? (
        <SlashMenu
          items={slashItems}
          active={slashActive}
          position={slashPos}
          onSelect={applySlashItem}
          onHover={(i) => setSlash((s) => (s ? { ...s, active: i } : s))}
          dict={dict}
        />
      ) : null}
      {editor.mentions && mention ? (
        <MentionMenu
          items={mentionItems}
          active={mentionActive}
          position={mentionPos}
          onSelect={applyMention}
          onHover={(i) => setMention((s) => (s ? { ...s, active: i } : s))}
          dict={dict}
        />
      ) : null}
      {editor.emojiPicker && emoji ? (
        <EmojiMenu
          items={emojiItems}
          active={emojiActive}
          position={emojiPos}
          onSelect={applyEmoji}
          onHover={(i) => setEmoji((s) => (s ? { ...s, active: i } : s))}
          dict={dict}
        />
      ) : null}
      {toolbarEnabled && editable ? <FormattingToolbar editor={editor} onRegister={registerToolbar} dict={dict} /> : null}
    </div>
  );
}
