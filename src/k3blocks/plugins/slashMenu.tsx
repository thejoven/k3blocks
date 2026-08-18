/**
 * K3Blocks — 斜杠菜单：'/' 唤起，模糊过滤，分组 Basic blocks / Media，
 * ↑↓ 选择、↵ 插入、esc 关闭（键盘事件由 K3EditorView 统一分发）。
 */
import type { ComponentType } from "react";
import {
  Code2,
  Columns2,
  FileText,
  Globe,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Pilcrow,
  Sigma,
  Table,
  TextQuote,
  Workflow,
} from "lucide-react";
import type { K3Dictionary } from "../i18n";
import type { SlashItem } from "../schema";

const ICONS: Record<string, ComponentType<{ size?: number | string }>> = {
  paragraph: Pilcrow,
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  bullet: List,
  numbered: ListOrdered,
  check: ListTodo,
  quote: TextQuote,
  code: Code2,
  divider: Minus,
  image: ImageIcon,
  columns: Columns2,
  table: Table,
  math: Sigma,
  embed: Globe,
  diagram: Workflow,
  pdf: FileText,
};

/** SlashItem.id → 字典条目名 */
const ITEM_LABEL_KEYS: Record<string, keyof K3Dictionary["slashMenu"]["items"]> = {
  paragraph: "paragraph",
  h1: "heading1",
  h2: "heading2",
  h3: "heading3",
  bulletListItem: "bulletListItem",
  numberedListItem: "numberedListItem",
  checkListItem: "checkListItem",
  quote: "quote",
  codeBlock: "codeBlock",
  divider: "divider",
  image: "image",
  columnList: "columnList",
  table: "table",
  math: "math",
  embed: "embed",
  diagram: "diagram",
  pdf: "pdf",
};

export interface SlashMenuProps {
  items: SlashItem[];
  active: number;
  position: { top: number; left: number } | null;
  onSelect: (item: SlashItem) => void;
  onHover: (index: number) => void;
  dict: K3Dictionary;
}

export function SlashMenu({ items, active, position, onSelect, onHover, dict }: SlashMenuProps) {
  if (!position) return null;
  let lastGroup = "";
  const groupLabels: Record<string, string> = {
    basic: dict.slashMenu.groupBasic,
    media: dict.slashMenu.groupMedia,
  };
  const itemLabel = (item: SlashItem): string => {
    const key = ITEM_LABEL_KEYS[item.id];
    return (key && dict.slashMenu.items[key]) || item.label;
  };
  return (
    <div
      className="k3-slash-menu k3-pop"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="k3-slash-list">
        {items.length === 0 ? <div className="k3-slash-empty">{dict.slashMenu.empty}</div> : null}
        {items.map((item, i) => {
          const Icon = ICONS[item.icon] ?? Pilcrow;
          const groupHeader =
            item.group !== lastGroup ? (
              <div className="k3-slash-group" key={`g-${item.group}`}>
                {groupLabels[item.group] ?? item.group}
              </div>
            ) : null;
          lastGroup = item.group;
          return (
            <div key={item.id}>
              {groupHeader}
              <button
                type="button"
                className={`k3-slash-item${i === active ? " k3-active" : ""}`}
                onMouseEnter={() => onHover(i)}
                onClick={() => onSelect(item)}
              >
                <span className="k3-slash-icon">
                  <Icon size={16} />
                </span>
                <span className="k3-slash-label">{itemLabel(item)}</span>
                {item.hint ? <span className="k3-slash-hint">{item.hint}</span> : null}
              </button>
            </div>
          );
        })}
      </div>
      <div className="k3-slash-footer">
        <kbd>↑</kbd>
        <kbd>↓</kbd>
        <span>{dict.slashMenu.footerSelect}</span>
        <kbd>↵</kbd>
        <span>{dict.slashMenu.footerInsert}</span>
        <kbd>esc</kbd>
        <span>{dict.slashMenu.footerClose}</span>
      </div>
    </div>
  );
}
