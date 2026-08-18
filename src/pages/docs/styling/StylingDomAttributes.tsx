/**
 * /docs/styling/dom-attributes — domAttributes prop：editor / block 两级属性注入
 * （data-testid、data-analytics 场景）、渲染结果 DOM 检视（live inspector）+ devtools 提示。
 */
import { useEffect, useRef, useState } from "react";
import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import DocsShell from "@/components/docs/DocsShell";
import {
  CardStrip,
  DemoFrame,
  DocTable,
  H2,
  InlineCode,
  MonoCell,
  P,
} from "@/components/docs/primitives";
import { txt, useEditorVersion } from "@/components/docs/utils";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";

const USAGE_SNIPPET = `<K3EditorView
  editor={editor}
  domAttributes={{
    editor: { "data-testid": "k3-editor" },   // 贴到组件根元素
    block: { "data-analytics": "block" },     // 贴到每个块行容器 .k3-block-row
  }}
/>`;

const E2E_SNIPPET = `// Playwright / Testing Library 的锚点从此稳定：
await page.getByTestId("k3-editor").locator('[data-analytics="block"]').first().click();

// 埋点侧：一次事件委托覆盖所有块行
document.querySelector(".k3-editor")?.addEventListener("click", (e) => {
  const row = (e.target as Element).closest('[data-analytics="block"]');
  if (row) track("block_click", { blockId: row.getAttribute("data-block-id") });
});`;

const DEMO_DOC: Block[] = [
  {
    id: "da1",
    type: "paragraph",
    props: {},
    content: [txt("这个编辑器的根元素带 data-testid，每一行块都带 data-analytics。")],
    children: [],
  },
  {
    id: "da2",
    type: "bulletListItem",
    props: {},
    content: [txt("下方检视面板是从真实 DOM 实时读出来的。")],
    children: [],
  },
];

/** 实时检视：从渲染出的 DOM 读回注入的属性。 */
function DomInspectorDemo() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [report, setReport] = useState<{ editorAttrs: string; blockCount: number; firstRow: string } | null>(null);
  const editor = useK3Editor({ initialContent: DEMO_DOC });
  const version = useEditorVersion(editor);

  useEffect(() => {
    const root = hostRef.current?.querySelector<HTMLElement>(".k3-editor");
    if (!root) return;
    const rows = root.querySelectorAll(".k3-block-row");
    const editorAttrs = Array.from(root.attributes)
      .filter((a) => a.name.startsWith("data-") || a.name === "class")
      .map((a) => `${a.name}="${a.value}"`)
      .join(" ");
    const first = rows[0];
    const firstRow = first
      ? Array.from(first.attributes)
          .filter((a) => a.name.startsWith("data-") || a.name === "class")
          .map((a) => `${a.name}="${a.value}"`)
          .join(" ")
      : "";
    setReport({ editorAttrs, blockCount: rows.length, firstRow });
  }, [version]);

  return (
    <DemoFrame className="mt-4" bodyClassName="p-0">
      <div ref={hostRef} className="px-4 py-5 sm:px-6">
        <K3EditorView
          editor={editor}
          placeholder="输入 '/' 查看命令"
          domAttributes={{
            editor: { "data-testid": "k3-editor" },
            block: { "data-analytics": "block" },
          }}
        />
      </div>
      <div className="border-t border-border bg-surface-inset px-4 py-3 font-mono text-[12px] leading-relaxed">
        <div className="text-text-4">{"// 实时读回的 DOM 属性"}</div>
        <div className="mt-1 text-text-2">
          <span className="text-accent">&lt;div</span>{" "}
          {report?.editorAttrs ?? "…"}
          <span className="text-accent">&gt;</span>
        </div>
        <div className="mt-1 text-text-2">
          <span className="text-accent">&lt;div</span>{" "}
          {report?.firstRow ?? "…"}
          <span className="text-accent">&gt;</span>
          <span className="text-text-4">{"  // 第一个块行"}</span>
        </div>
        <div className="mt-1 text-text-3">
          .k3-block-row × {report?.blockCount ?? 0}（每行都带 data-analytics=&quot;block&quot;）
        </div>
      </div>
    </DemoFrame>
  );
}

export default function StylingDomAttributes() {
  return (
    <DocsShell
      crumbs={["Docs", "Styling", "DOM attributes"]}
      title="DOM attributes."
      lead="domAttributes prop 把自定义属性注入两级 DOM：editor 键贴到组件根元素，block 键贴到每个块行容器 —— 测试锚点与埋点从此不依赖脆弱的类名选择器。"
    >
      <H2 id="usage">用法。</H2>
      <P>
        <InlineCode>domAttributes</InlineCode> 接受{" "}
        <InlineCode>{`{ editor?: Record<string, string>; block?: Record<string, string> }`}</InlineCode>
        。键值原样写入 DOM 属性 —— 按惯例使用 <InlineCode>data-*</InlineCode>：
      </P>
      <CodeBlock className="mt-4" code={USAGE_SNIPPET} language="tsx" />
      <DocTable
        columns={["键", "注入目标", "典型场景"]}
        rows={[
          [
            <MonoCell key="k" accent>editor</MonoCell>,
            "组件根元素 .k3-editor",
            "data-testid（E2E 锚点）、data-tenant、data-doc-id 等实例级标记",
          ],
          [
            <MonoCell key="k" accent>block</MonoCell>,
            "每个块行容器 .k3-block-row（含嵌套块）",
            "data-analytics 埋点、按行定位的测试选择器",
          ],
        ]}
      />

      <H2 id="demo">在线检视。</H2>
      <P>
        下面的编辑器注入了上述属性，底部面板是从<strong>真实渲染出的 DOM</strong>{" "}
        实时读回的属性列表 —— 新增一个块，.k3-block-row 计数会跟着变：
      </P>
      <DomInspectorDemo />
      <Callout className="mt-4" title="DevTools 提示">
        也可以在浏览器 DevTools 里直接验证：选中编辑器根元素看{" "}
        <InlineCode>data-testid</InlineCode>；任意块行元素上既有注入的{" "}
        <InlineCode>data-analytics</InlineCode>，也有组件自带的{" "}
        <InlineCode>data-block-id</InlineCode>（块 id 的稳定锚点，无需注入即存在）。
      </Callout>

      <H2 id="scenarios">两个典型场景。</H2>
      <CodeBlock className="mt-4" code={E2E_SNIPPET} language="ts" />
      <P>
        注意 <InlineCode>data-block-id</InlineCode> 与{" "}
        <InlineCode>data-analytics</InlineCode> 的组合：前者标识「哪个块」，后者标识
        「这是一个块行」—— 选择器互不依赖组件内部类名，样式重构不会打碎测试。
      </P>

      <H2 id="next">接下来。</H2>
      <CardStrip
        cards={[
          { to: "/docs/styling/overriding-css", title: "Overriding CSS", description: "类名钩子与变量覆盖的另一条路。" },
          { to: "/docs/styling/themes", title: "Themes", description: "CSS 变量全表与主题模式。" },
          { to: "/docs/api", title: "API reference", description: "domAttributes prop 的表格速查。" },
        ]}
      />
    </DocsShell>
  );
}
