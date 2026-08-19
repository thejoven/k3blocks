/**
 * /playground — 全页实验室（playground.md）。
 * 三区域：设置轨（232px）· 中央文档画布 · 检查器（360px，JSON / Markdown / Events）。
 * 所有开关即时作用于真实编辑器；设置持久化到 localStorage（k3:playground）。
 */
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, Download, Redo2, Settings2, Undo2, X } from "lucide-react";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";
import { isTextBlock } from "@/k3blocks/types";
import Kbd from "@/components/Kbd";
import { countBlocks, docStats, replaceDocument, showcaseDocument } from "@/lib/sampleDoc";
import { CopyButton, GhostButton } from "@/examples/shared";
import { VERSION } from "@/lib/version";
import { cn } from "@/lib/utils";

/* ---------------------------------- 设置 ---------------------------------- */

interface Settings {
  editable: boolean;
  theme: "light" | "dark";
  placeholder: string;
  slashMenu: boolean;
  formattingToolbar: boolean;
  sideMenu: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  editable: true,
  theme: "dark",
  placeholder: "输入 '/' 查看命令",
  slashMenu: true,
  formattingToolbar: true,
  sideMenu: true,
};

const STORAGE_KEY = "k3:playground";

function readSettings(): { settings: Settings; restored: boolean } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { settings: DEFAULT_SETTINGS, restored: false };
    return { settings: { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }, restored: true };
  } catch {
    return { settings: DEFAULT_SETTINGS, restored: false };
  }
}

/* --------------------------------- 事件日志 -------------------------------- */

interface LogRow {
  id: number;
  time: string;
  op: string;
  detail: string;
}

let logSeq = 0;

function now(): string {
  const d = new Date();
  const p = (n: number, l = 2) => String(n).padStart(l, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}`;
}

function flat(blocks: Block[], out: Block[] = []): Block[] {
  for (const b of blocks) {
    out.push(b);
    flat(b.children, out);
  }
  return out;
}

/* --------------------------------- 大纲 --------------------------------- */

interface OutlineRow {
  block: Block;
  depth: number;
}

/** 文档块树 → 扁平大纲行（带缩进层级） */
function outlineTree(blocks: Block[], depth = 0, out: OutlineRow[] = []): OutlineRow[] {
  for (const b of blocks) {
    out.push({ block: b, depth });
    outlineTree(b.children, depth + 1, out);
  }
  return out;
}

/** 块行内纯文本预览（首 24 字） */
function blockPreview(b: Block): string {
  let s = "";
  const walk = (cs: Block["content"]) => {
    for (const c of cs) {
      if (c.type === "text") s += c.text;
      else walk(c.content);
    }
  };
  walk(b.content);
  return s.slice(0, 24);
}

/** 文档 diff → 操作日志（updateBlock / insertBlocks / removeBlocks / moveBlock） */
function diffDocs(prev: Block[], next: Block[]): { op: string; detail: string }[] {
  const rows: { op: string; detail: string }[] = [];
  const prevFlat = flat(prev);
  const nextFlat = flat(next);
  const prevMap = new Map(prevFlat.map((b) => [b.id, b]));
  const nextMap = new Map(nextFlat.map((b) => [b.id, b]));

  for (const b of nextFlat) {
    if (!prevMap.has(b.id)) rows.push({ op: "insertBlocks", detail: `${b.id} type=${b.type}` });
  }
  for (const b of prevFlat) {
    if (!nextMap.has(b.id)) rows.push({ op: "removeBlocks", detail: b.id });
  }
  for (const b of nextFlat) {
    const o = prevMap.get(b.id);
    if (!o) continue;
    if (o.type !== b.type) rows.push({ op: "updateBlock", detail: `${b.id} type=${b.type}` });
    const keys = new Set([...Object.keys(o.props), ...Object.keys(b.props)]);
    for (const k of keys) {
      if (JSON.stringify(o.props[k]) !== JSON.stringify(b.props[k])) {
        rows.push({ op: "updateBlock", detail: `${b.id} props.${k}=${JSON.stringify(b.props[k])}` });
      }
    }
    if (JSON.stringify(o.content) !== JSON.stringify(b.content)) {
      rows.push({ op: "updateBlock", detail: `${b.id} content` });
    }
  }
  // 同集异序 → moveBlock
  if (!rows.length && prevFlat.length === nextFlat.length) {
    for (let i = 0; i < prevFlat.length; i++) {
      if (prevFlat[i].id !== nextFlat[i].id) {
        rows.push({ op: "moveBlock", detail: `${nextFlat[i].id} → #${i}` });
        break;
      }
    }
  }
  return rows;
}

