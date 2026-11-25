import { createRequire } from "module";
import { describe, expect, it } from "vitest";
import {
  collectHtmlImageSources, collectMedia, isDurableMediaUrl, richTextDocumentSchema, toPlainJson,
} from "@/lib/rich-text";
import { articleSchema } from "@/schemas/journal";
import { asEditorJson, mixedDocument, upload } from "../support/documents";

const require = createRequire(import.meta.url);
// The exact encoder Next.js uses to send Server Action arguments from the browser.
const { encodeReply, createTemporaryReferenceSet } = require("next/dist/compiled/react-server-dom-webpack/client.edge");

const A = upload("11111111-1111-4111-8111-111111111111.png");
const B = upload("22222222-2222-4222-8222-222222222222.jpg");
const C = upload("33333333-3333-4333-8333-333333333333.webp");

const encode = (value: unknown) => encodeReply([value], { temporaryReferences: createTemporaryReferenceSet() }) as Promise<string>;

describe("root cause: editor JSON through the Server Action encoder", () => {
  it("ProseMirror attrs have a null prototype", () => {
    const json = asEditorJson(mixedDocument([{ src: A }])) as { content: { attrs?: object }[] };
    const image = json.content.find((n) => (n as { type: string }).type === "image")!;
    expect(Object.getPrototypeOf(image.attrs)).toBeNull();
  });

  it("raw editor JSON loses every attrs object as a temporary reference ($T)", async () => {
    const encoded = await encode(asEditorJson(mixedDocument([{ src: A }])));
    expect(encoded).toContain('"attrs":"$T"');
    expect(encoded).not.toContain(A);
  });

  it("toPlainJson output encodes as data, with image sources intact", async () => {
    const encoded = await encode(toPlainJson(asEditorJson(mixedDocument([{ src: A }, { src: B }]))));
    expect(encoded).not.toContain("$T");
    expect(encoded).toContain(A);
    expect(encoded).toContain(B);
  });
});

describe("toPlainJson", () => {
  it("deep-copies into plain objects and drops non-JSON values", () => {
    const attrs = Object.create(null);
    Object.assign(attrs, { src: A, fn: () => 1, n: Number.NaN });
    const out = toPlainJson({ type: "image", attrs, list: [undefined, 1] });
    expect(Object.getPrototypeOf(out.attrs)).toBe(Object.prototype);
    expect(out).toEqual({ type: "image", attrs: { src: A, n: null }, list: [null, 1] });
  });

  it("preserves structure exactly for valid documents", () => {
    const doc = mixedDocument([{ src: A, alt: "first" }, { src: B }, { src: C }]);
    expect(toPlainJson(asEditorJson(doc))).toEqual(asEditorJson(doc));
  });
});

describe("richTextDocumentSchema", () => {
  it("accepts a mixed document produced by the editor schema", () => {
    const doc = toPlainJson(asEditorJson(mixedDocument([{ src: A }, { src: B }, { src: C }])));
    const parsed = richTextDocumentSchema.parse(doc);
    expect(parsed).toEqual(doc);
    expect(Object.getPrototypeOf((parsed.content![2] as { attrs: object }).attrs)).toBe(Object.prototype);
  });

  it("rejects a value that arrived as an unreadable reference without touching it", () => {
    const poisoned = new Proxy(function () {}, { get: () => { throw new Error("touched"); } });
    const result = richTextDocumentSchema.safeParse({ type: "doc", content: [{ type: "image", attrs: poisoned }] });
    expect(result.success).toBe(false);
  });

  it.each([
    ["blob URL", "blob:http://localhost:4000/0a1b"],
    ["base64 data", "data:image/png;base64,iVBORw0KGgo="],
    ["javascript", "javascript:alert(1)"],
    ["path traversal", "/api/upload/../../etc/passwd"],
  ])("rejects image source: %s", (_label, src) => {
    const result = richTextDocumentSchema.safeParse({ type: "doc", content: [{ type: "image", attrs: { src } }] });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.issues)).toMatch(/not uploaded yet/);
  });

  it("rejects non-doc roots, missing types and nested objects in attrs", () => {
    expect(richTextDocumentSchema.safeParse({ type: "paragraph" }).success).toBe(false);
    expect(richTextDocumentSchema.safeParse({ type: "doc", content: [{ text: "x" }] }).success).toBe(false);
    expect(richTextDocumentSchema.safeParse({ type: "doc", content: [{ type: "image", attrs: { src: A, x: { y: 1 } } }] }).success).toBe(false);
  });

  it("rejects absurdly deep documents", () => {
    let n: Record<string, unknown> = { type: "text", text: "x" };
    for (let i = 0; i < 80; i++) n = { type: "blockquote", content: [n] };
    expect(richTextDocumentSchema.safeParse({ type: "doc", content: [n] }).success).toBe(false);
  });

  it("is wired into the article schema", () => {
    const base = { title: "t", status: "DRAFT", isFeatured: false, tagIds: [] };
    expect(articleSchema.safeParse({ ...base, content: { type: "doc", content: [{ type: "image", attrs: { src: "blob:x" } }] } }).success).toBe(false);
    expect(articleSchema.safeParse({ ...base, content: null }).success).toBe(true);
  });
});

describe("media reference helpers", () => {
  it("collects media in document order", () => {
    const doc = richTextDocumentSchema.parse(toPlainJson(asEditorJson(mixedDocument([{ src: A, alt: "a" }, { src: B }, { src: C }]))));
    expect(collectMedia(doc).map((m) => m.src)).toEqual([A, B, "https://www.youtube.com/watch?v=dQw4w9WgXcQ", C]);
    expect(collectMedia(doc)[0].alt).toBe("a");
  });

  it("collects <img> sources from HTML", () => {
    expect(collectHtmlImageSources(`<p>x</p><img src="${A}" alt=""><img alt='' src='${B}'>`)).toEqual([A, B]);
  });

  it("classifies durable URLs", () => {
    expect(isDurableMediaUrl(A)).toBe(true);
    expect(isDurableMediaUrl("https://cdn.example.com/a.png")).toBe(true);
    expect(isDurableMediaUrl("blob:abc")).toBe(false);
    expect(isDurableMediaUrl("/api/upload/not-a-key.png")).toBe(false);
  });
});
