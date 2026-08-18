/**
 * K3Blocks — i18n 字典：组件内所有用户可见文案。
 * 内置 zhCN（默认，与初版文案一致）与 enUS 两套字典；
 * 通过 useK3Editor({ dictionary }) 或 <K3EditorView dictionary> 做局部覆盖（深合并）。
 */

/** 编辑器全部用户可见字符串的键 */
export interface K3Dictionary {
  /** 空段落占位符 */
  placeholder: string;
  slashMenu: {
    /** 分组名：基础块 */
    groupBasic: string;
    /** 分组名：媒体 */
    groupMedia: string;
    /** 无匹配结果提示 */
    empty: string;
    footerSelect: string;
    footerInsert: string;
    footerClose: string;
    /** 条目名（key = SlashItem.id） */
    items: {
      paragraph: string;
      heading1: string;
      heading2: string;
      heading3: string;
      bulletListItem: string;
      numberedListItem: string;
      checkListItem: string;
      quote: string;
      codeBlock: string;
      divider: string;
      image: string;
      columnList: string;
      table: string;
      math: string;
      embed: string;
      diagram: string;
      pdf: string;
    };
  };
  /** @ 提及菜单 */
  mentions: {
    /** 无匹配候选提示 */
    empty: string;
  };
  /** ":" emoji 网格菜单 */
  emoji: {
    /** 无匹配 emoji 提示 */
    empty: string;
  };
  /** 「选择文件」上传按钮 */
  upload: {
    /** 按钮提示：选择本地文件 */
    chooseFile: string;
    /** 上传中提示 */
    uploading: string;
  };
  sideMenu: {
    /** 「+」按钮提示 */
    insertBelow: string;
    /** 拖拽手柄提示 */
    dragHandle: string;
    delete: string;
    duplicate: string;
    convertTo: string;
    /** 「转换为」子菜单条目名 */
    convertItems: {
      paragraph: string;
      heading1: string;
      heading2: string;
      heading3: string;
      quote: string;
      bulletListItem: string;
      numberedListItem: string;
      checkListItem: string;
      codeBlock: string;
    };
  };
  formattingToolbar: {
    bold: string;
    italic: string;
    underline: string;
    strike: string;
    inlineCode: string;
    link: string;
    linkInputPlaceholder: string;
    /** 文字颜色下拉 */
    textColor: string;
    /** 高亮（背景色）下拉 */
    highlight: string;
    /** 色板：默认（清除颜色） */
    colorDefault: string;
    colorRed: string;
    colorOrange: string;
    colorGreen: string;
    colorBlue: string;
    colorGray: string;
  };
  codeBlock: {
    /** 复制按钮 aria-label */
    copy: string;
    /** 语言选择 aria-label */
    language: string;
  };
  table: {
    addRow: string;
    addColumn: string;
    removeRow: string;
    removeColumn: string;
  };
  math: {
    /** latex 编辑框占位符 */
    inputPlaceholder: string;
    /** 渲染失败小标 */
    renderError: string;
  };
  embed: {
    /** URL 占位输入框 */
    urlPlaceholder: string;
    /** 回到输入态的按钮 */
    editLink: string;
  };
  diagram: {
    /** 「编辑源码」按钮 */
    editSource: string;
    /** 渲染失败提示前缀 */
    renderError: string;
    /** 源码编辑框占位符 */
    inputPlaceholder: string;
  };
  pdf: {
    /** URL 占位输入框 */
    urlPlaceholder: string;
    /** 回到输入态的按钮 */
    editLink: string;
    /** 「新窗口打开」按钮 */
    openInNewTab: string;
  };
}

