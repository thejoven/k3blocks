# K3Blocks

Notion 风格的 React 块编辑器组件，设计语言遵从 cladd.io：dark-first 近黑表面、1px 发丝线、唯一强调色 `#388aff`、28px 控件刻度、克制的动效。

## 作为 npm 包使用

本目录可单独发布为 `@thejoven_com/k3blocks`。用户侧：

```bash
npm i @thejoven_com/k3blocks
```

```tsx
import { useK3Editor, K3EditorView } from "@thejoven_com/k3blocks";
import "@thejoven_com/k3blocks/style.css"; // 主题 CSS 变量单独导出，需显式引入一次
```

- 包为 `type: module`，同时提供 es / cjs 双格式与 `exports` map（含 `./style.css`）；`react` / `react-dom` 为 peerDependencies（>=18）。
- 构建与发布（token + `npm run release:patch`）见根 README 的「将组件发布到 npm」。

## 安装

```bash
npm install @thejoven_com/k3blocks
```

组件为纯 React + TypeScript 实现，无 tiptap 等编辑器依赖。图标依赖 `lucide-react`；公式与图表块依赖 `katex` 与 `mermaid`（mermaid 按需动态加载，不进首屏 bundle）。

## 快速上手

```tsx
import { useK3Editor, K3EditorView } from "@thejoven_com/k3blocks";

export default function App() {
  const editor = useK3Editor({
    initialContent: [
      { id: "1", type: "heading", props: { level: 1 }, content: [{ type: "text", text: "Hello." }], children: [] },
      { id: "2", type: "paragraph", props: {}, content: [], children: [] },
    ],
    onChange: (e) => localStorage.setItem("doc", JSON.stringify(e.document)),
  });
  return <K3EditorView editor={editor} theme="dark" slashMenu formattingToolbar sideMenu />;
}
```

- 组件本身**不做持久化**：通过 `onChange` + `editor.document` 交给宿主（如 localStorage）。
- `theme` 省略时继承宿主页面的 CSS 变量（`--bg` / `--surface-*` / `--border` / `--text-*` / `--accent` …）。

## 文档模型

```ts
type Block = { id: string; type: string; props: Record<string, any>; content: InlineContent[]; children: Block[] };
type InlineContent =
  | { type: "text"; text: string; styles?: { bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean; code?: boolean; textColor?: string; backgroundColor?: string } }
  | { type: "link"; href: string; content: InlineContent[] }
  | { type: "mention"; props: { id: string; label: string } };
```

JSON 即无损存储格式。

## API

### `useK3Editor(options?): K3Editor`

| option | 类型 | 默认 | 说明 |
|---|---|---|---|
| `initialContent` | `Block[]` | 一个空段落 | 初始文档 |
| `editable` | `boolean` | `true` | 只读模式 |
| `placeholder` | `string` | `输入 '/' 查看命令` | 空段落占位符 |
| `dictionary` | `DeepPartial<K3Dictionary>` | `zhCN` | i18n 字典覆盖（深合并） |
| `blockTypes` | `string[]` | 不限 | 块类型白名单 |
| `pasteHandler` | `(e: ClipboardEvent, editor: K3Editor) => boolean` | — | 自定义粘贴处理 |
| `mentions` | `{ items: K3MentionItem[]; trigger?: string }` | — | @ 提及（trigger 默认 `"@"`） |
| `blockConfig` | `{ heading?: { levels?: (1\|2\|3)[] }; codeBlock?: { defaultLanguage?: string } }` | — | 默认块配置（非法项 console.warn 并忽略） |
| `emojiPicker` | `boolean` | `true` | `:` emoji 网格建议菜单 |
| `uploadFile` | `(file: File) => Promise<string>` | — | 文件上传管道（缺省回退 FileReader dataURL） |
| `onChange` | `(editor) => void` | — | 文档变更回调 |

### `K3Editor` 实例

