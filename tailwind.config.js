/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // K3Blocks design tokens (design.md §2) — CSS-variable driven, html[data-theme] swap
        bg: "var(--bg)",
        "surface-1": "var(--surface-1)",
        "surface-2": "var(--surface-2)",
        "surface-inset": "var(--surface-inset)",
        border: "var(--border)",
        "text-1": "var(--text-1)",
        "text-2": "var(--text-2)",
        "text-3": "var(--text-3)",
        "text-4": "var(--text-4)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-soft": "var(--accent-soft)",
        "code-green": "var(--code-green)",
      },
      fontFamily: {
        sans: ['"Geist"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        kbd: ['11px', { lineHeight: '1' }],
        code: ['13px', { lineHeight: '1.7' }],
      },
      borderRadius: {
        xl: "24px",
        lg: "8px",
        md: "6px",
      },
      boxShadow: {
        kbd: "0 1px 0 var(--kbd-shadow)",
        popover: "var(--popover-shadow)",
      },
      transitionTimingFunction: {
        k3: "cubic-bezier(.4,0,.2,1)",
        pop: "cubic-bezier(0,1,.2,1.1)",
      },
      maxWidth: {
        shell: "1280px",
        prose: "800px",
      },
      keyframes: {
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
