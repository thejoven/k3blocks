/**
 * BlocksShell — Blocks 顶级栏目外壳（/blocks/*），不再共用 DocsShell。
 * 左侧 264px sticky 边栏（顶部「← 返回文档」/ BLOCKS 全列表 / 底部「功能特性 →」）
 * + 内容栏 + 右侧 TOC；整体仍在共享 Topbar 之下（Layout 已包）。
 */
import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BLOCK_DOCS } from "./blockData";

export interface TocItem {
  id: string;
  label: string;
}

/** 块 slug → 侧栏中文 label。 */
const BLOCK_LABELS: Record<string, string> = {
  paragraph: "段落",
  heading: "标题",
  "bullet-list": "无序列表",
  "numbered-list": "有序列表",
  "todo-list": "待办列表",
  quote: "引用",
  "code-block": "代码块",
  divider: "分割线",
  image: "图片",
};

const BLOCKS_ITEMS = [
  { label: "Overview", to: "/blocks" },
  ...BLOCK_DOCS.map((d) => ({ label: BLOCK_LABELS[d.slug] ?? d.name, to: `/blocks/${d.slug}` })),
];

function Sidebar() {
  return (
    <nav aria-label="Blocks 导航" className="flex flex-col">
      {/* 返回文档 */}
      <Link
        to="/docs"
        className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm text-text-2 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-1 hover:no-underline"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        返回文档
      </Link>

      {/* BLOCKS 全列表 */}
      <div className="mt-6">
        <span className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-text-4">
          Blocks
        </span>
        <ul className="mt-1.5 flex flex-col gap-0.5">
          {BLOCKS_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end
                className={({ isActive }) =>
                  cn(
                    "relative flex h-8 items-center rounded-lg px-2.5 text-sm transition-colors duration-150 ease-k3 hover:no-underline",
                    isActive
                      ? "bg-accent-soft text-text-1 before:absolute before:left-0 before:top-1.5 before:h-5 before:w-0.5 before:rounded-full before:bg-accent before:content-['']"
                      : "text-text-2 hover:bg-hover-overlay hover:text-text-1",
                  )
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* 底部回链：功能特性 */}
      <Link
        to="/docs/features/built-in-blocks"
        className="mt-6 flex items-center gap-1.5 border-t border-border px-2.5 pt-6 text-sm text-text-2 transition-colors duration-150 ease-k3 hover:text-text-1 hover:no-underline"
      >
        功能特性
        <ArrowRight size={14} strokeWidth={1.5} />
      </Link>
    </nav>
  );
}

function Toc({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const targets = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px" },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="本页目录">
      <div className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-text-4">
        On this page
      </div>
      <ul className="mt-3 flex flex-col gap-2 border-l border-border">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "-ml-px block border-l py-0.5 pl-3 text-[12px] leading-relaxed transition-colors duration-150 ease-k3 hover:no-underline",
                activeId === item.id
                  ? "border-accent text-accent"
                  : "border-transparent text-text-3 hover:text-text-2",
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function BlocksShell({
  children,
  toc,
}: {
  children: ReactNode;
  toc?: TocItem[];
}) {
  return (
    <div className="mx-auto flex max-w-shell items-start gap-10 px-6">
      {/* 左侧边栏 — 264px，sticky 于 Topbar 之下，自带滚动，右侧发丝线（同 DocsShell 风格） */}
      <aside className="sticky top-14 hidden h-[calc(100dvh-56px)] w-[264px] shrink-0 overflow-y-auto border-r border-border py-8 pr-6 lg:block">
        <Sidebar />
      </aside>

      {/* 内容栏 */}
      <div className="min-w-0 flex-1 pb-24 pt-12">
        <div className="max-w-prose">{children}</div>
      </div>

      {/* 右侧 TOC — 192px，sticky，≥1280px 显示 */}
      {toc && toc.length > 0 && (
        <aside className="sticky top-14 hidden h-[calc(100dvh-56px)] w-[192px] shrink-0 overflow-y-auto py-12 xl:block">
          <Toc items={toc} />
        </aside>
      )}
    </div>
  );
}