| 成员 | 签名 | 说明 |
|---|---|---|
| `document` | `Block[]`（getter） | 当前文档 |
| `insertBlocks` | `(blocks, refId?, placement?) => Block[]` | placement: `"before" \| "after" \| "nested"` |
| `updateBlock` | `(id, partial) => void` | 更新 type / props / content / children |
| `removeBlocks` | `(ids: string[]) => void` | 删除块 |
| `getBlock` | `(id) => Block \| undefined` | 查询块 |
| `undo` / `redo` | `() => void` | 自维护操作栈 |
| `canUndo` / `canRedo` | `boolean`（getter） | 历史状态 |
| `blocksToMarkdown` | `() => string` | 导出 Markdown |
| `blocksToHTML` | `() => string` | 导出语义化 HTML |
| `blocksToEmailHTML` | `() => string` | 导出 email-safe HTML（table + inline style） |
| `blocksToDocxBlob` | `() => Promise<Blob>` | 导出 .docx（docx 动态 import） |
| `blocksToOdtBlob` | `() => Promise<Blob>` | 导出 .odt（jszip 动态 import） |
| `print` | `(opts?: { title?: string }) => void` | 打印窗口渲染 + window.print() |
| `insertHTML` | `(html: string) => void` | 解析 HTML append 到文档末尾 |
| `insertMarkdown` | `(md: string) => void` | 解析 Markdown append 到文档末尾 |
| `onChange` | `(cb) => unsubscribe` | 订阅变更 |
| `onSelectionChange` | `(cb: (sel: K3Selection \| null) => void) => unsubscribe` | 订阅选区变化 |
| `getSelection` | `() => K3Selection \| null` | 当前选区覆盖的块 id 集 |
| `focus` | `() => void` | 聚焦编辑器 |
| `setTextCursor` | `(blockId, offset?) => void` | 设置文本光标 |

### `<K3EditorView />`

| prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `editor` | `K3Editor` | 必填 | 编辑器实例 |
| `editable` | `boolean` | `true` | 只读渲染 |
| `theme` | `"light" \| "dark"` | 继承页面 | 设置根元素 `data-theme` |
| `slashMenu` | `boolean` | `true` | `/` 斜杠菜单 |
| `formattingToolbar` | `boolean` | `true` | 选区悬浮格式化工具栏 |
| `sideMenu` | `boolean` | `true` | 块悬停「+」与拖拽手柄 |
| `placeholder` | `string` | `输入 '/' 查看命令` | 占位符 |
| `dictionary` | `DeepPartial<K3Dictionary>` | 继承 editor | i18n 字典覆盖（优先级最高） |
| `blockRenderers` | `Record<string, (block: Block, editor: K3Editor) => ReactNode>` | — | 自定义块渲染口（见下文） |
| `inlineRenderers` | `Record<string, (node: InlineContent & { type: string }, editor: K3Editor) => ReactNode>` | — | 自定义行内内容渲染口（见下文） |
| `inlineStyleRenderers` | `Record<string, (value: string) => CSSProperties>` | — | 自定义行内样式渲染口（见下文） |
| `domAttributes` | `{ editor?: Record<string, string>; block?: Record<string, string> }` | — | 附加 DOM 属性（测试锚点 / 埋点） |
| `className` | `string` | — | 追加到根元素 |

## i18n 字典 / i18n Dictionary

组件内所有用户可见文案由 `K3Dictionary` 描述，内置 `zhCN`（默认）与 `enUS`：

```ts
import { zhCN, enUS } from "@thejoven_com/k3blocks";

const editor = useK3Editor({ dictionary: enUS });
// 或局部覆盖（与 zhCN 深合并）：
useK3Editor({ dictionary: { placeholder: "写点什么…", slashMenu: { empty: "没有结果" } } });
// <K3EditorView dictionary={enUS} /> 亦可，优先级高于 useK3Editor 选项
```

All user-facing strings live in `K3Dictionary`; `zhCN` (default) and `enUS` ship built-in. Pass `dictionary` to `useK3Editor` and/or `K3EditorView` (view prop wins; deep-merged over `zhCN`).

