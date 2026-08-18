import { Link } from "react-router";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { VERSION } from "@/lib/version";

const COLUMNS: { label: string; links: { label: string; to: string; external?: boolean }[] }[] = [
  {
    label: "文档",
    links: [
      { label: "介绍", to: "/docs" },
      { label: "快速上手", to: "/docs/getting-started" },
      { label: "API 参考", to: "/docs/api" },
    ],
  },
  {
    label: "资源",
    links: [
      { label: "块", to: "/blocks" },
      { label: "示例", to: "/examples" },
      { label: "Playground", to: "/playground" },
      { label: "更新日志", to: "/docs/getting-started" },
    ],
  },
  {
    label: "社区",
    links: [
      { label: "GitHub", to: "https://github.com/thejoven/k3blocks", external: true },
      { label: "Issues", to: "https://github.com/thejoven/k3blocks/issues", external: true },
      { label: "Discussions", to: "https://github.com/thejoven/k3blocks/discussions", external: true },
      { label: "X", to: "https://x.com/thejoven_com", external: true },
    ],
  },
  {
    label: "法律",
    links: [{ label: "MPL-2.0 License", to: "https://www.mozilla.org/MPL/2.0/", external: true }],
  },
];

/**
 * Shared footer (design.md §6.3): 1px top hairline, 4 columns with mono upper
 * labels, bottom row with logo + copyright + mono version + theme toggle.
 */
export default function Footer() {
  const { theme, toggleTheme } = useTheme();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-shell px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.label}>
              <div className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-text-4">
                {col.label}
              </div>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.to}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-text-2 transition-colors duration-150 ease-k3 hover:text-text-1 hover:no-underline"
                      >
                        {link.label}
                        <span className="text-xs text-text-3">↗</span>
                      </a>
                    ) : (
                      <Link
                        to={link.to}
                        className="text-sm text-text-2 transition-colors duration-150 ease-k3 hover:text-text-1 hover:no-underline"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex items-center gap-3 border-t border-border pt-6">
          <img src="/logo.svg" alt="" width={16} height={16} className="block" />
          <span className="text-sm text-text-3">© 2025 K3 Team</span>
          <span className="font-mono text-[12px] text-text-4">MPL-2.0 · v{VERSION}</span>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-text-2 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-1"
          >
            <span className="flex transition-transform duration-200 ease-k3" style={{ transform: theme === "dark" ? "rotate(0deg)" : "rotate(180deg)" }}>
              {theme === "dark" ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
