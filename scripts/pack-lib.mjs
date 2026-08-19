import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rootPkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const dep = (name) => rootPkg.dependencies[name];

const pkg = {
  name: "@thejoven_com/k3blocks",
  version: rootPkg.version,
  description: "为 React 而生的 Notion 风格块编辑器",
  license: "MPL-2.0",
  type: "module",
  main: "./index.cjs",
  module: "./index.js",
  types: "./index.d.ts",
  exports: {
    ".": {
      types: "./index.d.ts",
      import: "./index.js",
      require: "./index.cjs",
    },
    "./style.css": "./style.css",
  },
  sideEffects: ["**/*.css"],
  peerDependencies: {
    react: ">=18",
    "react-dom": ">=18",
  },
  dependencies: {
    docx: dep("docx"),
    jszip: dep("jszip"),
    katex: dep("katex"),
    "lucide-react": dep("lucide-react"),
    mermaid: dep("mermaid"),
    prismjs: dep("prismjs"),
  },
  publishConfig: {
    access: "public",
    registry: "https://registry.npmjs.org/",
  },
  repository: {
    type: "git",
    url: "git+https://github.com/thejoven/k3blocks.git",
  },
  homepage: "https://github.com/thejoven/k3blocks#readme",
  keywords: ["react", "block-editor", "notion", "wysiwyg", "editor"],
};

writeFileSync(resolve(root, "lib/package.json"), `${JSON.stringify(pkg, null, 2)}\n`);
copyFileSync(resolve(root, "LICENSE"), resolve(root, "lib/LICENSE"));
copyFileSync(resolve(root, "src/k3blocks/README.md"), resolve(root, "lib/README.md"));
console.log(`packed @thejoven_com/k3blocks@${pkg.version} → lib/`);