字典键 / Keys：`placeholder` · `slashMenu.{groupBasic, groupMedia, empty, footerSelect, footerInsert, footerClose, items.*}` · `sideMenu.{insertBelow, dragHandle, delete, duplicate, convertTo, convertItems.*}` · `formattingToolbar.{bold, italic, underline, strike, inlineCode, link, linkInputPlaceholder, textColor, highlight, colorDefault, colorRed, colorOrange, colorGreen, colorBlue, colorGray}` · `codeBlock.{copy, language}` · `table.{addRow, addColumn, removeRow, removeColumn}` · `math.{inputPlaceholder, renderError}` · `embed.{urlPlaceholder, editLink}` · `diagram.{editSource, renderError, inputPlaceholder}` · `mentions.empty` · `emoji.empty` · `upload.{chooseFile, uploading}` · `pdf.{urlPlaceholder, editLink, openInNewTab}`。

## 块类型白名单 / blockTypes Whitelist

```ts
useK3Editor({ blockTypes: ["paragraph", "heading", "image"] });
```

- 斜杠菜单与「转换为」菜单只显示白名单类型 / Slash & "turn into" menus only list whitelisted types；
- 被移除类型的 Markdown 行首规则失效（如 `-`、`>`、` ``` `）/ Markdown input rules for removed types are disabled；
- `insertBlocks` 遇到非白名单 type 时递归降级为 `paragraph`（保留 content 与允许的子块）/ non-whitelisted types degrade to `paragraph` recursively。
- `column` 随 `columnList` 隐式允许 / `column` is implicitly allowed when `columnList` is。

## 选区事件 / Selection Events

```ts
const off = editor.onSelectionChange((sel) => console.log(sel?.blockIds));
editor.getSelection(); // { blockIds: string[] } | null
```

选区（含折叠光标）在编辑器内时实时上报覆盖块 id 集（跨块选区按文档顺序给出所有覆盖块）；选区移出或清空时回调 `null`。重复值不重复触发。

Reports the block ids under the selection (or caret) in document order; `null` when the selection leaves the editor. De-duplicated.

## 自定义粘贴 / Custom Paste Handler

```ts
useK3Editor({
  pasteHandler: (e, editor) => {
    const url = e.clipboardData?.getData("text/uri-list");
    if (url) { editor.insertBlocks([{ type: "image", props: { src: url } }]); return true; }
    return false; // 走默认
  },
});
```

组件根 paste 捕获阶段优先调用；返回 `true` 表示已处理（阻止默认粘贴），否则走默认行为：纯文本单行块内插入，多行按行拆块（代码块内不拆）。

Called in the root paste capture phase. Return `true` to suppress the default; otherwise the default pastes plain text — single line inserts in place, multiple lines split into blocks (never splits inside code blocks).

## 分栏块 columnList / Columns Block

斜杠菜单新增「分栏 / Columns」（Media 组），插入 `columnList`（2 个 `column`，各含一个空段落）。

The slash menu gains "分栏 / Columns" (Media group), inserting a `columnList` with two `column` children, each holding an empty paragraph.

- 结构 / Structure：`columnList` 的 children 只能是 `column`；`column` 的 children 是任意常规块。
- 渲染 / Rendering：CSS grid 按栏数均分，栏间距 24px，栏间 1px 发丝分隔线；窄屏（<768px）退化为单列堆叠。
- 栏内块正常编辑（输入、Enter 拆块、Markdown 规则、撤销）/ Blocks inside columns edit normally。
- 分栏块首 Backspace 整组降级为普通段落序列 / Backspace at the very start of the first column unwraps the whole group into a plain block sequence。
- 已知限制 / Known limitations：栏内不支持再嵌套分栏；拖拽排序不支持跨栏移动。

## 内置块（9 种 + 分栏 + 5 种媒体块）

`paragraph` · `heading`（props: `level: 1|2|3`）· `bulletListItem` · `numberedListItem` · `checkListItem`（props: `checked`）· `quote` · `codeBlock`（props: `language`）· `divider` · `image`（props: `src` / `caption` / `alt`，URL 嵌入）· `columnList` / `column`（分栏容器，children 结构固定）· `table` · `math` · `embed` · `diagram` · `pdf`（详见下文各节）

## 代码块 codeBlock

- 语法高亮 / Syntax highlighting：Prism overlay 方案——底层 `<pre aria-hidden>` 渲染高亮 token，上层 contenteditable 保持纯文本（`color: transparent` + `caret-color: var(--accent)` + 半透明 `--selection` 选区），两层同字体/字号/行高/padding，滚动同步；浏览器原生选区 / 光标 / 中文输入法 composition 均不受影响。
- 按需加载 / Lazy loading：prism 核心与语言组件全部走动态 `import()`（异步 chunk，不进主包）；按 `props.language` 加载对应组件（Promise 缓存 + 并发去重）；加载完成前显示纯文本；未知语言 / 加载失败静默降级为纯文本。
- 支持语言 / Languages：`markup`（别名 `html`/`xml`/`svg`）· `css` · `clike` · `javascript`（`js`）· `typescript`（`ts`）· `jsx` · `tsx` · `json` · `bash`（`sh`/`shell`）· `python`（`py`）· `markdown`（`md`）· `yaml`（`yml`）· `mermaid`；`text` 为纯文本（无高亮）。别名自动归一化。
- 语言 select / Language picker：可编辑时右上角为语言 `<select>`（选项即上述子集），改写 `props.language`；当前语言不在子集内时补占位项保证显示；只读时退化为纯标签。`blockConfig.codeBlock.defaultLanguage` 继续作为新代码块初始语言。
- 键盘 / Keyboard：`Enter` 块内换行，`⌘/Ctrl+Enter` 跳出代码块。

高亮配色 / Token colors（CSS 变量，theme.css 内 dark/light 两套默认值，可在 editor 根覆盖）：

| 变量 | 默认（dark / light） | 归并的 prism token |
|---|---|---|
| `--k3-code-keyword` | `#6ea8ff` / `#1a63d6` | keyword · important · tag · builtin · atrule |
| `--k3-code-string` | `#8fce9f` / `#2d7d46` | string · char · attr-value · regex |
| `--k3-code-comment` | `var(--text-4)` | comment · prolog · doctype · cdata |
| `--k3-code-function` | `#ac9be8` / `#7161c4` | function · selector · class-name |
| `--k3-code-number` | `#79c0ff` / `#0550ae` | number · boolean · constant · symbol · property · attr-name · variable |
| `--k3-code-operator` | `var(--text-2)` | operator · entity · url |
| `--k3-code-punctuation` | `var(--text-3)` | punctuation |

