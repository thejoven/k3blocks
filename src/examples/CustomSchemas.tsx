/**
 * custom-schemas — K3Blocks 的 schema 定制三件套组合演示：
 * 1) blockTypes 白名单收窄内置块；2) blockRenderers 注册一个 schema 外自定义块；
 * 3) dictionary 精简/改写文案。三者叠加 = 一个"迷你自定义 schema"编辑器。
 */
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";
import { PanelLabel } from "./shared";

/** 种子文档：白名单内的 paragraph/heading + 一个自定义 `note` 块 */
function miniSchemaDoc(): Block[] {
  return [
    {
      id: "cs-1",
      type: "heading",
      props: { level: 2 },
      content: [{ type: "text" as const, text: "迷你 Schema 编辑器" }],
      children: [],
    },
    {
      id: "cs-2",
      type: "paragraph",
      props: {},
      content: [
        { type: "text" as const, text: "这个编辑器只有段落与标题两种内置块（输入 " },
        { type: "text" as const, text: "/", styles: { code: true } },
        { type: "text" as const, text: " 验证），外加一个自定义 note 块。试着拖拽、删除它。" },
      ],
      children: [],
    },
    {
      id: "cs-3",
      type: "note",
      props: { text: "我是 schema 之外的自定义块：由 blockRenderers.note 渲染，结构与历史仍由编辑器管理。" },
      content: [],
      children: [],
    },
    {
      id: "cs-4",
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

export default function App() {
  const editor = useK3Editor({
    initialContent: doc,
    // 1) 白名单：斜杠菜单 / 转换为 / Markdown 规则只剩段落与标题
    blockTypes: ["paragraph", "heading"],
    // 3) 精简字典：覆盖 placeholder 与斜杠菜单空态
    dictionary: {
      placeholder: "只能写段落和标题…",
      slashMenu: { empty: "迷你 schema 里没有这个块" },
    },
  });

  return (
    <K3EditorView
      editor={editor}
      // 2) 渲染口：注册 schema 外的自定义 note 块
      blockRenderers={{
        note: (block) => (
          <aside className="note-block">{block.props.text}</aside>
        ),
      }}
    />
  );
}`,
  },
];

export default function CustomSchemas({ theme }: { theme?: "light" | "dark" }) {
  const editor = useK3Editor({
    initialContent: miniSchemaDoc(),
    blockTypes: ["paragraph", "heading"],
    dictionary: {
      placeholder: "只能写段落和标题…",
      slashMenu: { empty: "迷你 schema 里没有这个块" },
    },
  });

  return (
    <div className="grid md:grid-cols-[minmax(0,1fr)_340px]">
      <div className="px-6 py-10 md:px-10">
        <div className="mb-6">
          <PanelLabel>EDITOR — 迷你自定义 schema</PanelLabel>
        </div>
        <K3EditorView
          editor={editor}
          theme={theme}
          blockRenderers={{
            note: (block) => (
              <aside className="rounded-lg border border-border bg-surface-1 px-3 py-2 text-[14px] leading-[1.65] text-text-2">
                <span className="mr-2 font-mono text-[11px] uppercase tracking-[0.08em] text-accent">
                  note
                </span>
                {String(block.props.text ?? "")}
              </aside>
            ),
          }}
        />
      </div>
      <div className="border-t border-border md:border-l md:border-t-0">
        <div className="flex h-9 items-center border-b border-border px-4">
          <PanelLabel>SCHEMA 定制三件套</PanelLabel>
        </div>
        <ul className="flex flex-col gap-4 p-4">
          <li>
            <p className="mb-1 font-mono text-[12px] text-text-2">1 · blockTypes</p>
            <p className="font-mono text-[12px] leading-[1.7] text-text-4">
              白名单收窄内置块：斜杠菜单、「转换为」、Markdown 行首规则同步生效。
            </p>
          </li>
          <li>
            <p className="mb-1 font-mono text-[12px] text-text-2">2 · blockRenderers</p>
            <p className="font-mono text-[12px] leading-[1.7] text-text-4">
              注册 schema 外的自定义块渲染器；自定义 type 不受白名单降级影响，始终放行。
            </p>
          </li>
          <li>
            <p className="mb-1 font-mono text-[12px] text-text-2">3 · dictionary</p>
            <p className="font-mono text-[12px] leading-[1.7] text-text-4">
              深合并覆盖 placeholder、斜杠菜单等全部文案，与 zhCN 合并，未覆盖键沿用默认。
            </p>
          </li>
        </ul>
      </div>
    </div>
  );
}
