/**
 * K3Blocks — 导出器：Block[] → HTML / email-safe HTML / docx / odt / 打印。
 * docx 与 jszip 均为动态 import，不进入主 chunk。
 */
import { customInlineText, inlineToHtml } from "./inline";
import { toEmbedUrl } from "./blocks/EmbedBlock";
import type { Block, InlineContent, InlineStyles, K3CustomInlineContent } from "./types";

/* --------------------------------- 公共工具 --------------------------------- */

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\u00a0/g, "&nbsp;");
}

function escAttr(s: string): string {
  return esc(s).replace(/"/g, "&quot;");
}

/** 触发浏览器下载 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function tableRowsOf(block: Block): string[][] {
  const raw = Array.isArray(block.props.rows) ? block.props.rows : [];
  const rows = raw
    .filter((r: unknown) => Array.isArray(r))
    .map((r: unknown[]) => r.map((c: unknown) => (c == null ? "" : String(c))));
  if (!rows.length) return [[""]];
  const cols = Math.max(1, ...rows.map((r) => r.length));
  return rows.map((r) => (r.length < cols ? [...r, ...Array(cols - r.length).fill("")] : r));
}

/* ------------------------------- 语义化 HTML -------------------------------- */

function blockToHtml(b: Block): string {
  const inner = inlineToHtml(b.content);
  switch (b.type) {
    case "heading": {
      const level = Math.min(3, Math.max(1, Number(b.props.level) || 1));
      return `<h${level}>${inner}</h${level}>`;
    }
    case "quote":
      return `<blockquote>${inner || "<br>"}</blockquote>`;
    case "codeBlock": {
      const lang = String(b.props.language ?? "");
      const cls = lang && lang !== "text" ? ` class="language-${escAttr(lang)}"` : "";
      return `<pre><code${cls}>${inner ? esc(plainOf(b.content)) : ""}</code></pre>`;
    }
    case "divider":
      return "<hr>";
    case "image": {
      const src = String(b.props.src ?? "");
      if (!src) return "";
      const alt = String(b.props.alt ?? "");
      const caption = String(b.props.caption ?? "");
      return (
        `<figure><img src="${escAttr(src)}" alt="${escAttr(alt)}">` +
        (caption ? `<figcaption>${esc(caption)}</figcaption>` : "") +
        `</figure>`
      );
    }
    case "columnList": {
      const cols = b.children.length || 1;
      const colHtml = b.children
        .map((col) => `<div class="k3-column">${blocksToHtmlInner(col.children)}</div>`)
        .join("");
      return `<div class="k3-columns" style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:16px">${colHtml}</div>`;
    }
    case "column":
      return `<div class="k3-column">${blocksToHtmlInner(b.children)}</div>`;
    case "table": {
      const rows = tableRowsOf(b);
      const [head, ...body] = rows;
      const th = head.map((c) => `<th>${esc(c)}</th>`).join("");
      const trs = body.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("");
      return `<table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`;
    }
    case "math": {
      const latex = String(b.props.latex ?? "").trim();
      if (!latex) return "";
      return `<div class="k3-math" data-latex="${escAttr(latex)}">$$${esc(latex)}$$</div>`;
    }
    case "embed": {
      const url = String(b.props.url ?? "");
      if (!url) return "";
      return `<iframe src="${escAttr(toEmbedUrl(url))}" loading="lazy" allowfullscreen></iframe>`;
    }
    case "pdf": {
      const url = String(b.props.url ?? "");
      if (!url) return "";
      return `<iframe src="${escAttr(url)}" title="PDF" loading="lazy"></iframe>`;
    }
    case "diagram": {
      const code = String(b.props.code ?? "").trim();
      if (!code) return "";
      return `<pre class="k3-diagram" data-diagram="mermaid"><code>${esc(code)}</code></pre>`;
    }
    default:
      return `<p>${inner || "<br>"}</p>`;
  }
}

function plainOf(content: InlineContent[]): string {
  let s = "";
  for (const item of content) {
    if (item.type === "text") s += item.text;
    else if (item.type === "mention") s += `@${item.props.label}`;
    else if (item.type === "link") s += plainOf(item.content);
    else s += customInlineText(item as K3CustomInlineContent);
  }
  return s;
}

/** 列表块序列 → <ul>/<ol>（含 task-list checkbox），支持子块嵌套为内层列表 */
function blocksToHtmlInner(blocks: Block[]): string {
  let out = "";
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    if (b.type === "bulletListItem" || b.type === "numberedListItem" || b.type === "checkListItem") {
      const tag = b.type === "numberedListItem" ? "ol" : "ul";
      const task = b.type === "checkListItem";
      const items: string[] = [];
      while (i < blocks.length && blocks[i].type === b.type) {
        const li = blocks[i];
        const checkbox = task
          ? `<input type="checkbox" disabled${li.props.checked ? " checked" : ""}> `
          : "";
        const children = li.children.length ? blocksToHtmlInner(li.children) : "";
        items.push(`<li>${checkbox}${inlineToHtml(li.content)}${children}</li>`);
        i++;
      }
      out += `<${tag}${task ? ' class="task-list"' : ""}>${items.join("")}</${tag}>`;
      continue;
    }
    const children = b.children.length && b.type !== "columnList" && b.type !== "column" ? b.children : null;
    out += blockToHtml(b);
    // 非容器块的子块紧随主标签输出（与 Markdown 导出一致的前序顺序）
    if (children) out += blocksToHtmlInner(children);
    i++;
  }
  return out;
}

