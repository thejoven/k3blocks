/**
 * source-with-preview-blocks — 自定义 htmlPreview 块："源码 + 预览"模式。
 * 左：mono textarea 编辑 HTML 源码（updateBlock 实时回写 props.code）；
 * 右：sandboxed iframe（srcDoc）实时预览。
 */
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block, K3Editor } from "@/k3blocks";
import { GhostButton, PanelLabel } from "./shared";

const SAMPLE_HTML = `<style>
  body { font-family: system-ui; padding: 12px; color: #333; }
  .card { border: 1px solid #dbdbdb; border-radius: 8px; padding: 12px; }
  h3 { margin: 0 0 6px; } button { color: #388aff; }
</style>
<div class="card">
  <h3>Hello, preview.</h3>
  <p>改左边的源码，这里实时更新。</p>
  <button>一个按钮</button>
</div>`;

/** htmlPreview 渲染器：左源码 / 右预览，源码经 updateBlock 回写 props.code */
function renderHtmlPreview(block: Block, editor: K3Editor) {
  const code = String(block.props.code ?? "");
  return (
    <div className="grid overflow-hidden rounded-lg border border-border md:grid-cols-2">
      <div className="bg-surface-inset">
        <div className="flex h-7 items-center border-b border-border px-2.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-4">
            source
          </span>
        </div>
        <textarea
          value={code}
          onChange={(e) =>
            editor.updateBlock(block.id, { props: { ...block.props, code: e.target.value } })
          }
          spellCheck={false}
          className="h-[220px] w-full resize-y bg-transparent p-2.5 font-mono text-[12px] leading-[1.7] text-text-2 outline-none"
        />
      </div>
      <div className="border-t border-border md:border-l md:border-t-0">
        <div className="flex h-7 items-center border-b border-border px-2.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-4">
            preview
          </span>
        </div>
        <iframe
          title={`html-preview-${block.id}`}
          sandbox="allow-scripts"
          srcDoc={code}
          className="h-[220px] w-full bg-white"
        />
      </div>
    </div>
  );
}

function previewDoc(): Block[] {
  return [
    {
      id: "sp-1",
      type: "paragraph",
      props: {},
      content: [
        { type: "text" as const, text: "下面是一个自定义 " },
        { type: "text" as const, text: "htmlPreview", styles: { code: true } },
        { type: "text" as const, text: " 块：左边改 HTML 源码，右边 iframe 实时预览。" },
      ],
      children: [],
    },
    { id: "sp-2", type: "htmlPreview", props: { code: SAMPLE_HTML }, content: [], children: [] },
    { id: "sp-3", type: "paragraph", props: {}, content: [], children: [] },
  ];
}

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useK3Editor, K3EditorView } from "@k3/blocks";
import type { Block, K3Editor } from "@k3/blocks";

// "源码 + 预览"自定义块：textarea 编辑 props.code，iframe srcDoc 实时预览
function renderHtmlPreview(block: Block, editor: K3Editor) {
  const code = String(block.props.code ?? "");
  return (
    <div className="grid grid-cols-2">
      <textarea
        value={code}
        onChange={(e) =>
          editor.updateBlock(block.id, { props: { ...block.props, code: e.target.value } })
        }
      />
      {/* sandbox 不带 allow-same-origin：脚本无法触碰宿主页面 */}
      <iframe sandbox="allow-scripts" srcDoc={code} />
    </div>
  );
}

export default function App() {
  const editor = useK3Editor({ initialContent: doc });
  return (
    <K3EditorView editor={editor} blockRenderers={{ htmlPreview: renderHtmlPreview }} />
  );
}`,
  },
];

export default function SourceWithPreviewBlocks({ theme }: { theme?: "light" | "dark" }) {
  const editor = useK3Editor({ initialContent: previewDoc() });

  const insertPreview = () => {
    const refId = editor.getSelection()?.blockIds[0] ?? null;
    editor.insertBlocks(
      [{ type: "htmlPreview", props: { code: "<p style='font-family:system-ui'>New preview block.</p>" } }],
      refId,
      "after",
    );
  };

  return (
    <div>
      <div className="flex h-11 items-center border-b border-border px-4">
        <PanelLabel>EDITOR — 源码 + 预览块</PanelLabel>
        <div className="ml-auto">
          <GhostButton onClick={insertPreview}>插入 htmlPreview</GhostButton>
        </div>
      </div>
      <div className="px-6 py-10 md:px-10">
        <K3EditorView editor={editor} theme={theme} blockRenderers={{ htmlPreview: renderHtmlPreview }} />
      </div>
      <ul className="grid gap-2 border-t border-border px-6 py-4 font-mono text-[12px] leading-[1.7] text-text-4 md:grid-cols-2 md:px-10">
        <li>· 「源码 + 预览」模式：状态只有 props.code 一个字段，JSON 无损持久化。</li>
        <li>· textarea 受控于块 props——每次击键 updateBlock，预览同帧刷新，可撤销。</li>
        <li>· iframe sandbox="allow-scripts"（无 allow-same-origin）：脚本可运行但碰不到宿主。</li>
        <li>· 同模式可迁移到 Markdown / SVG / Chart.js 等任意"源码→渲染"自定义块。</li>
      </ul>
    </div>
  );
}
