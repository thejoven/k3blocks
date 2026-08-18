import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";
import SectionLabel from "@/components/SectionLabel";
import CodeBlock from "@/components/CodeBlock";
import { cn } from "@/lib/utils";

type TabId = "quickstart" | "controlled" | "theming";

const TABS: { id: TabId; label: string; code: string }[] = [
  {
    id: "quickstart",
    label: "Quickstart",
    code: `import { useK3Editor, K3EditorView } from "@k3/blocks";
import "@k3/blocks/style.css";

export default function App() {
  const editor = useK3Editor();
  return <K3EditorView editor={editor} />;
}`,
  },
  {
    id: "controlled",
    label: "Controlled",
    code: `const editor = useK3Editor({
  initialContent,
  onChange: (e) => save(e.document), // e.document is Block[]
});

return <K3EditorView editor={editor} />;`,
  },
  {
    id: "theming",
    label: "Theming",
    code: `<K3EditorView editor={editor} theme="dark" />

/* Override any token — the editor inherits
   your host app's palette. */
:root {
  --k3-bg: #111111;
  --k3-accent: #388aff;
}`,
  },
];

const TAB_SEED: Record<TabId, Block[]> = {
  quickstart: [
    {
      id: "q1",
      type: "paragraph",
      props: {},
      content: [{ type: "text", text: "输入 '/' 查看命令，或直接开始写作…", styles: {} }],
      children: [],
    },
  ],
  controlled: [
    {
      id: "c1",
      type: "paragraph",
      props: {},
      content: [{ type: "text", text: "每一次输入都会同步到外层 state。", styles: {} }],
      children: [],
    },
  ],
  theming: [
    {
      id: "t1",
      type: "paragraph",
      props: {},
      content: [{ type: "text", text: "CSS 变量驱动，跟随宿主应用主题。", styles: {} }],
      children: [],
    },
  ],
};

/** Live mini editor for the active tab — real and typable. */
function MiniEditor({ tab }: { tab: TabId }) {
  const editor = useK3Editor({
    initialContent: TAB_SEED[tab],
    placeholder: "输入 '/' 查看命令",
  });
  return <K3EditorView editor={editor} theme="dark" slashMenu formattingToolbar sideMenu />;
}

/**
 * S4 Code ↔ Output split (home.md §S4): 50/50 panel, tabs on the left,
 * the actual rendered mini editor for the active tab on the right.
 */
export default function Quickstart() {
  const [tab, setTab] = useState<TabId>("quickstart");
  const active = TABS.find((t) => t.id === tab)!;

  return (
    <section className="mx-auto max-w-shell px-6">
      <SectionLabel>快速开始</SectionLabel>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.015em] text-text-1">
        五行代码，接入编辑器。
      </h2>

      <div className="mt-8 grid overflow-hidden rounded-xl border border-border bg-surface-1 md:grid-cols-2">
        {/* Left — code */}
        <div className="flex flex-col border-b border-border md:border-b-0 md:border-r">
          <div className="flex h-11 items-center border-b border-border px-3">
            <div className="flex h-7 items-center rounded-lg border border-border p-0.5">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex h-6 items-center rounded-md px-2.5 font-mono text-[12px] transition-colors duration-150 ease-k3",
                    tab === t.id
                      ? "border border-border bg-surface-2 text-text-1"
                      : "border border-transparent text-text-3 hover:text-text-2",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 p-3">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <CodeBlock code={active.code} language="tsx" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right — live output */}
        <div className="bg-surface-inset p-6 md:p-8">
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.08em] text-text-4">
            实时预览
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MiniEditor tab={tab} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
