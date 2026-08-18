import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CodeBlock (design.md §6.4): --surface-inset well, hairline, radius 8px,
 * 13px Geist Mono, top-right copy button (28px ghost, appears on hover 150ms).
 * Copy feedback: icon swaps to check for 1.2s.
 */
export default function CodeBlock({
  code,
  language,
  className,
}: {
  code: string;
  language?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Clipboard API unavailable (non-secure context) — fall back silently.
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div
      className={cn(
        "group relative rounded-lg border border-border bg-surface-inset",
        className,
      )}
    >
      {language && (
        <span className="absolute right-3 top-2.5 font-mono text-[11px] text-text-4">
          {language}
        </span>
      )}
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy code"}
        className={cn(
          "absolute flex h-7 w-7 items-center justify-center rounded-lg",
          "text-text-3 transition-all duration-150 ease-k3",
          "hover:bg-hover-overlay hover:text-text-1",
          language ? "right-9 top-2" : "right-2 top-2",
          copied ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
        )}
        style={{ backgroundColor: "transparent" }}
      >
        {copied ? <Check size={14} strokeWidth={1.5} /> : <Copy size={14} strokeWidth={1.5} />}
      </button>
      <pre className="overflow-x-auto p-4 font-mono text-code text-text-2">
        <code>{code}</code>
      </pre>
    </div>
  );
}
