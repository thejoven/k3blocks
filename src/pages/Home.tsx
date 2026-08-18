import { useState } from "react";
import { Link } from "react-router";
import {
  Check,
  Code2,
  Copy,
  GripVertical,
  Hash,
  Heading,
  Image,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Palette,
  Quote,
  SquareSlash,
  TextCursorInput,
  Type,
  X,
  Braces,
} from "lucide-react";
import Hero from "@/components/home/Hero";
import LiveDemo from "@/components/home/LiveDemo";
import Quickstart from "@/components/home/Quickstart";
import SectionLabel from "@/components/SectionLabel";
import { cn } from "@/lib/utils";

/* ------------------------------ S3. Features ------------------------------ */

const FEATURES = [
  {
    icon: SquareSlash,
    title: "斜杠菜单",
    description: "模糊搜索、分组、全键盘操作。",
    spec: "/ → ⌘",
  },
  {
    icon: TextCursorInput,
    title: "格式化工具栏",
    description: "选区即现：粗体、斜体、下划线、删除线、行内代码、链接。",
    spec: "B I U S </> 🔗",
  },
  {
    icon: GripVertical,
    title: "拖拽排序",
    description: "HTML5 拖拽排序，悬停左侧手柄。",
    spec: "⠿",
  },
  {
    icon: Hash,
    title: "Markdown 快捷键",
    description: "行首 #、-、1.、[]、>、```、--- 即刻转换。",
    spec: "input rules",
  },
  {
    icon: Palette,
    title: "明暗主题",
    description: "CSS 变量驱动，跟随宿主应用。",
    spec: "--k3-*",
  },
  {
    icon: Braces,
    title: "JSON 文档模型",
    description: "无损 Block[] 结构，导入导出即持久化。",
    spec: "Block[]",
  },
];

