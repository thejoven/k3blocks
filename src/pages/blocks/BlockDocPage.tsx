/**
 * BlockDocPage — 9 个块专页共用的固定模板（blocks.md §2）：
 * 面包屑 → H1 → lead → live demo → props → 创建方式 → 样式说明 → 相关链接 → pager。
 */
import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowLeft, ArrowRight, ArrowUpRight, Moon, Sun } from "lucide-react";
import Callout from "@/components/Callout";
import Kbd from "@/components/Kbd";
import SectionLabel from "@/components/SectionLabel";
import { cn } from "@/lib/utils";
import BlocksShell, { type TocItem } from "./BlocksShell";
import BlockDemoPanel from "./BlockDemoPanel";
import MiniEditor from "./MiniEditor";
import { blockNeighbors, getBlockDoc, type BlockDoc } from "./blockData";

const TOC: TocItem[] = [
  { id: "demo", label: "Live demo" },
  { id: "props", label: "Props" },
  { id: "create", label: "创建方式" },
  { id: "styles", label: "样式说明" },
  { id: "related", label: "相关链接" },
];

function Breadcrumb({ doc }: { doc: BlockDoc }) {
  return (
    <nav aria-label="面包屑" className="flex items-center gap-1.5 font-mono text-[12px] text-text-4">
      <Link
        to="/blocks"
        className="transition-colors duration-150 ease-k3 hover:text-text-2 hover:no-underline"
      >
        Blocks
      </Link>
      <span>/</span>
      <span className="text-text-3">{doc.name}</span>
    </nav>
  );
}

function PropsTable({ doc }: { doc: BlockDoc }) {
  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              {["prop", "type", "default", "说明"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-text-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {doc.props.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-text-3">
                  无 props
                </td>
              </tr>
            ) : (
              doc.props.map((row) => (
                <tr key={row.prop} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-2.5 font-mono text-[13px] text-text-1">{row.prop}</td>
                  <td className="px-4 py-2.5 font-mono text-[13px] text-text-3">{row.type}</td>
                  <td className="px-4 py-2.5 font-mono text-[13px] text-text-3">{row.def}</td>
                  <td className="px-4 py-2.5 text-text-2">{row.desc}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {doc.propsNote && <p className="mt-3 text-[13px] text-text-3">{doc.propsNote}</p>}
    </>
  );
}

function CreationCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface-1 p-4 transition-colors duration-150 ease-k3 hover:bg-surface-2">
      <div className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-text-3">
        {label}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}

function CreationStrip({ doc }: { doc: BlockDoc }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <CreationCard label="斜杠菜单">
        <span className="font-mono text-[13px] text-text-1">{doc.slash}</span>
      </CreationCard>
      <CreationCard label="Markdown">
        {doc.markdownKeys ? (
          <>
            {doc.markdownKeys.map((key) => (
              <Kbd key={key}>{key}</Kbd>
            ))}
            <span className="text-[12px] text-text-3">行首输入</span>
          </>
        ) : (
          <span className="text-[13px] text-text-3">{doc.markdownNote}</span>
        )}
      </CreationCard>
      <CreationCard label="API">
        <code className="break-all font-mono text-[12px] leading-relaxed text-text-2">
          {doc.apiSnippet}
        </code>
      </CreationCard>
    </div>
  );
}

/** 样式说明：light/dark 两张缩略图，都是活的真实只读编辑器。 */
function StyleThumbs({ doc }: { doc: BlockDoc }) {
  const thumbSeed = doc.seed.slice(0, 2);
  const themes = [
    { key: "light" as const, label: "Light", icon: Sun, bg: "#ffffff" },
    { key: "dark" as const, label: "Dark", icon: Moon, bg: "#111111" },
  ];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {themes.map((th) => (
        <figure key={th.key} className="overflow-hidden rounded-lg border border-border">
          <figcaption className="flex h-8 items-center gap-2 border-b border-border bg-surface-1 px-3 font-mono text-[11px] uppercase tracking-[0.08em] text-text-3">
            <th.icon size={13} strokeWidth={1.5} />
            {th.label}
          </figcaption>
          <div className="px-4 py-3" style={{ backgroundColor: th.bg }}>
            <MiniEditor seed={thumbSeed} theme={th.key} />
          </div>
        </figure>
      ))}
    </div>
  );
}

function RelatedLinks({ doc }: { doc: BlockDoc }) {
  const cards = [
    {
      breadcrumb: "Docs / Foundations",
      title: "Manipulating Blocks",
      desc: "insertBlocks / updateBlock / removeBlocks 完整参考。",
      to: "/docs/foundations/manipulating-blocks",
    },
    doc.relatedExample
      ? {
          breadcrumb: "Examples",
          title: doc.relatedExample.title,
          desc: "该块在真实示例中的用法。",
          to: `/examples/${doc.relatedExample.slug}`,
        }
      : {
          breadcrumb: "Examples",
          title: "示例画廊",
          desc: "受控、只读、JSON 往返等完整示例。",
          to: "/examples",
        },
  ];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {cards.map((card) => (
        <Link
          key={card.to}
          to={card.to}
          className="group rounded-lg border border-border bg-surface-1 p-4 transition-colors duration-150 ease-k3 hover:bg-surface-2 hover:no-underline"
        >
          <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.08em] text-text-4">
            {card.breadcrumb}
            <ArrowUpRight
              size={13}
              strokeWidth={1.5}
              className="text-text-4 transition-colors duration-150 ease-k3 group-hover:text-accent"
            />
          </div>
          <div className="mt-2.5 text-[15px] font-semibold text-text-1">{card.title}</div>
          <p className="mt-1 text-[13px] text-text-2">{card.desc}</p>
        </Link>
      ))}
    </div>
  );
}

