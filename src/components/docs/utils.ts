import { useEffect, useState } from "react";
import type { InlineContent, InlineStyles, K3Editor } from "@/k3blocks";

/** Shorthand for a text inline node in seed documents. */
export function txt(text: string, styles?: InlineStyles): InlineContent {
  return styles ? { type: "text", text, styles } : { type: "text", text };
}

/** Shorthand for a link inline node. */
export function lnk(href: string, text: string): InlineContent {
  return { type: "link", href, content: [{ type: "text", text }] };
}

/**
 * Ticks a counter on every editor change (editor.onChange subscription).
 * Use it to re-read `editor.document` / `canUndo` / `canRedo` in React state.
 */
export function useEditorVersion(editor: K3Editor): number {
  const [version, setVersion] = useState(0);
  useEffect(() => editor.onChange(() => setVersion((v) => v + 1)), [editor]);
  return version;
}