覆盖示例 / Override example：

```css
.my-editor {
  --k3-code-string: #a5d6a7;
  --k3-code-keyword: #82aaff;
}
```

## 表格块 table

斜杠菜单 Media 组「表格 / Table」（别名 `table/grid/表格/biaoge`），插入 3×3 种子（首行为表头）。

| prop | 类型 | 说明 |
|---|---|---|
| `rows` | `string[][]` | 二维纯文本单元格；`rows[0]` 为表头。`content` 恒为空数组 |

- 渲染 / Rendering：真实 `<table>`；表头 `--surface-1` 底 + 600 字重；单元格 1px `--border`；hover 行 5% overlay 高亮；列宽均分（`table-layout: fixed`）。
- 编辑 / Editing：单元格 contenteditable（纯文本，`onInput` 回写 `props.rows`，打字合并历史）；块 hover 时右上角浮出 28px 迷你工具条：+行 +列 −行 −列（每次 `updateBlock` 一条历史；保底至少 1 行 1 列）。
- 键盘 / Keyboard：单元格内 `Tab` → 下一格（行尾到下行首格，表尾自动新增一行）；`Enter` 不拆块（换行忽略）；首格为空时 `Backspace` 删除整块。
- Markdown 导出 / Export：pipe table（首行表头 + `---` 分隔行）。
- 已知限制 / Known limitations：单元格不支持行内样式与嵌套块；列宽均分不可调；不参与「转换为」菜单。

## 数学公式块 math

斜杠菜单 Media 组「数学公式 / Math」（别名 `math/katex/latex/公式/gongshi`），种子 `E = mc^2`。依赖 `katex`（`katex.min.css` 随块组件引入）。

| prop | 类型 | 说明 |
|---|---|---|
| `latex` | `string` | LaTeX 源码，KaTeX 展示模式（`displayMode: true`）渲染 |

- 渲染态点击（可编辑时）进入编辑态：mono inset 输入框编辑 latex，失焦 / `⌘/Ctrl+Enter` 回渲染态（`Esc` 放弃）。
- 渲染态右上角常驻 mono `TeX` 小标；渲染失败不抛异常，显示原始源码 + 红色小标提示。
- Markdown 导出 / Export：`$$...$$` 围栏。
- 已知限制 / Known limitations：KaTeX 支持的子集（不支持 `\begin{aligned}` 之外的 env 差异以 KaTeX 为准）；无行内公式块。

