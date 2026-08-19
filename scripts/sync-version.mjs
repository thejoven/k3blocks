import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const version = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")).version;
writeFileSync(
  resolve(root, "src/lib/version.ts"),
  `/** 全站统一版本号 —— 与 package.json "version" 保持同步 */\nexport const VERSION = "${version}";\n`,
);
console.log(`synced src/lib/version.ts → ${version}`);
