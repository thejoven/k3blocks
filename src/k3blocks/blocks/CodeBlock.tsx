/**
 * K3Blocks — codeBlock：inset 深底 + 等宽字体 + 右上角语言标签/选择 + 复制按钮。
 * Enter 块内换行（不拆块），Cmd/Ctrl+Enter 跳出。
 * 语法高亮：overlay 方案——底层 <pre aria-hidden> 渲染 Prism token，上层 contenteditable
 * 保持纯文本（color: transparent + caret-color: accent），两层同字体/行高/padding 且滚动同步；
 * 未加载完成 / 未知语言 / 加载失败时静默降级为纯文本（上层恢复默认颜色）。
 */
import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { EditableContent } from "./EditableContent";
import { plainText } from "../inline";
import { CODE_LANGUAGES, highlightCode, resolveLanguage } from "../highlight";
import type { BlockRendererProps } from "./textBlocks";

export function CodeBlock({ ctx, block }: BlockRendererProps) {
  const [copied, setCopied] = useState(false);
  const language = String(block.props.language ?? "text");
  const text = plainText(block.content);
  const [html, setHtml] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // 高亮：prism 核心与语言组件均动态 import；alive 守卫丢弃过期的异步结果
  useEffect(() => {
    const canonical = resolveLanguage(language);
    if (!canonical) {
      setHtml(null);
      return;
    }
    let alive = true;
    void highlightCode(text, canonical).then((h) => {
      if (alive) setHtml(h);
    });
    return () => {
      alive = false;
    };
  }, [text, language]);

  // 滚动同步：上层 contenteditable 滚动驱动下层高亮层
  useEffect(() => {
    const editable = wrapRef.current?.querySelector<HTMLElement>(".k3-editable");
    if (!editable) return;
    const sync = () => {
      const pre = preRef.current;
      if (!pre) return;
      pre.scrollLeft = editable.scrollLeft;
      pre.scrollTop = editable.scrollTop;
    };
    sync();
    editable.addEventListener("scroll", sync, { passive: true });
    return () => editable.removeEventListener("scroll", sync);
  }, [html !== null]);

  const copy = () => {
    const done = () => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done, done);
    } else {
      done();
    }
  };

  // 语言 select：当前语言不在子集内（如自定义 "rust"）时补一个占位项，保证选中态正确显示
  const options = CODE_LANGUAGES.some((l) => l.value === language)
    ? CODE_LANGUAGES
    : [...CODE_LANGUAGES, { value: language, label: language }];
  const setLanguage = (value: string) => {
    ctx.editor.updateBlock(block.id, { props: { ...block.props, language: value } });
  };

  // pre-wrap 下结尾 "\n" 不占行高，补 <br> 与 contenteditable 的尾部 <br> 对齐
  const preHtml = html !== null && text.endsWith("\n") ? html + "<br>" : html;

  return (
    <div className={preHtml !== null ? "k3-codeblock k3-codeblock-hl" : "k3-codeblock"}>
      <div className="k3-codeblock-bar">
        {ctx.editable ? (
          <select
            className="k3-codeblock-lang k3-codeblock-lang-select"
            value={language}
            tabIndex={-1}
            aria-label={ctx.dict.codeBlock.language}
            title={ctx.dict.codeBlock.language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {options.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        ) : (
          <span className="k3-codeblock-lang">{language}</span>
        )}
        <button
          type="button"
          className="k3-codeblock-copy"
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          onClick={copy}
          aria-label={ctx.dict.codeBlock.copy}
          title={ctx.dict.codeBlock.copy}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <div className="k3-codeblock-code" ref={wrapRef}>
        {preHtml !== null && (
          <pre
            ref={preRef}
            aria-hidden="true"
            className="k3-codeblock-body k3-codeblock-highlight"
            dangerouslySetInnerHTML={{ __html: preHtml }}
          />
        )}
        <EditableContent ctx={ctx} block={block} className="k3-codeblock-body" />
      </div>
    </div>
  );
}
