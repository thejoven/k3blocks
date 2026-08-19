/**
 * alert-block — 基础自定义 alert 块：props.variant (info/success/warning/error)
 * + props.text，由 blockRenderers 渲染（左 2px 色变条 + 图标 + 文本）。
 * 斜杠菜单无法插入 schema 外的块，用外置按钮 insertBlocks 插入。
 */
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block, K3Editor } from "@/k3blocks";
import { Info, CircleCheck, TriangleAlert, CircleX } from "lucide-react";
import { GhostButton, PanelLabel } from "./shared";

type AlertVariant = "info" | "success" | "warning" | "error";

const VARIANTS: Record<
  AlertVariant,
  { color: string; icon: typeof Info; label: string }
> = {
  info: { color: "#388aff", icon: Info, label: "Info" },
  success: { color: "#2f9e44", icon: CircleCheck, label: "Success" },
  warning: { color: "#e8590c", icon: TriangleAlert, label: "Warning" },
  error: { color: "#e03131", icon: CircleX, label: "Error" },
};

/** 自定义 alert 块渲染器：左 2px 色变条 + 图标 + 文本 */
function renderAlert(block: Block) {
  const variant = (block.props.variant as AlertVariant) ?? "info";
  const v = VARIANTS[variant] ?? VARIANTS.info;
  const Icon = v.icon;
  return (
    <div
      className="flex items-start gap-2.5 rounded-lg border border-border bg-surface-1 px-3 py-2.5"
      style={{ borderLeft: `2px solid ${v.color}` }}
    >
      <Icon size={15} strokeWidth={1.75} style={{ color: v.color, marginTop: 3, flexShrink: 0 }} />
      <p className="text-[14px] leading-[1.65] text-text-2">{String(block.props.text ?? "")}</p>
    </div>
  );
}

function alertDoc(): Block[] {
  return [
    {
      id: "al-1",
      type: "paragraph",
      props: {},
      content: [
        { type: "text" as const, text: "下面是四个自定义 " },
        { type: "text" as const, text: "alert", styles: { code: true } },
        { type: "text" as const, text: " 块——schema 里没有它，渲染交给 blockRenderers。" },
      ],
      children: [],
    },
    { id: "al-2", type: "alert", props: { variant: "info", text: "Info：版本 v4 已发布，含 mentions 与 PDF 块。" }, content: [], children: [] },
    { id: "al-3", type: "alert", props: { variant: "success", text: "Success：文档已保存，JSON 无损。" }, content: [], children: [] },
    { id: "al-4", type: "alert", props: { variant: "warning", text: "Warning：该 API 将在下个主版本移除。" }, content: [], children: [] },
    { id: "al-5", type: "alert", props: { variant: "error", text: "Error：渲染失败时编辑器不会崩溃。" }, content: [], children: [] },
    { id: "al-6", type: "paragraph", props: {}, content: [], children: [] },
  ];
}

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useK3Editor, K3EditorView } from "@thejoven_com/k3blocks";
import type { Block } from "@thejoven_com/k3blocks";

// 自定义 alert 块渲染器：左 2px 色变条 + 图标 + 文本
function renderAlert(block: Block) {
  const v = VARIANTS[block.props.variant] ?? VARIANTS.info;
  return (
    <div style={{ borderLeft: \`2px solid \${v.color}\` }}>
      <v.icon /> {block.props.text}
    </div>
  );
}

export default function App() {
  const editor = useK3Editor({ initialContent: doc });
  return (
    <>
      {/* 斜杠菜单不认识自定义 type——用外置按钮 insertBlocks 插入 */}
      <button onClick={() =>
        editor.insertBlocks([{ type: "alert", props: { variant: "info", text: "新的提醒" } }])
      }>
        插入 alert
      </button>
      <K3EditorView editor={editor} blockRenderers={{ alert: renderAlert }} />
    </>
  );
}`,
  },
];

export default function AlertBlock({ theme }: { theme?: "light" | "dark" }) {
  const editor: K3Editor = useK3Editor({ initialContent: alertDoc() });

  const insertAlert = (variant: AlertVariant) => {
    const refId = editor.getSelection()?.blockIds[0] ?? null;
    editor.insertBlocks(
      [{ type: "alert", props: { variant, text: `${VARIANTS[variant].label}：通过 insertBlocks 插入的新块。` } }],
      refId,
      "after",
    );
  };

  return (
    <div>
      <div className="flex h-11 flex-wrap items-center gap-2 border-b border-border px-4">
        <PanelLabel>INSERT — 斜杠菜单外</PanelLabel>
        <div className="ml-auto flex items-center gap-2">
          {(Object.keys(VARIANTS) as AlertVariant[]).map((k) => (
            <GhostButton key={k} onClick={() => insertAlert(k)}>
              {VARIANTS[k].label}
            </GhostButton>
          ))}
        </div>
      </div>
      <div className="px-6 py-10 md:px-10">
        <K3EditorView editor={editor} theme={theme} blockRenderers={{ alert: renderAlert }} />
      </div>
      <p className="border-t border-border px-6 py-3 font-mono text-[12px] leading-[1.7] text-text-4 md:px-10">
        斜杠菜单只列白名单内的内置块；schema 外的 alert 块通过外置按钮 insertBlocks 插入，拖拽 / 删除 / 撤销照常生效。
      </p>
    </div>
  );
}
