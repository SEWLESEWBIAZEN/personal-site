import { z } from "zod";

/**
 * Rich-text (Tiptap / ProseMirror) document helpers shared by the editor, the Zod
 * schemas and the Server Actions.
 *
 * Why `toPlainJson` exists: ProseMirror builds node and mark `attrs` with
 * `Object.create(null)`, and `editor.getJSON()` returns those same objects. React's
 * Server Action encoder only serializes plain objects (prototype === Object.prototype);
 * anything else becomes a "temporary reference" (`"$T"`) that the server cannot read.
 * Every node or mark that has attributes (images, headings, links, code blocks, tables,
 * videos…) was therefore lost in transit and Prisma crashed when it touched the value.
 */
export function toPlainJson<T>(value: T): T {
  return clone(value, 0) as T;
}

const MAX_DEPTH = 64;

function clone(value: unknown, depth: number): unknown {
  if (depth > MAX_DEPTH) throw new Error("Document is nested too deeply");
  if (value === null || typeof value !== "object") {
    if (typeof value === "function" || typeof value === "symbol" || typeof value === "bigint") return undefined;
    if (typeof value === "number" && !Number.isFinite(value)) return null;
    return value;
  }
  if (Array.isArray(value)) return value.map((v) => clone(v, depth + 1) ?? null);
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(value)) {
    const v = clone((value as Record<string, unknown>)[key], depth + 1);
    if (v !== undefined) out[key] = v;
  }
  return out;
}

// ---- Validation -----------------------------------------------------------

const UPLOAD_PATH = /^\/api\/upload\/[0-9a-f-]{36}\.[a-z0-9]{2,5}$/;

/** Durable media URL: an uploaded file served by this app, or an absolute http(s) URL. */
export function isDurableMediaUrl(src: string): boolean {
  return UPLOAD_PATH.test(src) || /^https?:\/\/[^\s"'<>]+$/i.test(src);
}

export function isUploadPath(src: string): boolean {
  return UPLOAD_PATH.test(src);
}

const attrValue = z.union([
  z.string().max(5000),
  z.number().finite(),
  z.boolean(),
  z.null(),
  z.array(z.union([z.string().max(500), z.number().finite(), z.null()])).max(100),
]);

const attrs = z.record(z.string().max(100), attrValue);

const mark = z.object({ type: z.string().min(1).max(100), attrs: attrs.optional() });

export type RichTextNode = {
  type: string;
  attrs?: Record<string, z.infer<typeof attrValue>>;
  content?: RichTextNode[];
  marks?: z.infer<typeof mark>[];
  text?: string;
};

const MEDIA_NODES = new Set(["image", "youtube"]);

const node: z.ZodType<RichTextNode> = z.lazy(() =>
  z
    .object({
      type: z.string().min(1).max(100),
      attrs: attrs.optional(),
      content: z.array(node).max(10000).optional(),
      marks: z.array(mark).max(50).optional(),
      text: z.string().max(200000).optional(),
    })
    .superRefine((n, ctx) => {
      if (!MEDIA_NODES.has(n.type)) return;
      const src = n.attrs?.src;
      if (typeof src !== "string" || !src) {
        ctx.addIssue({ code: "custom", path: ["attrs", "src"], message: `The ${n.type} has no source` });
      } else if (n.type === "image" && !isDurableMediaUrl(src)) {
        // Rejects blob:, data: (base64) and other temporary or unsafe sources.
        ctx.addIssue({
          code: "custom",
          path: ["attrs", "src"],
          message: "An image is not uploaded yet (temporary or embedded data). Upload it to the media library and insert it again.",
        });
      }
    }),
);

function depthOf(value: unknown, depth = 0): number {
  if (depth > MAX_DEPTH) return depth;
  if (!value || typeof value !== "object") return depth;
  let max = depth;
  for (const v of Object.values(value)) max = Math.max(max, depthOf(v, depth + 1));
  return max;
}

/** A full Tiptap document. Parsing returns fresh plain objects. */
export const richTextDocumentSchema = z
  .unknown()
  .refine((v) => depthOf(v) <= MAX_DEPTH, "Document is nested too deeply")
  .pipe(
    z.object({ type: z.literal("doc"), content: z.array(node).max(10000).optional() }).passthrough(),
  ) as unknown as z.ZodType<RichTextNode & { type: "doc" }>;

export type RichTextDocument = z.infer<typeof richTextDocumentSchema>;

// ---- Inspection -------------------------------------------------------------

export type MediaRef = { type: string; src: string; alt: string | null };

/** Media nodes in document order (depth-first), so ordering can be asserted and validated. */
export function collectMedia(doc: RichTextNode | null | undefined): MediaRef[] {
  const out: MediaRef[] = [];
  const walk = (n: RichTextNode) => {
    if (MEDIA_NODES.has(n.type) && typeof n.attrs?.src === "string") {
      out.push({ type: n.type, src: n.attrs.src, alt: typeof n.attrs.alt === "string" ? n.attrs.alt : null });
    }
    n.content?.forEach(walk);
  };
  if (doc) walk(doc);
  return out;
}

/** `src` values of <img> tags in HTML, in order. */
export function collectHtmlImageSources(html: string | null | undefined): string[] {
  if (!html) return [];
  return [...html.matchAll(/<img\b[^>]*?\bsrc=["']([^"']+)["']/gi)].map((m) => m[1].replace(/&amp;/g, "&"));
}
