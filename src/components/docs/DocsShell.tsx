import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronDown, PanelLeft, Search, X } from "lucide-react";
import Kbd from "@/components/Kbd";
import { cn } from "@/lib/utils";

/**
 * DocsShell (docs.md §0) — shared across all /docs/* pages owned by the docs area.
 * 3 columns under the shared Topbar: grouped sidebar (264px, sticky, own scroll),
 * content column (800px, 960px when `wide`), right scroll-spy TOC (192px, ≥xl).
 * Deliberately flat: hover colors 150ms only; no scroll-driven animation.
 */

/* ------------------------------- nav config ------------------------------ */

interface NavItem {
  label: string;
  to: string;
  hash?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
  collapsible?: boolean;
  /** Collapsible groups open by default when the route starts with this prefix. */
  prefix?: string;
}

const NAV: NavGroup[] = [
  {
    label: "介绍",
    items: [{ label: "介绍", to: "/docs" }],
  },
  {
    label: "快速上手",
    items: [
      { label: "安装", to: "/docs/getting-started", hash: "installation" },
      { label: "快速开始", to: "/docs/getting-started", hash: "quickstart" },
    ],
  },
  {
    label: "基础概念",
    items: [
      { label: "文档结构", to: "/docs/foundations/document-structure" },
      { label: "块操作", to: "/docs/foundations/manipulating-blocks" },
      { label: "主题", to: "/docs/foundations/theming" },
    ],
  },
  {
    label: "功能特性",
    collapsible: true,
    prefix: "/docs/features",
    items: [
      { label: "内置块", to: "/docs/features/built-in-blocks" },
      { label: "排版", to: "/docs/features/typography" },
      { label: "列表类型", to: "/docs/features/list-types" },
      { label: "表格", to: "/docs/features/tables" },
      { label: "嵌入", to: "/docs/features/embeds" },
      { label: "代码块", to: "/docs/features/code-blocks" },
      { label: "数学公式", to: "/docs/features/math" },
      { label: "图表", to: "/docs/features/diagrams" },
      { label: "行内内容", to: "/docs/features/inline-content" },
      { label: "自定义块", to: "/docs/features/custom-blocks" },
    ],
  },
  {
    label: "定制",
    collapsible: true,
    prefix: "/docs/customization",
    items: [
      { label: "自定义 Schema", to: "/docs/customization/custom-schemas" },
      { label: "自定义行内内容", to: "/docs/customization/custom-inline-content" },
      { label: "自定义样式", to: "/docs/customization/custom-styles" },
      { label: "源码预览块", to: "/docs/customization/source-with-preview-blocks" },
    ],
  },
  {
    label: "导出",
    collapsible: true,
    prefix: "/docs/export",
    items: [
      { label: "Markdown", to: "/docs/export/markdown" },
      { label: "HTML", to: "/docs/export/html" },
      { label: "PDF", to: "/docs/export/pdf" },
      { label: "DOCX", to: "/docs/export/docx" },
      { label: "Email", to: "/docs/export/email" },
      { label: "ODT", to: "/docs/export/odt" },
    ],
  },
  {
    label: "导入",
    collapsible: true,
    prefix: "/docs/import",
    items: [
      { label: "HTML", to: "/docs/import/html" },
      { label: "Markdown", to: "/docs/import/markdown" },
    ],
  },
  {
    label: "进阶",
    collapsible: true,
    prefix: "/docs/advanced",
    items: [
      { label: "服务端处理", to: "/docs/advanced/server-side-processing" },
      { label: "国际化 (i18n)", to: "/docs/advanced/localization" },
      { label: "扩展点", to: "/docs/advanced/extensions" },
    ],
  },
  {
    label: "React",
    collapsible: true,
    prefix: "/docs/react",
    items: [
      { label: "概览", to: "/docs/react/overview" },
      { label: "格式化工具栏", to: "/docs/react/formatting-toolbar" },
      { label: "网格建议菜单", to: "/docs/react/grid-suggestion-menus" },
      { label: "链接工具栏", to: "/docs/react/link-toolbar" },
      { label: "文件面板", to: "/docs/react/file-panel" },
      { label: "块侧边菜单", to: "/docs/react/block-side-menu" },
      { label: "建议菜单", to: "/docs/react/suggestion-menus" },
    ],
  },
  {
    label: "样式与主题",
    collapsible: true,
    prefix: "/docs/styling",
    items: [
      { label: "主题", to: "/docs/styling/themes" },
      { label: "覆盖 CSS", to: "/docs/styling/overriding-css" },
      { label: "DOM 属性", to: "/docs/styling/dom-attributes" },
    ],
  },
  {
    label: "编辑器参考",
    collapsible: true,
    prefix: "/docs/reference",
    items: [
      { label: "概览", to: "/docs/reference/overview" },
      { label: "内容操作", to: "/docs/reference/manipulating-content" },
      { label: "光标与选区", to: "/docs/reference/cursor-selections" },
      { label: "Yjs 工具", to: "/docs/reference/yjs-utilities" },
      { label: "事件", to: "/docs/reference/events" },
    ],
  },
  {
    label: "API 参考",
    items: [
      { label: "概览", to: "/docs/api" },
      { label: "useK3Editor", to: "/docs/api", hash: "use-k3-editor" },
      { label: "K3EditorView", to: "/docs/api", hash: "k3-editor-view" },
      { label: "Editor methods", to: "/docs/api", hash: "editor-methods" },
    ],
  },
  {
    label: "示例",
    items: [{ label: "示例廊", to: "/examples" }],
  },
];

