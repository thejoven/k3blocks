/**
 * removing-default-blocks — blockTypes 白名单：左全量 schema，右
 * blockTypes: ["paragraph","heading","image"]。右侧斜杠菜单只剩 4 项，
 * `-`+空格等 Markdown 行首规则同步失效。
 */
import { useK3Editor, K3EditorView } from "@/k3blocks";
import { helloDocument } from "@/lib/sampleDoc";
import { PanelLabel } from "./shared";

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useK3Editor, K3EditorView } from "@thejoven_com/k3blocks";

export default function App() {
  // 全量 schema
  const full = useK3Editor();
  // 白名单：只留段落 / 标题 / 图片
  const slim = useK3Editor({
    blockTypes: ["paragraph", "heading", "image"],
  });

  return (
    <div className="grid grid-cols-2">
      <K3EditorView editor={full} />
      <K3EditorView editor={slim} placeholder="输入 / —— 只剩 4 个命令" />
    </div>
  );
}

// 白名单效果：
// · 斜杠菜单与「转换为」只列出 whitelisted 类型
// · 被移除类型的 Markdown 行首规则失效（-、>、\`\`\` …）
// · insertBlocks 遇到非白名单 type 时递归降级为 paragraph`,
  },
];

export default function RemovingDefaultBlocks({ theme }: { theme?: "light" | "dark" }) {
  const full = useK3Editor({
    initialContent: helloDocument(),
    placeholder: "全量 schema——输入 / 查看全部命令",
  });
  const slim = useK3Editor({
    initialContent: helloDocument(),
    blockTypes: ["paragraph", "heading", "image"],
    placeholder: "白名单 schema——输入 / 只剩 4 项",
  });

  return (
    <div className="grid md:grid-cols-2">
      <div className="px-6 py-10 md:px-8">
        <div className="mb-6">
          <PanelLabel>FULL SCHEMA — 10 types</PanelLabel>
        </div>
        <K3EditorView editor={full} theme={theme} />
        <p className="mt-6 font-mono text-[12px] leading-[1.7] text-text-4">
          输入 / 可见全部命令；`-`+空格转无序列表、`&gt;`+空格转引用。
        </p>
      </div>
      <div className="border-t border-border px-6 py-10 md:border-l md:border-t-0 md:px-8">
        <div className="mb-6">
          <PanelLabel>blockTypes: paragraph · heading · image</PanelLabel>
        </div>
        <K3EditorView editor={slim} theme={theme} />
        <p className="mt-6 font-mono text-[12px] leading-[1.7] text-text-4">
          斜杠菜单只剩 段落 / 标题 1-3 / 图片；`-`+空格不再转列表。
        </p>
      </div>
    </div>
  );
}
