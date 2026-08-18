/**
 * /docs/reference/yjs-utilities — 诚实说明页：K3Blocks 当前不包含 Yjs 实时协作。
 * 解释自研 contenteditable 架构的集成成本，给出当下替代路径（JSON 快照 + onChange
 * 同步 + 乐观锁/版本号）与 roadmap 表态。不含虚构代码。
 */
import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import DocsShell from "@/components/docs/DocsShell";
import {
  CardStrip,

  DocTable,
  H2,
  InlineCode,
  MonoCell,
  P,
} from "@/components/docs/primitives";

const SNAPSHOT_SNIPPET = `// 当下可用的「弱协作」：整文档快照同步。
// 发送端 —— onChange 输出快照（建议防抖，见 Events 一章）：
const editor = useK3Editor({
  onChange: (e) => {
    channel.send({
      docId,
      version: nextVersion(),     // 单调递增版本号
      document: e.document,       // 完整 Block[] 快照
    });
  },
});

// 接收端 —— 版本号做乐观锁：旧快照直接丢弃；
// 新快照经 key 重挂载灌回（key 必须打在调用 useK3Editor 的
// 组件上 —— 实例由 hook 内的 ref 持有，重挂载视图本身无效）。
function RemoteEditor({ docId }: { docId: string }) {
  const [snap, setSnap] = useState(loadLocal(docId));
  useEffect(() => channel.subscribe(docId, (msg) => {
    setSnap((prev) => (msg.version > prev.version ? msg : prev));
  }), [docId]);
  return <SyncedEditor key={\`\${docId}:\${snap.version}\`} doc={snap.document} />;
}

function SyncedEditor({ doc }: { doc: Block[] }) {
  const editor = useK3Editor({ initialContent: doc });
  return <K3EditorView editor={editor} />;
}`;

export default function RefYjs() {
  return (
    <DocsShell
      crumbs={["Docs", "Editor reference", "Yjs utilities"]}
      title="Yjs utilities."
      lead="直说：K3Blocks 当前版本不包含 Yjs（或任何 CRDT）实时协作能力。本页解释原因，并给出今天就能用的替代同步路径。"
    >
      <H2 id="status">现状。</H2>
      <DocTable
        columns={["能力", "状态", "说明"]}
        rows={[
          [
            <MonoCell key="c" accent>Yjs / CRDT 绑定</MonoCell>,
            "未提供",
            "包内没有 yjs 依赖，没有 awareness，没有共享文档类型 —— 任何「useK3Yjs…」式 API 都不存在",
          ],
          [
            <MonoCell key="c" accent>协同光标 / 在线状态</MonoCell>,
            "未提供",
            "选区模型（K3Selection）只覆盖本地编辑器",
          ],
          [
            <MonoCell key="c" accent>快照级同步</MonoCell>,
            "可行（见下文）",
            "onChange + document 提供完整的出向数据通路",
          ],
        ]}
      />

      <H2 id="why">为什么没有。</H2>
      <P>
        K3Blocks 的编辑层是<strong>自研 contenteditable 架构</strong>，不是
        ProseMirror / TipTap 系。Yjs 绑定（如 y-prosemirror 之于 TipTap）依赖编辑器
        把每一次输入表达为可对齐的操作序列（transaction / step）；而 contenteditable
        的输入是浏览器自由发挥的 DOM 突变 —— 输入法 composition、粘贴、execCommand
        产生的 DOM 变更必须先被规范化回文档模型，才能谈得上与远端状态做 CRDT 合并。
        把这套「DOM → 操作序列」的桥做正确，工作量与风险接近重写编辑内核，而不是加一个插件。
        与其提供一个半成品协作层，我们选择先诚实地标注边界。
      </P>

      <H2 id="alternative">当下的替代路径。</H2>
      <P>
        对「多人异步编辑同一文档 + 偶尔在线」的场景，整文档快照同步已经够用。
        所有原料都是真实存在的 API：<InlineCode>onChange</InlineCode> 出快照、
        <InlineCode>document</InlineCode> 读快照、<InlineCode>initialContent</InlineCode>{" "}
        + <InlineCode>key</InlineCode> 重挂载灌回快照、单调递增版本号做乐观锁：
      </P>
      <CodeBlock className="mt-4" code={SNAPSHOT_SNIPPET} language="tsx" />
      <Callout className="mt-4" title="适用边界">
        快照同步是「最后写入胜出」：两人同时在线编辑同一段落时后到的快照覆盖先到的。
        版本号只能防止旧数据覆盖新数据，不能合并两份并发编辑。需要真正的并发合并，
        请等待协作能力的正式版本，或在应用层按块自行实现合并策略。
      </Callout>

      <H2 id="roadmap">Roadmap 表态。</H2>
      <P>
        实时协作在路线图上，但前提是编辑内核先长出规范的操作层（让每次变更可序列化、
        可重放、可合并）。在那之前，本页描述的快照路径是官方支持的集成方式；我们不会
        发布一个名义上支持 Yjs、实则丢失输入法语义的绑定。关注仓库的 Changelog
        获取进展。
      </P>

      <H2 id="next">接下来。</H2>
      <CardStrip
        cards={[
          { to: "/docs/reference/events", title: "Events", description: "快照发送端的 onChange 订阅与防抖持久化。" },
          { to: "/docs/react/overview", title: "React overview", description: "initialContent + key 重挂载的受控模式详解。" },
          { to: "/docs/reference/overview", title: "Reference overview", description: "实例方法全景 —— 快照路径用到的 API 都在这里。" },
        ]}
      />
    </DocsShell>
  );
}