function Pager({ slug }: { slug: string }) {
  const { prev, next } = blockNeighbors(slug);
  const cardClass =
    "rounded-lg border border-border bg-surface-1 p-4 transition-colors duration-150 ease-k3 hover:bg-surface-2 hover:no-underline";
  return (
    <nav aria-label="块导航" className="mt-14 grid grid-cols-2 gap-3 border-t border-border pt-8">
      {prev ? (
        <Link to={`/blocks/${prev.slug}`} className={cardClass}>
          <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-text-4">
            <ArrowLeft size={12} strokeWidth={1.5} />
            上一块
          </div>
          <div className="mt-2 text-[15px] font-semibold text-text-1">{prev.name}</div>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link to={`/blocks/${next.slug}`} className={cn(cardClass, "text-right")}>
          <div className="flex items-center justify-end gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-text-4">
            下一块
            <ArrowRight size={12} strokeWidth={1.5} />
          </div>
          <div className="mt-2 text-[15px] font-semibold text-text-1">{next.name}</div>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}

export default function BlockDocPage({ slug }: { slug: string }) {
  const doc = getBlockDoc(slug);

  return (
    <BlocksShell toc={TOC}>
      <Breadcrumb doc={doc} />

      <h1 className="mt-4 font-mono text-4xl font-semibold tracking-[-0.015em] text-text-1">
        {doc.name}
        <span className="text-accent">.</span>
      </h1>
      <p className="mt-3 text-base leading-[1.65] text-text-2">{doc.lead}</p>

      <section id="demo" className="mt-10 scroll-mt-24">
        <SectionLabel withRule>LIVE DEMO</SectionLabel>
        <div className="mt-6">
          <BlockDemoPanel doc={doc} />
        </div>
        {doc.notes && <Callout className="mt-4">{doc.notes}</Callout>}
      </section>

      <section id="props" className="mt-14 scroll-mt-24">
        <SectionLabel withRule>PROPS</SectionLabel>
        <div className="mt-6">
          <PropsTable doc={doc} />
        </div>
      </section>

      <section id="create" className="mt-14 scroll-mt-24">
        <SectionLabel withRule>创建方式</SectionLabel>
        <div className="mt-6">
          <CreationStrip doc={doc} />
        </div>
      </section>

      <section id="styles" className="mt-14 scroll-mt-24">
        <SectionLabel withRule>样式说明</SectionLabel>
        <p className="mt-4 text-sm text-text-2">
          同一组 CSS 变量驱动两套主题；下面是 light / dark 下实时渲染的只读编辑器。
        </p>
        <div className="mt-5">
          <StyleThumbs doc={doc} />
        </div>
      </section>

      <section id="related" className="mt-14 scroll-mt-24">
        <SectionLabel withRule>相关链接</SectionLabel>
        <div className="mt-6">
          <RelatedLinks doc={doc} />
        </div>
      </section>

      <Pager slug={doc.slug} />
    </BlocksShell>
  );
}