## 嵌入块 embed

斜杠菜单 Media 组「嵌入 / Embed」（别名 `embed/iframe/嵌入/qianru`）。

| prop | 类型 | 说明 |
|---|---|---|
| `url` | `string` | 嵌入地址；空串显示占位输入框（同 image 块模式） |

- 有 url 时渲染 16:9 iframe 预览（`sandbox="allow-scripts allow-same-origin allow-presentation"`，`loading="lazy"`）。
- 自动识别 YouTube（`youtube.com/watch?v=` / `youtu.be`）、Vimeo、B 站（`bilibili.com/video/BV…`）转嵌入地址，其余原样加载。
- 下方 mono 域名标签 +「编辑链接」小按钮回到输入态。
- Markdown 导出 / Export：链接行 `[url](url)`。
- 已知限制 / Known limitations：目标站点可通过 `X-Frame-Options` / CSP 拒绝嵌入（iframe 空白属预期行为）；不支持 oEmbed 自动展开。

## 图表块 diagram（Mermaid）

斜杠菜单 Media 组「图表 / Diagram」（别名 `mermaid/diagram/图表/tubiao`），种子 flowchart。依赖 `mermaid`，**动态 import**（`await import('mermaid')`），不进首屏 bundle；主题依当前 `data-theme`（`dark` / `default`）。

| prop | 类型 | 说明 |
|---|---|---|
| `code` | `string` | Mermaid 源码 |

- 渲染态渲染 SVG；失败时显示 mono 错误信息条（不炸页面）。
- 「编辑源码」按钮进入编辑态：mono textarea（inset 深底），`⌘/Ctrl+Enter` / 失焦提交并重渲染（`Esc` 放弃）。
- Markdown 导出 / Export：` ```mermaid ` 围栏代码块。
- 已知限制 / Known limitations：`securityLevel: "strict"`（图内 HTML/脚本被禁用）；首次渲染需下载 mermaid chunk（有短暂空白帧）。

## PDF 块 pdf

斜杠菜单 Media 组「PDF 文档 / PDF」（别名 `pdf/document/文档/wendang`）。

| prop | 类型 | 说明 |
|---|---|---|
| `url` | `string` | PDF 地址；空串显示占位输入框（同 image/embed 块模式） |

- 有 url 时渲染 `<iframe src="url#toolbar=0&navpanes=0">`，固定 560px 高、inset 框；右上角浮条含 mono `PDF` 标签与「新窗口打开」「编辑链接」小按钮。
- Markdown 导出 / Export：链接行 `[url](url)`。
- 已知限制 / Known limitations：预览依赖浏览器内置 PDF viewer；跨域文件受目标站 CSP / `X-Frame-Options` 限制；不参与「转换为」菜单。

## Mentions（@ 提及）/ Mentions

```ts
const editor = useK3Editor({
  mentions: {
    items: [
      { id: "u1", label: "张三", subtext: "zhangsan@k3.io" },
      { id: "u2", label: "Alice" },
    ],
    trigger: "@", // 默认 "@"，可自定义
  },
});
```

- 文本块内输入 `@` 弹出建议菜单（与斜杠菜单同一弹层：模糊过滤 `label/subtext/id`，`↑↓` 选择、`↵` 插入、`esc` 关闭）；选中后在光标处插入 mention 行内节点并吃掉 `@query`。
- 触发约束 / Trigger guard：仅当 `@` 前是行首 / 空白 / 标点时触发（`user@host.com` 等邮箱场景不弹菜单）；中文输入法 composition 期间不触发。
- mention 为**原子 chip**（accent-soft 底、accent 字、圆角 6px、前导 `@`，`contenteditable="false"`）：不可局部编辑，Backspace 整体删除；撤销 / 重做 / onChange 天然生效。
- 模型 / Model：`{ type: "mention"; props: { id, label } }`（JSON 无损序列化）；DOM 互转使用 `<span data-k3-mention="id">`；纯文本与 Markdown 导出均为 `@label`。
- 空态文案 / Empty state：`mentions.empty` 字典键。
- 已知限制 / Known limitations：候选集为静态数组（异步加载需在组件外自行维护后重新传入）；不支持多级触发符。

## Font Style（文字颜色 / 背景色）/ Text & Highlight Colors

格式化工具栏尾部新增两个 28px 下拉：**文字颜色**（Text color）与**背景色**（Highlight）。

- 色板 / Palette：`default / red #e03131 / orange #e8590c / green #2f9e44 / blue #1971c2 / gray #868e96`；高亮为同色系 20% 透明底色；当前生效色带勾，`default` 清除颜色。
- 模型 / Model：`InlineStyles.textColor` / `InlineStyles.backgroundColor`（hex；DOM 侧 `rgb()/rgba()` 会归一化为 hex / hex8 再入模型）。
- 渲染 / Rendering：text 节点外包 `<span style="color:…;background-color:…">`；DOM↔模型互转完整覆盖（含 `<font color>` 读取）。
- Markdown 导出忽略颜色 / Colors are dropped in Markdown export。
- i18n 键 / Keys：`formattingToolbar.{textColor, highlight, colorDefault, colorRed, colorOrange, colorGreen, colorBlue, colorGray}`。
- 已知限制 / Known limitations：颜色基于浏览器 `execCommand("foreColor"/"hiliteColor")` 实现；清除（default）作用于选区所在的整个同色元素，选区只覆盖一部分时会连带清除未选中同色文字的颜色。

