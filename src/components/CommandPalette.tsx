import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Blocks, FlaskConical, Code2, Search } from "lucide-react";
import Kbd from "@/components/Kbd";
import { cn } from "@/lib/utils";
import {
  SEARCH_GROUPS,
  filterSearchIndex,
  type SearchEntry,
  type SearchGroup,
} from "@/lib/searchIndex";

const GROUP_ICONS: Record<SearchGroup, typeof FileText> = {
  Pages: FileText,
  Blocks: Blocks,
  Examples: FlaskConical,
  API: Code2,
};

/**
 * ⌘K command palette (design.md §6.2): 560px centered modal, inset input,
 * grouped results, full keyboard nav (↑↓ ↵ esc), footer kbd hint bar.
 * Menu motion: 200ms opacity + scale 0.96→1 overshoot pop.
 */
export default function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const results = useMemo(() => filterSearchIndex(query), [query]);

  const grouped = useMemo(() => {
    const map = new Map<SearchGroup, SearchEntry[]>();
    for (const group of SEARCH_GROUPS) {
      const entries = results.filter((r) => r.group === group);
      if (entries.length > 0) map.set(group, entries);
    }
    return map;
  }, [results]);

  // Flat list in display order for keyboard navigation.
  const flat = useMemo(() => {
    const out: SearchEntry[] = [];
    for (const group of SEARCH_GROUPS) out.push(...(grouped.get(group) ?? []));
    return out;
  }, [grouped]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      // Focus after the pop animation frame.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const openEntry = (entry: SearchEntry) => {
    onClose();
    navigate(entry.path);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const entry = flat[activeIndex];
      if (entry) openEntry(entry);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  // Keep the active row in view.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const row = list.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    row?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  let rowIndex = -1;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search documentation"
            className="relative flex w-[560px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-lg border border-border bg-surface-1 shadow-popover"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0, 1, 0.2, 1.1] }}
            style={{ transformOrigin: "center top" }}
            onKeyDown={onKeyDown}
          >
            {/* Inset input, 36px high */}
            <div className="border-b border-border p-2">
              <div className="flex h-9 items-center gap-2 rounded-lg bg-surface-inset px-3">
                <Search size={14} strokeWidth={1.5} className="shrink-0 text-text-3" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search documentation…"
                  className="w-full bg-transparent font-mono text-[13px] text-text-1 placeholder:text-text-3 focus:outline-none"
                  style={{ boxShadow: "none" }}
                />
              </div>
            </div>

            {/* Grouped results */}
            <div ref={listRef} className="max-h-[320px] overflow-y-auto p-1">
              {flat.length === 0 && (
                <div className="px-3 py-8 text-center text-sm text-text-3">
                  No results for “{query}”.
                </div>
              )}
              {SEARCH_GROUPS.map((group) => {
                const entries = grouped.get(group);
                if (!entries) return null;
                const Icon = GROUP_ICONS[group];
                return (
                  <div key={group} className="mb-1 last:mb-0">
                    <div className="px-3 pb-1 pt-2 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-text-4">
                      {group}
                    </div>
                    {entries.map((entry) => {
                      rowIndex += 1;
                      const idx = rowIndex;
                      const active = idx === activeIndex;
                      return (
                        <button
                          key={`${entry.group}-${entry.title}`}
                          type="button"
                          data-index={idx}
                          onClick={() => openEntry(entry)}
                          onMouseMove={() => setActiveIndex(idx)}
                          className={cn(
                            "flex h-9 w-full items-center gap-2.5 rounded-md px-3 text-left",
                            "transition-colors duration-150 ease-k3",
                            active ? "bg-accent-soft" : "bg-transparent",
                          )}
                        >
                          <Icon
                            size={16}
                            strokeWidth={1.5}
                            className={cn("shrink-0", active ? "text-accent" : "text-text-3")}
                          />
                          <span className={cn("text-sm", active ? "text-text-1" : "text-text-2")}>
                            {entry.title}
                          </span>
                          <span className="ml-auto font-mono text-[11px] text-text-4">
                            {entry.breadcrumb}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Footer hint bar */}
            <div className="flex h-9 items-center gap-4 border-t border-border px-3 text-[12px] text-text-3">
              <span className="flex items-center gap-1.5">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Kbd>↵</Kbd>
                <span>Open</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Kbd>esc</Kbd>
                <span>Close</span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
