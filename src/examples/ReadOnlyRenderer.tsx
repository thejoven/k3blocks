/**
 * read-only-renderer — editable={false} 把 K3Blocks 当渲染器用。
 * 左栏可编辑（数据源），右栏只读实时渲染同一份文档。
 */
import { useEffect } from "react";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import { replaceDocument, sampleDocument } from "@/lib/sampleDoc";
import { PanelLabel } from "./shared";

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useK3Editor, K3EditorView } from "@thejoven_com/k3blocks";

export default function App() {
  // 数据源：可编辑
  const source = useK3Editor({ initialContent: doc });
  // 渲染器：只读，跟随数据源
  const renderer = useK3Editor({ initialContent: doc, editable: false });

  source.onChange((e) => {
    renderer.removeBlocks(renderer.document.map((b) => b.id));
    renderer.insertBlocks(e.document);
  });

  return (
    <div className="grid grid-cols-2">
      <K3EditorView editor={source} />
      <K3EditorView editor={renderer} editable={false} />
    </div>
  );
}`,
  },
];

function ReadOnlyPane({ theme }: { theme?: "light" | "dark" }) {
  const source = useK3Editor({ initialContent: sampleDocument().slice(0, 7) });
  const renderer = useK3Editor({
    initialContent: sampleDocument().slice(0, 7),
    editable: false,
  });

  // 数据源每次变更 → 同步整包到只读渲染器
  useEffect(
    () =>
      source.onChange((e) => {
        replaceDocument(renderer, e.document);
      }),
    [source, renderer],
  );

  return (
    <div className="grid md:grid-cols-2">
      <div className="px-6 py-10 md:px-8">
        <div className="mb-6">
          <PanelLabel>EDITABLE — source</PanelLabel>
        </div>
        <K3EditorView editor={source} theme={theme} />
      </div>
      <div className="border-t border-border px-6 py-10 md:border-l md:border-t-0 md:px-8">
        <div className="mb-6">
          <PanelLabel>READ-ONLY — renderer</PanelLabel>
        </div>
        <K3EditorView editor={renderer} editable={false} theme={theme} />
      </div>
    </div>
  );
}

export default function ReadOnlyRenderer({ theme }: { theme?: "light" | "dark" }) {
  return <ReadOnlyPane theme={theme} />;
}
