/**
 * EXPORT 栏目共用：富种子文档 + live demo 外壳（44px 操作条 + 凹陷画布内
 * 真实 K3EditorView + 可选 mono 结果预览面板）+ 28px 操作按钮 / 反馈 chip。
 * 仅供 src/pages/docs/export/ 下六个导出页使用。
 */
import { useRef, useState, type ReactNode } from "react";
import { Check, Copy, X } from "lucide-react";
import { useK3Editor, K3EditorView } from "@/k3blocks";
import type { Block, K3Editor } from "@/k3blocks";
import { cn } from "@/lib/utils";

/* ------------------------------ 富种子文档 ------------------------------ */

function t(text: string, styles?: Record<string, unknown>) {
  return { type: "text" as const, text, ...(styles ? { styles } : {}) };
}

/**
 * 尽量覆盖导出器全部输入形态：标题 / 染色行内 / mention / 三种列表 /
 * 引用 / 代码块 / 表格 / 公式 / 分割线。
 */
export function richSeedDocument(): Block[] {
  return [
    {
      id: "ex-h1",
      type: "heading",
      props: { level: 1 },
      content: [t("产品周报 · 第 12 期")],
      children: [],
    },
    {
      id: "ex-p1",
      type: "paragraph",
      props: {},
      content: [
        t("本周"),
        t("重点", { bold: true }),
        t("：导出函数 "),
        t("blocksToDocxBlob()", { code: true }),
        t(" 上线，"),
        t("高亮部分", { backgroundColor: "#e8590c33" }),
        t(" 待确认，详见"),
        t("里程碑", { textColor: "#388aff" }),
        t("。"),
      ],
      children: [],
    },
    {
      id: "ex-p2",
      type: "paragraph",
      props: {},
      content: [
        t("负责人 "),
        { type: "mention", props: { id: "u1", label: "张三" } },
        t(" 已完成评审。"),
      ],
      children: [],
    },
    {
      id: "ex-b1",
      type: "bulletListItem",
      props: {},
      content: [t("支持 Markdown / HTML / Email HTML")],
      children: [],
    },
    {
      id: "ex-n1",
      type: "numberedListItem",
      props: {},
      content: [t("接入编辑器组件")],
      children: [],
    },
    {
      id: "ex-n2",
      type: "numberedListItem",
      props: {},
      content: [t("接入下载按钮")],
      children: [],
    },
    {
      id: "ex-c1",
      type: "checkListItem",
      props: { checked: true },
      content: [t("设计评审")],
      children: [],
    },
    {
      id: "ex-c2",
      type: "checkListItem",
      props: { checked: false },
      content: [t("灰度发布")],
      children: [],
    },
    {
      id: "ex-q1",
      type: "quote",
      props: {},
      content: [t("简单是可靠的先决条件。")],
      children: [],
    },
    {
      id: "ex-code",
      type: "codeBlock",
      props: { language: "ts" },
      content: [t('downloadBlob(await editor.blocksToDocxBlob(), "report.docx");')],
      children: [],
    },
    {
      id: "ex-table",
      type: "table",
      props: {
        rows: [
          ["格式", "函数", "产物"],
          ["Markdown", "blocksToMarkdown()", ".md"],
          ["Word", "blocksToDocxBlob()", ".docx"],
        ],
      },
      content: [],
      children: [],
    },
    { id: "ex-math", type: "math", props: { latex: "E = mc^2" }, content: [], children: [] },
    { id: "ex-div", type: "divider", props: {}, content: [], children: [] },
  ];
}

/* ------------------------------ 操作与反馈 ------------------------------ */

/** 28px accent 主按钮（design.md §4 控制刻度）。 */
export function ActionButton({
  children,
  onClick,
  busy = false,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  busy?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={cn(
        "flex h-7 items-center gap-1.5 rounded-lg bg-accent px-2.5 text-[12px] font-medium text-white transition-colors duration-150 ease-k3",
        busy ? "cursor-wait opacity-70" : "hover:bg-accent-hover",
        className,
      )}
    >
      {children}
    </button>
  );
}

export interface Feedback {
  kind: "ok" | "err";
  text: string;
}

/** 反馈状态：3.2s 自动消失，新消息顶掉旧计时器。 */
export function useFeedback() {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const show = (f: Feedback) => {
    window.clearTimeout(timer.current);
    setFeedback(f);
    timer.current = window.setTimeout(() => setFeedback(null), 3200);
  };
  return { feedback, show };
}

/** 操作结果 chip（成功 ✓ accent / 失败 ✕）。 */
export function FeedbackChip({ feedback }: { feedback: Feedback | null }) {
  if (!feedback) return null;
  return (
    <span className="flex h-7 items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2 font-mono text-[12px] text-text-1">
      {feedback.kind === "ok" ? (
        <Check size={13} strokeWidth={1.5} className="text-accent" />
      ) : (
        <X size={13} strokeWidth={1.5} className="text-text-3" />
      )}
      {feedback.text}
    </span>
  );
}

/** mono 预览面板右上角 28px 复制按钮（icon swap 150ms）。 */
function CopyMini({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // 非安全上下文下 Clipboard API 不可用——静默降级
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="flex h-7 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[12px] text-text-2 transition-colors duration-150 ease-k3 hover:bg-hover-overlay hover:text-text-1"
    >
      {copied ? <Check size={13} strokeWidth={1.5} /> : <Copy size={13} strokeWidth={1.5} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/* ------------------------------ demo 外壳 ------------------------------ */

/**
 * 导出页统一 demo：操作条（EDITOR 标 + 页面自定义动作）→ 可编辑画布 →
 * 可选的实时 mono 预览（renderPreview 输出随编辑刷新）。
 */
export default function ExportDemo({
  actions,
  previewLabel,
  renderPreview,
  className,
}: {
  /** 操作条右侧动作区（按钮 + 反馈 chip） */
  actions: (editor: K3Editor) => ReactNode;
  /** 预览面板 mono 标，如 "HTML — editor.blocksToHTML()" */
  previewLabel?: string;
  /** 预览内容生成器；缺省则无预览面板 */
  renderPreview?: (editor: K3Editor) => string;
  className?: string;
}) {
  const [, setDocTick] = useState(0);
  const editor = useK3Editor({
    initialContent: richSeedDocument(),
    onChange: () => setDocTick((v) => v + 1),
  });

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-surface-1", className)}>
      {/* 操作条（44px） */}
      <div className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-3 py-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-4">
          Editor — 可直接编辑
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">{actions(editor)}</div>
      </div>

      {/* 画布 */}
      <div className="bg-surface-inset px-5 py-8 md:px-8">
        <K3EditorView editor={editor} slashMenu formattingToolbar sideMenu />
      </div>

      {/* 实时预览 */}
      {renderPreview && (
        <div className="border-t border-border">
          <div className="flex h-9 items-center justify-between border-b border-border px-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-4">
              {previewLabel}
            </span>
            <CopyMini text={renderPreview(editor)} />
          </div>
          <pre className="max-h-[300px] overflow-auto whitespace-pre-wrap break-all px-4 py-3 font-mono text-[12px] leading-[1.7] text-text-2">
            {renderPreview(editor)}
          </pre>
        </div>
      )}
    </div>
  );
}