/* --------------------------------- 小控件 --------------------------------- */

/**
 * 规范 switch 行（design.md §4/§5）：整行可点 + hover 底色；
 * 轨道 32×18 圆角 999，滑块 14px；关 = --surface-2 + 1px --border，开 = --accent + 白滑块；
 * 150ms 过渡，键盘 :focus-visible 焦点环。
 */
function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="group flex h-8 cursor-pointer items-center justify-between gap-3 px-4 transition-colors duration-150 ease-k3 hover:bg-hover-overlay">
      <span className="text-sm text-text-2 transition-colors duration-150 ease-k3 group-hover:text-text-1">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-[18px] w-8 shrink-0 rounded-full border transition-colors duration-150 ease-k3",
          "focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent focus-visible:ring-[3px] focus-visible:ring-[rgba(56,138,255,0.25)]",
        )}
        style={{
          backgroundColor: checked ? "var(--accent)" : "var(--surface-2)",
          borderColor: checked ? "transparent" : "var(--border)",
        }}
      >
        <span
          className="absolute left-[1px] top-[1px] h-3.5 w-3.5 rounded-full bg-white transition-transform duration-150 ease-k3"
          style={{ transform: checked ? "translateX(14px)" : "translateX(0)" }}
        />
      </button>
    </label>
  );
}

function GroupLabel({ children }: { children: string }) {
  return (
    <div className="px-4 pt-5 font-mono text-[12px] uppercase tracking-[0.08em] text-text-4">
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex h-8 items-center justify-between gap-3 px-4 transition-colors duration-150 ease-k3 hover:bg-hover-overlay">
      <span className="text-sm text-text-2">{label}</span>
      {children}
    </div>
  );
}

/* -------------------------------- 快捷键速查 -------------------------------- */

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["/"], label: "斜杠菜单" },
  { keys: ["⌘B", "⌘I", "⌘U"], label: "粗体 / 斜体 / 下划线" },
  { keys: ["⌘K"], label: "链接" },
  { keys: ["⌘E"], label: "行内代码" },
  { keys: ["Tab"], label: "缩进嵌套" },
  { keys: ["Enter"], label: "拆块" },
  { keys: ["Backspace"], label: "删除 / 合并块" },
  { keys: ["⌘Z", "⌘Y"], label: "撤销 / 重做" },
];

