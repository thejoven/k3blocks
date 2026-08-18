/**
 * /docs/reference/manipulating-content — insertBlocks / updateBlock / removeBlocks /
 * insertHTML / insertMarkdown / document getter：参数表 + 按钮操作 live editor + 事件日志。
 */
import { useEffect, useRef, useState } from "react";
import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import DocsShell from "@/components/docs/DocsShell";
import {
  CardStrip,
  DemoFrame,
  DocLink,
  DocTable,
  H2,
  H3,
  InlineCode,
  MonoCell,
  P,
} from "@/components/docs/primitives";
import { txt } from "@/components/docs/utils";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";

const DEMO_DOC: Block[] = [
  { id: "mc1", type: "heading", props: { level: 2 }, content: [txt("操作台")], children: [] },
  {
    id: "mc2",
    type: "paragraph",
    props: {},
    content: [txt("用控制条上的按钮对我动手 —— 每次调用都会记一条日志。")],
    children: [],
  },
  {
    id: "mc3",
    type: "checkListItem",
    props: { checked: false },
    content: [txt("点「toggle 待办」翻转我的 checked。")],
    children: [],
  },
];

const logBtn =
  "flex h-7 items-center rounded-lg border border-border px-2.5 font-mono text-[12px] text-text-2 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-1";

