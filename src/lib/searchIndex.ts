/**
 * Static search index for the ⌘K command palette (design.md §6.2 / §8).
 * Every route on the site is listed here, grouped for the palette UI.
 */

export type SearchGroup = "Pages" | "Blocks" | "Examples" | "API";

export interface SearchEntry {
  /** Display title */
  title: string;
  /** Route path */
  path: string;
  /** Palette group */
  group: SearchGroup;
  /** Mono breadcrumb shown in the result row, e.g. "Docs / Foundations" */
  breadcrumb: string;
  /** Extra keywords for matching */
  keywords?: string[];
}

export const SEARCH_GROUPS: SearchGroup[] = ["Pages", "Blocks", "Examples", "API"];

export const searchIndex: SearchEntry[] = [
  // Pages
  { title: "Introduction", path: "/docs", group: "Pages", breadcrumb: "Docs", keywords: ["overview", "about"] },
  { title: "Getting Started", path: "/docs/getting-started", group: "Pages", breadcrumb: "Docs", keywords: ["install", "quickstart", "npm"] },
  { title: "Document Structure", path: "/docs/foundations/document-structure", group: "Pages", breadcrumb: "Docs / Foundations", keywords: ["model", "json", "block[]"] },
  { title: "Manipulating Blocks", path: "/docs/foundations/manipulating-blocks", group: "Pages", breadcrumb: "Docs / Foundations", keywords: ["insert", "update", "remove"] },
  { title: "Theming", path: "/docs/foundations/theming", group: "Pages", breadcrumb: "Docs / Foundations", keywords: ["dark", "light", "css variables"] },
  { title: "Blocks", path: "/blocks", group: "Pages", breadcrumb: "Blocks", keywords: ["types", "index"] },
  { title: "Examples", path: "/examples", group: "Pages", breadcrumb: "Examples", keywords: ["gallery", "demo"] },
  { title: "Playground", path: "/playground", group: "Pages", breadcrumb: "Playground", keywords: ["lab", "sandbox"] },

  // Blocks
  { title: "Paragraph", path: "/blocks/paragraph", group: "Blocks", breadcrumb: "Blocks", keywords: ["text", "/text"] },
  { title: "Heading", path: "/blocks/heading", group: "Blocks", breadcrumb: "Blocks", keywords: ["h1", "h2", "h3", "/h1"] },
  { title: "Bullet List", path: "/blocks/bullet-list", group: "Blocks", breadcrumb: "Blocks", keywords: ["ul", "/bullet"] },
  { title: "Numbered List", path: "/blocks/numbered-list", group: "Blocks", breadcrumb: "Blocks", keywords: ["ol", "/numbered"] },
  { title: "To-do List", path: "/blocks/todo-list", group: "Blocks", breadcrumb: "Blocks", keywords: ["check", "checkbox", "/todo"] },
  { title: "Quote", path: "/blocks/quote", group: "Blocks", breadcrumb: "Blocks", keywords: ["blockquote", "/quote"] },
  { title: "Code Block", path: "/blocks/code-block", group: "Blocks", breadcrumb: "Blocks", keywords: ["codeblock", "/code"] },
  { title: "Divider", path: "/blocks/divider", group: "Blocks", breadcrumb: "Blocks", keywords: ["hr", "separator", "/divider"] },
  { title: "Image", path: "/blocks/image", group: "Blocks", breadcrumb: "Blocks", keywords: ["picture", "media", "/image"] },

  // Features
  { title: "Built-in Blocks", path: "/docs/features/built-in-blocks", group: "Pages", breadcrumb: "Docs / Features", keywords: ["overview", "types", "whitelist", "blocktypes"] },
  { title: "Typography", path: "/docs/features/typography", group: "Pages", breadcrumb: "Docs / Features", keywords: ["heading", "paragraph", "quote", "markdown rules"] },
  { title: "List Types", path: "/docs/features/list-types", group: "Pages", breadcrumb: "Docs / Features", keywords: ["bullet", "numbered", "todo", "nesting", "tab"] },
  { title: "Tables", path: "/docs/features/tables", group: "Pages", breadcrumb: "Docs / Features", keywords: ["table", "rows", "grid", "biaoge"] },
  { title: "Embeds", path: "/docs/features/embeds", group: "Pages", breadcrumb: "Docs / Features", keywords: ["embed", "iframe", "youtube", "vimeo", "bilibili", "image"] },
  { title: "Code Blocks", path: "/docs/features/code-blocks", group: "Pages", breadcrumb: "Docs / Features", keywords: ["codeblock", "language", "copy", "```"] },
  { title: "Math Equations", path: "/docs/features/math", group: "Pages", breadcrumb: "Docs / Features", keywords: ["math", "katex", "latex", "gongshi", "公式"] },
  { title: "Diagrams", path: "/docs/features/diagrams", group: "Pages", breadcrumb: "Docs / Features", keywords: ["diagram", "mermaid", "flowchart", "tubiao", "图表"] },
  { title: "Inline Content", path: "/docs/features/inline-content", group: "Pages", breadcrumb: "Docs / Features", keywords: ["inline", "styles", "bold", "link", "formatting toolbar"] },
  { title: "Custom Blocks", path: "/docs/features/custom-blocks", group: "Pages", breadcrumb: "Docs / Features", keywords: ["custom", "blockrenderers", "renderer", "callout"] },

  // Examples
  { title: "Controlled Editor", path: "/examples/controlled", group: "Examples", breadcrumb: "Examples", keywords: ["state", "onchange"] },
  { title: "Read-only", path: "/examples/read-only", group: "Examples", breadcrumb: "Examples", keywords: ["viewer", "editable"] },
  { title: "JSON Round-trip", path: "/examples/json-round-trip", group: "Examples", breadcrumb: "Examples", keywords: ["persist", "import", "export"] },
  { title: "Dark Theme", path: "/examples/dark-theme", group: "Examples", breadcrumb: "Examples", keywords: ["theme", "css"] },
  { title: "Minimal Setup", path: "/examples/minimal", group: "Examples", breadcrumb: "Examples", keywords: ["bare", "simple"] },
  { title: "Displaying Document JSON", path: "/examples/displaying-document-json", group: "Examples", breadcrumb: "Examples", keywords: ["json", "live", "onchange"] },
  { title: "Multi-Column Blocks", path: "/examples/multi-column-blocks", group: "Examples", breadcrumb: "Examples", keywords: ["columns", "columnlist", "layout"] },
  { title: "Default Schema Showcase", path: "/examples/default-schema-showcase", group: "Examples", breadcrumb: "Examples", keywords: ["schema", "blocks", "all types"] },
  { title: "Removing Default Blocks from Schema", path: "/examples/removing-default-blocks", group: "Examples", breadcrumb: "Examples", keywords: ["blocktypes", "whitelist", "schema"] },
  { title: "Manipulating Blocks", path: "/examples/manipulating-blocks", group: "Examples", breadcrumb: "Examples", keywords: ["insert", "update", "remove", "undo"] },
  { title: "Displaying Selected Blocks", path: "/examples/displaying-selected-blocks", group: "Examples", breadcrumb: "Examples", keywords: ["selection", "onselectionchange"] },
  { title: "Use with Ariakit", path: "/examples/use-with-ariakit", group: "Examples", breadcrumb: "Examples", keywords: ["ariakit", "popover", "dialog"] },
  { title: "Use with ShadCN", path: "/examples/use-with-shadcn", group: "Examples", breadcrumb: "Examples", keywords: ["shadcn", "popover", "dialog"] },
  { title: "Localization (i18n)", path: "/examples/localization-i18n", group: "Examples", breadcrumb: "Examples", keywords: ["i18n", "dictionary", "zhcn", "enus"] },
  { title: "Multi-Editor Setup", path: "/examples/multi-editor-setup", group: "Examples", breadcrumb: "Examples", keywords: ["multi", "instances", "undo"] },
  { title: "Custom Paste Handler", path: "/examples/custom-paste-handler", group: "Examples", breadcrumb: "Examples", keywords: ["paste", "clipboard", "image"] },
  { title: "Custom Schemas", path: "/examples/custom-schemas", group: "Examples", breadcrumb: "Examples", keywords: ["schema", "blocktypes", "blockrenderers", "dictionary"] },
  { title: "Alert Block", path: "/examples/alert-block", group: "Examples", breadcrumb: "Examples", keywords: ["custom block", "alert", "callout", "blockrenderers"] },
  { title: "Mentions Menu", path: "/examples/mentions-menu", group: "Examples", breadcrumb: "Examples", keywords: ["mentions", "@", "chip"] },
  { title: "Font Style", path: "/examples/font-style", group: "Examples", breadcrumb: "Examples", keywords: ["textcolor", "backgroundcolor", "highlight", "color"] },
  { title: "PDF Block", path: "/examples/pdf-block", group: "Examples", breadcrumb: "Examples", keywords: ["pdf", "iframe", "document"] },
  { title: "Alert Block with Full UX", path: "/examples/alert-block-full-ux", group: "Examples", breadcrumb: "Examples", keywords: ["custom block", "alert", "updateblock", "a11y"] },
  { title: "Toggleable Custom Blocks", path: "/examples/toggleable-custom-blocks", group: "Examples", breadcrumb: "Examples", keywords: ["toggle", "collapse", "custom block"] },
  { title: "Configuring Default Blocks", path: "/examples/configuring-default-blocks", group: "Examples", breadcrumb: "Examples", keywords: ["blockconfig", "heading", "codeblock", "defaultlanguage"] },
  { title: "Math Block", path: "/examples/math-block", group: "Examples", breadcrumb: "Examples", keywords: ["math", "katex", "latex"] },
  { title: "Diagram Block", path: "/examples/diagram-block", group: "Examples", breadcrumb: "Examples", keywords: ["diagram", "mermaid", "flowchart", "gantt"] },
  { title: "Source with Preview Blocks", path: "/examples/source-with-preview-blocks", group: "Examples", breadcrumb: "Examples", keywords: ["custom block", "iframe", "srcdoc", "preview", "html"] },
  { title: "Code Block Theme", path: "/examples/code-block-theme", group: "Examples", breadcrumb: "Examples", keywords: ["codeblock", "highlight", "css variables", "theme"] },

  // API
  { title: "API Reference", path: "/docs/api", group: "API", breadcrumb: "Docs", keywords: ["reference"] },
  { title: "useK3Editor", path: "/docs/api", group: "API", breadcrumb: "Docs / API", keywords: ["hook", "initialcontent", "editable", "placeholder"] },
  { title: "K3EditorView", path: "/docs/api", group: "API", breadcrumb: "Docs / API", keywords: ["component", "theme", "onchange"] },
  { title: "editor.document", path: "/docs/api", group: "API", breadcrumb: "Docs / API", keywords: ["block[]", "json"] },
  { title: "insertBlocks / updateBlock / removeBlocks", path: "/docs/api", group: "API", breadcrumb: "Docs / API", keywords: ["methods", "ops"] },
  { title: "undo / redo", path: "/docs/api", group: "API", breadcrumb: "Docs / API", keywords: ["history"] },
  { title: "blocksToMarkdown", path: "/docs/api", group: "API", breadcrumb: "Docs / API", keywords: ["export", "markdown"] },

  // Docs v5 — Export/Import/Advanced/Customization/React/Styling/Reference
  { title: "Export Markdown", path: "/docs/export/markdown", group: "Pages", breadcrumb: "Docs / Export", keywords: ["markdown", "export", "download"] },
  { title: "Export HTML", path: "/docs/export/html", group: "Pages", breadcrumb: "Docs / Export", keywords: ["html", "export", "blocksToHTML"] },
  { title: "Export PDF", path: "/docs/export/pdf", group: "Pages", breadcrumb: "Docs / Export", keywords: ["pdf", "print", "export"] },
  { title: "Export DOCX", path: "/docs/export/docx", group: "Pages", breadcrumb: "Docs / Export", keywords: ["docx", "word", "export"] },
  { title: "Export Email", path: "/docs/export/email", group: "Pages", breadcrumb: "Docs / Export", keywords: ["email", "html", "export"] },
  { title: "Export ODT", path: "/docs/export/odt", group: "Pages", breadcrumb: "Docs / Export", keywords: ["odt", "openoffice", "export"] },
  { title: "Import HTML", path: "/docs/import/html", group: "Pages", breadcrumb: "Docs / Import", keywords: ["html", "import", "parse"] },
  { title: "Import Markdown", path: "/docs/import/markdown", group: "Pages", breadcrumb: "Docs / Import", keywords: ["markdown", "import", "parse"] },
  { title: "Server-side Processing", path: "/docs/advanced/server-side-processing", group: "Pages", breadcrumb: "Docs / Advanced", keywords: ["node", "server", "ssr"] },
  { title: "Localization (i18n)", path: "/docs/advanced/localization", group: "Pages", breadcrumb: "Docs / Advanced", keywords: ["i18n", "dictionary", "zhCN", "enUS"] },
  { title: "Extensions", path: "/docs/advanced/extensions", group: "Pages", breadcrumb: "Docs / Advanced", keywords: ["extensions", "plugins", "extension points"] },
  { title: "Custom Schemas", path: "/docs/customization/custom-schemas", group: "Pages", breadcrumb: "Docs / Customization", keywords: ["schema", "blockTypes", "blockConfig"] },
  { title: "Custom Inline Content", path: "/docs/customization/custom-inline-content", group: "Pages", breadcrumb: "Docs / Customization", keywords: ["inlineRenderers", "inline content", "tag"] },
  { title: "Custom Styles", path: "/docs/customization/custom-styles", group: "Pages", breadcrumb: "Docs / Customization", keywords: ["inlineStyleRenderers", "fontSize", "styles"] },
  { title: "Source With Preview Blocks", path: "/docs/customization/source-with-preview-blocks", group: "Pages", breadcrumb: "Docs / Customization", keywords: ["preview", "iframe", "htmlPreview"] },
  { title: "React Overview", path: "/docs/react/overview", group: "Pages", breadcrumb: "Docs / React", keywords: ["react", "hooks", "overview"] },
  { title: "Formatting Toolbar", path: "/docs/react/formatting-toolbar", group: "Pages", breadcrumb: "Docs / React", keywords: ["toolbar", "bold", "color"] },
  { title: "Grid Suggestion Menus", path: "/docs/react/grid-suggestion-menus", group: "Pages", breadcrumb: "Docs / React", keywords: ["emoji", "grid", "picker"] },
  { title: "Link Toolbar", path: "/docs/react/link-toolbar", group: "Pages", breadcrumb: "Docs / React", keywords: ["link", "href", "cmd+k"] },
  { title: "File Panel", path: "/docs/react/file-panel", group: "Pages", breadcrumb: "Docs / React", keywords: ["upload", "file", "uploadFile"] },
  { title: "Block Side Menu", path: "/docs/react/block-side-menu", group: "Pages", breadcrumb: "Docs / React", keywords: ["drag", "side menu", "handle"] },
  { title: "Suggestion Menus", path: "/docs/react/suggestion-menus", group: "Pages", breadcrumb: "Docs / React", keywords: ["slash", "mention", "menu"] },
  { title: "Themes", path: "/docs/styling/themes", group: "Pages", breadcrumb: "Docs / Styling", keywords: ["theme", "dark", "light"] },
  { title: "Overriding CSS", path: "/docs/styling/overriding-css", group: "Pages", breadcrumb: "Docs / Styling", keywords: ["css", "variables", "override"] },
  { title: "DOM Attributes", path: "/docs/styling/dom-attributes", group: "Pages", breadcrumb: "Docs / Styling", keywords: ["domAttributes", "data-testid"] },
  { title: "Reference Overview", path: "/docs/reference/overview", group: "Pages", breadcrumb: "Docs / Reference", keywords: ["editor", "methods", "api"] },
  { title: "Manipulating Content", path: "/docs/reference/manipulating-content", group: "Pages", breadcrumb: "Docs / Reference", keywords: ["insertBlocks", "updateBlock", "removeBlocks"] },
  { title: "Cursor & Selections", path: "/docs/reference/cursor-selections", group: "Pages", breadcrumb: "Docs / Reference", keywords: ["cursor", "selection", "focus"] },
  { title: "Yjs Utilities", path: "/docs/reference/yjs-utilities", group: "Pages", breadcrumb: "Docs / Reference", keywords: ["yjs", "collaboration", "roadmap"] },
  { title: "Events", path: "/docs/reference/events", group: "Pages", breadcrumb: "Docs / Reference", keywords: ["onChange", "events", "subscribe"] },
];

/** Case-insensitive substring match over title, breadcrumb and keywords. */
export function filterSearchIndex(query: string): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return searchIndex;
  return searchIndex.filter((entry) => {
    if (entry.title.toLowerCase().includes(q)) return true;
    if (entry.breadcrumb.toLowerCase().includes(q)) return true;
    return entry.keywords?.some((k) => k.toLowerCase().includes(q)) ?? false;
  });
}
