/**
 * K3Blocks — 导入器：HTML / Markdown → Block[]。
 * HTML 走 DOMParser（不执行任何脚本）；无法识别的结构一律降级为 paragraph。
 */
import { domToInline } from "./inline";
import { createBlock } from "./store";
import type { Block, InlineContent, InlineStyles, PartialBlock } from "./types";

/* ------------------------------- HTML → Block ------------------------------- */

function htmlChildrenToBlocks(el: Element): PartialBlock[] {
  const out: PartialBlock[] = [];
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent ?? "").replace(/\s+/g, " ").trim();
      if (text) out.push({ type: "paragraph", content: text });
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const block = elementToBlock(node as HTMLElement);
    if (Array.isArray(block)) out.push(...block);
    else if (block) out.push(block);
  }
  return out;
}

/** <li> → 列表项块（含 task-list checkbox 识别与嵌套列表） */
function listItemToBlock(li: HTMLElement, ordered: boolean): PartialBlock {
  // task-list：li 内首个 input[type=checkbox]
  const checkbox = li.querySelector(":scope > input[type='checkbox'], :scope > p > input[type='checkbox']");
  const nestedLists = Array.from(li.children).filter((c) => c.tagName === "UL" || c.tagName === "OL");
  // 内联内容：剔除嵌套列表后解析
  const clone = li.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("input[type='checkbox']").forEach((c) => c.remove());
  Array.from(clone.children)
    .filter((c) => c.tagName === "UL" || c.tagName === "OL")
    .forEach((c) => c.remove());
  const content = domToInline(clone);
  const children: PartialBlock[] = [];
  for (const nl of nestedLists) children.push(...listToBlocks(nl as HTMLElement));
  if (checkbox) {
    const checked = (checkbox as HTMLInputElement).checked || checkbox.hasAttribute("checked");
    return { type: "checkListItem", props: { checked }, content, children };
  }
  return { type: ordered ? "numberedListItem" : "bulletListItem", props: {}, content, children };
}

function listToBlocks(list: HTMLElement): PartialBlock[] {
  const ordered = list.tagName === "OL";
  return Array.from(list.children)
    .filter((c) => c.tagName === "LI")
    .map((li) => listItemToBlock(li as HTMLElement, ordered));
}

function tableToBlock(table: HTMLElement): PartialBlock {
  const rows: string[][] = [];
  table.querySelectorAll("tr").forEach((tr) => {
    const cells = Array.from(tr.querySelectorAll("th,td")).map((c) => (c.textContent ?? "").trim());
    if (cells.length) rows.push(cells);
  });
  if (!rows.length) rows.push([""]);
  const cols = Math.max(...rows.map((r) => r.length));
  return { type: "table", props: { rows: rows.map((r) => (r.length < cols ? [...r, ...Array(cols - r.length).fill("")] : r)) } };
}

