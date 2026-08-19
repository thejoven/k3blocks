/**
 * localization-i18n — dictionary 切换：zhCN / enUS / mergeDictionary 自定义单条。
 * 通过 <K3EditorView dictionary> 传入（优先级最高、随渲染即时生效），
 * placeholder、斜杠菜单、右键菜单文案立即切换。
 */
import { useState } from "react";
import { useK3Editor, K3EditorView, zhCN, enUS, mergeDictionary } from "@/k3blocks";
import { helloDocument } from "@/lib/sampleDoc";
import { cn } from "@/lib/utils";
import { PanelLabel } from "./shared";

export const SOURCE = [
  {
    name: "App.tsx",
    language: "tsx",
    code: `import { useState } from "react";
import { useK3Editor, K3EditorView, zhCN, enUS, mergeDictionary } from "@thejoven_com/k3blocks";

// 自定义：与 zhCN 深合并，只覆盖单条文案
const custom = mergeDictionary(zhCN, {
  placeholder: "写下你的 RFC 草案…",
  slashMenu: { empty: "没有匹配的块" },
});

export default function App() {
  const [dict, setDict] = useState(zhCN);
  const editor = useK3Editor({ initialContent: doc });

  // <K3EditorView dictionary> 优先级高于 useK3Editor 选项，随渲染即时切换
  return (
    <>
      <button onClick={() => setDict(zhCN)}>中文</button>
      <button onClick={() => setDict(enUS)}>English</button>
      <button onClick={() => setDict(custom)}>自定义</button>
      <K3EditorView editor={editor} dictionary={dict} />
    </>
  );
}`,
  },
];

type Lang = "zh" | "en" | "custom";

const DICTS: Record<Lang, { label: string; value: typeof zhCN }> = {
  zh: { label: "中文", value: zhCN },
  en: { label: "English", value: enUS },
  custom: {
    label: "自定义",
    value: mergeDictionary(zhCN, {
      placeholder: "写下你的 RFC 草案… 输入 '/' 插入块",
      slashMenu: { empty: "没有匹配的块类型" },
    }),
  },
};

export default function LocalizationI18n({ theme }: { theme?: "light" | "dark" }) {
  const [lang, setLang] = useState<Lang>("zh");
  const editor = useK3Editor({ initialContent: helloDocument() });

  return (
    <div className="px-6 py-10 md:px-16">
      <div className="mb-6 flex items-center justify-between">
        <PanelLabel>DICTIONARY</PanelLabel>
        <div className="flex h-7 items-center rounded-lg border border-border p-0.5">
          {(Object.keys(DICTS) as Lang[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setLang(k)}
              className={cn(
                "flex h-6 items-center rounded-md px-2.5 font-mono text-[12px] transition-colors duration-150 ease-k3",
                lang === k
                  ? "border border-border bg-surface-2 text-text-1"
                  : "border border-transparent text-text-3 hover:text-text-2",
              )}
            >
              {DICTS[k].label}
            </button>
          ))}
        </div>
      </div>
      <K3EditorView editor={editor} theme={theme} dictionary={DICTS[lang].value} />
      <p className="mt-6 font-mono text-[12px] leading-[1.7] text-text-4">
        {lang === "custom"
          ? "自定义 = mergeDictionary(zhCN, { placeholder, slashMenu.empty })——只覆盖两条，其余沿用 zhCN。"
          : "切换后 placeholder、斜杠菜单、侧边手柄菜单、格式化工具栏文案即时生效。输入 / 试试。"}
      </p>
    </div>
  );
}
