/**
 * multi-editor-setup — 同页三个独立编辑器：不同种子 / 主题 / placeholder，
 * 各自独立 undo 栈。每个实例一次 useK3Editor 调用。
 */
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";
import { PanelLabel } from "./shared";

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useK3Editor, K3EditorView } from "@thejoven_com/k3blocks";

// 每个编辑器 = 一次独立的 useK3Editor 调用：
// 文档模型、undo/redo 栈、选区互不共享
function NotesEditor() {
  const editor = useK3Editor({
    initialContent: notesDoc,
    placeholder: "随手记…",
  });
  return <K3EditorView editor={editor} />;
}

function SpecEditor() {
  const editor = useK3Editor({
    initialContent: specDoc,
    placeholder: "写规范…",
  });
  return <K3EditorView editor={editor} theme="light" />;
}

export default function App() {
  return (
    <>
      <NotesEditor />
      <SpecEditor />
    </>
  );
}`,
  },
];

function t(text: string) {
  return { type: "text" as const, text };
}

const SEEDS: { label: string; theme?: "light" | "dark"; placeholder: string; doc: () => Block[] }[] = [
  {
    label: "EDITOR A — 继承宿主主题",
    placeholder: "会议纪要：随手记…",
    doc: () => [
      { id: "ma-1", type: "heading", props: { level: 3 }, content: [t("周一例会")], children: [] },
      { id: "ma-2", type: "bulletListItem", props: {}, content: [t("编辑器 A 有独立 undo 栈")], children: [] },
    ],
  },
  {
    label: "EDITOR B — theme=light",
    theme: "light",
    placeholder: "写一条规范…",
    doc: () => [
      { id: "mb-1", type: "heading", props: { level: 3 }, content: [t("API 规范草案")], children: [] },
      { id: "mb-2", type: "checkListItem", props: { checked: false }, content: [t("在 B 里输入再 ⌘Z——不影响 A/C")], children: [] },
    ],
  },
  {
    label: "EDITOR C — theme=dark",
    theme: "dark",
    placeholder: "头脑风暴…",
    doc: () => [
      { id: "mc-1", type: "quote", props: {}, content: [t("三个实例，三份文档，三条历史。")], children: [] },
    ],
  },
];

/** 单个编辑器卡片：独立 useK3Editor 实例。 */
function EditorCard({
  label,
  placeholder,
  makeDoc,
  theme,
}: {
  label: string;
  placeholder: string;
  makeDoc: () => Block[];
  theme?: "light" | "dark";
}) {
  const editor = useK3Editor({ initialContent: makeDoc(), placeholder });
  return (
    <div className="rounded-lg border border-border bg-surface-1">
      <div className="flex h-8 items-center border-b border-border px-3">
        <PanelLabel>{label}</PanelLabel>
      </div>
      <div className="px-3 py-2">
        <K3EditorView editor={editor} theme={theme} placeholder={placeholder} />
      </div>
    </div>
  );
}

export default function MultiEditorSetup() {
  return (
    <div className="px-6 py-10 md:px-16">
      <div className="mb-6 flex items-center justify-between">
        <PanelLabel>MULTI-EDITOR — 3 instances</PanelLabel>
        <span className="font-mono text-[11px] text-text-4">每实例一次 useK3Editor</span>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {SEEDS.map((s) => (
          <EditorCard
            key={s.label}
            label={s.label}
            placeholder={s.placeholder}
            makeDoc={s.doc}
            theme={s.theme}
          />
        ))}
      </div>
      <p className="mt-6 font-mono text-[12px] leading-[1.7] text-text-4">
        三个编辑器各自持有文档模型与 undo/redo 栈——在 A 里 ⌘Z 不会动 B/C 的历史。
      </p>
    </div>
  );
}
