/**
 * K3Blocks — Notion 风格块编辑器 React 组件（公共导出）。
 */
import "./theme.css";

export { useK3Editor } from "./useK3Editor";
export { K3EditorView } from "./K3EditorView";
export { BLOCK_SPECS, SLASH_ITEMS } from "./schema";
export { zhCN, enUS, mergeDictionary } from "./i18n";
export {
  blocksToHTML,
  blocksToEmailHTML,
  blocksToDocxBlob,
  blocksToOdtBlob,
  printBlocks,
  downloadBlob,
} from "./exporters";
export { tryParseHTMLToBlocks, tryParseMarkdownToBlocks } from "./importers";
export { EMOJI_LIST } from "./plugins/emojiData";
export { CODE_LANGUAGES, resolveLanguage } from "./highlight";

export type { K3Dictionary, DeepPartial } from "./i18n";
export type { K3EmojiItem } from "./plugins/emojiData";

export type {
  Block,
  InlineContent,
  InlineStyles,
  PartialBlock,
  Placement,
  CursorPosition,
  K3Editor,
  K3Selection,
  K3PasteHandler,
  K3MentionItem,
  K3BlockConfig,
  K3FileUploader,
  K3InlineRenderer,
  K3InlineStyleRenderer,
  K3CustomInlineContent,
  UseK3EditorOptions,
  K3EditorViewProps,
  BlockType,
} from "./types";
