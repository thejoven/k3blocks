/**
 * /docs/features/embeds — image 块与 embed 块：URL 占位输入、
 * YouTube/Vimeo/B 站识别、sandbox 策略、X-Frame-Options 空白说明；live demo。
 */
import Callout from "@/components/Callout";
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
import type { Block } from "@/k3blocks";

/* ------------------------------- live demo ------------------------------- */

const DEMO_DOC: Block[] = [
  {
    id: "em1",
    type: "image",
    props: { src: "/logo.svg", caption: "image 块：src 已填入", alt: "K3Blocks logo" },
    content: [],
    children: [],
  },
  {
    id: "em2",
    type: "embed",
    props: { url: "" },
    content: [],
    children: [],
  },
  { id: "em3", type: "paragraph", props: {}, content: [], children: [] },
];

/* ---------------------------------- 页面 ---------------------------------- */

export default function Embeds() {
  return (
    <DocsShell
      crumbs={["Docs", "Features", "Embeds"]}
      title="Embeds."
      lead="image 块嵌入图片 URL，embed 块以 16:9 iframe 嵌入任意网页——YouTube、Vimeo 与 B 站链接自动转为嵌入地址。"
    >
      <H2 id="url-placeholder">URL 占位输入。</H2>
      <P>
        两种块共享同一模式：<InlineCode>props.src</InlineCode> /{" "}
        <InlineCode>props.url</InlineCode> 为空串时显示占位输入框，粘贴 URL 回车即嵌入；
        已有地址时可通过「编辑链接」回到输入态。image 块额外支持{" "}
        <InlineCode>caption</InlineCode> 与 <InlineCode>alt</InlineCode>。
      </P>

      <H2 id="demo">在线体验。</H2>
      <P>下面的 image 块已填入示例地址；embed 块留空——粘贴一个视频页 URL 试试识别。</P>
      <LiveDemo
        className="mt-4"
        seed={DEMO_DOC}
        hints={[
          { text: "embed 占位框中粘贴 URL 并回车嵌入" },
          { text: "「编辑链接」回到输入态" },
        ]}
      />

      <H2 id="providers">链接识别。</H2>
      <P>embed 块自动识别以下站点并转换为嵌入地址，其余 URL 原样加载：</P>
      <DocTable
        columns={["站点", "匹配", "转换为"]}
        rows={[
          ["YouTube", <MonoCell>youtube.com/watch?v= · youtu.be</MonoCell>, <MonoCell>youtube.com/embed/…</MonoCell>],
          ["Vimeo", <MonoCell>vimeo.com/…</MonoCell>, <MonoCell>player.vimeo.com/video/…</MonoCell>],
          ["B 站", <MonoCell>bilibili.com/video/BV…</MonoCell>, <MonoCell>player.bilibili.com/player.html?bvid=…</MonoCell>],
        ]}
      />

      <H2 id="sandbox">sandbox 策略。</H2>
      <P>
        iframe 固定带{" "}
        <InlineCode>sandbox="allow-scripts allow-same-origin allow-presentation"</InlineCode>{" "}
        与 <InlineCode>loading="lazy"</InlineCode>：允许脚本与同源（播放器需要），
        但不放行弹窗、表单提交与顶层跳转；懒加载避免首屏被嵌入页拖慢。
        预览下方常驻 mono 域名标签。
      </P>
      <Callout className="mt-4" title="iframe 空白？">
        目标站点可通过 <InlineCode>X-Frame-Options</InlineCode> 或 CSP{" "}
        <InlineCode>frame-ancestors</InlineCode> 拒绝被嵌入——此时 iframe 空白属预期行为，
        不是组件故障。embed 块不支持 oEmbed 自动展开。
      </Callout>

      <CardStrip
        className="mt-14"
        cards={[
          { to: "/blocks/image", title: "Image block", description: "图片块专页：props 与上传区交互。" },
          { to: "/docs/features/diagrams", title: "Diagrams", description: "Mermaid 图表块：源码与渲染双态。" },
        ]}
      />
    </DocsShell>
  );
}
