/**
 * /docs/customization/source-with-preview-blocks —「源码 + 预览」自定义块模式教程：
 * HTML 源码 textarea ↔ sandbox iframe 实时预览，updateBlock 回写 props.code；
 * 讲解单向数据流与 iframe sandbox 安全边界，回链 /examples/source-with-preview-blocks。
 */
import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import DocsShell from "@/components/docs/DocsShell";
import LiveDemo from "@/components/docs/LiveDemo";
import {
  CardStrip,
  DocTable,
  H2,
  InlineCode,
  MonoCell,
  P,
} from "@/components/docs/primitives";
import { txt } from "@/components/docs/utils";
import type { Block, K3Editor } from "@/k3blocks";

/* --------------------------- htmlPreview 渲染器 --------------------------- */

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

/** htmlPreview 渲染器：左源码 textarea / 右 sandbox iframe，源码经 updateBlock 回写。 */
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

const SEED: Block[] = [
  {
    id: "swp1",
    type: "paragraph",
    props: {},
    content: [
      txt("下面是一个自定义 "),
      txt("htmlPreview", { code: true }),
      txt(" 块：左边改 HTML 源码，右边 iframe 同帧刷新。"),
    ],
    children: [],
  },
  { id: "swp2", type: "htmlPreview", props: { code: SAMPLE_HTML }, content: [], children: [] },
  { id: "swp3", type: "paragraph", props: {}, content: [], children: [] },
];

/* -------------------------------- 教程代码 -------------------------------- */

const STEP_RENDERER = `import type { Block, K3Editor } from "@k3/blocks";

// 1. 渲染器：左 textarea 编辑源码，右 iframe srcDoc 预览
function renderHtmlPreview(block: Block, editor: K3Editor) {
  const code = String(block.props.code ?? "");
  return (
    <div className="grid grid-cols-2">
      <textarea
        value={code}
        onChange={(e) =>
          editor.updateBlock(block.id, {
            props: { ...block.props, code: e.target.value },
          })
        }
      />
      {/* sandbox 不带 allow-same-origin：脚本可运行但碰不到宿主 */}
      <iframe sandbox="allow-scripts" srcDoc={code} />
    </div>
  );
}`;

const STEP_REGISTER = `// 2. 注册渲染口 + 种子块（数据全在 props.code，JSON 照常持久化）
const editor = useK3Editor({
  initialContent: [
    { id: "p1", type: "htmlPreview", props: { code: "<p>Hello.</p>" }, content: [], children: [] },
  ],
});

<K3EditorView editor={editor} blockRenderers={{ htmlPreview: renderHtmlPreview }} />`;

/* ---------------------------------- 页面 ---------------------------------- */

