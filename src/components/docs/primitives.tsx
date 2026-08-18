import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Docs-only prose primitives (docs.md §0): shared by the /docs/* pages.
 * Not part of the site-wide shared component set.
 */

/** Section heading — auto-collected into the right TOC by DocsShell. */
export function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="mt-14 scroll-mt-24 text-2xl font-semibold tracking-[-0.015em] text-text-1"
    >
      {children}
    </h2>
  );
}

export function H3({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h3 id={id} className="mt-10 scroll-mt-24 text-[17px] font-semibold text-text-1">
      {children}
    </h3>
  );
}

/** Body paragraph: 14px / --text-2 / 1.65 / max-measure 68ch (design.md §3). */
export function P({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("mt-3 max-w-[68ch] text-sm leading-[1.65] text-text-2", className)}>
      {children}
    </p>
  );
}

/** Inline code chip inside prose. */
export function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-md border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[12px] text-text-1">
      {children}
    </code>
  );
}

/** Accent text link (react-router). */
export function DocLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="text-accent hover:underline">
      {children}
    </Link>
  );
}

/** External accent link with ↗ glyph (design.md §3). */
export function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-baseline gap-0.5 text-accent hover:underline"
    >
      {children}
      <span className="text-[12px] text-text-3 no-underline">↗</span>
    </a>
  );
}

/**
 * Hairline table (docs.md §3.1/§4): 1px row rules, mono uppercase header.
 */
export function DocTable({
  columns,
  rows,
  className,
}: {
  columns: string[];
  rows: ReactNode[][];
  className?: string;
}) {
  return (
    <div className={cn("mt-4 overflow-x-auto rounded-lg border border-border", className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c}
                className="whitespace-nowrap border-b border-border bg-surface-1 px-3 py-2 text-left font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-text-4"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr:last-child>td]:border-b-0">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="border-b border-border px-3 py-2.5 align-top leading-relaxed text-text-2"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Mono table cell (signatures, types). */
export function MonoCell({ children, accent = false }: { children: ReactNode; accent?: boolean }) {
  return (
    <span className={cn("font-mono text-[13px]", accent ? "text-accent" : "text-text-1")}>
      {children}
    </span>
  );
}

/** Status chip for feature tables (✓ stable · β beta · roadmap). */
export function StatusChip({ status }: { status: "stable" | "beta" | "roadmap" }) {
  const label = status === "stable" ? "✓ stable" : status === "beta" ? "β beta" : "roadmap";
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-md border px-1.5 font-mono text-[11px]",
        status === "stable" && "border-border bg-surface-2 text-text-1",
        status === "beta" && "border-border bg-accent-soft text-accent",
        status === "roadmap" && "border-border text-text-4",
      )}
    >
      {label}
    </span>
  );
}

/** Card strip linking to related docs / examples (docs.md cross-linking rule). */
export function CardStrip({
  cards,
  className,
}: {
  cards: { to: string; title: string; description: string; external?: boolean }[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2",
        className,
      )}
    >
      {cards.map((c) => (
        <Link
          key={c.to + c.title}
          to={c.to}
          className="group flex flex-col bg-bg p-5 transition-colors duration-150 ease-k3 hover:bg-surface-1 hover:no-underline"
        >
          <span className="flex items-center gap-1.5 text-[15px] font-semibold text-text-1">
            {c.title}
            <ArrowUpRight
              size={14}
              strokeWidth={1.5}
              className="text-text-4 transition-colors duration-150 group-hover:text-accent"
            />
          </span>
          <span className="mt-1 text-sm text-text-2">{c.description}</span>
          <span className="mt-3 font-mono text-[12px] text-text-4">{c.to}</span>
        </Link>
      ))}
    </div>
  );
}

/**
 * Demo frame (docs.md §2/§3.3): 24px-radius panel with an optional 44px
 * control bar and a padded live-editor body.
 */
export function DemoFrame({
  bar,
  children,
  className,
  bodyClassName,
  style,
}: {
  bar?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-surface-1", className)} style={style}>
      {bar && (
        <div className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-3 py-2">
          {bar}
        </div>
      )}
      <div className={cn("px-6 py-6", bodyClassName)}>{children}</div>
    </div>
  );
}

/** Segmented control (28px, design.md §2 demo bars). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex h-7 items-center rounded-lg border border-border p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "flex h-6 items-center rounded-md px-2.5 font-mono text-[12px] transition-colors duration-150 ease-k3",
            value === o.value
              ? "border border-border bg-surface-2 text-text-1"
              : "border border-transparent text-text-3 hover:text-text-2",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** 28px switch row used in prop playgrounds (docs.md §4.2). */
export function SwitchRow({
  label,
  prop,
  checked,
  onChange,
}: {
  label: string;
  prop: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex h-7 items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={prop}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-[18px] w-8 shrink-0 rounded-full border transition-colors duration-150 ease-k3",
          checked ? "border-accent bg-accent" : "border-border bg-surface-2",
        )}
      >
        <span
          className={cn(
            "absolute left-[2px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white transition-transform duration-150 ease-k3",
            checked && "translate-x-[13px]",
          )}
        />
      </button>
      <span className="text-sm text-text-1">{label}</span>
      <span className="font-mono text-[12px] text-text-4">{prop}</span>
    </div>
  );
}
