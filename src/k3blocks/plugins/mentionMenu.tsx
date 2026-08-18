/**
 * K3Blocks — @ 提及菜单：trigger（默认 "@"）唤起，模糊过滤候选，
 * ↑↓ 选择、↵ 插入、esc 关闭（键盘事件由 K3EditorView 统一分发，同斜杠菜单）。
 */
import type { K3Dictionary } from "../i18n";
import { fuzzyMatch } from "../schema";
import type { K3MentionItem } from "../types";

/** 模糊过滤 mention 候选（label + subtext + id） */
export function filterMentionItems(items: K3MentionItem[], query: string): K3MentionItem[] {
  return items.filter((it) => fuzzyMatch(query, `${it.label} ${it.subtext ?? ""} ${it.id}`));
}

export interface MentionMenuProps {
  items: K3MentionItem[];
  active: number;
  position: { top: number; left: number } | null;
  onSelect: (item: K3MentionItem) => void;
  onHover: (index: number) => void;
  dict: K3Dictionary;
}

export function MentionMenu({ items, active, position, onSelect, onHover, dict }: MentionMenuProps) {
  if (!position) return null;
  return (
    <div
      className="k3-mention-menu k3-pop"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="k3-slash-list">
        {items.length === 0 ? <div className="k3-slash-empty">{dict.mentions.empty}</div> : null}
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            className={`k3-slash-item${i === active ? " k3-active" : ""}`}
            onMouseEnter={() => onHover(i)}
            onClick={() => onSelect(item)}
          >
            <span className="k3-mention-avatar" aria-hidden>
              {item.label.slice(0, 1)}
            </span>
            <span className="k3-slash-label">{item.label}</span>
            {item.subtext ? <span className="k3-slash-hint">{item.subtext}</span> : null}
          </button>
        ))}
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
