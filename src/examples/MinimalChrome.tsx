/**
 * minimal-chrome — 关掉 slashMenu / sideMenu / formattingToolbar 后的纯净书写模式。
 */
import { useK3Editor, K3EditorView } from "@/k3blocks";
import { PanelLabel } from "./shared";

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useK3Editor, K3EditorView } from "@thejoven_com/k3blocks";

export default function App() {
  const editor = useK3Editor({ initialContent: doc });
  return (
    <K3EditorView
      editor={editor}
      slashMenu={false}           // 关闭 "/" 菜单
      formattingToolbar={false}   // 关闭选区悬浮工具栏
      sideMenu={false}            // 关闭悬停 “+” 与拖拽手柄
      placeholder="只写字。别的都没有。"
    />
  );
}`,
  },
];

export default function MinimalChrome({ theme }: { theme?: "light" | "dark" }) {
  const editor = useK3Editor({
    initialContent: [
      {
        id: "mc-1",
        type: "paragraph",
        props: {},
        content: [{ type: "text" as const, text: "没有菜单，没有工具栏，没有手柄。" }],
        children: [],
      },
      {
        id: "mc-2",
        type: "paragraph",
        props: {},
        content: [{ type: "text" as const, text: "只剩下你和文字。快捷键（⌘B / ⌘Z）依然可用。" }],
        children: [],
      },
      { id: "mc-3", type: "paragraph", props: {}, content: [], children: [] },
    ],
    placeholder: "只写字。别的都没有。",
  });

  return (
    <div className="px-6 py-12 md:px-16">
      <div className="mb-8">
        <PanelLabel>PROSE-ONLY — slashMenu / sideMenu / formattingToolbar 全部关闭</PanelLabel>
      </div>
      <div className="mx-auto max-w-prose">
        <K3EditorView
          editor={editor}
          theme={theme}
          slashMenu={false}
          formattingToolbar={false}
          sideMenu={false}
          placeholder="只写字。别的都没有。"
        />
      </div>
    </div>
  );
}