export default function SourceWithPreviewBlocks() {
  return (
    <DocsShell
      crumbs={["Docs", "Customization", "Source with preview blocks"]}
      title="Source with preview blocks."
      lead="「源码 + 预览」是自定义块的经典模式：块内一边放受控源码编辑器，一边放实时渲染结果——全部状态只有 props 里的一个字符串字段，updateBlock 是唯一写入口。"
    >
      <H2 id="demo">先看效果。</H2>
      <P>
        左侧 textarea 编辑 HTML 源码，每次击键经 <InlineCode>updateBlock</InlineCode>{" "}
        回写 <InlineCode>props.code</InlineCode>；右侧 sandboxed iframe 以{" "}
        <InlineCode>srcDoc</InlineCode> 同帧重渲染。切到 JSON 视图可看到源码就存在块里。
      </P>
      <LiveDemo
        className="mt-4"
        seed={SEED}
        blockRenderers={{ htmlPreview: renderHtmlPreview }}
        hints={[
          { text: "左侧改源码，右侧同帧刷新" },
          { keys: ["⌘", "Z"], text: "每次击键一条历史，可撤销" },
          { keys: ["⠿"], text: "拖拽、删除照常生效" },
        ]}
      />

      <H2 id="renderer">渲染器实现。</H2>
      <P>
        整个模式就是一个 <InlineCode>blockRenderers</InlineCode>{" "}
        函数：受控 textarea + sandbox iframe，没有内部 state。
      </P>
      <CodeBlock className="mt-3" code={STEP_RENDERER} language="tsx" />
      <CodeBlock className="mt-3" code={STEP_REGISTER} language="tsx" />

      <H2 id="data-flow">状态流：props.code 单向数据流。</H2>
      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface-1 p-4 font-mono text-[12px]">
        {["textarea onChange", "editor.updateBlock", "props.code", "iframe srcDoc"].map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            {i > 0 && <span className="text-text-4">→</span>}
            <span className="rounded-md border border-border bg-surface-inset px-2 py-1 text-text-1">
              {s}
            </span>
          </span>
        ))}
        <span className="w-full pt-1 text-text-4">{"// 渲染器不持有 state，props 是唯一事实源"}</span>
      </div>
      <DocTable
        columns={["环节", "规则", "换来的能力"]}
        rows={[
          [
            <MonoCell>存储</MonoCell>,
            "全部状态只有 props.code 一个字符串字段",
            "JSON 无损持久化，onChange 序列化即存档",
          ],
          [
            <MonoCell>写入</MonoCell>,
            "textarea 受控于 props，onChange 一律经 updateBlock 回写",
            "每次编辑进入历史栈：撤销 / 重做天然生效",
          ],
          [
            <MonoCell>读取</MonoCell>,
            "渲染器只读 block.props，不持有内部 state",
            "预览与数据同帧一致；外部 updateBlock（如协作方）也能驱动刷新",
          ],
        ]}
      />

      <H2 id="security">安全：sandbox 边界。</H2>
      <P>
        预览渲染的是用户输入的任意 HTML，必须关进 iframe 沙箱。本例的{" "}
        <InlineCode>sandbox="allow-scripts"</InlineCode> 是有意为之的最小授权：
      </P>
      <DocTable
        columns={["token", "是否授予", "原因"]}
        rows={[
          [
            <MonoCell>allow-scripts</MonoCell>,
            "授予",
            "允许预览里的脚本运行（按钮交互、动画）——这是「可运行预览」的价值。",
          ],
          [
            <MonoCell>allow-same-origin</MonoCell>,
            "不授予",
            "缺失时 iframe 源为 opaque origin：脚本碰不到宿主的 DOM、cookie 与 localStorage。",
          ],
          [
            <MonoCell>allow-top-navigation / allow-forms / allow-popups</MonoCell>,
            "不授予",
            "预览不能跳转宿主页面、不能提交表单、不能弹窗。",
          ],
        ]}
      />

      <Callout className="mt-6" title="不要同时给 allow-scripts + allow-same-origin">
        两个 token 同时存在时，iframe 内脚本可以移除自己的 sandbox 属性并逃逸——
        等同于没有沙箱。需要同源能力时（如读取宿主传递的模块），改用专用 CDN 域或
        postMessage 协议，而不是放开 <InlineCode>allow-same-origin</InlineCode>。
      </Callout>

      <P>
        同一模式可平移到任何「源码 → 渲染」自定义块：Markdown 预览、SVG 源码、
        Chart.js 配置——换掉右侧的渲染目标即可，状态流与安全边界原样复用。
      </P>

      <CardStrip
        className="mt-14"
        cards={[
          { to: "/examples/source-with-preview-blocks", title: "示例：Source with preview blocks", description: "含「插入 htmlPreview」按钮的完整可运行示例。" },
          { to: "/docs/features/custom-blocks", title: "Custom blocks", description: "blockRenderers 渲染口的四步接入与只读语义。" },
          { to: "/docs/api", title: "API reference", description: "updateBlock 与 blockRenderers 的完整签名。" },
        ]}
      />
    </DocsShell>
  );
}
