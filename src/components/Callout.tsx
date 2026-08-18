import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Callout (design.md §6.4): left 2px accent bar, --accent-soft bg, radius 8px, 14px.
 */
export default function Callout({
  children,
  title,
  className,
}: {
  children: ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg bg-accent-soft py-3 pl-4 pr-4 text-sm text-text-2",
        className,
      )}
      style={{ borderLeftWidth: 2, borderLeftStyle: "solid", borderLeftColor: "var(--accent)" }}
    >
      {title && <div className="mb-1 font-semibold text-text-1">{title}</div>}
      {children}
    </div>
  );
}
