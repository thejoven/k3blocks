/**
 * K3Blocks — 侧边菜单：块悬停时左 gutter 显示「+」与六点拖拽手柄。
 * + 在该块下方插入段落并聚焦；手柄可拖拽排序，点击弹出
 * 删除 / 复制 / 转换为… 菜单。
 */
import { useEffect, useRef, useState } from "react";
import { Copy, GripVertical, Plus, Trash2 } from "lucide-react";
import type { K3Dictionary } from "../i18n";
import type { Block } from "../types";
import { genId } from "../store";
import type { ViewContext } from "../viewContext";

type ConvertLabelKey = keyof K3Dictionary["sideMenu"]["convertItems"];

const CONVERT_TARGETS: { type: string; labelKey: ConvertLabelKey; props?: Record<string, any> }[] = [
  { type: "paragraph", labelKey: "paragraph" },
  { type: "heading", labelKey: "heading1", props: { level: 1 } },
  { type: "heading", labelKey: "heading2", props: { level: 2 } },
  { type: "heading", labelKey: "heading3", props: { level: 3 } },
  { type: "quote", labelKey: "quote" },
  { type: "bulletListItem", labelKey: "bulletListItem" },
  { type: "numberedListItem", labelKey: "numberedListItem" },
  { type: "checkListItem", labelKey: "checkListItem", props: { checked: false } },
  { type: "codeBlock", labelKey: "codeBlock", props: { language: "text" } },
];

export interface SideMenuProps {
  ctx: ViewContext;
  block: Block;
  visible: boolean;
}

export function SideMenu({ ctx, block, visible }: SideMenuProps) {
  const [open, setOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { editor } = ctx;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setConvertOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setConvertOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // 行 hover 移出时收起
  useEffect(() => {
    if (!visible) {
      setOpen(false);
      setConvertOpen(false);
    }
  }, [visible]);

  const insertBelow = () => {
    const created = editor.insertBlocks([{ type: "paragraph" }], block.id, "after");
    if (created[0]) editor.setTextCursor(created[0].id, 0);
  };

  const duplicate = () => {
    const copy: Block = JSON.parse(JSON.stringify(block));
    const reid = (b: Block): Block => ({
      ...b,
      id: genId(),
      children: b.children.map(reid),
    });
    editor.insertBlocks([reid(copy)], block.id, "after");
    setOpen(false);
  };

  const remove = () => {
    editor.removeBlocks([block.id]);
    setOpen(false);
  };

  const convertTo = (type: string, props: Record<string, any>) => {
    editor.updateBlock(block.id, { type, props });
    editor.setTextCursor(block.id, 0);
    setOpen(false);
    setConvertOpen(false);
  };

  const dict = ctx.dict.sideMenu;
  // 容器块（分栏/列）与无可编辑文本的块（分割线/图片/表格/公式/嵌入/图表/PDF）不参与「转换为」
  const convertible = ![
    "divider",
    "image",
    "columnList",
    "column",
    "table",
    "math",
    "embed",
    "diagram",
    "pdf",
  ].includes(block.type);
  // 白名单裁剪转换目标；heading 级别与代码块默认语言受 blockConfig 约束
  const convertTargets = CONVERT_TARGETS.filter((t) => editor.isTypeAllowed(t.type))
    .filter((t) => t.type !== "heading" || editor.isHeadingLevelAllowed(Number(t.props?.level)))
    .map((t) =>
      t.type === "codeBlock" ? { ...t, props: { language: editor.codeDefaultLanguage } } : t
    );

  return (
    <div className={`k3-side-menu${visible || open ? " k3-visible" : ""}`}>
      <button
        type="button"
        className="k3-side-btn"
        title={dict.insertBelow}
        aria-label={dict.insertBelow}
        tabIndex={-1}
        onMouseDown={(e) => e.preventDefault()}
        onClick={insertBelow}
      >
        <Plus size={16} />
      </button>
      <div className="k3-grip-wrap" ref={menuRef}>
        <button
          type="button"
          className="k3-side-btn k3-grip"
          title={dict.dragHandle}
          aria-label={dict.dragHandle}
          tabIndex={-1}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("text/k3-block-id", block.id);
            e.dataTransfer.effectAllowed = "move";
            ctx.setDraggingId(block.id);
            setOpen(false);
          }}
          onDragEnd={() => {
            ctx.setDraggingId(null);
            ctx.setDropIndicator(null);
          }}
          onClick={() => {
            setOpen((v) => !v);
            setConvertOpen(false);
          }}
        >
          <GripVertical size={16} />
        </button>
        {open ? (
          <div className="k3-grip-menu k3-pop">
            <button type="button" className="k3-menu-item" onClick={remove}>
              <Trash2 size={14} />
              <span>{dict.delete}</span>
              <kbd>Del</kbd>
            </button>
            <button type="button" className="k3-menu-item" onClick={duplicate}>
              <Copy size={14} />
              <span>{dict.duplicate}</span>
              <kbd>⌘D</kbd>
            </button>
            {convertible && convertTargets.length ? (
              <>
                <div className="k3-menu-sep" />
                <button
                  type="button"
                  className={`k3-menu-item${convertOpen ? " k3-on" : ""}`}
                  onClick={() => setConvertOpen((v) => !v)}
                >
                  <span className="k3-menu-arrow">⇄</span>
                  <span>{dict.convertTo}</span>
                  <span className="k3-menu-caret">{convertOpen ? "▾" : "▸"}</span>
                </button>
                {convertOpen
                  ? convertTargets
                      .filter(
                        (t) =>
                          t.type !== block.type ||
                          (t.type === "heading" && t.props?.level !== block.props.level)
                      )
                      .map((t) => (
                        <button
                          key={`${t.type}-${t.props?.level ?? ""}`}
                          type="button"
                          className="k3-menu-item k3-menu-sub"
                          onClick={() => convertTo(t.type, t.props ?? {})}
                        >
                          <span>{dict.convertItems[t.labelKey]}</span>
                        </button>
                      ))
                  : null}
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
