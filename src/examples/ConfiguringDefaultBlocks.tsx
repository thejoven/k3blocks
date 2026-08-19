/**
 * configuring-default-blocks — blockConfig 前后对比：左侧默认编辑器，
 * 右侧 heading.levels: [1,2] + codeBlock.defaultLanguage: "ts"——
 * 斜杠菜单无 H3、###+空格 失效、新代码块默认 ts 标签。
 */
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block } from "@/k3blocks";
import { PanelLabel } from "./shared";

function configDoc(): Block[] {
  return [
    {
      id: "cfg-1",
      type: "paragraph",
      props: {},
      content: [
        { type: "text" as const, text: "输入 / 看斜杠菜单；在行首试 " },
        { type: "text" as const, text: "###", styles: { code: true } },
        { type: "text" as const, text: "+空格；再插一个代码块看语言标签。" },
      ],
      children: [],
    },
    { id: "cfg-2", type: "paragraph", props: {}, content: [], children: [] },
  ];
}

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useK3Editor, K3EditorView } from "@thejoven_com/k3blocks";

export default function App() {
  // 左：全部默认
  const left = useK3Editor({ initialContent: doc });
  // 右：只允许 H1/H2；新代码块默认 TypeScript
  const right = useK3Editor({
    initialContent: doc,
    blockConfig: {
      heading: { levels: [1, 2] },        // H3 菜单隐藏，###+空格 失效
      codeBlock: { defaultLanguage: "ts" }, // 新代码块初始语言与标签
    },
  });
  return (
    <div className="grid grid-cols-2">
      <K3EditorView editor={left} />
      <K3EditorView editor={right} />
    </div>
  );
}`,
  },
];

export default function ConfiguringDefaultBlocks({ theme }: { theme?: "light" | "dark" }) {
  const left = useK3Editor({ initialContent: configDoc() });
  const right = useK3Editor({
    initialContent: configDoc(),
    blockConfig: {
      heading: { levels: [1, 2] },
      codeBlock: { defaultLanguage: "ts" },
    },
  });

  return (
    <div>
      <div className="grid md:grid-cols-2">
        <div className="px-6 py-10 md:px-8">
          <div className="mb-6">
            <PanelLabel>DEFAULT — 未配置</PanelLabel>
          </div>
          <K3EditorView editor={left} theme={theme} />
        </div>
        <div className="border-t border-border px-6 py-10 md:border-l md:border-t-0 md:px-8">
          <div className="mb-6">
            <PanelLabel>CONFIGURED — levels [1,2] · lang ts</PanelLabel>
          </div>
          <K3EditorView editor={right} theme={theme} />
        </div>
      </div>
      <ul className="grid gap-2 border-t border-border px-6 py-4 font-mono text-[12px] leading-[1.7] text-text-4 md:grid-cols-3 md:px-10">
        <li>· 右侧斜杠菜单只有「标题 1 / 标题 2」，无 H3 项。</li>
        <li>· 右侧行首 ###+空格 不再转标题（# / ## 仍生效）。</li>
        <li>· 右侧新代码块默认 ts 标签；已有 H3 块不受影响，仅不再新增。</li>
      </ul>
    </div>
  );
}