/** 单个元素 → 块（容器元素返回数组）；无法识别返回 null（由调用方降级） */
function elementToBlock(el: HTMLElement): PartialBlock | PartialBlock[] | null {
  const tag = el.tagName;
  if (/^H[1-6]$/.test(tag)) {
    const level = Math.min(3, Math.max(1, Number(tag[1])));
    return { type: "heading", props: { level }, content: domToInline(el) };
  }
  switch (tag) {
    case "P":
      return { type: "paragraph", content: domToInline(el) };
    case "UL":
    case "OL":
      return listToBlocks(el);
    case "BLOCKQUOTE": {
      // 引用内若是多个子块：首个作为 quote，其余作为 children
      const children = htmlChildrenToBlocks(el);
      const inline = domToInline(el);
      if (children.length && children.some((c) => c.type !== "paragraph")) {
        const [first, ...rest] = children;
        return { type: "quote", props: {}, content: first.content ?? [], children: rest };
      }
      return { type: "quote", props: {}, content: inline };
    }
    case "PRE": {
      const code = el.querySelector("code");
      const cls = code?.className ?? el.className ?? "";
      const m = cls.match(/language-([\w-]+)/);
      const text = (code ?? el).textContent ?? "";
      return { type: "codeBlock", props: { language: m?.[1] ?? "text" }, content: text.replace(/\n$/, "") };
    }
    case "HR":
      return { type: "divider", props: {} };
    case "IMG": {
      const src = el.getAttribute("src") ?? "";
      if (!src) return null;
      return { type: "image", props: { src, alt: el.getAttribute("alt") ?? "", caption: "" } };
    }
    case "FIGURE": {
      const img = el.querySelector("img");
      if (img) {
        const src = img.getAttribute("src") ?? "";
        if (!src) return null;
        const caption = el.querySelector("figcaption")?.textContent?.trim() ?? "";
        return { type: "image", props: { src, alt: img.getAttribute("alt") ?? "", caption } };
      }
      return htmlChildrenToBlocks(el);
    }
    case "TABLE":
      return tableToBlock(el);
    case "IFRAME": {
      const src = el.getAttribute("src") ?? "";
      if (!src) return null;
      return { type: "embed", props: { url: src } };
    }
    case "DIV":
    case "SECTION":
    case "ARTICLE":
    case "MAIN":
    case "HEADER":
    case "FOOTER":
    case "BODY": {
      // 容器：有块级子元素则递归，否则按段落处理
      if (el.querySelector("p,h1,h2,h3,h4,h5,h6,ul,ol,blockquote,pre,table,div,figure,hr,img,iframe")) {
        return htmlChildrenToBlocks(el);
      }
      return { type: "paragraph", content: domToInline(el) };
    }
    case "BR":
    case "SCRIPT":
    case "STYLE":
    case "TEMPLATE":
    case "NOSCRIPT":
      return null;
    default:
      // 无法识别：有文本则降级为段落
      if ((el.textContent ?? "").trim()) return { type: "paragraph", content: domToInline(el) };
      return null;
  }
}

/** HTML 字符串 → Block[]（DOMParser 解析，不执行脚本；无法识别一律 paragraph） */
export function tryParseHTMLToBlocks(html: string): Block[] {
  if (typeof html !== "string" || !html.trim()) return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  const partials = htmlChildrenToBlocks(doc.body);
  return partials.map((p) => createBlock(p));
}

/* ----------------------------- Markdown → Block ----------------------------- */

/** 行内 Markdown → InlineContent[]：**bold** *italic* `code` ~~strike~~ [text](href) */
export function parseInlineMarkdown(src: string): InlineContent[] {
  const out: InlineContent[] = [];
  // token 正则：code > bold > strike > italic > link > 纯文本
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(~~[^~]+~~)|(\*[^*\n]+\*)|(\[[^\]\n]*\]\([^)\n]*\))/g;
  let last = 0;
  const pushText = (text: string, styles?: InlineStyles) => {
    if (!text) return;
    const prev = out[out.length - 1];
    if (!styles && prev && prev.type === "text" && !prev.styles) {
      prev.text += text;
    } else {
      out.push({ type: "text", text, ...(styles ? { styles } : {}) });
    }
  };
  for (let m = re.exec(src); m; m = re.exec(src)) {
    pushText(src.slice(last, m.index));
    const token = m[0];
    if (m[1]) pushText(token.slice(1, -1), { code: true });
    else if (m[2]) pushText(token.slice(2, -2), { bold: true });
    else if (m[3]) pushText(token.slice(2, -2), { strike: true });
    else if (m[4]) pushText(token.slice(1, -1), { italic: true });
    else if (m[5]) {
      const lm = token.match(/^\[([^\]]*)\]\(([^)]*)\)$/);
      if (lm) {
        const inner = parseInlineMarkdown(lm[1]);
        out.push({ type: "link", href: lm[2].trim(), content: inner.length ? inner : [{ type: "text", text: lm[1] }] });
      }
    }
    last = m.index + token.length;
  }
  pushText(src.slice(last));
  return out;
}

function isTableSeparator(line: string): boolean {
  return /^\s*\|?[\s:|-]+\|?\s*$/.test(line) && line.includes("-");
}

function parseTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((c) => c.trim().replace(/\\\|/g, "|"));
}