function FeatureGrid() {
  return (
    <section className="mx-auto max-w-shell px-6">
      <SectionLabel>特性</SectionLabel>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.015em] text-text-1">
        块编辑器所需的一切。
      </h2>
      <p className="mt-2 text-sm text-text-2">块、菜单、快捷键、主题、持久化 —— 开箱即用。</p>

      {/* Hairline grid: 1px --border lines via gap-px over a border-colored track */}
      <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="bg-bg p-8 transition-colors duration-150 ease-k3 hover:bg-surface-1"
          >
            <f.icon size={16} strokeWidth={1.5} className="text-text-3" />
            <div className="mt-4 text-[15px] font-semibold text-text-1">{f.title}</div>
            <p className="mt-1.5 text-sm text-text-2">{f.description}</p>
            <div className="mt-3 font-mono text-[12px] text-text-4">{f.spec}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ S5. Blocks -------------------------------- */

const BLOCK_TILES = [
  { icon: Type, name: "Paragraph", slash: "/text", to: "/blocks/paragraph" },
  { icon: Heading, name: "Heading", slash: "/h1–h3", to: "/blocks/heading" },
  { icon: List, name: "Bullet list", slash: "/bullet", to: "/blocks/bullet-list" },
  { icon: ListOrdered, name: "Numbered list", slash: "/numbered", to: "/blocks/numbered-list" },
  { icon: ListTodo, name: "Check list", slash: "/todo", to: "/blocks/todo-list" },
  { icon: Quote, name: "Quote", slash: "/quote", to: "/blocks/quote" },
  { icon: Code2, name: "Code", slash: "/code", to: "/blocks/code-block" },
  { icon: Minus, name: "Divider", slash: "/divider", to: "/blocks/divider" },
  { icon: Image, name: "Image", slash: "/image", to: "/blocks/image" },
];

function BlockTiles() {
  return (
    <section className="mx-auto max-w-shell px-6">
      <SectionLabel>块</SectionLabel>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.015em] text-text-1">
        九种块类型，开箱即用。
      </h2>
      <p className="mt-2 text-sm text-text-2">点击任意块，查看文档与可运行示例。</p>

      <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 md:grid-cols-3">
        {BLOCK_TILES.map((t) => (
          <Link
            key={t.name}
            to={t.to}
            className="flex flex-col bg-bg p-6 transition-colors duration-150 ease-k3 hover:bg-surface-2 hover:no-underline"
          >
            <t.icon size={16} strokeWidth={1.5} className="text-text-3" />
            <div className="mt-4 text-[15px] font-semibold text-text-1">{t.name}</div>
            <div className="mt-1 font-mono text-[12px] text-text-4">{t.slash}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------- S6. Trade-offs ----------------------------- */

const FITS = [
  "需要 Notion 式编辑体验的 React 应用",
  "想要 JSON 文档模型、自控存储",
  "重视暗色主题与设计一致性",
  "希望零重依赖（不自依赖 tiptap/ProseMirror）",
];

const NOT_FITS = [
  "需要表格、看板等高级块（路线图中）",
  "协同编辑（尚未支持 Yjs）",
  "富文本仅需简单输入框",
  "非 React 技术栈",
];

function TradeOffs() {
  return (
    <section className="mx-auto max-w-shell px-6">
      <SectionLabel>取舍</SectionLabel>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.015em] text-text-1">
        它适合你吗？
      </h2>

      <div className="mt-8 grid overflow-hidden rounded-xl border border-border bg-surface-1 md:grid-cols-2">
        <div className="border-b border-border p-8 md:border-b-0 md:border-r">
          <div className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-accent">
            ✓ 适合
          </div>
          <ul className="mt-4 flex flex-col gap-3">
            {FITS.map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-sm text-text-2">
                <Check size={15} strokeWidth={1.5} className="mt-0.5 shrink-0 text-accent" />
                {line}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-8">
          <div className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-text-4">
            ✗ 不适合
          </div>
          <ul className="mt-4 flex flex-col gap-3">
            {NOT_FITS.map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-sm text-text-2">
                <X size={15} strokeWidth={1.5} className="mt-0.5 shrink-0 text-text-4" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- S7. CTA -------------------------------- */

const INSTALL_CMD = "npm install @k3/blocks";

function Cta() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
    } catch {
      // ignore — non-secure context
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <section className="mx-auto max-w-shell px-6">
      {/* 整宽 CTA 面板：24px 圆角 + 1px 发丝线，左文右命令行 */}
      <div className="grid items-center gap-10 rounded-xl border border-border bg-surface-1 p-10 md:grid-cols-2 md:p-16">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.015em] text-text-1">现在开始构建。</h2>
          <p className="mt-2 text-sm text-text-2">MPL-2.0 开源。五分钟接入，随时 eject。</p>

          <div className="mt-8 flex items-center gap-3">
            <Link
              to="/docs/getting-started"
              className="flex h-8 items-center rounded-lg bg-accent px-3.5 text-sm font-medium text-white transition-colors duration-150 ease-k3 hover:bg-accent-hover hover:no-underline"
            >
              阅读文档
            </Link>
            <Link
              to="/playground"
              className="flex h-8 items-center rounded-lg border border-border px-3.5 text-sm font-medium text-text-1 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:no-underline"
            >
              在线试玩
            </Link>
          </div>
        </div>

        <div className="relative flex items-center gap-3 rounded-lg border border-border bg-surface-inset px-4 py-3.5">
          <span className="min-w-0 truncate font-mono text-xl text-text-1">$ {INSTALL_CMD}</span>
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? "已复制" : "复制安装命令"}
            className={cn(
              "ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
              "text-text-3 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-1",
            )}
          >
            {copied ? <Check size={14} strokeWidth={1.5} /> : <Copy size={14} strokeWidth={1.5} />}
          </button>
          {copied && (
            <span className="absolute -top-8 right-0 rounded-md border border-border bg-surface-2 px-2 py-1 font-mono text-[11px] text-text-2 shadow-popover">
              已复制
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Page ----------------------------------- */

/**
 * Landing page `/` (home.md): Hero → live Demo → feature grid → code↔output →
 * block tiles → "Is it for you?" → CTA. Only the hero animates; 96px section rhythm.
 */
export default function Home() {
  return (
    <div className="flex flex-col gap-24 pb-24">
      <Hero />
      <LiveDemo />
      <FeatureGrid />
      <Quickstart />
      <BlockTiles />
      <TradeOffs />
      <Cta />
    </div>
  );
}