## 默认块配置 blockConfig

```ts
useK3Editor({
  blockConfig: {
    heading: { levels: [1, 2] },        // 只允许 H1/H2：H3 菜单项隐藏，"###"+空格 规则失效
    codeBlock: { defaultLanguage: "ts" }, // 新代码块（斜杠菜单 / ``` 规则 / 转换为）的初始语言与语言标签默认
  },
});
```

- `heading.levels`：`(1|2|3)` 的非空数组；限定后斜杠菜单 / 「转换为」菜单按 level 过滤，`#`~`###` 行首规则仅对允许的级别生效（已有 H3 块不受影响，仅不再新增）。
- `codeBlock.defaultLanguage`：非空字符串；作为新代码块的初始 `props.language` 与右上角语言标签默认。
- 校验 / Validation：非法配置静默忽略并 `console.warn`（如 `levels: []`、`levels: [4]`、`defaultLanguage: ""`），其余部分照常生效。

## 自定义块渲染口 blockRenderers

```tsx
<K3EditorView
  editor={editor}
  blockRenderers={{
    callout: (block, editor) => (
      <aside data-block-id={block.id}>{block.props.text}</aside>
    ),
  }}
/>
```

- 遇到 schema **未注册**的 `type` 时优先用 `blockRenderers[type]` 渲染；已注册的内置 type 始终走内置渲染器，不受此表影响。
- 定位是**只读渲染口** / read-only render slot：块的结构编辑（拖拽、删除、侧边菜单）照常生效，但块内交互需自行实现；如需编辑请通过 `editor.updateBlock` 回写。
- 白名单语义 / Whitelist semantics：`blockTypes` 未设置时全部放行；即使设置了白名单，schema 未注册的自定义 type 也不会被 `isTypeAllowed` / `insertBlocks` 降级误杀（始终放行）。

## 导出 / Export

全部导出函数位于 `src/k3blocks/exporters.ts`（也从包入口导出），editor 实例挂同名方法（内部读 `this.document`）：

