import { useEffect, useState, type ReactNode } from "react";
import Topbar from "@/components/Topbar";
import Footer from "@/components/Footer";
import CommandPalette from "@/components/CommandPalette";

/**
 * Shared layout (children pattern — design.md §6, react-dev.md contract A).
 * Topbar is sticky in normal flow (no fixed, no page offset bookkeeping).
 * Docs-style sidebars are owned by the individual pages, not here.
 */
export default function Layout({ children }: { children: ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Global ⌘K / Ctrl+K, plus "/" outside of editable contexts.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((open) => !open);
        return;
      }
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement | null;
        const tag = target?.tagName;
        const editable =
          tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable;
        if (!editable) {
          e.preventDefault();
          setPaletteOpen(true);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-bg">
      <Topbar onOpenSearch={() => setPaletteOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
