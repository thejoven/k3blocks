/**
 * K3Blocks — ":" emoji 网格建议菜单：8 列网格、模糊过滤（中英文关键词）、
 * ↑↓←→ 网格键盘导航、↵ 插入、esc 关闭（键盘事件由 K3EditorView 统一分发，同 mention 菜单）。
 */
import type { K3Dictionary } from "../i18n";
import { EMOJI_GRID_COLUMNS } from "./emojiData";
import type { K3EmojiItem } from "./emojiData";

export interface EmojiMenuProps {
  items: K3EmojiItem[];
  active: number;
  position: { top: number; left: number } | null;
  onSelect: (item: K3EmojiItem) => void;
  onHover: (index: number) => void;
  dict: K3Dictionary;
}

export function EmojiMenu({ items, active, position, onSelect, onHover, dict }: EmojiMenuProps) {
  if (!position) return null;
  return (
    <div
      className="k3-emoji-menu k3-pop"
      style={{ top: position.top, left: position.left, "--k3-emoji-cols": EMOJI_GRID_COLUMNS } as React.CSSProperties}
      onMouseDown={(e) => e.preventDefault()}
    >
      {items.length === 0 ? (
        <div className="k3-slash-empty">{dict.emoji.empty}</div>
      ) : (
        <div className="k3-emoji-grid" role="listbox">
          {items.map((item, i) => (
            <button
              key={`${item.emoji}-${i}`}
              type="button"
              role="option"
              aria-selected={i === active}
              className={`k3-emoji-item${i === active ? " k3-active" : ""}`}
              title={item.keywords.split(" ")[0]}
              onMouseEnter={() => onHover(i)}
              onClick={() => onSelect(item)}
            >
              {item.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