| 函数 | editor 方法 | 说明 |
|---|---|---|
| `blocksToHTML(blocks: Block[]): string` | `editor.blocksToHTML()` | 完整语义化 HTML：`h1-h3` / `p` / `ul` / `ol` / `li>input[checkbox]`（task-list）/ `blockquote` / `pre>code` / `hr` / `figure>img+figcaption` / `table` / `div.k3-math[data-latex]`（KaTeX 文本占位）/ `iframe`（embed、pdf）/ mention `span.k3-mention` / 行内 `strong,em,u,s,code,a` 与 `span[style]`（textColor / backgroundColor）；columnList 用 `div` + CSS grid |
| `blocksToEmailHTML(blocks: Block[]): string` | `editor.blocksToEmailHTML()` | email-safe 版：全 `table` 布局 + 全 inline style（无 class 无 grid），分栏转 table 列，待办转 `☐/☑` 文本，embed/pdf 降级为链接 |
| `blocksToDocxBlob(blocks: Block[]): Promise<Blob>` | `editor.blocksToDocxBlob()` | `.docx` 导出（`docx` 包**动态 import**，不进主 chunk）：paragraph / heading / bullet / numbered / todo（`☐/☑` 前缀）/ quote / code / divider / image（远程图无法同步取字节，导出 `[image: …]` 占位文本）/ table（管道分隔文本行）/ math（LaTeX 源码）/ mention |
| `blocksToOdtBlob(blocks: Block[]): Promise<Blob>` | `editor.blocksToOdtBlob()` | 最小 `.odt`（`jszip` **动态 import**）：`mimetype`（STORE）+ `META-INF/manifest.xml` + `content.xml`，`text:h` / `text:p` / `text:list` 覆盖主要块，行内 bold/italic/underline/strike/code 走自动样式 |
| `printBlocks(blocks: Block[], opts?: { title?: string }): void` | `editor.print(opts?)` | 打开新窗口渲染 `blocksToHTML` + 内联打印样式（A4、衬线标题、代码块灰底），调 `window.print()`（用户可另存为 PDF；弹窗被拦截时 console.warn） |
| `downloadBlob(blob: Blob, filename: string): void` | — | 触发浏览器下载（`URL.createObjectURL` + `<a download>`） |

```ts
import { blocksToHTML, blocksToDocxBlob, downloadBlob } from "@thejoven_com/k3blocks";
const html = editor.blocksToHTML();
downloadBlob(await editor.blocksToDocxBlob(), "doc.docx");
editor.print({ title: "周报" });
```

## 导入 / Import

位于 `src/k3blocks/importers.ts`（包入口导出）：