/** Block[] → 完整语义化 HTML */
export function blocksToHTML(blocks: Block[]): string {
  return blocksToHtmlInner(blocks);
}

/* ------------------------------ email-safe HTML ----------------------------- */

const EMAIL_FONT = "font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;";

function emailInline(content: InlineContent[]): string {
  let out = "";
  for (const item of content) {
    if (item.type === "text") {
      let s = esc(item.text).replace(/\n/g, "<br>");
      const st: InlineStyles = item.styles ?? {};
      if (st.code)
        s = `<code style="font-family:Menlo,Consolas,monospace;background:#f2f2f2;padding:1px 4px;border-radius:3px;">${s}</code>`;
      if (st.bold) s = `<strong>${s}</strong>`;
      if (st.italic) s = `<em>${s}</em>`;
      if (st.underline) s = `<u>${s}</u>`;
      if (st.strike) s = `<s>${s}</s>`;
      const css: string[] = [];
      if (st.textColor) css.push(`color:${st.textColor}`);
      if (st.backgroundColor) css.push(`background-color:${st.backgroundColor}`);
      if (css.length) s = `<span style="${css.join(";")}">${s}</span>`;
      out += s;
    } else if (item.type === "mention") {
      out += `<span style="color:#1c7ed6;font-weight:500;">@${esc(item.props.label)}</span>`;
    } else if (item.type === "link") {
      out += `<a href="${escAttr(item.href)}" style="color:#1c7ed6;text-decoration:underline;">${emailInline(item.content)}</a>`;
    } else {
      out += esc(customInlineText(item as K3CustomInlineContent));
    }
  }
  return out;
}

function emailRow(content: string): string {
  return `<tr><td style="padding:2px 0;${EMAIL_FONT}font-size:14px;line-height:1.6;color:#212529;">${content}</td></tr>`;
}

