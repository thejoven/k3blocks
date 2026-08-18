import DocsShell from "@/components/docs/DocsShell";
import {
  CardStrip,
  DemoFrame,
  DocTable,
  H2,
  InlineCode,
  P,
  StatusChip,
} from "@/components/docs/primitives";
import { txt } from "@/components/docs/utils";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";

const PREVIEW_DOC: Block[] = [
  { id: "p1", type: "heading", props: { level: 2 }, content: [txt("五分钟预览")], children: [] },
  {
    id: "p2",
    type: "paragraph",
    props: {},
    content: [
      txt("输入 "),
      txt("/", { code: true }),
      txt(" 打开斜杠菜单，选中文字试试"),
      txt("格式化工具栏", { bold: true }),
      txt("，或者把这一行拖到最后。"),
    ],
    children: [],
  },
  {
    id: "p3",
    type: "checkListItem",
    props: { checked: true },
    content: [txt("块模型：文档即 JSON")],
    children: [],
  },
  {
    id: "p4",
    type: "checkListItem",
    props: { checked: false },
    content: [txt("勾掉我 —— 状态变化立刻写回 Block.props")],
    children: [],
  },
];

function PreviewDemo() {
  const editor = useK3Editor({ initialContent: PREVIEW_DOC });
  return (
    <DemoFrame className="mt-6" bodyClassName="px-4 py-4 sm:px-6">
      <K3EditorView editor={editor} placeholder="输入 '/' 查看命令" />
      <p className="mt-4 border-t border-border pt-3 font-mono text-[12px] text-text-4">
        这个页面上的每个 demo 都是真实运行的编辑器。
      </p>
    </DemoFrame>
  );
}

export default function DocsIntroduction() {
  return (
    <DocsShell
      crumbs={["Docs", "Introduction"]}
      title="K3Blocks."
      lead="一个 Notion 风格的 React 块编辑器组件。块为原子，JSON 为文档，设计为你。"
    >
      <H2 id="why">为什么是 K3Blocks？</H2>
      <P>
        富文本编辑器的大多数复杂度来自「HTML 即文档」的假设。K3Blocks 反过来：文档是一棵{" "}
        <InlineCode>Block[]</InlineCode> 树 —— 每个块有 id、type、props、content 与
        children，序列化成 JSON 就是无损的存储格式。React 只负责块级结构，块内文本由浏览器
        contenteditable 托管，光标因此不会随重渲染跳走。
      </P>
      <P>
        视觉上，K3Blocks 遵循 cladd.io 的设计语言：暗色优先的近黑表面、1px
        发丝线、唯一强调色、28px 控件刻度。编辑器的每一种颜色都来自 CSS
        变量，宿主的设计系统可以完全接管它，而不是覆盖一堆内联样式。
      </P>
      <P>
        实现上，K3Blocks 不绑定 tiptap 或任何重型编辑器内核：选区管理、跨块光标移动、中文输入法
        composition 处理都是自研的薄层。运行时依赖只有 React 与
        lucide-react，每一行都可以审计。
      </P>

      <H2 id="preview">五分钟预览。</H2>
      <P>不用安装任何东西 —— 这个编辑器就跑在当前页面里。</P>
      <PreviewDemo />

      <H2 id="features">能力一览。</H2>
      <DocTable
        columns={["能力", "状态", "说明"]}
        rows={[
          ["斜杠菜单", <StatusChip key="s" status="stable" />, "模糊搜索、分组、全键盘操作"],
          ["格式化工具栏", <StatusChip key="s" status="stable" />, "选区即现：粗体 / 斜体 / 下划线 / 删除线 / 行内代码 / 链接"],
          ["拖拽排序", <StatusChip key="s" status="stable" />, "悬停块左侧手柄，HTML5 拖拽"],
          ["Markdown 输入规则", <StatusChip key="s" status="stable" />, "行首 #、-、1.、[]、>、```、--- 即刻转换"],
          ["撤销 / 重做", <StatusChip key="s" status="stable" />, "自维护操作栈，⌘Z / ⌘⇧Z"],
          ["主题", <StatusChip key="s" status="stable" />, "light / dark，CSS 变量驱动，可继承宿主"],
          ["协同编辑", <StatusChip key="s" status="roadmap" />, "文档模型已按 CRDT 友好的形状设计"],
          ["表格块", <StatusChip key="s" status="roadmap" />, "规划中"],
        ]}
      />

      <H2 id="next">继续阅读。</H2>
      <CardStrip
        cards={[
          { to: "/docs/getting-started", title: "Quickstart", description: "五行代码接入你的 React 应用。" },
          { to: "/blocks", title: "Block types", description: "九种内置块，每页配可运行 demo。" },
          { to: "/docs/api", title: "API Reference", description: "useK3Editor、K3EditorView 与全部实例方法。" },
          { to: "/examples", title: "Examples", description: "受控、只读、JSON 往返、暗色主题等完整示例。" },
        ]}
      />
    </DocsShell>
  );
}