function ManipulateDemo() {
  const editor = useK3Editor({ initialContent: DEMO_DOC });
  const [logs, setLogs] = useState<string[]>([]);
  const counter = useRef(0);

  useEffect(
    () =>
      editor.onChange((e) =>
        setLogs((prev) => [`onChange → blocks: ${e.document.length}`, ...prev].slice(0, 6)),
      ),
    [editor],
  );

  const log = (line: string) => setLogs((prev) => [line, ...prev].slice(0, 6));

  const insertAfter = () => {
    counter.current += 1;
    const [b] = editor.insertBlocks(
      [{ type: "paragraph", content: `插入的第 ${counter.current} 个段落` }],
      "mc2",
      "after",
    );
    log(`insertBlocks(…, "mc2", "after") → ${b.id}`);
  };

  const toggleTodo = () => {
    const blk = editor.getBlock("mc3");
    if (!blk) return log('getBlock("mc3") → undefined（已被删除）');
    editor.updateBlock("mc3", { props: { checked: !blk.props.checked } });
    log(`updateBlock("mc3", { props: { checked: ${!blk.props.checked} } })`);
  };

  const removeLast = () => {
    const doc = editor.document;
    const last = doc[doc.length - 1];
    if (!last) return log("removeBlocks —— 文档已空");
    editor.removeBlocks([last.id]);
    log(`removeBlocks(["${last.id}"])`);
  };

  const appendMarkdown = () => {
    editor.insertMarkdown(`- 由 **insertMarkdown** 追加的列表项\n- 第二项`);
    log('insertMarkdown("- 由 …")');
  };

  return (
    <DemoFrame
      className="mt-4"
      bar={
        <>
          <button type="button" className={logBtn} onClick={insertAfter}>insertBlocks</button>
          <button type="button" className={logBtn} onClick={toggleTodo}>updateBlock</button>
          <button type="button" className={logBtn} onClick={removeLast}>removeBlocks</button>
          <button type="button" className={logBtn} onClick={appendMarkdown}>insertMarkdown</button>
          <button type="button" className={logBtn} onClick={() => editor.undo()}>undo</button>
        </>
      }
      bodyClassName="p-0"
    >
      <div className="px-4 py-5 sm:px-6">
        <K3EditorView editor={editor} placeholder="输入 '/' 查看命令" />
      </div>
      <div className="border-t border-border bg-surface-inset px-4 py-3 font-mono text-[12px] leading-relaxed">
        <div className="text-text-4">{"// 事件日志（最近 6 条）"}</div>
        {logs.length === 0 ? (
          <div className="mt-1 text-text-3">还没有事件 —— 点上面的按钮，或直接在编辑器里打字。</div>
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

const INSERT_SNIPPET = `// 追加到文档末尾（refId 省略 / null）
const [b] = editor.insertBlocks([{ type: "heading", props: { level: 2 }, content: "新章节" }]);

// 插到参照块之前 / 之后 / 嵌套为其子块
editor.insertBlocks([{ type: "paragraph", content: "前面" }], "mc2", "before");
editor.insertBlocks([{ type: "paragraph", content: "后面" }], "mc2", "after");
editor.insertBlocks([{ type: "paragraph", content: "子块" }], "mc2", "nested");

// content 可以直接给字符串（等价于单个 text 节点），缺省字段自动补齐`;

const UPDATE_SNIPPET = `// 只传需要改的字段；type / props / content / children 都可更新
editor.updateBlock("mc3", { props: { checked: true } });
editor.updateBlock("mc2", { type: "quote" }); // 等效「转换为」`;

const REPLACE_SNIPPET = `// 没有 replaceDocument —— 整份替换 = 清空 + 插入：
const ids = editor.document.map((b) => b.id);
if (ids.length) editor.removeBlocks(ids);
editor.insertBlocks(newDoc); // 两步各入一条撤销历史`;

const IMPORT_SNIPPET = `editor.insertHTML("<h2>标题</h2><p>一段 <strong>HTML</strong></p>");
editor.insertMarkdown("## 标题\\n\\n一段 **Markdown**");
// 两者都解析后 append 到文档末尾；HTML 解析不执行任何脚本，
// 无法识别的结构一律降级为 paragraph。`;

export default function RefManipulatingContent() {
  return (
    <DocsShell
      crumbs={["Docs", "Editor reference", "Manipulating content"]}
      title="Manipulating content."
      lead="五个文档操作方法加一个 document getter —— 全部同步生效、自动入撤销栈、触发 onChange。本页每个方法配参数表与真实按钮。"
      wide
    >
      <H2 id="demo">操作台。</H2>
      <P>先玩后看：按钮直接调用 live editor 的实例方法，底部日志同步记录调用与 onChange。</P>
      <ManipulateDemo />

      <H2 id="document">document（getter）。</H2>
      <P>
        <InlineCode>editor.document</InlineCode> 返回当前完整{" "}
        <InlineCode>Block[]</InlineCode>。每次 onChange 后重新读取即是新快照 ——
        不要跨变更缓存它；把它当不可变数据对待，修改一律走下面的方法。
      </P>

      <H2 id="insert-blocks">insertBlocks。</H2>
      <P>
        <MonoCell>insertBlocks(blocks: PartialBlock[], refId?: string | null, placement?: Placement): Block[]</MonoCell>
      </P>
      <DocTable
        columns={["参数", "类型", "说明"]}
        rows={[
          [<MonoCell key="p" accent>blocks</MonoCell>, <MonoCell key="t">PartialBlock[]</MonoCell>, "部分块：id / type / props / children 缺省自动补齐；content 可给字符串"],
          [<MonoCell key="p" accent>refId</MonoCell>, <MonoCell key="t">string | null</MonoCell>, "参照块 id；省略或 null 时追加到文档末尾"],
          [<MonoCell key="p" accent>placement</MonoCell>, <MonoCell key="t">"before" | "after" | "nested"</MonoCell>, '相对参照块的位置，默认 "after"'],
          [<MonoCell key="p" accent>返回值</MonoCell>, <MonoCell key="t">Block[]</MonoCell>, "落库后的完整块（含生成的 id），可直接接 setTextCursor"],
        ]}
      />
      <CodeBlock className="mt-4" code={INSERT_SNIPPET} language="ts" />
      <Callout className="mt-4">
        设置了 <InlineCode>blockTypes</InlineCode> 白名单时，非白名单 type 递归降级为{" "}
        <InlineCode>paragraph</InlineCode>（保留 content 与允许的子块）。
      </Callout>

      <H2 id="update-block">updateBlock。</H2>
      <P>
        <MonoCell>updateBlock(id: string, partial: Partial&lt;Omit&lt;Block, "id" | "children"&gt;&gt; &amp; &#123; children?: Block[] &#125;): void</MonoCell>
      </P>
      <CodeBlock className="mt-4" code={UPDATE_SNIPPET} language="ts" />

      <H2 id="remove-blocks">removeBlocks。</H2>
      <P>
        <MonoCell>removeBlocks(ids: string[]): void</MonoCell> ——
        按 id 批量删除，子块一并删除。配合 <InlineCode>document</InlineCode> 可整份替换文档：
      </P>
      <CodeBlock className="mt-4" code={REPLACE_SNIPPET} language="ts" />

      <H2 id="import">insertHTML / insertMarkdown。</H2>
      <P>两个导入方法都是「解析 + append 到文档末尾」，参数只有一个字符串：</P>
      <CodeBlock className="mt-4" code={IMPORT_SNIPPET} language="ts" />
      <H3>解析能力速查</H3>
      <DocTable
        columns={["方法", "覆盖", "降级策略"]}
        rows={[
          [
            <MonoCell key="m" accent>insertHTML</MonoCell>,
            "h1-h6（钳到 1-3）/ p / ul·ol（含 task-list 与嵌套）/ blockquote / pre（language-x 识别语言）/ hr / img·figure / table / iframe→embed / 行内样式与颜色",
            "script/style/template 直接丢弃，不执行脚本；无法识别一律 paragraph",
          ],
          [
            <MonoCell key="m" accent>insertMarkdown</MonoCell>,
            "#~### 标题 / 三种列表 / > 引用 / ``` 围栏（mermaid→diagram）/ --- / $$ 公式 / 管道表格 / 整行图片 / 行内 ** * ` ~~ []()",
            "连续文本行合并为一个段落、空行分块",
          ],
        ]}
      />
      <P>
        导出方向的六个方法（blocksToMarkdown / blocksToHTML / …）见{" "}
        <DocLink to="/docs/reference/overview">Reference overview</DocLink> 的 Export 组与{" "}
        <DocLink to="/docs/api">API reference</DocLink>。
      </P>

      <H2 id="next">接下来。</H2>
      <CardStrip
        cards={[
          { to: "/docs/reference/cursor-selections", title: "Cursor & selections", description: "insertBlocks 返回值接 setTextCursor 的典型链路。" },
          { to: "/docs/reference/events", title: "Events", description: "这些方法如何触发 onChange。" },
          { to: "/docs/foundations/manipulating-blocks", title: "Manipulating blocks（指南）", description: "叙事式的块操作教程。" },
        ]}
      />
    </DocsShell>
  );
}
