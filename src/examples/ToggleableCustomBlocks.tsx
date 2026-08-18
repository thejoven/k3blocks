/**
 * toggleable-custom-blocks — 自定义 toggle 块：chevron 按钮展开 / 收起
 * （props.expanded 经 updateBlock 写回），展开区显示 props.text。
 * 对应 Notion 的 toggle 块（Notion 用 children 嵌套子块，这里简化为 text）。
 */
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block, K3Editor } from "@/k3blocks";
import { ChevronRight } from "lucide-react";
import { GhostButton, PanelLabel } from "./shared";

/** toggle 渲染器：chevron 旋转表示展开态，内容区随 props.expanded 显隐 */
function renderToggle(block: Block, editor: K3Editor) {
  const expanded = block.props.expanded !== false;
  return (
    <div className="rounded-lg border border-border bg-surface-1">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() =>
          editor.updateBlock(block.id, { props: { ...block.props, expanded: !expanded } })
        }
        className="flex w-full items-center gap-1.5 px-2.5 py-2 text-left text-[14px] font-medium text-text-1 transition-colors duration-150 ease-k3 hover:bg-hover-overlay"
      >
        <ChevronRight
          size={14}
          strokeWidth={1.75}
          className="shrink-0 text-text-3 transition-transform duration-150 ease-k3"
          style={{ transform: expanded ? "rotate(90deg)" : "none" }}
        />
        {String(block.props.title ?? "Toggle")}
      </button>
      {expanded ? (
        <p className="border-t border-border px-3 py-2 pl-[30px] text-[14px] leading-[1.65] text-text-2">
          {String(block.props.text ?? "")}
        </p>
      ) : null}
    </div>
  );
}

function toggleDoc(): Block[] {
  return [
    {
      id: "tg-1",
      type: "paragraph",
      props: {},
      content: [
        { type: "text" as const, text: "点击 chevron 或标题行展开 / 收起——状态存在 " },
        { type: "text" as const, text: "props.expanded", styles: { code: true } },
        { type: "text" as const, text: " 里，可撤销。" },
      ],
      children: [],
    },
    {
      id: "tg-2",
      type: "toggle",
      props: { title: "v4 更新了哪些能力？", text: "mentions（@ 提及）、文字颜色 / 高亮、PDF 块、blockConfig 默认块配置，四件一起发布。", expanded: true },
      content: [],
      children: [],
    },
    {
      id: "tg-3",
      type: "toggle",
      props: { title: "为什么 toggle 不进内置 schema？", text: "内置 schema 保持最小集；垂直需求用 blockRenderers 自行扩展，渲染与交互完全由宿主控制。", expanded: false },
      content: [],
      children: [],
    },
    {
      id: "tg-4",
      type: "paragraph",
      props: {},
      content: [],
      children: [],
    },
  ];
}

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useK3Editor, K3EditorView } from "@k3/blocks";
import type { Block, K3Editor } from "@k3/blocks";
import { ChevronRight } from "lucide-react";

// toggle 渲染器：chevron 展开 / 收起，状态写回 props.expanded
function renderToggle(block: Block, editor: K3Editor) {
  const expanded = block.props.expanded !== false;
  return (
    <div>
      <button
        aria-expanded={expanded}
        onClick={() =>
          editor.updateBlock(block.id, { props: { ...block.props, expanded: !expanded } })
        }
      >
        <ChevronRight style={{ transform: expanded ? "rotate(90deg)" : "none" }} />
        {block.props.title}
      </button>
      {expanded ? <p>{block.props.text}</p> : null}
    </div>
  );
}

export default function App() {
  const editor = useK3Editor({ initialContent: doc });
  return <K3EditorView editor={editor} blockRenderers={{ toggle: renderToggle }} />;
}`,
  },
];

export default function ToggleableCustomBlocks({ theme }: { theme?: "light" | "dark" }) {
  const editor = useK3Editor({ initialContent: toggleDoc() });

  const insertToggle = () => {
    const refId = editor.getSelection()?.blockIds[0] ?? null;
    editor.insertBlocks(
      [{ type: "toggle", props: { title: "新的 toggle", text: "展开区内容。", expanded: true } }],
      refId,
      "after",
    );
  };

  return (
    <div>
      <div className="flex h-11 items-center border-b border-border px-4">
        <PanelLabel>EDITOR — Toggle 块</PanelLabel>
        <div className="ml-auto">
          <GhostButton onClick={insertToggle}>插入 toggle</GhostButton>
        </div>
      </div>
      <div className="px-6 py-10 md:px-10">
        <K3EditorView editor={editor} theme={theme} blockRenderers={{ toggle: renderToggle }} />
      </div>
      <p className="border-t border-border px-6 py-3 font-mono text-[12px] leading-[1.7] text-text-4 md:px-10">
        对应 Notion 的 toggle 块。Notion 用 children 嵌套任意子块；此示例简化为 props.text——
        展开状态、标题与内容都是普通 props，随文档 JSON 持久化，撤销 / 重做天然生效。
      </p>
    </div>
  );
}