/** 递归可选：dictionary 覆盖只需给出要改的叶子 */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export const zhCN: K3Dictionary = {
  placeholder: "输入 '/' 查看命令",
  slashMenu: {
    groupBasic: "Basic blocks",
    groupMedia: "Media",
    empty: "无匹配结果",
    footerSelect: "选择",
    footerInsert: "插入",
    footerClose: "关闭",
    items: {
      paragraph: "段落",
      heading1: "标题 1",
      heading2: "标题 2",
      heading3: "标题 3",
      bulletListItem: "无序列表",
      numberedListItem: "有序列表",
      checkListItem: "待办列表",
      quote: "引用",
      codeBlock: "代码块",
      divider: "分割线",
      image: "图片",
      columnList: "分栏",
      table: "表格",
      math: "数学公式",
      embed: "嵌入",
      diagram: "图表",
      pdf: "PDF 文档",
    },
  },
  mentions: {
    empty: "无匹配成员",
  },
  emoji: {
    empty: "无匹配表情",
  },
  upload: {
    chooseFile: "选择文件",
    uploading: "上传中…",
  },
  sideMenu: {
    insertBelow: "在下方插入块",
    dragHandle: "拖拽排序 / 点击打开菜单",
    delete: "删除",
    duplicate: "复制",
    convertTo: "转换为",
    convertItems: {
      paragraph: "段落",
      heading1: "标题 1",
      heading2: "标题 2",
      heading3: "标题 3",
      quote: "引用",
      bulletListItem: "无序列表",
      numberedListItem: "有序列表",
      checkListItem: "待办列表",
      codeBlock: "代码块",
    },
  },
  formattingToolbar: {
    bold: "加粗 ⌘B",
    italic: "斜体 ⌘I",
    underline: "下划线 ⌘U",
    strike: "删除线",
    inlineCode: "行内代码 ⌘E",
    link: "链接 ⌘K",
    linkInputPlaceholder: "输入链接，回车确认",
    textColor: "文字颜色",
    highlight: "背景色",
    colorDefault: "默认",
    colorRed: "红色",
    colorOrange: "橙色",
    colorGreen: "绿色",
    colorBlue: "蓝色",
    colorGray: "灰色",
  },
  codeBlock: {
    copy: "复制代码",
    language: "代码语言",
  },
  table: {
    addRow: "添加行",
    addColumn: "添加列",
    removeRow: "删除行",
    removeColumn: "删除列",
  },
  math: {
    inputPlaceholder: "输入 LaTeX，⌘Enter 完成",
    renderError: "公式渲染失败",
  },
  embed: {
    urlPlaceholder: "粘贴嵌入链接（YouTube / Vimeo / B 站…），回车确认",
    editLink: "编辑链接",
  },
  diagram: {
    editSource: "编辑源码",
    renderError: "图表渲染失败",
    inputPlaceholder: "输入 Mermaid 源码，⌘Enter 重渲染",
  },
  pdf: {
    urlPlaceholder: "粘贴 PDF 链接，回车确认",
    editLink: "编辑链接",
    openInNewTab: "新窗口打开",
  },
};

export const enUS: K3Dictionary = {
  placeholder: "Type '/' for commands",
  slashMenu: {
    groupBasic: "Basic blocks",
    groupMedia: "Media",
    empty: "No results",
    footerSelect: "Select",
    footerInsert: "Insert",
    footerClose: "Close",
    items: {
      paragraph: "Paragraph",
      heading1: "Heading 1",
      heading2: "Heading 2",
      heading3: "Heading 3",
      bulletListItem: "Bullet list",
      numberedListItem: "Numbered list",
      checkListItem: "To-do list",
      quote: "Quote",
      codeBlock: "Code block",
      divider: "Divider",
      image: "Image",
      columnList: "Columns",
      table: "Table",
      math: "Math",
      embed: "Embed",
      diagram: "Diagram",
      pdf: "PDF",
    },
  },
  mentions: {
    empty: "No matching people",
  },
  emoji: {
    empty: "No matching emoji",
  },
  upload: {
    chooseFile: "Choose file",
    uploading: "Uploading…",
  },
  sideMenu: {
    insertBelow: "Insert block below",
    dragHandle: "Drag to reorder / click for menu",
    delete: "Delete",
    duplicate: "Duplicate",
    convertTo: "Turn into",
    convertItems: {
      paragraph: "Paragraph",
      heading1: "Heading 1",
      heading2: "Heading 2",
      heading3: "Heading 3",
      quote: "Quote",
      bulletListItem: "Bullet list",
      numberedListItem: "Numbered list",
      checkListItem: "To-do list",
      codeBlock: "Code block",
    },
  },
  formattingToolbar: {
    bold: "Bold ⌘B",
    italic: "Italic ⌘I",
    underline: "Underline ⌘U",
    strike: "Strikethrough",
    inlineCode: "Inline code ⌘E",
    link: "Link ⌘K",
    linkInputPlaceholder: "Paste a link and press Enter",
    textColor: "Text color",
    highlight: "Highlight",
    colorDefault: "Default",
    colorRed: "Red",
    colorOrange: "Orange",
    colorGreen: "Green",
    colorBlue: "Blue",
    colorGray: "Gray",
  },
  codeBlock: {
    copy: "Copy code",
    language: "Code language",
  },
  table: {
    addRow: "Add row",
    addColumn: "Add column",
    removeRow: "Remove row",
    removeColumn: "Remove column",
  },
  math: {
    inputPlaceholder: "Type LaTeX, ⌘Enter to render",
    renderError: "Failed to render formula",
  },
  embed: {
    urlPlaceholder: "Paste an embed link (YouTube / Vimeo / Bilibili…), press Enter",
    editLink: "Edit link",
  },
  diagram: {
    editSource: "Edit source",
    renderError: "Failed to render diagram",
    inputPlaceholder: "Type Mermaid source, ⌘Enter to re-render",
  },
  pdf: {
    urlPlaceholder: "Paste a PDF link, press Enter",
    editLink: "Edit link",
    openInNewTab: "Open in new tab",
  },
};

/** 深合并：override 中给出的叶子覆盖 base，未给出的保持 base */
export function mergeDictionary(base: K3Dictionary, override?: DeepPartial<K3Dictionary>): K3Dictionary {
  if (!override) return base;
  const merge = <T>(b: T, o: unknown): T => {
    if (o === undefined || o === null) return b;
    if (typeof b !== "object" || typeof o !== "object") return o as T;
    const out: Record<string, unknown> = { ...(b as Record<string, unknown>) };
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
      out[k] = merge(out[k], v);
    }
    return out as T;
  };
  return merge(base, override);
}