function emailBlock(b: Block): string {
  const inner = emailInline(b.content);
  switch (b.type) {
    case "heading": {
      const level = Math.min(3, Math.max(1, Number(b.props.level) || 1));
      const size = level === 1 ? 26 : level === 2 ? 21 : 17;
      return emailRow(
        `<div style="font-size:${size}px;font-weight:700;line-height:1.3;margin:12px 0 4px;">${inner}</div>`
      );
    }
    case "quote":
      return emailRow(
        `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>` +
          `<td style="width:3px;background:#dee2e6;"></td>` +
          `<td style="padding:4px 12px;color:#495057;">${inner}</td></tr></table>`
      );
    case "codeBlock":
      return emailRow(
        `<pre style="margin:0;padding:12px;background:#f4f4f4;border-radius:6px;font-family:Menlo,Consolas,monospace;font-size:13px;line-height:1.5;white-space:pre-wrap;">${esc(plainOf(b.content))}</pre>`
      );
    case "divider":
      return `<tr><td style="padding:8px 0;"><hr style="border:none;border-top:1px solid #dee2e6;margin:0;"></td></tr>`;
    case "image": {
      const src = String(b.props.src ?? "");
      if (!src) return "";
      const alt = String(b.props.alt ?? "");
      const caption = String(b.props.caption ?? "");
      return emailRow(
        `<img src="${escAttr(src)}" alt="${escAttr(alt)}" style="max-width:100%;height:auto;display:block;">` +
          (caption
            ? `<div style="font-size:12px;color:#868e96;text-align:center;padding-top:4px;">${esc(caption)}</div>`
            : "")
      );
    }
    case "columnList": {
      const cols = b.children;
      const width = `${Math.floor(100 / Math.max(1, cols.length))}%`;
      const tds = cols
        .map(
          (col) =>
            `<td valign="top" style="width:${width};padding:0 8px;">` +
            `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${emailBlocksInner(col.children)}</table>` +
            `</td>`
        )
        .join("");
      return `<tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${tds}</tr></table></td></tr>`;
    }
    case "column":
      return emailBlocksInner(b.children);
    case "table": {
      const rows = tableRowsOf(b);
      const trs = rows
        .map((r, ri) => {
          const cells = r
            .map(
              (c) =>
                `<td style="border:1px solid #dee2e6;padding:6px 10px;${ri === 0 ? "font-weight:600;background:#f8f9fa;" : ""}">${esc(c)}</td>`
            )
            .join("");
          return `<tr>${cells}</tr>`;
        })
        .join("");
      return `<tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">${trs}</table></td></tr>`;
    }
    case "math": {
      const latex = String(b.props.latex ?? "").trim();
      if (!latex) return "";
      return emailRow(
        `<code style="font-family:Menlo,Consolas,monospace;background:#f2f2f2;padding:2px 6px;border-radius:3px;">${esc(latex)}</code>`
      );
    }
    case "embed":
    case "pdf": {
      const url = String(b.props.url ?? "");
      if (!url) return "";
      return emailRow(`<a href="${escAttr(url)}" style="color:#1c7ed6;text-decoration:underline;">${esc(url)}</a>`);
    }
    case "diagram": {
      const code = String(b.props.code ?? "").trim();
      if (!code) return "";
      return emailRow(
        `<pre style="margin:0;padding:12px;background:#f4f4f4;border-radius:6px;font-family:Menlo,Consolas,monospace;font-size:13px;white-space:pre-wrap;">${esc(code)}</pre>`
      );
    }
    default:
      return emailRow(inner || "<br>");
  }
}

function emailBlocksInner(blocks: Block[]): string {
  let out = "";
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    if (b.type === "bulletListItem" || b.type === "numberedListItem" || b.type === "checkListItem") {
      const rows: string[] = [];
      let n = 0;
      while (i < blocks.length && blocks[i].type === b.type) {
        const li = blocks[i];
        n++;
        const marker =
          li.type === "checkListItem" ? (li.props.checked ? "☑" : "☐") : li.type === "numberedListItem" ? `${n}.` : "•";
        const children = li.children.length
          ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${emailBlocksInner(li.children)}</table>`
          : "";
        rows.push(
          `<tr><td valign="top" style="width:24px;padding:2px 0;${EMAIL_FONT}font-size:14px;line-height:1.6;color:#212529;">${marker}</td>` +
            `<td style="padding:2px 0;${EMAIL_FONT}font-size:14px;line-height:1.6;color:#212529;">${emailInline(li.content)}${children}</td></tr>`
        );
        i++;
      }
      out += `<tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows.join("")}</table></td></tr>`;
      continue;
    }
    const children =
      b.children.length && b.type !== "columnList" && b.type !== "column" ? b.children : null;
    out += emailBlock(b);
    if (children) out += emailBlocksInner(children);
    i++;
  }
  return out;
}

/** Block[] → email-safe HTML（table 布局 + 全 inline style，无 class 无 grid） */
export function blocksToEmailHTML(blocks: Block[]): string {
  return (
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">` +
    emailBlocksInner(blocks) +
    `</table>`
  );
}

