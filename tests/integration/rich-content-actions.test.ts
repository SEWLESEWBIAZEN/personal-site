import { beforeEach, describe, expect, it } from "vitest";
import { integrationEnabled, session } from "../support/integration";
import { prisma } from "@/lib/prisma";
import { toPlainJson, collectMedia, collectHtmlImageSources, type RichTextDocument } from "@/lib/rich-text";
import { withHeadingAnchors } from "@/lib/content";
import { highlightCodeBlocks } from "@/lib/highlight";
import { createArticle, updateArticle } from "@/server/actions/journal";
import { createIdea, updateIdea } from "@/server/actions/idea";
import { journalRepository } from "@/server/repositories/journal";
import { mediaService } from "@/server/services/media";
import type { ArticleInput } from "@/schemas/journal";
import { asEditorJson, mixedDocument } from "../support/documents";
import { resetDatabase, uploadFixture } from "../support/db";

/** What the browser sends: editor JSON normalized by the editor, plus the editor HTML. */
function editorPayload(doc: object) {
  const json = toPlainJson(asEditorJson(doc)) as RichTextDocument;
  return { content: json, contentHtml: toHtml(json) };
}

// Minimal HTML rendering of the test documents (the browser uses editor.getHTML()).
function toHtml(n: RichTextDocument | Record<string, unknown>): string {
  const node = n as { type: string; attrs?: Record<string, unknown>; content?: object[]; text?: string; marks?: { type: string; attrs?: { href?: string } }[] };
  const inner = (node.content ?? []).map((c) => toHtml(c as RichTextDocument)).join("");
  switch (node.type) {
    case "doc": return inner;
    case "text": {
      let t = node.text ?? "";
      for (const m of node.marks ?? []) t = m.type === "bold" ? `<strong>${t}</strong>` : m.type === "italic" ? `<em>${t}</em>` : m.type === "link" ? `<a href="${m.attrs?.href}">${t}</a>` : t;
      return t;
    }
    case "paragraph": return `<p>${inner}</p>`;
    case "heading": return `<h${node.attrs?.level}>${inner}</h${node.attrs?.level}>`;
    case "image": return `<img src="${node.attrs?.src}" alt="${node.attrs?.alt ?? ""}">`;
    case "bulletList": return `<ul>${inner}</ul>`;
    case "orderedList": return `<ol>${inner}</ol>`;
    case "listItem": return `<li>${inner}</li>`;
    case "blockquote": return `<blockquote>${inner}</blockquote>`;
    case "codeBlock": return `<pre><code class="language-${node.attrs?.language}">${inner}</code></pre>`;
    case "table": return `<table><tbody>${inner}</tbody></table>`;
    case "tableRow": return `<tr>${inner}</tr>`;
    case "tableHeader": return `<th>${inner}</th>`;
    case "tableCell": return `<td>${inner}</td>`;
    case "youtube": return `<div data-youtube-video=""><iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" width="640" height="360"></iframe></div>`;
    default: return inner;
  }
}

function article(doc: object, extra: Partial<ArticleInput> = {}): ArticleInput {
  return { title: "Field note", slug: "", excerpt: "", coverImage: "", status: "PUBLISHED", isFeatured: false, categoryId: "", tagIds: [], ...editorPayload(doc), ...extra };
}

/** The public page's render path for a saved article. */
async function renderPublished(slug: string) {
  const a = await journalRepository.findPublishedBySlug(slug);
  return highlightCodeBlocks(withHeadingAnchors(a!.contentHtml ?? "").html);
}

const ok = <T,>(r: { ok: boolean } & ({ data: T } | { error: string })) => {
  if (!r.ok) throw new Error(`expected ok, got ${JSON.stringify(r)}`);
  return (r as { data: T }).data;
};