| 函数 | editor 方法 | 说明 |
|---|---|---|
| `tryParseHTMLToBlocks(html: string): Block[]` | `editor.insertHTML(html)` | `DOMParser` 解析（**不执行任何脚本**，`script/style/template` 直接丢弃）：`h1-h6`（钳到 1-3 级）/ `p` / `ul` / `ol`（含 task-list `input[checkbox]` 与嵌套列表）/ `blockquote` / `pre`（`language-x` 类名识别语言）/ `hr` / `img` / `figure` / `table` / `iframe`→embed / 容器 `div` 递归 / 行内 `b,strong,i,em,u,s,strike,code,a,font/span color·background`；无法识别一律降级为 paragraph。editor 方法解析后 **append 到文档末尾** |
| `tryParseMarkdownToBlocks(md: string): Block[]` | `editor.insertMarkdown(md)` | 行级解析：`#`/`##`/`###`（更多 `#` 钳到 3 级）、`-`/`*`/`+` 与 `1.` 列表（含 `- [ ]` / `- [x]`）、`>` 引用（连续行合并）、```` ``` ```` 围栏（带语言；`mermaid` → diagram 块）、`---` 分割线、`$$` 公式、`| a | b |` 表格、`![alt](src)` 整行图片、行内 `**bold**` / `*italic*` / `` `code` `` / `~~strike~~` / `[text](href)`；连续文本行合并为一个段落、空行分块 |

## Emoji 网格菜单 / Emoji Picker

`useK3Editor({ emojiPicker?: boolean })`（默认 `true`）。文本块内输入 `:`（前一个字符须为行首 / 空白 / 标点）弹出网格建议菜单：

- 8 列网格，内置 280+ 常用 emoji 静态表（`EMOJI_LIST`，含中英文关键词如 `smile/笑`、`heart/心`），子序列模糊过滤，最多展示 48 条。
- `↑↓←→` 网格键盘导航、`↵`/`Tab` 插入（替换 `:query` 为普通文本 emoji）、`esc` 关闭；弹层定位复用 mention 菜单的 caret 锚点。
- 字典键：`emoji.empty`。

## 文件上传 / uploadFile

`useK3Editor({ uploadFile?: (file: File) => Promise<string> })`。

- image / pdf / embed 块的 URL 占位框带「选择文件」按钮（28px ghost）：选本地文件 → 有 `uploadFile` 用它（按钮变 28px loading 态）→ 否则回退 `FileReader` 读 dataURL。
- 图片**粘贴**（`clipboardData.files` 中的 `image/*`）与**拖拽进编辑器**同样走这条管道，自动在当前块后 / 落点处插入 image 块；image 块占位框内也可直接粘贴图片文件。
- 字典键：`upload.chooseFile` / `upload.uploading`。

## 自定义行内渲染 / inlineRenderers & inlineStyleRenderers

```tsx
<K3EditorView
  editor={editor}
  inlineRenderers={{
    badge: (node, editor) => <span className="badge">{node.text}</span>,
  }}
  inlineStyleRenderers={{
    fontSize: (v) => ({ fontSize: v }),
  }}
/>
```

- `inlineRenderers?: Record<string, (node: InlineContent & { type: string }, editor: K3Editor) => ReactNode>` — 未知 inline type（非 text/link/mention）的渲染口。inline.ts 序列化 / 反序列化对未知 inline type **原样保留**（JSON 进出无损；DOM 中以 `data-k3-inline="type"` 原子 span 标注并内嵌完整 JSON，经 portal 渲染该表返回的节点）。类型上自定义节点不进 `InlineContent` 联合（保持判别联合收窄向后兼容），构造时按 `K3CustomInlineContent` 断言即可。
- `inlineStyleRenderers?: Record<string, (value: string) => React.CSSProperties>` — `InlineStyles` 带索引签名，允许任意额外键；渲染 text 节点时 `styles[key]` 经此表转 CSS（上例使 `styles: { fontSize: "20px" }` 生效）。
- 两者都只影响渲染与 JSON 往返；Markdown 导出对未知类型降级取其 `text` / `label`。

## 附加 DOM 属性 / domAttributes

```tsx
<K3EditorView
  editor={editor}
  domAttributes={{
    editor: { "data-testid": "k3-editor" },
    block: { "data-analytics": "block" },
  }}
/>
```

`domAttributes?: { editor?: Record<string, string>; block?: Record<string, string> }` — `editor` 键值贴到组件根元素，`block` 键值贴到每个块行容器（`.k3-block-row`），用于测试锚点 / 分析埋点。

## 快捷键与 Markdown 规则

| 操作 | 按键 / 输入 |
|---|---|
| 加粗 / 斜体 / 下划线 | `⌘/Ctrl+B` / `I` / `U` |
| 行内代码 | `⌘/Ctrl+E` 或 `` `code` `` |
| 链接 | `⌘/Ctrl+K` |
| 撤销 / 重做 | `⌘/Ctrl+Z` · `⌘/Ctrl+Shift+Z` / `⌘/Ctrl+Y` |
| 拆块 / 块内换行 | `Enter` / `Shift+Enter` |
| 代码块内换行 / 跳出 | `Enter` / `⌘/Ctrl+Enter` |
| 缩进 / 提升（列表） | `Tab` / `Shift+Tab` |
| 标题 1-3 | `#` `##` `###` + `Space` |
| 无序 / 有序 / 待办列表 | `-` 或 `*` · `1.` · `[]` + `Space` |
| 引用 | `>` + `Space` |
| 代码块 / 分割线 | ` ``` ` · `---` + `Enter` |
| 行内加粗 | `**bold**` |
| 斜杠菜单 | `/`，`↑↓` 选择，`↵` 插入，`esc` 关闭 |
| @ 提及（配置 mentions 后） | `@`，`↑↓` 选择，`↵` 插入，`esc` 关闭 |
| emoji（emojiPicker 开启时） | `:`，`↑↓←→` 网格导航，`↵` 插入，`esc` 关闭 |

## 主题

CSS 变量与宿主页面同名，组件根元素通过 `data-theme="light|dark"` 切换；不传 `theme` 时完全继承宿主。动效遵循 `prefers-reduced-motion`。

## License

MPL-2.0。K3Blocks 是 100% 开源软件：MPL-2.0 允许在 commercial（含闭源）应用中使用；若你修改了 K3Blocks 源文件，期望你公开这些修改以回馈社区。详见仓库根目录 LICENSE。
