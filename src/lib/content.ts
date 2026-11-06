import sanitizeHtml from "sanitize-html";
import { slugify } from "./utils";

const ALLOWED_IFRAME_HOSTS = ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"];

export function sanitizeContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "p", "br", "hr", "strong", "b", "em", "i", "s", "u", "code", "pre",
      "blockquote", "ul", "ol", "li", "a", "img", "figure", "figcaption",
      "table", "thead", "tbody", "tr", "th", "td", "colgroup", "col", "div", "span", "iframe",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      iframe: ["src", "width", "height", "allowfullscreen", "frameborder"],
      div: ["data-youtube-video"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
      col: ["style"],
    },
    allowedClasses: { code: ["language-*"] },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowedIframeHostnames: ALLOWED_IFRAME_HOSTS,
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, rel: "noopener noreferrer" },
      }),
    },
  });
}

export function htmlToText(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
}

export type TocEntry = { id: string; text: string; level: number };

// Adds stable ids to h2/h3 headings and returns a table of contents.
export function withHeadingAnchors(html: string): { html: string; toc: TocEntry[] } {
  const toc: TocEntry[] = [];
  const used = new Set<string>();

  const out = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_m, level: string, inner: string) => {
    const text = htmlToText(inner);
    let id = slugify(text) || "section";
    let n = 1;
    while (used.has(id)) id = `${slugify(text)}-${n++}`;
    used.add(id);
    toc.push({ id, text, level: Number(level) });
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });

  return { html: out, toc };
}
