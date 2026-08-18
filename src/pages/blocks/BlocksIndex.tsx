/**
 * /blocks 索引页（blocks.md §1）：9 块磁贴墙 —— 每块磁贴内嵌一个活的
 * 只读迷你编辑器预览；下方为自定义块路线图 teaser。动效仅限 hover。
 */
import { Link } from "react-router";
import { ArrowUpRight, Globe, Sigma, Table, Workflow, type LucideIcon } from "lucide-react";
import SectionLabel from "@/components/SectionLabel";
import BlocksShell, { type TocItem } from "./BlocksShell";
import MiniEditor from "./MiniEditor";
import { BLOCK_DOCS } from "./blockData";
import type { Block } from "@/k3blocks";

const TOC: TocItem[] = [
  { id: "wall", label: "磁贴墙" },
  { id: "custom", label: "自定义块" },
];

/** 图片块的磁贴预览换成带 URL 的成品态，而非空占位。 */
const IMAGE_TILE_SEED: Block[] = [
  {
    id: "tile-img",
    type: "image",
    props: { src: "/logo.svg", caption: "logo.svg", alt: "K3Blocks logo" },
    content: [],
    children: [],
  },
];

function tileSeed(slug: string, seed: Block[]): Block[] {
  if (slug === "image") return IMAGE_TILE_SEED;
  return seed.slice(0, 2);
}

/** 引擎 v3 媒体块磁贴：table / math / embed / diagram，链接到 FEATURES 专题页。 */
interface MediaTile {
  type: string;
  name: string;
  icon: LucideIcon;
  slash: string;
  to: string;
  seed: Block[];
}

const MEDIA_TILES: MediaTile[] = [
  {
    type: "table",
    name: "Table",
    icon: Table,
    slash: "/table",
    to: "/docs/features/tables",
    seed: [
      {
        id: "tile-tb",
        type: "table",
        props: {
          rows: [
            ["名称", "状态"],
            ["表格", "✓"],
          ],
        },
        content: [],
        children: [],
      },
    ],
  },
  {
    type: "math",
    name: "Math",
    icon: Sigma,
    slash: "/math",
    to: "/docs/features/math",
    seed: [
      { id: "tile-ma", type: "math", props: { latex: "E = mc^2" }, content: [], children: [] },
    ],
  },
  {
    type: "embed",
    name: "Embed",
    icon: Globe,
    slash: "/embed",
    to: "/docs/features/embeds",
    seed: [
      { id: "tile-em", type: "embed", props: { url: "" }, content: [], children: [] },
    ],
  },
  {
    type: "diagram",
    name: "Diagram",
    icon: Workflow,
    slash: "/diagram",
    to: "/docs/features/diagrams",
    seed: [
      {
        id: "tile-dg",
        type: "diagram",
        props: { code: "flowchart LR\n  A --> B" },
        content: [],
        children: [],
      },
    ],
  },
]

function TileWall() {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 md:grid-cols-3">
      {BLOCK_DOCS.map((doc) => (
        <Link
          key={doc.slug}
          to={`/blocks/${doc.slug}`}
          className="flex flex-col bg-bg p-5 transition-colors duration-150 ease-k3 hover:bg-surface-2 hover:no-underline"
        >
          <div className="flex items-center gap-2.5">
            <doc.icon size={16} strokeWidth={1.5} className="shrink-0 text-text-3" />
            <span className="text-[15px] font-semibold text-text-1">{doc.name}</span>
            <span className="ml-auto font-mono text-[12px] text-text-4">{doc.slash}</span>
          </div>
          {/* 活的迷你编辑器预览（只读、不拦截点击） */}
          <div className="pointer-events-none mt-4 h-24 overflow-hidden rounded-md border border-border bg-surface-inset px-3 py-2">
            <MiniEditor seed={tileSeed(doc.slug, doc.seed)} />
          </div>
        </Link>
      ))}
      {MEDIA_TILES.map((tile) => (
        <Link
          key={tile.type}
          to={tile.to}
          className="flex flex-col bg-bg p-5 transition-colors duration-150 ease-k3 hover:bg-surface-2 hover:no-underline"
        >
          <div className="flex items-center gap-2.5">
            <tile.icon size={16} strokeWidth={1.5} className="shrink-0 text-text-3" />
            <span className="text-[15px] font-semibold text-text-1">{tile.name}</span>
            <span className="ml-auto font-mono text-[12px] text-text-4">{tile.slash}</span>
          </div>
          {/* 活的迷你编辑器预览（只读、不拦截点击） */}
          <div className="pointer-events-none mt-4 h-24 overflow-hidden rounded-md border border-border bg-surface-inset px-3 py-2">
            <MiniEditor seed={tile.seed} />
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function BlocksIndex() {
  return (
    <BlocksShell toc={TOC}>
      <nav aria-label="面包屑" className="flex items-center gap-1.5 font-mono text-[12px] text-text-4">
        <Link
          to="/docs"
          className="transition-colors duration-150 ease-k3 hover:text-text-2 hover:no-underline"
        >
          Docs
        </Link>
        <span>/</span>
        <span className="text-text-3">Blocks</span>
      </nav>

      <h1 className="mt-4 text-5xl font-semibold leading-[1.1] tracking-[-0.025em] text-text-1">
        Blocks.
      </h1>
      <p className="mt-4 max-w-[68ch] text-base leading-[1.65] text-text-2">
        九种基础块 + 四种媒体块（table / math / embed / diagram）。每一种都可经斜杠菜单、Markdown 行首规则或 API 创建。
      </p>

      <section id="wall" className="mt-10 scroll-mt-24">
        <SectionLabel withRule>块类型</SectionLabel>
        <div className="mt-6">
          <TileWall />
        </div>
      </section>

      <section id="custom" className="mt-14 scroll-mt-24">
        <div className="rounded-xl border border-border bg-surface-1 p-8">
          <div className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-text-4">
            Roadmap
          </div>
          <p className="mt-3 text-sm text-text-3">
            Custom block schemas 正在路线图上 —{" "}
            <a
              href="https://github.com/thejoven/k3blocks"
              target="_blank"
              rel="noreferrer"
              className="text-accent"
            >
              关注 GitHub 获取更新
              <ArrowUpRight size={12} strokeWidth={1.5} className="ml-0.5 inline text-text-3" />
            </a>
          </p>
        </div>
      </section>
    </BlocksShell>
  );
}
