/**
 * dark-and-light — theme prop + CSS 变量覆盖的双主题切换。
 * segmented: light | dark | custom（custom 用覆盖表把 accent 染成 #0047ff）。
 */
import { useState } from "react";
import type { CSSProperties } from "react";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import { sampleDocument } from "@/lib/sampleDoc";
import { cn } from "@/lib/utils";
import { PanelLabel } from "./shared";

const CUSTOM_CSS = `.brand-canvas {
  /* 只覆盖变量，不动组件 */
  --accent: #0047ff;
  --accent-hover: #3d6bff;
  --accent-soft: rgba(0, 71, 255, 0.12);
  --selection: rgba(0, 71, 255, 0.24);
}`;

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useState } from "react";
import { useK3Editor, K3EditorView } from "@k3/blocks";
import "./styles.css";

export default function App() {
  const [mode, setMode] = useState<"light" | "dark" | "custom">("dark");
  const editor = useK3Editor({ initialContent: doc });
  const theme = mode === "custom" ? "dark" : mode;

  return (
    <div className={mode === "custom" ? "brand-canvas" : undefined}>
      <K3EditorView editor={editor} theme={theme} />
    </div>
  );
}`,
  },
  { name: "styles.css", language: "css", code: CUSTOM_CSS },
];

type Mode = "light" | "dark" | "custom";

export default function DarkAndLight(_props: { theme?: "light" | "dark" }) {
  const [mode, setMode] = useState<Mode>("dark");
  const editor = useK3Editor({ initialContent: sampleDocument().slice(0, 8) });
  const theme = mode === "custom" ? "dark" : mode;

  return (
    <div className="px-6 py-10 md:px-16">
      <div className="mb-6 flex items-center justify-between">
        <PanelLabel>THEME</PanelLabel>
        <div className="flex h-7 items-center rounded-lg border border-border p-0.5">
          {(["light", "dark", "custom"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "flex h-6 items-center rounded-md px-2.5 font-mono text-[12px] transition-colors duration-150 ease-k3",
                mode === m
                  ? "border border-border bg-surface-2 text-text-1"
                  : "border border-transparent text-text-3 hover:text-text-2",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <div
        className={cn(
          "rounded-lg border border-border p-6 transition-colors duration-150 ease-k3",
          mode === "custom" && "brand-canvas",
        )}
        style={{
          backgroundColor: "var(--surface-inset)",
          ...(mode === "custom"
            ? ({
                "--accent": "#0047ff",
                "--accent-hover": "#3d6bff",
                "--accent-soft": "rgba(0, 71, 255, 0.12)",
                "--selection": "rgba(0, 71, 255, 0.24)",
              } as CSSProperties)
            : {}),
        }}
      >
        <K3EditorView editor={editor} theme={theme} />
      </div>
      {mode === "custom" && (
        <p className="mt-4 font-mono text-[12px] text-text-4">
          custom = data-theme="dark" + 覆盖 --accent → #0047ff（见 Code 面板的 styles.css）
        </p>
      )}
    </div>
  );
}
