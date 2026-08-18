import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Keycap primitive (design.md §6.4): 6px radius, surface-2, 1px border +
 * bottom micro-shadow, 11px Geist Mono.
 */
export default function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return <kbd className={cn(className)}>{children}</kbd>;
}
