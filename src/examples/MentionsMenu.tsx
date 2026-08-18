/**
 * mentions-menu — mentions 配置演示：文本内输入 @ 弹建议菜单，插入原子 mention chip。
 * 种子段落含已插入的 mention；右侧面板列出候选 items。
 */
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block, K3MentionItem } from "@/k3blocks";
import { PanelLabel } from "./shared";

const MENTION_ITEMS: K3MentionItem[] = [
  { id: "u1", label: "张三", subtext: "zhangsan@k3.io" },
  { id: "u2", label: "李四", subtext: "lisi@k3.io" },
  { id: "u3", label: "Ada", subtext: "ada@k3.io" },
  { id: "u4", label: "Grace", subtext: "grace@k3.io" },
  { id: "u5", label: "Linus", subtext: "linus@k3.io" },
];

function mentionsDoc(): Block[] {
  return [
    {
      id: "mn-1",
      type: "heading",
      props: { level: 2 },
      content: [{ type: "text" as const, text: "评审通知" }],
      children: [],
    },
    {
      id: "mn-2",
      type: "paragraph",
      props: {},
      content: [
        { type: "text" as const, text: "请 " },
        { type: "mention" as const, props: { id: "u1", label: "张三" } },
        { type: "text" as const, text: " 和 " },
        { type: "mention" as const, props: { id: "u3", label: "Ada" } },
        { type: "text" as const, text: " 在周五前完成代码评审。" },
      ],
      children: [],
    },
    {
      id: "mn-3",
      type: "paragraph",
      props: {},
      content: [
        { type: "text" as const, text: "在这一行输入 @ 试试（输入 zhang 或 ada 可模糊过滤）。" },
      ],
      children: [],
    },
    {
      id: "mn-4",
      type: "paragraph",
      props: {},
      content: [
        { type: "text" as const, text: "邮箱免疫：写 zhangsan@k3.io 不会弹菜单——@ 前必须是行首 / 空白 / 标点。" },
      ],
      children: [],
    },
  ];
}

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useK3Editor, K3EditorView } from "@k3/blocks";

const editor = useK3Editor({
  initialContent: doc, // 种子段落里已含 { type: "mention", props: { id, label } }
  mentions: {
    items: [
      { id: "u1", label: "张三", subtext: "zhangsan@k3.io" },
      { id: "u2", label: "李四", subtext: "lisi@k3.io" },
      { id: "u3", label: "Ada", subtext: "ada@k3.io" },
      { id: "u4", label: "Grace", subtext: "grace@k3.io" },
    ],
    trigger: "@", // 默认值，可自定义
  },
});

export default function App() {
  return <K3EditorView editor={editor} />;
}`,
  },
];

export default function MentionsMenu({ theme }: { theme?: "light" | "dark" }) {
  const editor = useK3Editor({
    initialContent: mentionsDoc(),
    mentions: { items: MENTION_ITEMS, trigger: "@" },
  });

  return (
    <div className="grid md:grid-cols-[minmax(0,1fr)_340px]">
      <div className="px-6 py-10 md:px-10">
        <div className="mb-6">
          <PanelLabel>EDITOR — 输入 @ 提及成员</PanelLabel>
        </div>
        <K3EditorView editor={editor} theme={theme} />
      </div>
      <div className="border-t border-border md:border-l md:border-t-0">
        <div className="flex h-9 items-center border-b border-border px-4">
          <PanelLabel>MENTION ITEMS</PanelLabel>
        </div>
        <ul className="p-4">
          {MENTION_ITEMS.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between border-b border-border py-2 font-mono text-[12px] last:border-b-0"
            >
              <span className="text-text-2">@{m.label}</span>
              <span className="text-text-4">{m.subtext}</span>
            </li>
          ))}
        </ul>
        <ul className="flex flex-col gap-2 border-t border-border p-4 font-mono text-[12px] leading-[1.7] text-text-4">
          <li>· @ 触发建议菜单：↑↓ 选择、↵ 插入、esc 关闭。</li>
          <li>· chip 是原子节点：Backspace 整体删除，不可局部编辑。</li>
          <li>· 撤销 / 重做 / onChange / Markdown 导出（@label）天然生效。</li>
        </ul>
      </div>
    </div>
  );
}
