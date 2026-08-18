/**
 * /docs/react/file-panel — 文件面板与上传管道：uploadFile 签名与示例实现、
 * FileReader dataURL 回退、占位框「选择文件」、粘贴/拖拽图片管道；live demo。
 */
import { useState } from "react";
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
  SwitchRow,
} from "@/components/docs/primitives";
import { txt } from "@/components/docs/utils";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";

const UPLOAD_SNIPPET = `const editor = useK3Editor({
  // 接收本地 File，resolve 出可用 URL；reject 时占位框保持输入态
  uploadFile: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (!res.ok) throw new Error("upload failed");
    const { url } = await res.json();
    return url;
  },
});`;

const FALLBACK_SNIPPET = `// 未配置 uploadFile 时的回退：FileReader 读 dataURL，完全本地。
// 等价于组件内部做的事：
const url = await new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});`;

const DEMO_DOC: Block[] = [
  {
    id: "fp1",
    type: "paragraph",
    props: {},
    content: [txt("从系统剪贴板粘贴一张截图到这里 —— 会自动在下方插入 image 块。")],
    children: [],
  },
  { id: "fp2", type: "image", props: { src: "", caption: "", alt: "" }, content: [], children: [] },
];

/** 模拟 uploadFile：延迟 600ms 后回退为 dataURL（demo 无真实后端）。 */
const fakeUpload = async (file: File): Promise<string> => {
  await new Promise((r) => setTimeout(r, 600));
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("FileReader failed"));
    reader.readAsDataURL(file);
  });
};

function FilePanelDemo() {
  const [withUpload, setWithUpload] = useState(true);
  const editor = useK3Editor({
    initialContent: DEMO_DOC,
    uploadFile: withUpload ? fakeUpload : undefined,
  });
  return (
    <DemoFrame
      className="mt-4"
      bar={
        <>
          <SwitchRow label="uploadFile 管道" prop="uploadFile" checked={withUpload} onChange={setWithUpload} />
          <span className="font-mono text-[12px] text-text-4">
            {withUpload ? "模拟上传（600ms loading 态）" : "未配置 —— FileReader dataURL 回退"}
          </span>
        </>
      }
      bodyClassName="px-4 py-6 sm:px-6"
    >
      <K3EditorView editor={editor} placeholder="粘贴图片，或在下方占位框选择文件" />
    </DemoFrame>
  );
}

export default function UiFilePanel() {
  return (
    <DocsShell
      crumbs={["Docs", "React", "File panel"]}
      title="File panel."
      lead="image / pdf / embed 占位框内置「选择文件」按钮；所有本地文件都汇入同一条 uploadFile 管道，未配置时回退为 FileReader dataURL。"
    >
      <H2 id="upload-file">uploadFile 签名。</H2>
      <P>
        <InlineCode>uploadFile</InlineCode> 是 <InlineCode>useK3Editor</InlineCode>{" "}
        的选项：接收浏览器 <InlineCode>File</InlineCode>，返回{" "}
        <InlineCode>Promise&lt;string&gt;</InlineCode> —— resolve
        出来的字符串会被直接写入块的 URL prop（image 的 <InlineCode>src</InlineCode>、
        pdf / embed 的 <InlineCode>url</InlineCode>）。上传期间按钮变为 28px loading
        态（文案 <InlineCode>upload.uploading</InlineCode>）。
      </P>
      <CodeBlock className="mt-4" code={UPLOAD_SNIPPET} language="tsx" />

      <H2 id="fallback">缺省回退：FileReader dataURL。</H2>
      <P>
        不传 <InlineCode>uploadFile</InlineCode> 时组件内置回退：用{" "}
        <InlineCode>FileReader.readAsDataURL</InlineCode>{" "}
        把文件读成 base64 dataURL 写入块 —— 零配置即可在原型阶段工作，但 dataURL
        会让文档 JSON 急剧膨胀，生产环境应始终配置真实上传。
      </P>
      <CodeBlock className="mt-4" code={FALLBACK_SNIPPET} language="ts" />

      <H2 id="entry-points">三个入口，一条管道。</H2>
      <DocTable
        columns={["入口", "行为"]}
        rows={[
          [
            <MonoCell key="a" accent>占位框「选择文件」</MonoCell>,
            "image / pdf / embed 块的 URL 占位框带 28px ghost 按钮；选本地文件后走管道，URL 写回块 props",
          ],
          [
            <MonoCell key="a" accent>粘贴图片</MonoCell>,
            "剪贴板 clipboardData.files 中的 image/* 走管道，自动在当前块后插入 image 块；image 块占位框内也可直接粘贴",
          ],
          [
            <MonoCell key="a" accent>拖拽进编辑器</MonoCell>,
            "图片文件拖入编辑器同样走管道，在落点处插入 image 块",
          ],
        ]}
      />

      <H2 id="demo">在线体验。</H2>
      <P>
        下面种子里有一个空的 image 占位框 —— 点「选择文件」挑一张本地图；
        或者直接把截图 ⌘V 粘贴进段落。开关可以对照「有 uploadFile（带 loading
        态）」与「dataURL 回退」两种路径（demo 的上传是 600ms 模拟延迟）。
      </P>
      <FilePanelDemo />

      <Callout className="mt-6">
        管道只负责「File → URL」。文件类型校验、大小限制、进度条都不在组件职责内 ——
        在你的 <InlineCode>uploadFile</InlineCode> 实现里做。字典键：
        <MonoCell accent>upload.chooseFile</MonoCell>（选择文件）与{" "}
        <MonoCell accent>upload.uploading</MonoCell>（上传中…）。
      </Callout>

      <H2 id="next">接下来。</H2>
      <CardStrip
        cards={[
          { to: "/blocks/image", title: "Image block", description: "image 块的 props 与占位框行为。" },
          { to: "/docs/react/block-side-menu", title: "Block side menu", description: "用「+」在任意块后插入媒体块。" },
          { to: "/docs/api", title: "API reference", description: "uploadFile 选项的表格速查。" },
        ]}
      />
    </DocsShell>
  );
}
