/**
 * basic-setup — 五行代码的最小编辑器。
 */
import { useK3Editor, K3EditorView } from "@/k3blocks";
import { helloDocument } from "@/lib/sampleDoc";

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useK3Editor, K3EditorView } from "@thejoven_com/k3blocks";
import "@thejoven_com/k3blocks/style.css";

export default function App() {
  const editor = useK3Editor();
  return <K3EditorView editor={editor} />;
}`,
  },
];

export default function BasicSetup({ theme }: { theme?: "light" | "dark" }) {
  const editor = useK3Editor({ initialContent: helloDocument() });
  return (
    <div className="px-6 py-10 md:px-16">
      <K3EditorView editor={editor} theme={theme} />
    </div>
  );
}
