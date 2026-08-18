/**
 * /examples — 示例廊（examples.md §1）。
 * 8 个活磁贴（真实运行的缩放编辑器）+ 筛选轨；点击卡片进详情页。
 */
import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";
import SectionLabel from "@/components/SectionLabel";
import { EXAMPLES } from "@/examples";
import type { ExampleMeta } from "@/examples";
import { cn } from "@/lib/utils";

const FILTERS = ["All", "Basics", "Data", "Theming", "Schema", "Integration", "Advanced"] as const;
type Filter = (typeof FILTERS)[number];

/** 磁贴活预览：缩放运行的真实编辑器；hover 揭开面纱后可输入。 */
function LiveThumbnail({ seed }: { seed: () => Block[] }) {
  const editor = useK3Editor({ initialContent: seed() });
  return (
    <div className="relative aspect-video overflow-hidden border-b border-border bg-surface-inset">
      {/* 缩放层：pointer-events 仅 hover 时开启；点击不冒泡（不进详情页） */}
      <div
        className="pointer-events-none absolute inset-0 group-hover:pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-[166.67%] origin-top-left scale-[0.6] px-6 py-4">
          <K3EditorView editor={editor} />
        </div>
      </div>
      {/* 面纱：hover 时 150ms 淡出 */}
      <div className="pointer-events-none absolute inset-0 flex items-end justify-end bg-gradient-to-t from-surface-inset/80 to-transparent p-3 transition-opacity duration-150 ease-k3 group-hover:opacity-0">
        <span className="rounded-md border border-border bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-text-3">
          点击交互
        </span>
      </div>
    </div>
  );
}

function ExampleCard({ example }: { example: ExampleMeta }) {
  const navigate = useNavigate();
  return (
    <article
      onClick={() => navigate(`/examples/${example.slug}`)}
      className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-surface-1 transition-colors duration-150 ease-k3 hover:bg-surface-2"
    >
      <LiveThumbnail seed={example.thumbnail} />
      <div className="p-5">
        <h3 className="text-[15px] font-semibold text-text-1 decoration-accent underline-offset-4 group-hover:underline">
          {example.title}
        </h3>
        <p className="mt-1 text-sm text-text-2">{example.blurb}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-md border border-border px-1.5 py-0.5 font-mono text-[11px] leading-none text-text-4">
            {example.category}
          </span>
          {example.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-border px-1.5 py-0.5 font-mono text-[11px] leading-none text-text-4"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function Examples() {
  const [filter, setFilter] = useState<Filter>("All");
  const list =
    filter === "All" ? EXAMPLES : EXAMPLES.filter((e) => e.category === filter);

  return (
    <div className="mx-auto max-w-shell px-6 py-16">
      <SectionLabel>EXAMPLES</SectionLabel>
      <h1 className="mt-4 text-5xl font-semibold leading-[1.1] tracking-[-0.025em] text-text-1">
        Examples.
      </h1>
      <p className="mt-4 max-w-prose text-base text-text-2">
        每个示例都是可运行的完整应用。打开、编辑、读源码。
      </p>

      {/* 筛选轨：28px segmented pill group */}
      <div className="mt-8 flex h-7 w-fit items-center rounded-lg border border-border p-0.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "flex h-6 items-center rounded-md px-2.5 text-[13px] transition-colors duration-150 ease-k3",
              filter === f
                ? "border border-border bg-surface-2 text-text-1"
                : "border border-transparent text-text-3 hover:text-text-2",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 卡片网格：2 列（移动端 1 列），筛选切换 150ms 淡入 */}
      <motion.div
        key={filter}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
        className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2"
      >
        {list.map((e) => (
          <ExampleCard key={e.slug} example={e} />
        ))}
      </motion.div>
    </div>
  );
}
