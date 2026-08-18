/**
 * K3Blocks — 视图上下文：块渲染器 / 侧边菜单 / 拖拽共享的渲染期状态。
 */
import type { K3Dictionary } from "./i18n";
import type { K3EditorViewProps } from "./types";
import type { EditorCore } from "./useK3Editor";

export interface DropIndicator {
  id: string;
  placement: "before" | "after";
}

export interface ViewContext {
  editor: EditorCore;
  editable: boolean;
  placeholder: string;
  /** 当前生效的 i18n 字典 */
  dict: K3Dictionary;
  /** 自定义块渲染口（schema 未注册的 type 优先使用，只读渲染） */
  blockRenderers?: K3EditorViewProps["blockRenderers"];
  /** 自定义行内内容渲染口（未知 inline type → ReactNode） */
  inlineRenderers?: K3EditorViewProps["inlineRenderers"];
  /** 自定义行内样式渲染口（styles[key] → CSS） */
  inlineStyleRenderers?: K3EditorViewProps["inlineStyleRenderers"];
  /** 附加 DOM 属性（block 键值贴到每个块行容器） */
  domAttributes?: K3EditorViewProps["domAttributes"];
  sideMenu: boolean;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  dropIndicator: DropIndicator | null;
  setDropIndicator: (d: DropIndicator | null) => void;
  draggingId: string | null;
  setDraggingId: (id: string | null) => void;
}
