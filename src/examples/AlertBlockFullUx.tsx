/**
 * alert-block-full-ux — 完整版自定义 alert 块：
 * variant segmented 控件（updateBlock 写回）、每 variant 配色 + 图标、
 * 文本 contenteditable 可编辑（失焦 updateBlock 回写）、全部控件 Tab 可达。
 */
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block, K3Editor } from "@/k3blocks";
import { Info, CircleCheck, TriangleAlert, CircleX } from "lucide-react";
import { GhostButton, PanelLabel } from "./shared";

type AlertVariant = "info" | "success" | "warning" | "error";

const VARIANTS: Record<AlertVariant, { color: string; soft: string; icon: typeof Info; label: string }> = {
  info: { color: "#388aff", soft: "rgba(56,138,255,0.10)", icon: Info, label: "Info" },
  success: { color: "#2f9e44", soft: "rgba(47,158,68,0.10)", icon: CircleCheck, label: "Success" },
  warning: { color: "#e8590c", soft: "rgba(232,89,12,0.10)", icon: TriangleAlert, label: "Warning" },
  error: { color: "#e03131", soft: "rgba(224,49,49,0.10)", icon: CircleX, label: "Error" },
};

/** 完整 UX 的 alert 渲染器：segmented 切换 + 图标 + 可编辑文本，全部经 updateBlock 回写 */
function renderAlertFull(block: Block, editor: K3Editor) {
  const variant = (block.props.variant as AlertVariant) ?? "info";
  const v = VARIANTS[variant] ?? VARIANTS.info;
  const Icon = v.icon;
  return (
    <div
      className="rounded-lg border border-border px-3 py-2.5"
      style={{ borderLeft: `2px solid ${v.color}`, backgroundColor: v.soft }}
    >
      <div className="mb-2 flex items-center gap-1" role="group" aria-label="Alert variant">
        {(Object.keys(VARIANTS) as AlertVariant[]).map((k) => {
          const active = k === variant;
          return (
            <button
              key={k}
              type="button"
              aria-pressed={active}
              onClick={() => editor.updateBlock(block.id, { props: { ...block.props, variant: k } })}
              className="h-6 rounded-md border px-2 font-mono text-[11px] transition-colors duration-150 ease-k3"
              style={{
                borderColor: active ? VARIANTS[k].color : "var(--border)",
                color: active ? VARIANTS[k].color : "var(--text-3)",
                backgroundColor: active ? VARIANTS[k].soft : "transparent",
              }}
            >
              {VARIANTS[k].label}
            </button>
          );
        })}
      </div>
      <div className="flex items-start gap-2.5">
        <Icon size={15} strokeWidth={1.75} style={{ color: v.color, marginTop: 3, flexShrink: 0 }} />
        <p
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) =>
            editor.updateBlock(block.id, {
              props: { ...block.props, text: e.currentTarget.textContent ?? "" },
            })
          }
          className="min-w-[4ch] flex-1 rounded text-[14px] leading-[1.65] text-text-1 outline-none focus-visible:bg-hover-overlay"
        >
          {String(block.props.text ?? "")}
        </p>
      </div>
    </div>
  );
}

function alertFullDoc(): Block[] {
  return [
    {
      id: "ax-1",
      type: "paragraph",
      props: {},
      content: [
        { type: "text" as const, text: "点 segmented 控件切换 variant，点文本直接改字——全部经 " },
        { type: "text" as const, text: "updateBlock", styles: { code: true } },
        { type: "text" as const, text: " 回写，可撤销。" },
      ],
      children: [],
    },
    { id: "ax-2", type: "alert", props: { variant: "info", text: "点击上方 Info / Success / Warning / Error 切换我的级别。" }, content: [], children: [] },
    { id: "ax-3", type: "alert", props: { variant: "warning", text: "这段文字可以直接编辑——点我，改字，失焦即保存。" }, content: [], children: [] },
    { id: "ax-4", type: "paragraph", props: {}, content: [], children: [] },
  ];
}

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useK3Editor, K3EditorView } from "@thejoven_com/k3blocks";
import type { Block, K3Editor } from "@thejoven_com/k3blocks";

// 完整 UX 的 alert 渲染器：segmented 切换 + 图标 + 可编辑文本
function renderAlert(block: Block, editor: K3Editor) {
  const v = VARIANTS[block.props.variant] ?? VARIANTS.info;
  return (
    <div style={{ borderLeft: \`2px solid \${v.color}\`, background: v.soft }}>
      {/* variant segmented 控件：aria-pressed + updateBlock 写回 */}
      {Object.keys(VARIANTS).map((k) => (
        <button
          key={k}
          aria-pressed={k === block.props.variant}
          onClick={() =>
            editor.updateBlock(block.id, { props: { ...block.props, variant: k } })
          }
        >
          {k}
        </button>
      ))}
      {/* 文本 contenteditable：失焦 updateBlock 回写（一条历史） */}
      <p
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) =>
          editor.updateBlock(block.id, {
            props: { ...block.props, text: e.currentTarget.textContent ?? "" },
          })
        }
      >
        {block.props.text}
      </p>
    </div>
  );
}

export default function App() {
  const editor = useK3Editor({ initialContent: doc });
  return <K3EditorView editor={editor} blockRenderers={{ alert: renderAlert }} />;
}`,
  },
];

export default function AlertBlockFullUx({ theme }: { theme?: "light" | "dark" }) {
  const editor = useK3Editor({ initialContent: alertFullDoc() });

  const insertAlert = () => {
    const refId = editor.getSelection()?.blockIds[0] ?? null;
    editor.insertBlocks(
      [{ type: "alert", props: { variant: "info", text: "新的 alert——点我的级别按钮和文本。" } }],
      refId,
      "after",
    );
  };

  return (
    <div>
      <div className="flex h-11 items-center border-b border-border px-4">
        <PanelLabel>EDITOR — 完整交互的自定义块</PanelLabel>
        <div className="ml-auto">
          <GhostButton onClick={insertAlert}>插入 alert</GhostButton>
        </div>
      </div>
      <div className="px-6 py-10 md:px-10">
        <K3EditorView editor={editor} theme={theme} blockRenderers={{ alert: renderAlertFull }} />
      </div>
      <ul className="grid gap-2 border-t border-border px-6 py-4 font-mono text-[12px] leading-[1.7] text-text-4 md:grid-cols-2 md:px-10">
        <li>· variant 切换：segmented 控件 + aria-pressed，updateBlock 写回 props.variant。</li>
        <li>· 每 variant 独立配色：info 蓝 / success 绿 / warning 橙 / error 红 + 同色图标。</li>
        <li>· 文本可编辑：contenteditable，失焦一次性 updateBlock 回写（一条撤销历史）。</li>
        <li>· 键盘可达：按钮与文本均可 Tab 聚焦，focus-visible 高亮；⌘Z 可撤销全部改动。</li>
      </ul>
    </div>
  );
}
