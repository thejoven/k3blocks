/**
 * /docs/reference/events — 事件系统：onChange / onSelectionChange 订阅与退订、
 * 触发时机表、React useEffect 订阅范式 + 防抖持久化示例；live 事件日志 demo。
 */
import { useEffect, useRef, useState } from "react";
import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import Kbd from "@/components/Kbd";
import DocsShell from "@/components/docs/DocsShell";
import {
  CardStrip,
  DemoFrame,
  DocLink,
  DocTable,
  H2,
  InlineCode,

  P,
} from "@/components/docs/primitives";
import { txt } from "@/components/docs/utils";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";

const DEMO_DOC: Block[] = [
  {
    id: "ev1",
    type: "paragraph",
    props: {},
    content: [txt("打字、拆块、撤销、拖选 —— 每一个动作都会在下方日志留下一条事件。")],
    children: [],
  },
  { id: "ev2", type: "paragraph", props: {}, content: [], children: [] },
];

function EventsDemo() {
  const editor = useK3Editor({ initialContent: DEMO_DOC });
  const [logs, setLogs] = useState<string[]>([]);
  const seq = useRef(0);

  useEffect(() => {
    const push = (line: string) => {
      seq.current += 1;
      setLogs((prev) => [`#${seq.current} ${line}`, ...prev].slice(0, 8));
    };
    const offChange = editor.onChange((e) => push(`onChange → blocks: ${e.document.length}`));
    const offSel = editor.onSelectionChange((sel) =>
      push(sel ? `onSelectionChange → [${sel.blockIds.join(", ")}]` : "onSelectionChange → null"),
    );
    return () => {
      offChange();
      offSel();
    };
  }, [editor]);

  return (
    <DemoFrame className="mt-4" bodyClassName="p-0">
      <div className="px-4 py-5 sm:px-6">
        <K3EditorView editor={editor} placeholder="输入 '/' 查看命令" />
      </div>
      <div className="border-t border-border bg-surface-inset px-4 py-3 font-mono text-[12px] leading-relaxed">
        <div className="text-text-4">{"// 事件日志（最近 8 条，退订后停止）"}</div>
        {logs.length === 0 ? (
          <div className="mt-1 text-text-3">还没有事件。</div>
        ) : (
          logs.map((l, i) => (
            <div key={i} className={i === 0 ? "mt-1 text-text-1" : "mt-1 text-text-3"}>
              {l}
            </div>
          ))
        )}
      </div>
    </DemoFrame>
  );
}

const SUBSCRIBE_SNIPPET = `// 两个订阅方法的签名对称：传回调，返回退订函数
const offChange = editor.onChange((e) => {
  console.log("document", e.document);
});
const offSel = editor.onSelectionChange((sel) => {
  console.log("selection", sel?.blockIds ?? null);
});

offChange(); // 退订；组件卸载时务必调用（或交给 useEffect cleanup）
offSel();`;

const EFFECT_SNIPPET = `// React 中的标准订阅范式：useEffect + cleanup
function useEditorEvents(editor: K3Editor) {
  useEffect(() => {
    return editor.onChange((e) => {
      setDoc(e.document);
      setCanUndo(e.canUndo);
    });
  }, [editor]); // editor 引用稳定，依赖数组是形式性的
}`;

const DEBOUNCE_SNIPPET = `// 防抖持久化：输入期每次变更都触发 onChange，
// 落盘 / 上报请合并到一个窗口里。
const save = debounce((doc: Block[]) => {
  localStorage.setItem("doc", JSON.stringify(doc));
  // 或 await api.save(doc)
}, 500);

const editor = useK3Editor({
  onChange: (e) => save(e.document), // option 回调与实例订阅等价
});`;

export default function RefEvents() {
  return (
    <DocsShell
      crumbs={["Docs", "Editor reference", "Events"]}
      title="Events."
      lead="两个订阅口：onChange 报文档变更，onSelectionChange 报选区覆盖块。都返回退订函数 —— React 里交给 useEffect cleanup。"
      wide
    >
      <H2 id="demo">事件日志。</H2>
      <P>
        这个面板同时订阅了两个事件 —— 打字、<Kbd>Enter</Kbd> 拆块、⌘Z
        撤销、点击与拖选，各触发什么一目了然：
      </P>
      <EventsDemo />

      <H2 id="timing">触发时机。</H2>
      <DocTable
        columns={["动作", "onChange", "onSelectionChange"]}
        rows={[
          ["文本输入（含输入法 composition 提交）", "每次变更触发", "光标移动时连带触发（去重后）"],
          ["块操作（拆块 / 合并 / 插入 / 删除 / 拖拽 / 转换）", "每次操作触发", "光标落点变化时触发"],
          ["行内格式（⌘B / 工具栏 / 颜色）", "触发", "不单独触发"],
          ["实例方法（insertBlocks / updateBlock / removeBlocks / insertHTML / insertMarkdown）", "每次调用触发", "不单独触发"],
          ["undo / redo", "触发（历史回放即变更）", "光标恢复时触发"],
          ["纯光标移动 / 拖选（文档未变）", "不触发", "触发；选区移出或清空时回调 null"],
        ]}
      />
      <P>
        两个共性：<strong>去重</strong>（选区快照与上一帧相同则不重复触发）与
        <strong>同步派发</strong>（回调在变更完成的同一帧内调用，不经过 React 渲染周期）。
      </P>

      <H2 id="subscribe">订阅与退订。</H2>
      <CodeBlock className="mt-4" code={SUBSCRIBE_SNIPPET} language="ts" />
      <P>
        <InlineCode>useK3Editor</InlineCode> 选项里的{" "}
        <InlineCode>onChange</InlineCode> 回调与实例订阅完全等价 ——
        前者适合「这个编辑器只有一个消费者」，实例订阅适合多点订阅（如日志面板 +
        持久化并存）。
      </P>

      <H2 id="react">React 订阅范式。</H2>
      <CodeBlock className="mt-4" code={EFFECT_SNIPPET} language="tsx" />
      <Callout className="mt-4">
        不要把 <InlineCode>editor.document</InlineCode> 直接当 React state 用 ——
        它是可变实例上的 getter。在 onChange 里重新读取并 setState（或只存一个递增
        版本号），渲染层才能感知变化。docs 站内的{" "}
        <InlineCode>useEditorVersion</InlineCode> 工具函数就是这个模式。
      </Callout>

      <H2 id="debounce">防抖持久化。</H2>
      <P>
        输入期 onChange 频率与按键同阶 —— 直接落盘或发请求会放大到不可接受。
        标准做法是把昂贵操作包进防抖窗口：
      </P>
      <CodeBlock className="mt-4" code={DEBOUNCE_SNIPPET} language="tsx" />
      <P>
        完整的协作式同步思路（快照 + 版本号）见{" "}
        <DocLink to="/docs/reference/yjs-utilities">Yjs utilities</DocLink>。
      </P>

      <H2 id="next">接下来。</H2>
      <CardStrip
        cards={[
          { to: "/docs/reference/cursor-selections", title: "Cursor & selections", description: "选区快照的模型与跨块语义。" },
          { to: "/docs/reference/manipulating-content", title: "Manipulating content", description: "会触发 onChange 的全部实例方法。" },
          { to: "/docs/reference/overview", title: "Reference overview", description: "实例方法全景分组表。" },
        ]}
      />
    </DocsShell>
  );
}