describe.skipIf(!integrationEnabled)("rich-text persistence (real PostgreSQL + local storage)", () => {
  beforeEach(async () => {
    await resetDatabase();
    session.current = { user: { role: "ADMIN", id: "t" } };
  });

  it("A: text-only formatting is saved, retrieved and rendered intact", async () => {
    const doc = mixedDocument([]);
    const saved = ok(await createArticle(article(doc)));
    const row = await prisma.journalArticle.findUniqueOrThrow({ where: { id: saved.id } });
    expect(row.content).toEqual(toPlainJson(asEditorJson(doc)));
    const html = await renderPublished(saved.slug);
    for (const s of ['<h2 id="overview">', "<strong>bold</strong>", "<em>italic</em>", 'href="https://example.com/docs"', "<ul>", "<ol>", "<blockquote>", "hljs"]) expect(html).toContain(s);
  });

  it("B: a single uploaded image is persisted as a durable reference and renders", async () => {
    const img = await uploadFixture("red.png");
    const saved = ok(await createArticle(article(mixedDocument([{ src: img.url, alt: "Red square" }]))));
    const row = await prisma.journalArticle.findUniqueOrThrow({ where: { id: saved.id } });
    expect(collectMedia(row.content as RichTextDocument).filter((m) => m.type === "image")).toEqual([{ type: "image", src: img.url, alt: "Red square" }]);
    expect(await renderPublished(saved.slug)).toContain(`<img src="${img.url}" alt="Red square" />`);
    expect(await mediaService.findUsages(img.url)).toBe(1);
  });

  it("C/D: multiple images and mixed content keep structure and order exactly", async () => {
    const [a, b, c] = [await uploadFixture("red.png"), await uploadFixture("blue.png"), await uploadFixture("green.png")];
    const doc = mixedDocument([{ src: a.url, alt: "one" }, { src: b.url, alt: "two" }, { src: c.url, alt: "three" }]);
    const saved = ok(await createArticle(article(doc)));
    const row = await prisma.journalArticle.findUniqueOrThrow({ where: { id: saved.id } });
    expect(row.content).toEqual(toPlainJson(asEditorJson(doc)));
    expect(collectHtmlImageSources(await renderPublished(saved.slug))).toEqual([a.url, b.url, c.url]);
    expect(await renderPublished(saved.slug)).toContain("youtube-nocookie.com/embed/");
  });

  it("E: update adds, removes and reorders images; removed media follows the library policy", async () => {
    const [a, b, c] = [await uploadFixture("red.png"), await uploadFixture("blue.png"), await uploadFixture("green.png")];
    const created = ok(await createArticle(article(mixedDocument([{ src: a.url }, { src: b.url }]))));

    // Remove A, move B first, add C.
    const updated = ok(await updateArticle(created.id, article(mixedDocument([{ src: b.url }, { src: c.url }]), { title: "Edited note" }), { expectedUpdatedAt: created.updatedAt }));
    const row = await prisma.journalArticle.findUniqueOrThrow({ where: { id: created.id } });
    expect(row.title).toBe("Edited note");
    expect(collectMedia(row.content as RichTextDocument).filter((m) => m.type === "image").map((m) => m.src)).toEqual([b.url, c.url]);
    expect(collectHtmlImageSources(row.contentHtml)).toEqual([b.url, c.url]);
    expect(updated.updatedAt).not.toBe(created.updatedAt);

    // Removed media stays in the library and becomes deletable; used media is protected.
    expect(await mediaService.deleteIfUnused(b.id)).toMatchObject({ ok: false });
    expect(await mediaService.deleteIfUnused(a.id)).toEqual({ ok: true });
  });

  it("raw (un-normalized) editor attrs no longer reach Prisma: rejected as validation, not a 500", async () => {
    const poisoned = new Proxy(function () {}, { get: () => { throw new Error("Cannot access toStringTag on the server"); } });
    const result = await createArticle({ ...article(mixedDocument([])), content: { type: "doc", content: [{ type: "image", attrs: poisoned as never }] } });
    expect(result).toMatchObject({ ok: false, code: "VALIDATION" });
    expect(await prisma.journalArticle.count()).toBe(0);
  });

  it("F: invalid media references are rejected with an actionable error and nothing is written", async () => {
    const missing = "/api/upload/99999999-9999-4999-8999-999999999999.png";
    const r1 = await createArticle(article(mixedDocument([{ src: missing }])));
    expect(r1).toMatchObject({ ok: false, code: "MEDIA" });
    expect(!r1.ok && r1.error).toMatch(/not in the media library/);

    const r2 = await createArticle({ ...article(mixedDocument([])), content: { type: "doc", content: [{ type: "image", attrs: { src: "blob:http://localhost/x" } }] } });
    expect(r2).toMatchObject({ ok: false, code: "VALIDATION" });
    expect(!r2.ok && r2.error).toMatch(/not uploaded yet/);

    const r3 = await createArticle({ ...article(mixedDocument([])), contentHtml: '<img src="http://insecure.example/x.png">' });
    expect(r3).toMatchObject({ ok: false, code: "MEDIA" });
    expect(await prisma.journalArticle.count()).toBe(0);
  });

  it("F: oversized payloads are rejected by validation", async () => {
    const r = await createArticle({ ...article(mixedDocument([])), contentHtml: "x".repeat(500001) });
    expect(r).toMatchObject({ ok: false, code: "VALIDATION" });
  });

  it("F: a real database failure returns a safe error and leaves no partial record", async () => {
    const r = await createArticle(article(mixedDocument([])), );
    expect(r.ok).toBe(true);
    const bad = await createArticle(article(mixedDocument([]), { categoryId: "does-not-exist" }));
    expect(bad).toMatchObject({ ok: false });
    expect(!bad.ok && bad.requestId).toBeTruthy();
    expect(!bad.ok && bad.error).not.toMatch(/prisma|invocation|SELECT/i);
    expect(await prisma.journalArticle.count()).toBe(1);
  });

  it("F: a retried update after a lost response is detected instead of overwriting newer content", async () => {
    const created = ok(await createArticle(article(mixedDocument([]))));
    ok(await updateArticle(created.id, article(mixedDocument([]), { title: "v2" }), { expectedUpdatedAt: created.updatedAt }));
    const retry = await updateArticle(created.id, article(mixedDocument([]), { title: "v2-retry" }), { expectedUpdatedAt: created.updatedAt });
    expect(retry).toMatchObject({ ok: false, code: "CONFLICT" });
    expect((await prisma.journalArticle.findUniqueOrThrow({ where: { id: created.id } })).title).toBe("v2");
  });

  it("concurrent updates from the same version: exactly one wins", async () => {
    const created = ok(await createArticle(article(mixedDocument([]))));
    const results = await Promise.all(
      ["tab-a", "tab-b"].map((t) => updateArticle(created.id, article(mixedDocument([]), { title: t }), { expectedUpdatedAt: created.updatedAt })),
    );
    expect(results.filter((r) => r.ok)).toHaveLength(1);
  });

  it("unauthenticated saves are refused", async () => {
    session.current = null;
    expect(await createArticle(article(mixedDocument([])))).toMatchObject({ ok: false, code: "UNAUTHORIZED" });
  });

  it("regression: HTML-only legacy articles stay readable and can be updated", async () => {
    const legacy = await prisma.journalArticle.create({ data: { title: "Legacy", slug: "legacy", contentHtml: "<h2>Old</h2><p>Body</p>", status: "PUBLISHED", publishedAt: new Date() } });
    expect(await renderPublished("legacy")).toContain('<h2 id="old">Old</h2>');
    const r = await updateArticle(legacy.id, { ...article(mixedDocument([])), content: null, contentHtml: "<h2>Old</h2><p>Body edited</p>", slug: "legacy" });
    expect(r.ok).toBe(true);
    expect(await renderPublished("legacy")).toContain("Body edited");
  });

  it("ideas share the same pipeline: create and update with images", async () => {
    const [a, b] = [await uploadFixture("red.png"), await uploadFixture("blue.png")];
    const base = { title: "An idea", summary: "", categoryId: "", status: "EXPLORING" as const, coverImage: "", isPublic: true, tagIds: [] };
    const created = ok(await createIdea({ ...base, ...editorPayload(mixedDocument([{ src: a.url }])) }));
    ok(await updateIdea(created.id, { ...base, ...editorPayload(mixedDocument([{ src: b.url }, { src: a.url }])) }, { expectedUpdatedAt: created.updatedAt }));
    const row = await prisma.idea.findUniqueOrThrow({ where: { id: created.id } });
    expect(collectMedia(row.content as RichTextDocument).filter((m) => m.type === "image").map((m) => m.src)).toEqual([b.url, a.url]);
    expect(await createIdea({ ...base, ...editorPayload(mixedDocument([{ src: "/api/upload/99999999-9999-4999-8999-999999999999.png" }])) })).toMatchObject({ ok: false, code: "MEDIA" });
  });
});