/** 设置轨底部可折叠 Shortcuts 卡 */
function ShortcutsCard() {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-border">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-full items-center gap-1.5 px-4 font-mono text-[12px] uppercase tracking-[0.08em] text-text-4 transition-colors duration-150 ease-k3 hover:text-text-2"
      >
        {open ? (
          <ChevronDown size={13} strokeWidth={1.5} />
        ) : (
          <ChevronRight size={13} strokeWidth={1.5} />
        )}
        Shortcuts
      </button>
      {open && (
        <div className="flex flex-col gap-1 px-4 pb-3">
          {SHORTCUTS.map((s) => (
            <div key={s.label} className="flex min-h-6 items-center justify-between gap-2">
              <span className="text-[12px] text-text-3">{s.label}</span>
              <span className="flex items-center gap-1">
                {s.keys.map((k) => (
                  <Kbd key={k}>{k}</Kbd>
                ))}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* --------------------------------- 设置面板 -------------------------------- */

function SettingsPanel({
  settings,
  update,
  onLoadSample,
  onClear,
  onReset,
  blockCount,
}: {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  onLoadSample: () => void;
  onClear: () => void;
  onReset: () => void;
  blockCount: number;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto pb-4">
        <GroupLabel>EDITOR</GroupLabel>
        <Switch label="Editable" checked={settings.editable} onChange={(v) => update({ editable: v })} />
        <Row label="Theme">
          {/* segmented：28px 控制高，与 switch 行视觉对齐 */}
          <div className="flex h-7 items-center rounded-md border border-border p-0.5">
            {(["light", "dark"] as const).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={settings.theme === t}
                onClick={() => update({ theme: t })}
                className={cn(
                  "flex h-full items-center rounded px-2 font-mono text-[11px] transition-colors duration-150 ease-k3",
                  "focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent",
                  settings.theme === t
                    ? "bg-surface-2 text-text-1"
                    : "text-text-3 hover:text-text-2",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </Row>
        <div className="mt-1 px-4">
          <input
            value={settings.placeholder}
            onChange={(e) => update({ placeholder: e.target.value })}
            placeholder="Placeholder"
            aria-label="Placeholder"
            className="h-7 w-full rounded-lg border border-border bg-surface-inset px-2 font-mono text-[12px] text-text-2 placeholder:text-text-4"
          />
        </div>

        <GroupLabel>CHROME</GroupLabel>
        <Switch label="Slash menu" checked={settings.slashMenu} onChange={(v) => update({ slashMenu: v })} />
        <Switch
          label="Formatting toolbar"
          checked={settings.formattingToolbar}
          onChange={(v) => update({ formattingToolbar: v })}
        />
        <Switch label="Side menu" checked={settings.sideMenu} onChange={(v) => update({ sideMenu: v })} />

        <GroupLabel>DOCUMENT</GroupLabel>
        <div className="mt-1 flex flex-col items-start gap-2 px-4">
          <GhostButton onClick={onLoadSample}>Load sample</GhostButton>
          <div className="relative">
            <GhostButton onClick={() => setConfirming((v) => !v)}>Clear</GhostButton>
            <AnimatePresence>
              {confirming && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: [0, 1, 0.2, 1.1] }}
                  style={{ transformOrigin: "top left" }}
                  className="absolute left-0 top-8 z-20 w-44 rounded-lg border border-border bg-surface-2 p-3 shadow-popover"
                >
                  <p className="text-[13px] text-text-1">确认清空？</p>
                  <div className="mt-2 flex gap-2">
                    <GhostButton onClick={() => setConfirming(false)}>取消</GhostButton>
                    <GhostButton
                      onClick={() => {
                        setConfirming(false);
                        onClear();
                      }}
                    >
                      清空
                    </GhostButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="text-[13px] text-text-3 transition-colors duration-150 ease-k3 hover:text-text-1"
          >
            Reset
          </button>
        </div>
      </div>

      <ShortcutsCard />

      <div className="px-4 py-3 font-mono text-[12px] leading-relaxed text-text-4">
        <div>@thejoven_com/k3blocks v{VERSION}</div>
        <div>blocks: {blockCount}</div>
      </div>
    </div>
  );
}

/* ---------------------------------- 页面 ---------------------------------- */

type InspectorTab = "json" | "markdown" | "outline" | "events";

export default function Playground() {
  const [{ settings, restored }] = useState(readSettings);
  const [current, setCurrent] = useState<Settings>(settings);
  const [banner, setBanner] = useState(restored);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tab, setTab] = useState<InspectorTab>("json");
  const [events, setEvents] = useState<LogRow[]>([]);
  const [tick, setTick] = useState(0);
  /** 当前选区覆盖的块 id（onSelectionChange 驱动，大纲高亮用） */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const editor = useK3Editor({ initialContent: showcaseDocument() });
  const prevDocRef = useRef<Block[]>(JSON.parse(JSON.stringify(editor.document)));
  const debounceRef = useRef<number | null>(null);
  /** 画布滚动容器（大纲点击定位时 querySelector data-block-id 用） */
  const canvasRef = useRef<HTMLDivElement | null>(null);
  /** 跳过下 N 次 change 的 diff（批量操作改记单行日志） */
  const suppressRef = useRef(0);

  /* 选区订阅：大纲面板当前块高亮 */
  useEffect(
    () =>
      editor.onSelectionChange((sel) => {
        setSelectedIds(sel?.blockIds ?? []);
      }),
    [editor],
  );

  /* 设置持久化 */
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch {
      // localStorage 不可用——跳过持久化
    }
  }, [current]);

  /* 恢复会话横幅：4s 自动淡出 */
  useEffect(() => {
    if (!banner) return;
    const t = window.setTimeout(() => setBanner(false), 4000);
    return () => window.clearTimeout(t);
  }, [banner]);

  /* 订阅变更：diff 事件 + 150ms 防抖刷新检查器 */
  useEffect(
    () =>
      editor.onChange(() => {
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => {
          const next: Block[] = JSON.parse(JSON.stringify(editor.document));
          if (suppressRef.current > 0) {
            suppressRef.current -= 1;
          } else {
            const rows = diffDocs(prevDocRef.current, next);
            if (rows.length) {
              setEvents((prev) => {
                let acc = prev;
                for (const r of rows) {
                  // 连续对同一块的内容更新合并为一行（只更新时间戳）
                  const head = acc[0];
                  if (head && head.op === r.op && head.detail === r.detail) {
                    acc = [{ ...head, time: now() }, ...acc.slice(1)];
                  } else {
                    acc = [{ id: ++logSeq, time: now(), op: r.op, detail: r.detail }, ...acc];
                  }
                }
                return acc.slice(0, 50);
              });
            }
          }
          prevDocRef.current = next;
          setTick((v) => v + 1);
        }, 150);
      }),
    [editor],
  );
  useEffect(
    () => () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    },
    [],
  );

  const update = (patch: Partial<Settings>) => setCurrent((s) => ({ ...s, ...patch }));

  const pushLog = (op: string, detail: string) =>
    setEvents((prev) => [{ id: ++logSeq, time: now(), op, detail }, ...prev].slice(0, 50));

  const loadSample = () => {
    suppressRef.current = 1;
    replaceDocument(editor, showcaseDocument());
    pushLog("loadSample", `${countBlocks(showcaseDocument())} blocks`);
    setTick((v) => v + 1);
  };

  const clearDoc = () => {
    suppressRef.current = 1;
    editor.removeBlocks(editor.document.map((b) => b.id));
    pushLog("clearDocument", "→ 1 empty paragraph");
    setTick((v) => v + 1);
  };

  const resetAll = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setCurrent(DEFAULT_SETTINGS);
    setBanner(false);
    loadSample();
    pushLog("reset", "settings + document");
  };

  const doUndo = () => {
    suppressRef.current = 1;
    editor.undo();
    pushLog("undo", "");
  };
  const doRedo = () => {
    suppressRef.current = 1;
    editor.redo();
    pushLog("redo", "");
  };

  // tick 由 150ms 防抖的 change 订阅驱动，重读 editor.document / blocksToMarkdown()
  const json = useMemo(
    () => JSON.stringify(editor.document, null, 2),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, tick],
  );
  const markdown = useMemo(
    () => editor.blocksToMarkdown(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, tick],
  );
  const blockCount = countBlocks(editor.document);

  /* 统计条：块数 / 词数 / 字符数（tick 驱动） */
  const stats = useMemo(
    () => docStats(editor.document),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, tick],
  );

  /* 大纲行（tick 驱动） */
  const outline = useMemo(
    () => outlineTree(editor.document),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, tick],
  );

  /** 大纲点击：定位聚焦对应块（文本块置光标；所有块滚动到可视区） */
  const focusBlock = (id: string) => {
    const block = editor.getBlock(id);
    if (!block) return;
    if (isTextBlock(block.type)) editor.setTextCursor(id, 0);
    window.requestAnimationFrame(() => {
      canvasRef.current
        ?.querySelector(`[data-block-id="${id}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const download = (content: string, type: string, filename: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJson = () => download(json, "application/json", "k3blocks-playground.json");
  const downloadMarkdown = () => download(markdown, "text/markdown", "k3blocks-playground.md");

  const settingsPanel = (
    <SettingsPanel
      settings={current}
      update={update}
      onLoadSample={loadSample}
      onClear={clearDoc}
      onReset={resetAll}
      blockCount={blockCount}
    />
  );

  const inspector = (
    <div className="flex h-full flex-col">
      {/* Tab bar（28px tabs） */}
      <div className="flex h-9 items-end gap-1 border-b border-border px-2">
        {(
          [
            ["json", "JSON"],
            ["markdown", "Markdown"],
            ["outline", "Outline"],
            ["events", "Events"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "flex h-7 items-center rounded-t-md border border-b-0 px-3 font-mono text-[12px] transition-colors duration-150 ease-k3",
              tab === key
                ? "border-border bg-surface-inset text-text-1"
                : "border-transparent text-text-3 hover:text-text-2",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="relative min-h-0 flex-1">
        <AnimatePresence mode="wait" initial={false}>
          {tab === "json" && (
            <motion.div
              key="json"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex h-full flex-col"
            >
              <div className="flex h-10 items-center justify-end gap-2 border-b border-border px-3">
                <CopyButton text={json} />
                <GhostButton onClick={downloadJson}>
                  <Download size={13} strokeWidth={1.5} />
                  .json
                </GhostButton>
              </div>
              <pre className="min-h-0 flex-1 overflow-auto p-3 font-mono text-[12px] leading-[1.7] text-text-3">
                {json}
              </pre>
            </motion.div>
          )}
          {tab === "markdown" && (
            <motion.div
              key="markdown"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex h-full flex-col"
            >
              <div className="flex h-10 items-center justify-end gap-2 border-b border-border px-3">
                <CopyButton text={markdown} />
                <GhostButton onClick={downloadMarkdown}>
                  <Download size={13} strokeWidth={1.5} />
                  .md
                </GhostButton>
              </div>
              <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap p-3 font-mono text-[12px] leading-[1.7] text-text-2">
                {markdown}
              </pre>
            </motion.div>
          )}
          {tab === "outline" && (
            <motion.div
              key="outline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex h-full flex-col"
            >
              <div className="flex h-10 items-center border-b border-border px-3 font-mono text-[12px] text-text-4">
                文档大纲 · 点击定位
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-2">
                {outline.length === 0 ? (
                  <p className="p-2 font-mono text-[12px] text-text-4">文档为空。</p>
                ) : (
                  outline.map(({ block, depth }) => {
                    const preview = blockPreview(block);
                    const active = selectedIds.includes(block.id);
                    return (
                      <button
                        key={block.id}
                        type="button"
                        onClick={() => focusBlock(block.id)}
                        title={preview || block.type}
                        className={cn(
                          "flex h-7 w-full items-center gap-2 rounded-md pr-2 text-left transition-colors duration-150 ease-k3",
                          active
                            ? "bg-accent-soft text-text-1"
                            : "text-text-3 hover:bg-hover-overlay hover:text-text-2",
                        )}
                        style={{ paddingLeft: 8 + depth * 14 }}
                      >
                        <span
                          className={cn(
                            "shrink-0 font-mono text-[11px]",
                            active ? "text-accent" : "text-text-4",
                          )}
                        >
                          {block.type}
                        </span>
                        <span className="truncate text-[12px]">{preview || "—"}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
          {tab === "events" && (
            <motion.div
              key="events"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex h-full flex-col"
            >
              <div className="flex h-10 items-center justify-end border-b border-border px-3">
                <GhostButton onClick={() => setEvents([])}>Clear log</GhostButton>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-2">
                {events.length === 0 ? (
                  <p className="p-2 font-mono text-[12px] text-text-4">
                    在编辑器里输入，事件会出现在这里…
                  </p>
                ) : (
                  events.map((e) => (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex h-6 items-center gap-2 overflow-hidden whitespace-nowrap px-1 font-mono text-[12px]"
                    >
                      <span className="text-text-4">{e.time}</span>
                      <span className="text-accent">{e.op}</span>
                      <span className="truncate text-text-3">{e.detail}</span>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer：Undo / Redo，由 canUndo / canRedo 驱动 */}
      <div className="flex h-11 items-center gap-2 border-t border-border px-3">
        <GhostButton disabled={!editor.canUndo} onClick={doUndo}>
          <Undo2 size={13} strokeWidth={1.5} />
          Undo
        </GhostButton>
        <GhostButton disabled={!editor.canRedo} onClick={doRedo}>
          <Redo2 size={13} strokeWidth={1.5} />
          Redo
        </GhostButton>
      </div>
    </div>
  );

  const canvas = (
    <div className="flex h-full flex-col overflow-hidden bg-bg">
      {/* 40px 上下文条：文件名 + 实时统计 + 快捷键提示 */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-border px-4">
        <span className="font-mono text-[12px] text-text-4">playground / untitled</span>
        <span className="hidden font-mono text-[12px] text-text-4 md:block">
          {stats.blocks} blocks · {stats.words} words · {stats.chars} chars
        </span>
        <span className="hidden items-center gap-3 text-[12px] text-text-3 sm:flex">
          <span className="flex items-center gap-1.5">
            <Kbd>/</Kbd> 菜单
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>⌘B</Kbd> 加粗
          </span>
          <span>⠿ drag</span>
        </span>
      </div>

      <div ref={canvasRef} className="min-h-0 flex-1 overflow-y-auto px-4 pb-16 md:px-8">
        {/* 恢复会话横幅 */}
        <AnimatePresence>
          {banner && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-md border border-border bg-surface-1 px-2.5 py-1 font-mono text-[12px] text-text-3"
            >
              已恢复上次会话
              <button
                type="button"
                onClick={resetAll}
                className="text-accent hover:text-accent-hover"
              >
                重置
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* “页面”隐喻：居中 760px 文档列，surface-inset + hairline */}
        <div className="mx-auto mt-8 max-w-[760px] rounded-lg border border-border bg-surface-inset px-6 py-16 md:px-12">
          <K3EditorView
            editor={editor}
            editable={current.editable}
            theme={current.theme}
            placeholder={current.placeholder}
            slashMenu={current.slashMenu}
            formattingToolbar={current.formattingToolbar}
            sideMenu={current.sideMenu}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:h-[calc(100dvh-56px)] lg:flex-row">
      {/* 移动端：28px Settings 条 + 抽屉 */}
      <div className="flex h-7 items-center border-b border-border bg-surface-1 px-3 lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-1.5 font-mono text-[12px] text-text-3 hover:text-text-1"
        >
          <Settings2 size={13} strokeWidth={1.5} />
          Settings
        </button>
      </div>
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            className="fixed inset-0 z-[90] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
            <motion.div
              className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-border bg-surface-1"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="flex h-10 items-center justify-between border-b border-border px-4">
                <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-text-4">
                  SETTINGS
                </span>
                <button
                  type="button"
                  aria-label="Close settings"
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-text-2 hover:bg-hover-overlay hover:text-text-1"
                >
                  <X size={15} strokeWidth={1.5} />
                </button>
              </div>
              <div className="min-h-0 flex-1">{settingsPanel}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 桌面设置轨 */}
      <aside className="hidden w-[232px] shrink-0 border-r border-border bg-surface-1 lg:block">
        {settingsPanel}
      </aside>

      {/* 中央画布 */}
      <section className="min-h-[70dvh] min-w-0 flex-1 lg:min-h-0">{canvas}</section>

      {/* 检查器：桌面右栏 / 移动端底部 */}
      <aside className="h-[420px] border-t border-border bg-surface-1 lg:h-auto lg:w-[360px] lg:shrink-0 lg:border-l lg:border-t-0">
        {inspector}
      </aside>
    </div>
  );
}