/** Prev/next pager order across the docs area. */
const PAGER: { to: string; title: string }[] = [
  { to: "/docs", title: "Introduction" },
  { to: "/docs/getting-started", title: "Getting started" },
  { to: "/docs/foundations/document-structure", title: "Document structure" },
  { to: "/docs/foundations/manipulating-blocks", title: "Manipulating blocks" },
  { to: "/docs/foundations/theming", title: "Theming" },
  { to: "/blocks", title: "Blocks" },
  { to: "/docs/features/built-in-blocks", title: "Built-in blocks" },
  { to: "/docs/features/typography", title: "Typography" },
  { to: "/docs/features/list-types", title: "List types" },
  { to: "/docs/features/tables", title: "Tables" },
  { to: "/docs/features/embeds", title: "Embeds" },
  { to: "/docs/features/code-blocks", title: "Code blocks" },
  { to: "/docs/features/math", title: "Math equations" },
  { to: "/docs/features/diagrams", title: "Diagrams" },
  { to: "/docs/features/inline-content", title: "Inline content" },
  { to: "/docs/features/custom-blocks", title: "Custom blocks" },
  { to: "/docs/customization/custom-schemas", title: "Custom schemas" },
  { to: "/docs/customization/custom-inline-content", title: "Custom inline content" },
  { to: "/docs/customization/custom-styles", title: "Custom styles" },
  { to: "/docs/customization/source-with-preview-blocks", title: "Source with preview blocks" },
  { to: "/docs/export/markdown", title: "Export Markdown" },
  { to: "/docs/export/html", title: "Export HTML" },
  { to: "/docs/export/pdf", title: "Export PDF" },
  { to: "/docs/export/docx", title: "Export DOCX" },
  { to: "/docs/export/email", title: "Export Email" },
  { to: "/docs/export/odt", title: "Export ODT" },
  { to: "/docs/import/html", title: "Import HTML" },
  { to: "/docs/import/markdown", title: "Import Markdown" },
  { to: "/docs/advanced/server-side-processing", title: "Server-side processing" },
  { to: "/docs/advanced/localization", title: "Localization" },
  { to: "/docs/advanced/extensions", title: "Extensions" },
  { to: "/docs/react/overview", title: "React overview" },
  { to: "/docs/react/formatting-toolbar", title: "Formatting toolbar" },
  { to: "/docs/react/grid-suggestion-menus", title: "Grid suggestion menus" },
  { to: "/docs/react/link-toolbar", title: "Link toolbar" },
  { to: "/docs/react/file-panel", title: "File panel" },
  { to: "/docs/react/block-side-menu", title: "Block side menu" },
  { to: "/docs/react/suggestion-menus", title: "Suggestion menus" },
  { to: "/docs/styling/themes", title: "Themes" },
  { to: "/docs/styling/overriding-css", title: "Overriding CSS" },
  { to: "/docs/styling/dom-attributes", title: "DOM attributes" },
  { to: "/docs/reference/overview", title: "Reference overview" },
  { to: "/docs/reference/manipulating-content", title: "Manipulating content" },
  { to: "/docs/reference/cursor-selections", title: "Cursor & selections" },
  { to: "/docs/reference/yjs-utilities", title: "Yjs utilities" },
  { to: "/docs/reference/events", title: "Events" },
  { to: "/docs/api", title: "API reference" },
];

