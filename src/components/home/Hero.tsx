import { useMemo, useState } from "react";
import { Link } from "react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Copy } from "lucide-react";
import { VERSION } from "@/lib/version";

const INSTALL_CMD = "npm install @k3/blocks";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, filter: "blur(10px)", y: 12 },
  show: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

const itemReduced = {
  hidden: { opacity: 1, filter: "blur(0px)", y: 0 },
  show: { opacity: 1, filter: "blur(0px)", y: 0 },
};

/**
 * S1 Hero (home.md §S1): the only animated section on the site.
 * Children stagger 80ms from blur(10px)/translateY(12px) to rest, 700ms ease-out.
 */
export default function Hero() {
  const reduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const variants = useMemo(
    () => ({ container, item: reduceMotion ? itemReduced : item }),
    [reduceMotion],
  );

  const copyInstall = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
    } catch {
      // ignore — non-secure context
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <motion.div
      className="mx-auto flex max-w-3xl flex-col items-center px-6 pb-24 pt-32 text-center"
      variants={variants.container}
      initial="hidden"
      animate="show"
    >
      {/* 1. Version pill */}
      <motion.div variants={variants.item}>
        <Link
          to="/docs/getting-started"
          className="flex h-7 items-center gap-2 rounded-full border border-border px-3 font-mono text-[12px] text-text-3 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:no-underline"
        >
          <span className="text-text-2">v{VERSION}</span>
          <span className="text-accent">·</span>
          <span>MPL-2.0</span>
        </Link>
      </motion.div>

      {/* 2. H1 */}
      <motion.h1
        variants={variants.item}
        className="mt-6 text-[48px] font-semibold leading-[1.1] tracking-[-0.025em] text-text-1"
      >
        为 React 而生的块编辑器。
      </motion.h1>

      {/* 3. Sub */}
      <motion.p variants={variants.item} className="mt-5 max-w-xl text-base text-text-2">
        K3Blocks 是一个 Notion 风格的块编辑器组件。斜杠菜单、选区工具栏、拖拽排序、Markdown
        快捷输入 —— 五行代码，接入你的 React 应用。
      </motion.p>

      {/* 4. Buttons */}
      <motion.div variants={variants.item} className="mt-8 flex items-center gap-3">
        <Link
          to="/docs/getting-started"
          className="flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3.5 text-sm font-medium text-white transition-colors duration-150 ease-k3 hover:bg-accent-hover hover:no-underline"
        >
          快速开始
          <ArrowRight size={14} strokeWidth={1.5} />
        </Link>
        <Link
          to="/playground"
          className="flex h-8 items-center rounded-lg border border-border px-3.5 text-sm font-medium text-text-1 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:no-underline"
        >
          在线试玩
        </Link>
      </motion.div>

      {/* 5. Mono install line */}
      <motion.div variants={variants.item} className="mt-6 flex items-center gap-1.5">
        <span className="font-mono text-[13px] text-text-3">$ {INSTALL_CMD}</span>
        <button
          type="button"
          onClick={copyInstall}
          aria-label={copied ? "已复制" : "复制安装命令"}
          className="flex h-6 w-6 items-center justify-center rounded-md text-text-3 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-1"
        >
          {copied ? <Check size={13} strokeWidth={1.5} /> : <Copy size={13} strokeWidth={1.5} />}
        </button>
      </motion.div>
    </motion.div>
  );
}
