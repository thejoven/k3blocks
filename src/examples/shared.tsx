/**
 * 示例共用的小控件：28px ghost 按钮、复制按钮（icon swap 150ms）、面板标签。
 */
import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function GhostButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-7 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[12px] transition-colors duration-150 ease-k3",
        disabled
          ? "cursor-not-allowed text-text-4"
          : "text-text-2 hover:bg-hover-overlay hover:text-text-1",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Copy 按钮：成功后图标换成对勾 1.2s（design.md §5 复制反馈）。 */
export function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // 非安全上下文下 Clipboard API 不可用——静默降级
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };
  return (
    <GhostButton onClick={copy}>
      {copied ? <Check size={13} strokeWidth={1.5} /> : <Copy size={13} strokeWidth={1.5} />}
      {copied ? "Copied" : (label ?? "Copy")}
    </GhostButton>
  );
}

/** 示例内的小面板标题（mono 11px --text-4）。 */
export function PanelLabel({ children }: { children: string }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-4">
      {children}
    </span>
  );
}
