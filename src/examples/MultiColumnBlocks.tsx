/**
 * multi-column-blocks — columnList 分栏块：种子文档含一个 2 栏 columnList
 * （左栏段落 + 清单，右栏引用）；斜杠菜单 Media 组「分栏 / Columns」可插入新分栏。
 */
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";
import { PanelLabel } from "./shared";

function t(text: string) {
  return { type: "text" as const, text };
}

/** 代表性种子：一个 2 栏 columnList（左栏段落+待办，右栏引用）。 */
export function columnsDocument(): Block[] {
  return [
    {
      id: "col-h",
      type: "heading",
      props: { level: 2 },
      content: [t("发布计划")],
      children: [],
    },
    {
      id: "col-list",
      type: "columnList",
      props: {},
      content: [],
      children: [
        {
          id: "col-a",
          type: "column",
          props: {},
          content: [],
          children: [
            {
              id: "col-a1",
              type: "paragraph",
              props: {},
              content: [t("左栏是常规块：段落、清单、标题都可以放进来，正常编辑与撤销。")],
              children: [],
            },
            {
              id: "col-a2",
              type: "checkListItem",
              props: { checked: true },
              content: [t("栏内 Markdown 规则照常工作")],
              children: [],
            },
            {
              id: "col-a3",
              type: "checkListItem",
              props: { checked: false },
              content: [t("试试在左栏输入 - 加空格")],
              children: [],
            },
          ],
        },
        {
          id: "col-b",
          type: "column",
          props: {},
          content: [],
          children: [
            {
              id: "col-b1",
              type: "quote",
              props: {},
              content: [t("右栏一句引用——栏间距 24px，栏间 1px 发丝分隔线。")],
              children: [],
            },
          ],
        },
      ],
    },
    {
      id: "col-tail",
      type: "paragraph",
      props: {},
      content: [t("插入新分栏：在空行输入 /，选择 Media 组的「分栏」。")],
      children: [],
    },
  ];
}

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useK3Editor, K3EditorView } from "@k3/blocks";

// columnList 的 children 只能是 column；column 的 children 是任意常规块
const doc = [
  {
    id: "cols",
    type: "columnList",
    props: {},
    content: [],
    children: [
      { id: "a", type: "column", props: {}, content: [], children: [
        { id: "a1", type: "paragraph", props: {}, content: [{ type: "text", text: "左栏" }], children: [] },
      ]},
      { id: "b", type: "column", props: {}, content: [], children: [
        { id: "b1", type: "quote", props: {}, content: [{ type: "text", text: "右栏" }], children: [] },
      ]},
    ],
  },
];

export default function App() {
  const editor = useK3Editor({ initialContent: doc });
  return <K3EditorView editor={editor} />;
}`,
  },
];

export default function MultiColumnBlocks({ theme }: { theme?: "light" | "dark" }) {
  const editor = useK3Editor({ initialContent: columnsDocument() });
  return (
    <div className="px-6 py-10 md:px-16">
      <div className="mb-6 flex items-center justify-between">
        <PanelLabel>EDITOR — columnList</PanelLabel>
        <span className="font-mono text-[11px] text-text-4">斜杠菜单 → Media → 分栏</span>
      </div>
      <K3EditorView editor={editor} theme={theme} />
      <p className="mt-6 font-mono text-[12px] leading-[1.7] text-text-4">
        已知限制：栏内不能再嵌套分栏；拖拽排序不支持跨栏移动；窄屏（&lt;768px）退化为单列堆叠。
      </p>
    </div>
  );
}
