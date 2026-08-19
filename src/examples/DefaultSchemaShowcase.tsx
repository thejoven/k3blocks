/**
 * default-schema-showcase — 内置块全览：paragraph / heading 1-3 / bullet /
 * numbered / check / quote / code / divider / image / columnList，
 * 每块前一个小 mono 标签，每块一个真实运行的小编辑器。
 */
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";
import { PanelLabel } from "./shared";

function t(text: string) {
  return { type: "text" as const, text };
}
function blk(id: string, type: string, text = "", props: Record<string, unknown> = {}): Block {
  return { id, type, props, content: text ? [t(text)] : [], children: [] };
}

const DEMOS: { label: string; block: () => Block }[] = [
  { label: "paragraph", block: () => blk("d-p", "paragraph", "普通段落——一切从这里开始。") },
  { label: "heading · level 1", block: () => blk("d-h1", "heading", "一级标题", { level: 1 }) },
  { label: "heading · level 2", block: () => blk("d-h2", "heading", "二级标题", { level: 2 }) },
  { label: "heading · level 3", block: () => blk("d-h3", "heading", "三级标题", { level: 3 }) },
  { label: "bulletListItem", block: () => blk("d-b", "bulletListItem", "无序列表项（Tab 缩进）") },
  { label: "numberedListItem", block: () => blk("d-n", "numberedListItem", "有序列表项") },
  { label: "checkListItem", block: () => blk("d-c", "checkListItem", "待办事项", { checked: true }) },
  { label: "quote", block: () => blk("d-q", "quote", "引用——Content is the interface.") },
  { label: "codeBlock", block: () => blk("d-code", "codeBlock", 'const editor = useK3Editor();', { language: "tsx" }) },
  { label: "divider", block: () => blk("d-d", "divider") },
  {
    label: "image",
    block: () => blk("d-i", "image", "", { src: "/logo.svg", alt: "K3Blocks logo", caption: "URL 嵌入的图片块" }),
  },
  {
    label: "columnList",
    block: () => ({
      id: "d-cl",
      type: "columnList",
      props: {},
      content: [],
      children: [
        {
          id: "d-cl-a",
          type: "column",
          props: {},
          content: [],
          children: [blk("d-cl-a1", "paragraph", "左栏")],
        },
        {
          id: "d-cl-b",
          type: "column",
          props: {},
          content: [],
          children: [blk("d-cl-b1", "paragraph", "右栏")],
        },
      ],
    }),
  },
];

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useK3Editor, K3EditorView } from "@thejoven_com/k3blocks";

// 内置 schema：9 种内容块 + columnList 分栏容器
const TYPES = [
  "paragraph", "heading", "bulletListItem", "numberedListItem",
  "checkListItem", "quote", "codeBlock", "divider", "image", "columnList",
];

function BlockDemo({ block }) {
  const editor = useK3Editor({ initialContent: [block] });
  return <K3EditorView editor={editor} />;
}

export default function App() {
  return TYPES.map((type) => <BlockDemo key={type} block={makeBlock(type)} />);
}`,
  },
];

/** 单块小编辑器：每块一个独立实例，互不影响。 */
function BlockDemo({ label, make, theme }: { label: string; make: () => Block; theme?: "light" | "dark" }) {
  const editor = useK3Editor({ initialContent: [make()] });
  return (
    <div className="rounded-lg border border-border bg-surface-1">
      <div className="flex h-8 items-center border-b border-border px-3">
        <PanelLabel>{label}</PanelLabel>
      </div>
      <div className="px-3 py-2">
        <K3EditorView editor={editor} theme={theme} />
      </div>
    </div>
  );
}

export default function DefaultSchemaShowcase({ theme }: { theme?: "light" | "dark" }) {
  return (
    <div className="px-6 py-10 md:px-16">
      <div className="mb-6 flex items-center justify-between">
        <PanelLabel>DEFAULT SCHEMA — 10 blocks</PanelLabel>
        <span className="font-mono text-[11px] text-text-4">每个磁贴都是可编辑的活实例</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {DEMOS.map((d) => (
          <BlockDemo key={d.label} label={d.label} make={d.block} theme={theme} />
        ))}
      </div>
    </div>
  );
}
