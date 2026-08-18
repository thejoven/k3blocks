import { useState } from "react";
import { Link, NavLink } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Github, Menu, Moon, Sun, X } from "lucide-react";
import Kbd from "@/components/Kbd";
import { useTheme } from "@/hooks/useTheme";
import { VERSION } from "@/lib/version";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Docs", to: "/docs" },
  { label: "Blocks", to: "/blocks" },
  { label: "Examples", to: "/examples" },
  { label: "Playground", to: "/playground" },
];

/**
 * Shared topbar (design.md §6.1): sticky 56px, solid --bg, 1px bottom hairline.
 * No blur/transparency. Stays in normal document flow (no fixed positioning).
 */
export default function Topbar({ onOpenSearch }: { onOpenSearch: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-border bg-bg">
      <div className="mx-auto flex h-full max-w-shell items-center gap-3 px-6">
        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Open navigation"
          onClick={() => setDrawerOpen(true)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-text-2 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-1 md:hidden"
        >
          <Menu size={16} strokeWidth={1.5} />
        </button>

        {/* Logo + wordmark + version chip */}
        <Link
          to="/"
          aria-label="K3Blocks 首页"
          className="group flex items-center gap-2 hover:no-underline"
        >
          <img src="/logo.svg" alt="" width={20} height={20} className="block" />
          <span className="text-sm font-semibold text-text-1 transition-colors duration-150 ease-k3 group-hover:text-accent">
            K3Blocks
          </span>
          <span className="hidden rounded-md border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] leading-none text-text-3 sm:inline-flex">
            v{VERSION}
          </span>
        </Link>

        {/* Center-left nav */}
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex h-7 items-center rounded-lg px-2.5 text-sm transition-colors duration-150 ease-k3 hover:no-underline",
                  isActive
                    ? "bg-accent-soft text-text-1"
                    : "text-text-2 hover:bg-hover-overlay hover:text-text-1",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* ⌘K search pill */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="hidden h-7 items-center gap-2 rounded-lg border border-border bg-surface-1 px-2.5 font-mono text-[12px] text-text-3 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-2 sm:flex"
          >
            Search docs…
            <Kbd>⌘K</Kbd>
          </button>

          {/* GitHub */}
          <a
            href="https://github.com/thejoven/k3blocks"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-text-2 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-1 hover:no-underline"
          >
            <Github size={16} strokeWidth={1.5} />
          </a>

          {/* Theme toggle — icon rotates 200ms */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-text-2 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-1"
          >
            <span className="flex transition-transform duration-200 ease-k3" style={{ transform: theme === "dark" ? "rotate(0deg)" : "rotate(180deg)" }}>
              {theme === "dark" ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            className="fixed inset-0 z-[90] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
            <motion.div
              className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-border bg-surface-1"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="flex h-14 items-center justify-between border-b border-border px-4">
                <span className="text-sm font-semibold text-text-1">K3Blocks</span>
                <button
                  type="button"
                  aria-label="Close navigation"
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-text-2 hover:bg-hover-overlay hover:text-text-1"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>
              <nav className="flex flex-col gap-1 p-2">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setDrawerOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex h-9 items-center rounded-lg px-3 text-sm hover:no-underline",
                        isActive ? "bg-accent-soft text-text-1" : "text-text-2 hover:bg-hover-overlay",
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    onOpenSearch();
                  }}
                  className="mt-1 flex h-9 items-center justify-between rounded-lg px-3 text-sm text-text-2 hover:bg-hover-overlay"
                >
                  Search docs…
                  <Kbd>⌘K</Kbd>
                </button>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
