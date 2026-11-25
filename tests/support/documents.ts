import { getSchema } from "@tiptap/react";
import { editorExtensions } from "@/components/editor/extensions";

export const upload = (key: string) => `/api/upload/${key}`;

/** A mixed document covering every node and mark the editor offers. */
export function mixedDocument(images: { src: string; alt?: string }[]) {
  const [first, second, third] = images;
  const img = (i?: { src: string; alt?: string }) => (i ? [{ type: "image", attrs: { src: i.src, alt: i.alt ?? "", title: i.alt ?? null } }] : []);
  return {
    type: "doc",
    content: [
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Overview" }] },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Plain, " },
          { type: "text", marks: [{ type: "bold" }], text: "bold" },
          { type: "text", text: ", " },
          { type: "text", marks: [{ type: "italic" }], text: "italic" },
          { type: "text", text: " and a " },
          { type: "text", marks: [{ type: "link", attrs: { href: "https://example.com/docs", target: "_blank", rel: "noopener noreferrer nofollow", class: null } }], text: "link" },
          { type: "text", text: "." },
        ],
      },
      ...img(first),
      { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "Details" }] },
      { type: "bulletList", content: [li("First bullet"), li("Second bullet")] },
      { type: "orderedList", attrs: { start: 1, type: null }, content: [li("Step one"), li("Step two")] },
      { type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: "A quoted line." }] }] },
      ...img(second),
      { type: "codeBlock", attrs: { language: "ts" }, content: [{ type: "text", text: "const x: number = 1;" }] },
      {
        type: "table",
        content: [
          { type: "tableRow", content: [cell("tableHeader", "Key"), cell("tableHeader", "Value")] },
          { type: "tableRow", content: [cell("tableCell", "a"), cell("tableCell", "1")] },
        ],
      },
      { type: "youtube", attrs: { src: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", start: 0, width: 640, height: 360 } },
      ...img(third),
      { type: "paragraph", content: [{ type: "text", text: "The end." }] },
    ],
  };
}

function li(text: string) {
  return { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text }] }] };
}
function cell(type: string, text: string) {
  return { type, attrs: { colspan: 1, rowspan: 1, colwidth: null }, content: [{ type: "paragraph", content: [{ type: "text", text }] }] };
}

/** Round-trips a document through the editor's real ProseMirror schema, like editor.getJSON(). */
export function asEditorJson(doc: object) {
  const schema = getSchema(editorExtensions());
  return schema.nodeFromJSON(doc).toJSON() as Record<string, unknown>;
}