/* ---------------------------------- DOCX ---------------------------------- */

type DocxModule = typeof import("docx");

function docxRuns(docx: DocxModule, content: InlineContent[], base: { italics?: boolean } = {}): InstanceType<DocxModule["TextRun"]>[] {
  const runs: InstanceType<DocxModule["TextRun"]>[] = [];
  for (const item of content) {
    if (item.type === "text") {
      const st: InlineStyles = item.styles ?? {};
      const color = st.textColor ? String(st.textColor).replace(/^#/, "").slice(0, 6) : undefined;
      runs.push(
        new docx.TextRun({
          text: item.text,
          bold: !!st.bold,
          italics: !!st.italic || !!base.italics,
          underline: st.underline ? {} : undefined,
          strike: !!st.strike,
          font: st.code ? "Courier New" : undefined,
          color,
        })
      );
    } else if (item.type === "mention") {
      runs.push(new docx.TextRun({ text: `@${item.props.label}`, color: "1C7ED6", bold: true }));
    } else if (item.type === "link") {
      runs.push(
        new docx.TextRun({
          text: plainOf(item.content),
          style: "Hyperlink",
        })
      );
    } else {
      runs.push(new docx.TextRun({ text: customInlineText(item as K3CustomInlineContent), ...base }));
    }
  }
  return runs;
}

function docxChildren(docx: DocxModule, blocks: Block[], depth = 0): InstanceType<DocxModule["Paragraph"]>[] {
  const out: InstanceType<DocxModule["Paragraph"]>[] = [];
  const headings = [docx.HeadingLevel.HEADING_1, docx.HeadingLevel.HEADING_2, docx.HeadingLevel.HEADING_3];
  let numbered = 0;
  for (const b of blocks) {
    if (b.type !== "numberedListItem") numbered = 0;
    if (b.type === "columnList" || b.type === "column") {
      out.push(...docxChildren(docx, b.children, depth));
      continue;
    }
    switch (b.type) {
      case "heading": {
        const level = Math.min(3, Math.max(1, Number(b.props.level) || 1));
        out.push(new docx.Paragraph({ heading: headings[level - 1], children: docxRuns(docx, b.content) }));
        break;
      }
      case "bulletListItem":
        out.push(new docx.Paragraph({ bullet: { level: depth }, children: docxRuns(docx, b.content) }));
        break;
      case "numberedListItem":
        numbered += 1;
        out.push(
          new docx.Paragraph({
            children: [new docx.TextRun({ text: `${numbered}. ` }), ...docxRuns(docx, b.content)],
            indent: { left: 720 * (depth + 1) },
          })
        );
        break;
      case "checkListItem":
        out.push(
          new docx.Paragraph({
            children: [new docx.TextRun({ text: b.props.checked ? "☑ " : "☐ " }), ...docxRuns(docx, b.content)],
            indent: { left: 720 * (depth + 1) },
          })
        );
        break;
      case "quote":
        out.push(
          new docx.Paragraph({
            children: docxRuns(docx, b.content, { italics: true }),
            indent: { left: 720 },
            border: { left: { style: docx.BorderStyle.SINGLE, size: 12, color: "DEE2E6", space: 8 } },
          })
        );
        break;
      case "codeBlock":
        for (const line of plainOf(b.content).split("\n")) {
          out.push(
            new docx.Paragraph({
              children: [new docx.TextRun({ text: line || " ", font: "Courier New", size: 20 })],
              shading: { fill: "F4F4F4" },
            })
          );
        }
        break;
      case "divider":
        out.push(
          new docx.Paragraph({
            children: [],
            border: { bottom: { style: docx.BorderStyle.SINGLE, size: 6, color: "ADB5BD", space: 1 } },
          })
        );
        break;
      case "image": {
        // 远程图片无法同步取尺寸/字节，导出占位文本
        const src = String(b.props.src ?? "");
        if (src)
          out.push(
            new docx.Paragraph({
              children: [new docx.TextRun({ text: `[image: ${String(b.props.alt ?? "") || src}]`, color: "868E96" })],
            })
          );
        break;
      }
      case "table": {
        const rows = tableRowsOf(b);
        rows.forEach((r, ri) => {
          out.push(
            new docx.Paragraph({
              children: [new docx.TextRun({ text: r.join(" | "), bold: ri === 0 })],
            })
          );
        });
        break;
      }
      case "math": {
        const latex = String(b.props.latex ?? "").trim();
        if (latex)
          out.push(new docx.Paragraph({ children: [new docx.TextRun({ text: latex, font: "Courier New" })] }));
        break;
      }
      case "embed":
      case "pdf": {
        const url = String(b.props.url ?? "");
        if (url)
          out.push(new docx.Paragraph({ children: [new docx.TextRun({ text: url, style: "Hyperlink" })] }));
        break;
      }
      case "diagram": {
        const code = String(b.props.code ?? "").trim();
        if (code)
          for (const line of code.split("\n"))
            out.push(
              new docx.Paragraph({
                children: [new docx.TextRun({ text: line || " ", font: "Courier New", size: 20 })],
                shading: { fill: "F4F4F4" },
              })
            );
        break;
      }
      default:
        out.push(new docx.Paragraph({ children: docxRuns(docx, b.content) }));
    }
    if (b.children.length) out.push(...docxChildren(docx, b.children, depth + 1));
  }
  return out;
}

/** Block[] → .docx Blob（docx 包动态 import，不进主 chunk） */
export async function blocksToDocxBlob(blocks: Block[]): Promise<Blob> {
  const docx = await import("docx");
  const doc = new docx.Document({
    sections: [{ properties: {}, children: docxChildren(docx, blocks) }],
  });
  return docx.Packer.toBlob(doc);
}

/* ----------------------------------- ODT ----------------------------------- */

function xmlEscape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** ODT 自动样式：bold / italic / underline / strike / code / mention */
const ODT_STYLES = `<office:automatic-styles>`
  + `<style:style style:name="B" style:family="text"><style:text-properties fo:font-weight="bold" style:font-weight-asian="bold"/></style:style>`
  + `<style:style style:name="I" style:family="text"><style:text-properties fo:font-style="italic" style:font-style-asian="italic"/></style:style>`
  + `<style:style style:name="U" style:family="text"><style:text-properties style:text-underline-style="solid" style:text-underline-width="auto" style:text-underline-color="font-color"/></style:style>`
  + `<style:style style:name="S" style:family="text"><style:text-properties style:text-line-through-style="solid"/></style:style>`
  + `<style:style style:name="CODE" style:family="text"><style:text-properties style:font-name="Courier"/></style:style>`
  + `<style:style style:name="M" style:family="text"><style:text-properties fo:color="#1c7ed6" fo:font-weight="bold"/></style:style>`
  + `</office:automatic-styles>`;

function odtSpans(content: InlineContent[]): string {
  let out = "";
  const wrap = (inner: string, st: InlineStyles): string => {
    let s = inner;
    if (st.code) s = `<text:span text:style-name="CODE">${s}</text:span>`;
    if (st.bold) s = `<text:span text:style-name="B">${s}</text:span>`;
    if (st.italic) s = `<text:span text:style-name="I">${s}</text:span>`;
    if (st.underline) s = `<text:span text:style-name="U">${s}</text:span>`;
    if (st.strike) s = `<text:span text:style-name="S">${s}</text:span>`;
    return s;
  };
  for (const item of content) {
    if (item.type === "text") {
      const t = xmlEscape(item.text).replace(/\n/g, "<text:line-break/>");
      out += item.styles ? wrap(t, item.styles) : t;
    } else if (item.type === "mention") {
      out += `<text:span text:style-name="M">@${xmlEscape(item.props.label)}</text:span>`;
    } else if (item.type === "link") {
      out += `<text:a xlink:type="simple" xlink:href="${xmlEscape(item.href)}">${odtSpans(item.content)}</text:a>`;
    } else {
      out += xmlEscape(customInlineText(item as K3CustomInlineContent));
    }
  }
  return out;
}

function odtBlocks(blocks: Block[], depth = 0): string {
  let out = "";
  for (const b of blocks) {
    if (b.type === "columnList" || b.type === "column") {
      out += odtList(b.children, depth);
      continue;
    }
    if (odtIsList(b.type)) {
      out += odtList([b], depth);
      continue;
    }
    const spans = odtSpans(b.content);
    switch (b.type) {
      case "heading": {
        const level = Math.min(3, Math.max(1, Number(b.props.level) || 1));
        out += `<text:h text:style-name="Heading_20_${level}" text:outline-level="${level}">${spans}</text:h>`;
        break;
      }
      case "quote":
        out += `<text:p text:style-name="Quotations">${spans}</text:p>`;
        break;
      case "codeBlock":
        for (const line of plainOf(b.content).split("\n"))
          out += `<text:p text:style-name="Preformatted_20_Text">${xmlEscape(line) || "<text:s/>"}</text:p>`;
        break;
      case "divider":
        out += `<text:p text:style-name="Horizontal_20_Line"/>`;
        break;
      case "image": {
        const src = String(b.props.src ?? "");
        if (src) out += `<text:p text:style-name="Standard">[image: ${xmlEscape(String(b.props.alt ?? "") || src)}]</text:p>`;
        break;
      }
      case "table": {
        const rows = tableRowsOf(b);
        out += `<text:p text:style-name="Standard">${xmlEscape(rows.map((r) => r.join(" | ")).join("\n")).replace(/\n/g, "<text:line-break/>")}</text:p>`;
        break;
      }
      case "math": {
        const latex = String(b.props.latex ?? "").trim();
        if (latex) out += `<text:p text:style-name="Preformatted_20_Text">${xmlEscape(latex)}</text:p>`;
        break;
      }
      case "embed":
      case "pdf": {
        const url = String(b.props.url ?? "");
        if (url)
          out += `<text:p text:style-name="Standard"><text:a xlink:type="simple" xlink:href="${xmlEscape(url)}">${xmlEscape(url)}</text:a></text:p>`;
        break;
      }
      case "diagram": {
        const code = String(b.props.code ?? "").trim();
        if (code)
          for (const line of code.split("\n"))
            out += `<text:p text:style-name="Preformatted_20_Text">${xmlEscape(line) || "<text:s/>"}</text:p>`;
        break;
      }
      default:
        out += `<text:p text:style-name="Standard">${spans}</text:p>`;
    }
    if (b.children.length) out += odtList(b.children, depth + 1);
  }
  return out;
}

function odtIsList(type: string): boolean {
  return type === "bulletListItem" || type === "numberedListItem" || type === "checkListItem";
}

/** 列表块序列 → <text:list>（列表项的子块作为嵌套列表） */
function odtList(blocks: Block[], depth: number): string {
  let out = "";
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    if (odtIsList(b.type)) {
      const items: string[] = [];
      while (i < blocks.length && odtIsList(blocks[i].type)) {
        const li = blocks[i];
        const spans = odtSpans(li.content);
        const text = li.type === "checkListItem" ? `${li.props.checked ? "☑" : "☐"} ${spans}` : spans;
        const nested = li.children.length ? odtList(li.children, depth + 1) : "";
        items.push(`<text:list-item><text:p text:style-name="P1">${text}</text:p>${nested}</text:list-item>`);
        i++;
      }
      out += `<text:list text:style-name="L1">${items.join("")}</text:list>`;
      continue;
    }
    out += odtBlocks([b], depth);
    i++;
  }
  return out;
}

