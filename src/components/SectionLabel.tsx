import { cn } from "@/lib/utils";

/**
 * Section label (design.md §3): 12px / 500 / uppercase / +0.08em tracking / --text-3.
 * Optionally followed by a 24px-tall hairline row.
 */
export default function SectionLabel({
  children,
  withRule = false,
  className,
}: {
  children: string;
  withRule?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-text-3">
        {children}
      </span>
      {withRule && (
        <div className="mt-2 flex h-6 items-center">
          <div className="h-px w-full bg-border" />
        </div>
      )}
    </div>
  );
}
