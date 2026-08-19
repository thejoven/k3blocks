# K3Blocks

为 React 而生的 Notion 风格块编辑器。

K3Blocks 是一套可嵌入的 React 组件：斜杠菜单、选区格式化工具栏、拖拽排序、Markdown 快捷键、中英双语、明暗主题，以及可 JSON 序列化的文档模型。实现为纯 React + TypeScript，不依赖第三方富文本引擎。视觉上采用暗色优先的近黑表面、1px 发丝线、Geist / Geist Mono 与单一蓝色强调色。

本仓库包含：

- **编辑器组件包**（`src/k3blocks/`）— 可单独发布为 `@thejoven_com/k3blocks`
- **文档演示站** — 首页、Docs、Blocks、Examples、Playground

## 本地运行

```bash
# 要求 Node.js 20+
npm install
npm run dev        # → http://localhost:3000
npm run build      # 产物在 dist/
npm run preview    # 预览生产构建 → http://localhost:4173
```

> 路由使用 HashRouter（URL 形如 `/#/examples/basic-setup`），任意静态服务器上二级页面直达/刷新都不会 404。

## 目录结构

```
src/
  k3blocks/        # ★ 编辑器组件包（可单独发布为 @thejoven_com/k3blocks）
    index.ts       # 公共导出：useK3Editor / K3EditorView / zhCN / enUS / 类型
    types.ts       # Block / InlineContent / K3Editor / K3Dictionary 等
    schema.ts      # 块规格注册表（含 columnList 分栏）
    store.ts       # 文档模型 + 自维护 undo/redo 栈
    i18n.ts        # 中英双语字典 + mergeDictionary
    blocks/        # 9+2 种块渲染器
    plugins/       # slashMenu / formattingToolbar / sideMenu / markdownRules / dragDrop
    theme.css      # light/dark 双主题 CSS 变量
    README.md      # 组件 API 文档
  components/      # 站点共享组件（Topbar / CommandPalette / CodeBlock / …）
  pages/           # 路由页面（docs / blocks / examples / playground / home）
  examples/        # 19 个可运行示例
  lib/             # searchIndex / sampleDoc / utils
```

## 组件快速上手

```tsx
import { useK3Editor, K3EditorView } from "@/k3blocks";

export default function App() {
  const editor = useK3Editor({
    onChange: (e) => localStorage.setItem("doc", JSON.stringify(e.document)),
  });
  return <K3EditorView editor={editor} theme="dark" />;
}
```

更多能力：`blockTypes` 白名单、`dictionary` i18n、`onSelectionChange`、`pasteHandler`、`columnList` 分栏——详见 `src/k3blocks/README.md` 与站内 Examples。

## 技术栈

React 19 · TypeScript · Vite 7 · Tailwind CSS v3.4 · framer-motion · lucide-react · @ariakit/react · Geist/Geist Mono（fontsource）

## 将组件发布到 npm

包名 [`@thejoven_com/k3blocks`](https://www.npmjs.com/package/@thejoven_com/k3blocks)，组织 `thejoven_com`。文档站根包是 `private`，**不要**在仓库根目录执行 `npm publish`（会把整站打上去）。真正发布的是 `lib/` 里的组件库产物。

本机安装源可以继续用 npmmirror；发布必须走 `https://registry.npmjs.org/`（脚本已写死）。

### 一次性：写入官方源 token

1. 打开 [npm Access Tokens](https://www.npmjs.com/settings/~/tokens) → Generate New Token → **Granular Access Token**
   - Organization：`thejoven_com`
   - Permissions：Read and write
   - 勾选 Automation / bypass 2FA（否则 publish 会要 OTP）
2. 只把 token 绑到官方源，**不要改**默认 `registry`：

```ini
# ~/.npmrc
//registry.npmjs.org/:_authToken=npm_你的token
```

```bash
npm whoami --registry=https://registry.npmjs.org/   # 应打印 jwenlee
```

token 不要提交进仓库，不要贴到聊天里。本地项目 `.npmrc` 已被 gitignore。

### 日常发版（一条命令）

```bash
npm run release:patch   # 1.5.0 → 1.5.1  bugfix
npm run release:minor   # 1.5.0 → 1.6.0  新能力
npm run release:major   # 1.5.0 → 2.0.0  breaking
```

脚本会：递增 `package.json` 版本 → 同步 `src/lib/version.ts` → `vite` 构建 `lib/` → `npm publish ./lib` 到官方源。

版本已改、只想再发一次：

```bash
npm run publish:lib
```

确认：

```bash
npm view @thejoven_com/k3blocks version --registry=https://registry.npmjs.org/
```

预发布：`npm run build:lib && npm publish ./lib --tag beta --access public --registry=https://registry.npmjs.org/`。

### 用户侧接入

```bash
npm i @thejoven_com/k3blocks
```

```tsx
import { useK3Editor, K3EditorView } from "@thejoven_com/k3blocks";
import "@thejoven_com/k3blocks/style.css";

export default function App() {
  const editor = useK3Editor();
  return <K3EditorView editor={editor} theme="dark" slashMenu formattingToolbar sideMenu />;
}
```

组件不内置字体文件，默认继承宿主的 Geist / Geist Mono（或任意系统字体栈）；`theme` 省略时同样继承宿主页面的 CSS 变量。

## License

K3Blocks is 100% Open Source Software. Source code in this repository is
covered by the Mozilla Public License Version 2.0 (MPL-2.0). The MPL-2.0
license allows you to use K3Blocks in commercial (and closed-source)
applications. If you make changes to the K3Blocks source files, you're
expected to publish these changes so the wider community can benefit as well.

See [LICENSE](./LICENSE) for the full license text.
