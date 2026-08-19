import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

const k3Root = path.resolve(__dirname, "src/k3blocks");

export default defineConfig({
  plugins: [
    react(),
    dts({
      entryRoot: k3Root,
      tsconfigPath: path.resolve(__dirname, "tsconfig.lib.json"),
      include: ["src/k3blocks"],
      exclude: ["src/k3blocks/__dev__"],
    }),
  ],
  publicDir: false,
  build: {
    outDir: "lib",
    emptyOutDir: true,
    lib: {
      entry: path.resolve(k3Root, "index.ts"),
      name: "K3Blocks",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: (id) => {
        if (
          id === "react" ||
          id === "react-dom" ||
          id === "react/jsx-runtime" ||
          id === "lucide-react" ||
          id === "katex" ||
          id === "mermaid" ||
          id === "docx" ||
          id === "jszip" ||
          id === "prismjs"
        ) {
          return true;
        }
        return id.startsWith("prismjs/") || id.startsWith("katex/");
      },
      output: {
        assetFileNames: (asset) =>
          asset.name?.endsWith(".css") ? "style.css" : "[name][extname]",
        globals: { react: "React", "react-dom": "ReactDOM" },
      },
    },
  },
});
