/**
 * /examples/[slug] — 示例详情（examples.md §2）。
 * Run | Code 演示面板 + How it works + API used strip + prev/next pager。
 */
import { useState } from "react";
import { Link, useParams } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Moon, RotateCcw, Sun } from "lucide-react";
import CodeBlock from "@/components/CodeBlock";
import SectionLabel from "@/components/SectionLabel";
import { EXAMPLES, getExample } from "@/examples";
import { cn } from "@/lib/utils";

/** slug → 源文件名（src/examples/<PascalCase>.tsx），与仓库文件命名一一对应 */
function exampleSourceUrl(slug: string): string {
  const pascal = slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
  return `https://github.com/thejoven/k3blocks/blob/main/src/examples/${pascal}.tsx`;
}

/** 把 `inline code` 标记渲染成 mono 片段 */
function InlineMono({ text }: { text: string }) {
  const parts = text.split("`");
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <code key={i} className="rounded-md bg-surface-2 px-1 py-0.5 font-mono text-[12px] text-text-1">
            {p}
          </code>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export default function ExampleDetail() {
  const { slug } = useParams();
  const example = getExample(slug);
  const [view, setView] = useState<"run" | "code">("run");
  const [demoTheme, setDemoTheme] = useState<"dark" | "light">("dark");
  const [resetKey, setResetKey] = useState(0);
  const [fileIdx, setFileIdx] = useState(0);

  if (!example) {
    return (
      <div className="mx-auto max-w-shell px-6 py-32 text-center">
        <SectionLabel>EXAMPLES</SectionLabel>
        <h1 className="mt-4 text-[32px] font-semibold tracking-[-0.015em] text-text-1">
          404 — Example not found
        </h1>
        <p className="mt-3 font-mono text-[13px] text-text-4">
          <Link to="/examples">← 返回示例廊</Link>
        </p>
      </div>
    );
  }

  const idx = EXAMPLES.findIndex((e) => e.slug === example.slug);
  const prev = idx > 0 ? EXAMPLES[idx - 1] : null;
  const next = idx < EXAMPLES.length - 1 ? EXAMPLES[idx + 1] : null;
  const file = example.files[Math.min(fileIdx, example.files.length - 1)];
  const Body = example.component;

  return (
    <div className="mx-auto max-w-shell px-6 py-12">
      {/* 面包屑 */}
      <nav className="font-mono text-[12px] text-text-4">
        <Link to="/examples" className="text-text-3 hover:text-text-1 hover:no-underline">
          Examples
        </Link>
        <span className="mx-2">/</span>
        <span>{example.slug}</span>
      </nav>

      {/* 头部 */}
      <header className="mt-8 max-w-prose">
        <h1 className="text-4xl font-semibold leading-[1.1] tracking-[-0.025em] text-text-1">
          {example.title}
        </h1>
        <p className="mt-3 text-base text-text-2">{example.blurb}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[12px]">
          <span className="text-text-4">{example.category}</span>
          {example.tags.map((t) => (
            <span
              key={t}
              className="rounded-md border border-border px-1.5 py-0.5 text-[11px] leading-none text-text-4"
            >
              {t}
            </span>
          ))}
          <a
            href={exampleSourceUrl(example.slug)}
            target="_blank"
            rel="noreferrer"
            className="text-text-3 hover:text-text-1"
          >
            编辑此示例 ↗
          </a>
          {example.apis.map((api) => (
            <Link
              key={api}
              to="/docs/api"
              className="rounded-md bg-accent-soft px-1.5 py-0.5 text-[11px] leading-none text-accent hover:no-underline"
            >
              {api}
            </Link>
          ))}
        </div>
      </header>

      {/* 演示面板：24px-radius hairline panel + 44px demo bar */}
      <div className="mt-10 overflow-hidden rounded-xl border border-border bg-surface-1">
        <div className="flex h-11 flex-wrap items-center gap-3 border-b border-border px-3">
          <div className="flex h-7 items-center rounded-lg border border-border p-0.5">
            {(["run", "code"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  "flex h-6 items-center rounded-md px-2.5 font-mono text-[12px] transition-colors duration-150 ease-k3",
                  view === v
                    ? "border border-border bg-surface-2 text-text-1"
                    : "border border-transparent text-text-3 hover:text-text-2",
                )}
              >
                {v === "run" ? "Run" : "Code"}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* 演示面板内主题切换（仅作用于编辑器实例） */}
            <button
              type="button"
              aria-label="Toggle demo theme"
              onClick={() => setDemoTheme((t) => (t === "dark" ? "light" : "dark"))}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-text-2 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-1"
            >
              <span
                className="flex transition-transform duration-200 ease-k3"
                style={{ transform: demoTheme === "dark" ? "rotate(0deg)" : "rotate(180deg)" }}
              >
                {demoTheme === "dark" ? (
                  <Sun size={15} strokeWidth={1.5} />
                ) : (
                  <Moon size={15} strokeWidth={1.5} />
                )}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setResetKey((k) => k + 1)}
              className="flex h-7 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[12px] text-text-2 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-1"
            >
              <RotateCcw size={13} strokeWidth={1.5} />
              Reset
            </button>
          </div>
        </div>

        {/* Run ↔ Code 150ms crossfade */}
        <div className="bg-surface-inset">
          <AnimatePresence mode="wait" initial={false}>
            {view === "run" ? (
              <motion.div
                key={`run-${resetKey}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="min-h-[420px]"
              >
                <Body theme={demoTheme} />
              </motion.div>
            ) : (
              <motion.div
                key="code"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="p-4 md:p-6"
              >
                {/* 文件 tab strip（28px） */}
                <div className="mb-3 flex h-7 items-end gap-1 border-b border-border">
                  {example.files.map((f, i) => (
                    <button
                      key={f.name}
                      type="button"
                      onClick={() => setFileIdx(i)}
                      className={cn(
                        "flex h-7 items-center rounded-t-md border border-b-0 px-3 font-mono text-[12px] transition-colors duration-150 ease-k3",
                        i === fileIdx
                          ? "border-border bg-surface-inset text-text-1"
                          : "border-transparent text-text-3 hover:text-text-2",
                      )}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
                <CodeBlock code={file.code} language={file.language} className="max-h-[480px] overflow-y-auto" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* How it works */}
      <section className="mt-16 max-w-prose">
        <SectionLabel withRule>HOW IT WORKS</SectionLabel>
        <ol className="mt-6 flex flex-col gap-8">
          {example.steps.map((step, i) => (
            <li key={i} className="flex gap-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border font-mono text-[12px] text-text-3">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm leading-relaxed text-text-2">
                  <InlineMono text={step.text} />
                </p>
                <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-surface-inset p-3 font-mono text-[12px] leading-[1.7] text-text-2">
                  {step.code}
                </pre>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Relevant Docs / API used strip */}
      <section className="mt-16 max-w-prose">
        <SectionLabel withRule>RELEVANT DOCS</SectionLabel>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {example.apis.map((api) => (
            <Link
              key={api}
              to="/docs/api"
              className="flex items-center justify-between rounded-lg border border-border bg-surface-1 px-4 py-3 transition-colors duration-150 ease-k3 hover:bg-surface-2 hover:no-underline"
            >
              <span className="font-mono text-[13px] text-accent">{api}</span>
              <span className="font-mono text-[11px] text-text-4">API Reference →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Pager */}
      <nav className="mt-16 flex items-stretch justify-between gap-4 border-t border-border pt-8">
        {prev ? (
          <Link
            to={`/examples/${prev.slug}`}
            className="group flex items-center gap-2 text-sm text-text-2 hover:text-text-1 hover:no-underline"
          >
            <ArrowLeft size={15} strokeWidth={1.5} />
            <span>
              <span className="block font-mono text-[11px] text-text-4">上一个</span>
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`/examples/${next.slug}`}
            className="group flex items-center gap-2 text-right text-sm text-text-2 hover:text-text-1 hover:no-underline"
          >
            <span>
              <span className="block font-mono text-[11px] text-text-4">下一个</span>
              {next.title}
            </span>
            <ArrowRight size={15} strokeWidth={1.5} />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