/* ------------------------------- nav pieces ------------------------------ */

function itemActive(item: NavItem, pathname: string, hash: string, group: NavGroup): boolean {
  if (item.hash) return pathname === item.to && hash === `#${item.hash}`;
  if (pathname !== item.to) return false;
  // Plain item yields to a hash sibling when that hash is currently targeted.
  return !group.items.some((i) => i.hash && pathname === i.to && hash === `#${i.hash}`);
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname, hash } = useLocation();
  // No entry = follow the route (open when pathname matches group.prefix);
  // toggling pins the user's choice per group.
  const [openOverrides, setOpenOverrides] = useState<Record<string, boolean>>({});

  return (
    <nav className="flex flex-col gap-5">
      {NAV.map((group) => {
        const groupOpen =
          openOverrides[group.label] ??
          (group.collapsible && group.prefix ? pathname.startsWith(group.prefix) : true);
        const header = (
          <span className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-text-4">
            {group.label}
          </span>
        );
        const items = (
          <ul className="mt-1.5 flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = itemActive(item, pathname, hash, group);
              return (
                <li key={item.label}>
                  <Link
                    to={item.hash ? `${item.to}#${item.hash}` : item.to}
                    onClick={onNavigate}
                    className={cn(
                      "relative flex h-8 items-center rounded-lg px-2.5 text-sm transition-colors duration-150 ease-k3 hover:no-underline",
                      active
                        ? "bg-accent-soft text-text-1 before:absolute before:left-0 before:top-1.5 before:h-5 before:w-0.5 before:rounded-full before:bg-accent before:content-['']"
                        : "text-text-2 hover:bg-hover-overlay hover:text-text-1",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        );

        if (!group.collapsible) {
          return <div key={group.label}>{header}{items}</div>;
        }
        return (
          <div key={group.label}>
            <button
              type="button"
              onClick={() =>
                setOpenOverrides((prev) => ({ ...prev, [group.label]: !groupOpen }))
              }
              aria-expanded={groupOpen}
              className="flex w-full items-center justify-between"
            >
              {header}
              <ChevronDown
                size={14}
                strokeWidth={1.5}
                className={cn(
                  "text-text-4 transition-transform duration-150 ease-k3",
                  groupOpen && "rotate-180",
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {groupOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  {items}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}

/** Search pill clone (28px) — opens the shared ⌘K palette owned by Layout. */
function SearchPill() {
  const openPalette = () => {
    // Layout's palette listens for ⌘K/Ctrl+K on window; replay that gesture.
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
  };
  return (
    <button
      type="button"
      onClick={openPalette}
      className="flex h-7 w-full items-center gap-2 rounded-lg border border-border bg-surface-1 px-2.5 font-mono text-[12px] text-text-3 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-2"
    >
      <Search size={13} strokeWidth={1.5} />
      <span className="flex-1 text-left">Search docs…</span>
      <Kbd>⌘K</Kbd>
    </button>
  );
}

/* ---------------------------------- shell --------------------------------- */

/** 路由 → 仓库源文件路径（「在 GitHub 上编辑此页」链接用） */
const EDIT_PAGE_FILES: Record<string, string> = {
  "/docs": "src/pages/docs/Introduction.tsx",
  "/docs/getting-started": "src/pages/docs/GettingStarted.tsx",
  "/docs/foundations/document-structure": "src/pages/docs/DocumentStructure.tsx",
  "/docs/foundations/manipulating-blocks": "src/pages/docs/ManipulatingBlocks.tsx",
  "/docs/foundations/theming": "src/pages/docs/Theming.tsx",
  "/docs/api": "src/pages/docs/ApiReference.tsx",
  "/docs/features/built-in-blocks": "src/pages/docs/features/BuiltInBlocks.tsx",
  "/docs/features/typography": "src/pages/docs/features/Typography.tsx",
  "/docs/features/list-types": "src/pages/docs/features/ListTypes.tsx",
  "/docs/features/tables": "src/pages/docs/features/Tables.tsx",
  "/docs/features/embeds": "src/pages/docs/features/Embeds.tsx",
  "/docs/features/code-blocks": "src/pages/docs/features/CodeBlocks.tsx",
  "/docs/features/math": "src/pages/docs/features/MathEquations.tsx",
  "/docs/features/diagrams": "src/pages/docs/features/Diagrams.tsx",
  "/docs/features/inline-content": "src/pages/docs/features/InlineContent.tsx",
  "/docs/features/custom-blocks": "src/pages/docs/features/CustomBlocks.tsx",
  "/docs/export/markdown": "src/pages/docs/export/ExportMarkdown.tsx",
  "/docs/export/html": "src/pages/docs/export/ExportHtml.tsx",
  "/docs/export/pdf": "src/pages/docs/export/ExportPdf.tsx",
  "/docs/export/docx": "src/pages/docs/export/ExportDocx.tsx",
  "/docs/export/email": "src/pages/docs/export/ExportEmail.tsx",
  "/docs/export/odt": "src/pages/docs/export/ExportOdt.tsx",
  "/docs/import/html": "src/pages/docs/import/ImportHtml.tsx",
  "/docs/import/markdown": "src/pages/docs/import/ImportMarkdown.tsx",
  "/docs/advanced/server-side-processing": "src/pages/docs/advanced/ServerSideProcessing.tsx",
  "/docs/advanced/localization": "src/pages/docs/advanced/Localization.tsx",
  "/docs/advanced/extensions": "src/pages/docs/advanced/Extensions.tsx",
  "/docs/customization/custom-schemas": "src/pages/docs/customization/CustomSchemas.tsx",
  "/docs/customization/custom-inline-content": "src/pages/docs/customization/CustomInlineContent.tsx",
  "/docs/customization/custom-styles": "src/pages/docs/customization/CustomStyles.tsx",
  "/docs/customization/source-with-preview-blocks": "src/pages/docs/customization/SourceWithPreviewBlocks.tsx",
  "/docs/react/overview": "src/pages/docs/react/ReactOverview.tsx",
  "/docs/react/formatting-toolbar": "src/pages/docs/react/UiFormattingToolbar.tsx",
  "/docs/react/grid-suggestion-menus": "src/pages/docs/react/UiGridSuggestionMenus.tsx",
  "/docs/react/link-toolbar": "src/pages/docs/react/UiLinkToolbar.tsx",
  "/docs/react/file-panel": "src/pages/docs/react/UiFilePanel.tsx",
  "/docs/react/block-side-menu": "src/pages/docs/react/UiBlockSideMenu.tsx",
  "/docs/react/suggestion-menus": "src/pages/docs/react/UiSuggestionMenus.tsx",
  "/docs/styling/themes": "src/pages/docs/styling/StylingThemes.tsx",
  "/docs/styling/overriding-css": "src/pages/docs/styling/StylingOverridingCss.tsx",
  "/docs/styling/dom-attributes": "src/pages/docs/styling/StylingDomAttributes.tsx",
  "/docs/reference/overview": "src/pages/docs/reference/RefOverview.tsx",
  "/docs/reference/manipulating-content": "src/pages/docs/reference/RefManipulatingContent.tsx",
  "/docs/reference/cursor-selections": "src/pages/docs/reference/RefCursorSelections.tsx",
  "/docs/reference/yjs-utilities": "src/pages/docs/reference/RefYjs.tsx",
  "/docs/reference/events": "src/pages/docs/reference/RefEvents.tsx",
  "/blocks": "src/pages/blocks/BlocksIndex.tsx",
  "/blocks/paragraph": "src/pages/blocks/pages/Paragraph.tsx",
  "/blocks/heading": "src/pages/blocks/pages/Heading.tsx",
  "/blocks/bullet-list": "src/pages/blocks/pages/BulletList.tsx",
  "/blocks/numbered-list": "src/pages/blocks/pages/NumberedList.tsx",
  "/blocks/todo-list": "src/pages/blocks/pages/TodoList.tsx",
  "/blocks/quote": "src/pages/blocks/pages/Quote.tsx",
  "/blocks/code-block": "src/pages/blocks/pages/CodeBlock.tsx",
  "/blocks/divider": "src/pages/blocks/pages/Divider.tsx",
  "/blocks/image": "src/pages/blocks/pages/Image.tsx",
};

function editPageUrl(pathname: string): string {
  const file = EDIT_PAGE_FILES[pathname] ?? "src";
  return `https://github.com/thejoven/k3blocks/blob/main/${file}`;
}

export default function DocsShell({
  crumbs,
  title,
  lead,
  wide = false,
  children,
}: {
  /** Mono breadcrumb segments, e.g. ["Docs", "Foundations", "Document structure"]. */
  crumbs: string[];
  /** H1 — docs variant is 36px, ends with a period. */
  title: string;
  lead: string;
  /** API reference uses the 880px content column (docs.md §4). */
  wide?: boolean;
  children: ReactNode;
}) {
  const { pathname, hash } = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);
  const [toc, setToc] = useState<{ id: string; label: string }[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Hash navigation + scroll reset on page change.
  useEffect(() => {
    if (hash) {
      // Wait a tick so the target page's sections exist.
      const t = window.setTimeout(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView();
      }, 0);
      return () => window.clearTimeout(t);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);

  // Collect h2[id] for the "On this page" TOC + IntersectionObserver scroll-spy.
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    // Defer one frame so the new page's headings exist and setState stays async.
    const raf = window.requestAnimationFrame(() => {
      const headings = Array.from(
        contentRef.current?.querySelectorAll<HTMLHeadingElement>("h2[id]") ?? [],
      );
      setToc(headings.map((h) => ({ id: h.id, label: h.textContent ?? "" })));
      setActiveId(null);
      if (headings.length === 0) return;

      const visible = new Set<string>();
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) visible.add(entry.target.id);
            else visible.delete(entry.target.id);
          }
          const first = headings.find((h) => visible.has(h.id));
          if (first) setActiveId(first.id);
        },
        { rootMargin: "-72px 0px -66% 0px" },
      );
      headings.forEach((h) => observer?.observe(h));
    });
    return () => {
      window.cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [pathname]);

  const pagerIndex = PAGER.findIndex((p) => p.to === pathname);
  const prev = pagerIndex > 0 ? PAGER[pagerIndex - 1] : null;
  const next = pagerIndex >= 0 && pagerIndex < PAGER.length - 1 ? PAGER[pagerIndex + 1] : null;

  return (
    <div className="mx-auto flex max-w-shell items-start gap-10 px-6">
      {/* Mobile docs drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            className="fixed inset-0 z-[90] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-border bg-surface-1"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
                <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-text-3">
                  Docs
                </span>
                <button
                  type="button"
                  aria-label="Close docs navigation"
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-text-2 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-1"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <SearchPill />
                <div className="mt-4">
                  <NavList onNavigate={() => setDrawerOpen(false)} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left sidebar — 264px, sticky under topbar, own scroll, hairline right */}
      <aside className="sticky top-14 hidden h-[calc(100dvh-56px)] w-[264px] shrink-0 overflow-y-auto border-r border-border py-8 pr-6 lg:block">
        <SearchPill />
        <div className="mt-6">
          <NavList />
        </div>
      </aside>

      {/* Content column */}
      <div className={cn("min-w-0 flex-1 pb-24 pt-12", wide ? "max-w-[960px]" : "max-w-prose")}>
        {/* Mobile: docs nav trigger */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="mb-6 flex h-7 items-center gap-2 rounded-lg border border-border bg-surface-1 px-2.5 font-mono text-[12px] text-text-3 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-2 lg:hidden"
        >
          <PanelLeft size={13} strokeWidth={1.5} />
          Docs menu
        </button>

        <nav aria-label="Breadcrumb" className="font-mono text-[12px] text-text-4">
          {crumbs.join(" / ")}
        </nav>
        <h1 className="mt-3 text-4xl font-semibold leading-[1.1] tracking-[-0.025em] text-text-1">
          {title}
        </h1>
        <p className="mt-4 text-base leading-[1.65] text-text-2">{lead}</p>

        <div ref={contentRef}>{children}</div>

        {/* Prev / next pager */}
        {(prev || next) && (
          <div className="mt-16 grid grid-cols-2 gap-4">
            {prev ? (
              <Link
                to={prev.to}
                className="flex flex-col rounded-lg border border-border p-4 transition-colors duration-150 ease-k3 hover:bg-surface-1 hover:no-underline"
              >
                <span className="flex items-center gap-1 font-mono text-[12px] text-text-4">
                  <ArrowLeft size={12} strokeWidth={1.5} /> 上一页
                </span>
                <span className="mt-1.5 text-sm font-medium text-text-1">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                to={next.to}
                className="flex flex-col items-end rounded-lg border border-border p-4 text-right transition-colors duration-150 ease-k3 hover:bg-surface-1 hover:no-underline"
              >
                <span className="flex items-center gap-1 font-mono text-[12px] text-text-4">
                  下一页 <ArrowRight size={12} strokeWidth={1.5} />
                </span>
                <span className="mt-1.5 text-sm font-medium text-text-1">{next.title}</span>
              </Link>
            ) : (
              <span />
            )}
          </div>
        )}

        {/* Edit link */}
        <div className="mt-8 flex justify-end">
          <a
            href={editPageUrl(pathname)}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[12px] text-text-4 transition-colors duration-150 ease-k3 hover:text-text-2 hover:no-underline"
          >
            在 GitHub 上编辑此页 ↗
          </a>
        </div>
      </div>

      {/* Right TOC — 192px, sticky, ≥1280px only */}
      {toc.length > 0 && (
        <aside className="sticky top-14 hidden h-[calc(100dvh-56px)] w-[192px] shrink-0 overflow-y-auto py-12 xl:block">
          <span className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-text-4">
            On this page
          </span>
          <ul className="mt-3 flex flex-col gap-2 border-l border-border">
            {toc.map((t) => (
              <li key={t.id}>
                <Link
                  to={`${pathname}#${t.id}`}
                  className={cn(
                    "-ml-px block border-l py-0.5 pl-3 text-[12px] leading-relaxed transition-colors duration-150 ease-k3 hover:no-underline",
                    activeId === t.id
                      ? "border-accent text-accent"
                      : "border-transparent text-text-3 hover:text-text-2",
                  )}
                >
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