/** Markdown 字符串 → Block[]（行级解析；空行分块，连续文本行合并为一个段落） */
export function tryParseMarkdownToBlocks(md: string): Block[] {
  if (typeof md !== "string" || !md.trim()) return [];
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const blocks: PartialBlock[] = [];
  let i = 0;

  const flushParagraph = (buf: string[]) => {
    if (!buf.length) return;
    blocks.push({ type: "paragraph", content: parseInlineMarkdown(buf.join("\n")) });
    buf.length = 0;
  };

  const paraBuf: string[] = [];
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 空行：段落分块
    if (!trimmed) {
      flushParagraph(paraBuf);
      i++;
      continue;
    }

    // 围栏代码块 ```lang（mermaid → diagram 块，与 Markdown 导出对称）
    const fence = trimmed.match(/^```(\S*)\s*$/);
    if (fence) {
      flushParagraph(paraBuf);
      const lang = fence[1] ?? "";
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i].trim())) {
        body.push(lines[i]);
        i++;
      }
      i++; // 跳过收尾 ```
      if (lang === "mermaid") blocks.push({ type: "diagram", props: { code: body.join("\n") } });
      else blocks.push({ type: "codeBlock", props: { language: lang || "text" }, content: body.join("\n") });
      continue;
    }

    // $$ 公式块
    if (/^\$\$\s*$/.test(trimmed)) {
      flushParagraph(paraBuf);
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^\$\$\s*$/.test(lines[i].trim())) {
        body.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({ type: "math", props: { latex: body.join("\n").trim() } });
      continue;
    }

    // 标题（### 以上钳到 3 级）
    const h = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flushParagraph(paraBuf);
      blocks.push({
        type: "heading",
        props: { level: Math.min(3, h[1].length) },
        content: parseInlineMarkdown(h[2]),
      });
      i++;
      continue;
    }

    // 分割线
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushParagraph(paraBuf);
      blocks.push({ type: "divider", props: {} });
      i++;
      continue;
    }

    // 表格：| a | b | 后跟分隔行
    if (trimmed.includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      flushParagraph(paraBuf);
      const rows: string[][] = [parseTableRow(line)];
      i += 2; // 跳过表头与分隔行
      while (i < lines.length && lines[i].trim().includes("|") && lines[i].trim()) {
        rows.push(parseTableRow(lines[i]));
        i++;
      }
      const cols = Math.max(...rows.map((r) => r.length));
      blocks.push({
        type: "table",
        props: { rows: rows.map((r) => (r.length < cols ? [...r, ...Array(cols - r.length).fill("")] : r)) },
      });
      continue;
    }

    // 整行图片 ![alt](src)
    const img = trimmed.match(/^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/);
    if (img) {
      flushParagraph(paraBuf);
      blocks.push({ type: "image", props: { src: img[2], alt: img[1], caption: "" } });
      i++;
      continue;
    }

    // 待办 - [ ] / - [x]
    const todo = trimmed.match(/^[-*+]\s+\[([ xX])\]\s+(.*)$/);
    if (todo) {
      flushParagraph(paraBuf);
      blocks.push({
        type: "checkListItem",
        props: { checked: todo[1].toLowerCase() === "x" },
        content: parseInlineMarkdown(todo[2]),
      });
      i++;
      continue;
    }

    // 无序列表
    const bullet = trimmed.match(/^[-*+]\s+(.*)$/);
    if (bullet) {
      flushParagraph(paraBuf);
      blocks.push({ type: "bulletListItem", props: {}, content: parseInlineMarkdown(bullet[1]) });
      i++;
      continue;
    }

    // 有序列表
    const numbered = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (numbered) {
      flushParagraph(paraBuf);
      blocks.push({ type: "numberedListItem", props: {}, content: parseInlineMarkdown(numbered[1]) });
      i++;
      continue;
    }

    // 引用（连续 > 行合并为一个 quote）
    const quote = trimmed.match(/^>\s?(.*)$/);
    if (quote) {
      flushParagraph(paraBuf);
      const buf = [quote[1]];
      i++;
      while (i < lines.length) {
        const q = lines[i].trim().match(/^>\s?(.*)$/);
        if (!q) break;
        buf.push(q[1]);
        i++;
      }
      blocks.push({ type: "quote", props: {}, content: parseInlineMarkdown(buf.join("\n")) });
      continue;
    }

    // 普通文本行：并入段落缓冲
    paraBuf.push(trimmed);
    i++;
  }
  flushParagraph(paraBuf);
  return blocks.map((p) => createBlock(p));
}
