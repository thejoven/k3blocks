# K3Blocks — Notion 风格块编辑器 + 文档站

K3Blocks 是一个 Notion 风格的 React 块编辑器组件（对标 [BlockNote](https://github.com/TypeCellOS/BlockNote)），设计语言致敬 [cladd](https://cladd.io/)：dark-first 近黑表面、1px 发丝线、Geist + Geist Mono、单一蓝色 accent、"surfaces not shadows"。

本仓库 = **可发布的编辑器组件包**（`src/k3blocks/`）+ **完整文档演示站**（首页 / Docs / Blocks / Examples / Playground）。

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
  k3blocks/        # ★ 编辑器组件包（可单独发布为 @k3/blocks）
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

`src/k3blocks/` 是一个自包含的组件包，可以脱离文档站单独发布为 `@k3/blocks`。

### 1. 库化构建（vite lib mode）

以 `src/k3blocks/index.ts` 为入口，新增 `vite.lib.config.ts`，用 `vite build --mode lib` 构建：

```ts
// vite.lib.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/k3blocks/index.ts"),
      name: "K3Blocks",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
    },
    // 样式单独产出 dist/style.css（对应 package.json exports 的 "./style.css"）
    cssCodeSplit: false,
    rollupOptions: {
      // 宿主应用提供的依赖一律 external，不打进 bundle
      external: ["react", "react-dom", "react/jsx-runtime", "katex", "mermaid"],
      output: { globals: { react: "React", "react-dom": "ReactDOM" } },
    },
  },
});
```

> `katex` / `mermaid` 标为 external（mermaid 在组件内本就是 dynamic import，可选标为 peer 或保持外置由用户按需安装）。
> 备选方案：用 [tsup](https://tsup.egoist.dev) 一行搞定 —— `tsup src/k3blocks/index.ts --format esm,cjs --dts --external react,react-dom,katex,mermaid`。

构建脚本：

```json
{ "scripts": { "build:lib": "vite build --mode lib --config vite.lib.config.ts" } }
```

### 2. package.json 发布配置

发布前把包级 `package.json` 调整为（站点仓库可放在独立的发布目录，或发布时生成）：

```json
{
  "name": "@k3/blocks",
  "version": "1.4.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./style.css": "./dist/style.css"
  },
  "files": ["dist"],
  "sideEffects": ["**/*.css"],
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  },
  "publishConfig": { "access": "public" },
  "scripts": {
    "prepublishOnly": "npm run build:lib"
  }
}
```

- `sideEffects: ["**/*.css"]` 保证主题 CSS 不被宿主 bundler tree-shake 掉。
- 类型声明可用 `vite-plugin-dts` 或 tsup 的 `--dts` 生成到 `dist/index.d.ts`。

### 3. 样式与字体

主题变量在 `src/k3blocks/theme.css`，需随包单独导出，用户侧显式引入一次：

```ts
import "@k3/blocks/style.css";
```

组件不内置字体文件，默认继承宿主的 Geist / Geist Mono（或任意系统字体栈）；`theme` 省略时同样继承宿主页面的 CSS 变量。

### 4. 发布流程

```bash
npm login                          # 登录 npm 账号
npm version patch                  # 递增版本并打 git tag（minor / major 同理）
npm publish --access public        # scoped 包首次发布必须带 --access public
```

用户侧接入（5 行）：

```tsx
import { useK3Editor, K3EditorView } from "@k3/blocks";
import "@k3/blocks/style.css";

export default function App() {
  const editor = useK3Editor();
  return <K3EditorView editor={editor} theme="dark" slashMenu formattingToolbar sideMenu />;
}
```

```bash
npm i @k3/blocks
```

### 5. 版本管理与 CHANGELOG

- 遵循 [SemVer](https://semver.org/lang/zh-CN/)：bugfix → `patch`，新能力 → `minor`，breaking API（如 `useK3Editor` 选项重命名）→ `major`。
- 维护根目录 `CHANGELOG.md`（建议 [Keep a Changelog](https://keepachangelog.com/) 格式），每次发布记录 Added / Changed / Fixed。
- 预发布用 dist-tag，不污染 latest：`npm publish --tag beta`（版本号如 `1.5.0-beta.0`，用 `npm version prerelease --preid=beta` 生成）；用户侧 `npm i @k3/blocks@beta` 试用，稳定后 `npm dist-tag add @k3/blocks@1.5.0 latest`。

## License

K3Blocks is 100% Open Source Software. Source code in this repository is
covered by the Mozilla Public License Version 2.0 (MPL-2.0). The MPL-2.0
license allows you to use K3Blocks in commercial (and closed-source)
applications. If you make changes to the K3Blocks source files, you're
expected to publish these changes so the wider community can benefit as well.

See [LICENSE](./LICENSE) for the full license text.