const ODT_MANIFEST = `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
<manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/>
<manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`;

function odtContentXml(blocks: Block[]): string {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<office:document-content ` +
    `xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" ` +
    `xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" ` +
    `xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" ` +
    `xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" ` +
    `xmlns:xlink="http://www.w3.org/1999/xlink" ` +
    `office:version="1.2">` +
    ODT_STYLES +
    `<office:body><office:text>` +
    odtList(blocks, 0) +
    `</office:text></office:body></office:document-content>`
  );
}

/** Block[] → 最小 .odt Blob（jszip 动态 import，不进主 chunk） */
export async function blocksToOdtBlob(blocks: Block[]): Promise<Blob> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  zip.file("mimetype", "application/vnd.oasis.opendocument.text", { compression: "STORE" });
  zip.file("META-INF/manifest.xml", ODT_MANIFEST);
  zip.file("content.xml", odtContentXml(blocks));
  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.oasis.opendocument.text",
  });
}

/* ---------------------------------- 打印 ----------------------------------- */

const PRINT_CSS = `
@page { size: A4; margin: 20mm; }
body { font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif; color: #212529; line-height: 1.6; font-size: 14px; }
h1, h2, h3 { font-family: Georgia, 'Times New Roman', serif; line-height: 1.3; margin: 18px 0 8px; }
h1 { font-size: 26px; } h2 { font-size: 21px; } h3 { font-size: 17px; }
p { margin: 6px 0; }
ul, ol { margin: 6px 0; padding-left: 24px; }
ul.task-list { list-style: none; padding-left: 4px; }
ul.task-list input { margin-right: 6px; }
blockquote { margin: 8px 0; padding: 4px 14px; border-left: 3px solid #dee2e6; color: #495057; }
pre { background: #f4f4f4; border-radius: 6px; padding: 12px; font-family: Menlo, Consolas, monospace; font-size: 13px; white-space: pre-wrap; }
code { font-family: Menlo, Consolas, monospace; background: #f2f2f2; padding: 1px 4px; border-radius: 3px; }
pre code { background: none; padding: 0; }
hr { border: none; border-top: 1px solid #dee2e6; margin: 16px 0; }
img { max-width: 100%; height: auto; }
figure { margin: 12px 0; }
figcaption { font-size: 12px; color: #868e96; text-align: center; margin-top: 4px; }
table { border-collapse: collapse; width: 100%; margin: 8px 0; }
th, td { border: 1px solid #dee2e6; padding: 6px 10px; text-align: left; }
th { background: #f8f9fa; }
.k3-mention { color: #1c7ed6; font-weight: 500; }
.k3-math { font-family: Menlo, Consolas, monospace; background: #f8f9fa; padding: 8px 12px; border-radius: 6px; }
iframe { width: 100%; min-height: 320px; border: 1px solid #dee2e6; border-radius: 6px; }
.k3-columns { display: grid; gap: 16px; }
`;

/** 打开新窗口渲染 blocksToHTML + 内联打印样式并调 window.print()（用户可另存为 PDF） */
export function printBlocks(blocks: Block[], opts?: { title?: string }): void {
  const win = window.open("", "_blank");
  if (!win) {
    console.warn("[k3blocks] print: 弹窗被拦截，无法打开打印窗口");
    return;
  }
  const title = opts?.title ?? "document";
  win.document.open();
  win.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>` +
      `<style>${PRINT_CSS}</style></head><body>${blocksToHTML(blocks)}</body></html>`
  );
  win.document.close();
  const doPrint = () => {
    win.focus();
    win.print();
  };
  // 等待样式/图片尽量就绪后再触发打印
  if (win.document.readyState === "complete") setTimeout(doPrint, 50);
  else win.addEventListener("load", () => setTimeout(doPrint, 50));
}
