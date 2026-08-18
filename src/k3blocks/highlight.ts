/**
 * K3Blocks — codeBlock 语法高亮引擎（Prism）。
 * prism 核心与语言组件全部经动态 import 加载（异步 chunk，不进主包）；
 * 语言组件按 codeBlock 的 language prop 按需加载（静态映射表 + Promise 缓存，并发去重）；
 * 未知语言 / 加载失败静默降级为纯文本（返回 null）。
 */

/** prismjs 核心模块动态 import 后的最小形状（避免把类型锚定到具体导出方式） */
interface PrismCore {
  languages: Record<string, unknown>;
  highlight(text: string, grammar: unknown, language: string): string;
}

interface LangSpec {
  /** prism 组件的依赖（需先加载，如 tsx → jsx/typescript） */
  deps?: string[];
  load: () => Promise<unknown>;
}

/**
 * 支持的语言子集 → prism 组件动态 import。
 * 注意：每个 load 必须是静态字符串字面量，Vite 才能切成独立异步 chunk。
 */
const LANGS: Record<string, LangSpec> = {
  markup: { load: () => import("prismjs/components/prism-markup") },
  css: { load: () => import("prismjs/components/prism-css") },
  clike: { load: () => import("prismjs/components/prism-clike") },
  javascript: { deps: ["clike"], load: () => import("prismjs/components/prism-javascript") },
  typescript: { deps: ["javascript"], load: () => import("prismjs/components/prism-typescript") },
  jsx: { deps: ["markup", "javascript"], load: () => import("prismjs/components/prism-jsx") },
  tsx: { deps: ["jsx", "typescript"], load: () => import("prismjs/components/prism-tsx") },
  json: { load: () => import("prismjs/components/prism-json") },
  bash: { load: () => import("prismjs/components/prism-bash") },
  python: { load: () => import("prismjs/components/prism-python") },
  markdown: { deps: ["markup"], load: () => import("prismjs/components/prism-markdown") },
  yaml: { load: () => import("prismjs/components/prism-yaml") },
  mermaid: { load: () => import("prismjs/components/prism-mermaid") },
};

/** 常见别名 → 规范语言名（写入 props.language 的任意值都会先归一化） */
const ALIASES: Record<string, string> = {
  html: "markup",
  xml: "markup",
  svg: "markup",
  mathml: "markup",
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  mts: "typescript",
  cts: "typescript",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  py: "python",
  md: "markdown",
  yml: "yaml",
};

/** 语言 select 选项（面向用户的子集；clike 等基础件不单独列出） */
export const CODE_LANGUAGES: readonly { value: string; label: string }[] = [
  { value: "text", label: "text" },
  { value: "markup", label: "html" },
  { value: "css", label: "css" },
  { value: "javascript", label: "javascript" },
  { value: "typescript", label: "typescript" },
  { value: "jsx", label: "jsx" },
  { value: "tsx", label: "tsx" },
  { value: "json", label: "json" },
  { value: "bash", label: "bash" },
  { value: "python", label: "python" },
  { value: "markdown", label: "markdown" },
  { value: "yaml", label: "yaml" },
  { value: "mermaid", label: "mermaid" },
];

/**
 * 归一化 language prop → prism 规范语言名。
 * "text" / "plain" / 空串 / 未知语言返回 null（调用方按纯文本处理）。
 */
export function resolveLanguage(language: string): string | null {
  const l = language.trim().toLowerCase();
  if (!l || l === "text" || l === "plain" || l === "plaintext") return null;
  const canonical = ALIASES[l] ?? l;
  return canonical in LANGS ? canonical : null;
}

let corePromise: Promise<PrismCore> | null = null;

/** 加载 prism 核心（全局只加载一次；加载前置 manual 标志关闭自动扫描） */
function loadCore(): Promise<PrismCore> {
  if (!corePromise) {
    // 关闭 prism 的 DOMContentLoaded 自动 highlightAll（我们只手动 tokenize）
    const g = globalThis as { Prism?: { manual?: boolean } };
    g.Prism = { ...(g.Prism ?? {}), manual: true };
    corePromise = import("prismjs").then((m) => {
      const mod = m as unknown as { default?: PrismCore } & PrismCore;
      return mod.default ?? mod;
    });
  }
  return corePromise;
}

/** 语言组件加载缓存（并发去重；失败的 Promise 也缓存，避免反复打挂掉的 chunk） */
const langPromises = new Map<string, Promise<boolean>>();

function ensureLanguage(name: string): Promise<boolean> {
  const cached = langPromises.get(name);
  if (cached) return cached;
  const spec = LANGS[name];
  if (!spec) return Promise.resolve(false);
  const p = (async (): Promise<boolean> => {
    try {
      for (const dep of spec.deps ?? []) {
        if (!(await ensureLanguage(dep))) return false;
      }
      await spec.load();
      return true;
    } catch {
      return false;
    }
  })();
  langPromises.set(name, p);
  return p;
}

/**
 * 高亮一段代码，返回带 prism token span 的 HTML；不可高亮时返回 null。
 * @param language 已归一化的 prism 语言名（resolveLanguage 的返回值）
 */
export async function highlightCode(code: string, language: string): Promise<string | null> {
  try {
    const Prism = await loadCore();
    if (!(await ensureLanguage(language))) return null;
    const grammar = Prism.languages[language];
    if (!grammar) return null;
    return Prism.highlight(code, grammar, language);
  } catch {
    // 语法组件异常 / 动态 import 失败：静默降级为纯文本
    return null;
  }
}
