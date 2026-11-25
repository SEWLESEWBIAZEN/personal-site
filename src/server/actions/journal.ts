"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserFacingError, type ActionResult } from "@/lib/action-result";
import { articleSchema, type ArticleInput } from "@/schemas/journal";
import { uniqueSlug } from "@/server/services/slug";
import { buildRichContent, resolvePublishedAt } from "@/server/services/content";
import { runAction } from "@/server/services/action";

const findBySlug = (slug: string) => prisma.journalArticle.findUnique({ where: { slug }, select: { id: true } });

function revalidate(slug?: string) {
  revalidatePath("/");
  revalidatePath("/journal");
  if (slug) revalidatePath(`/journal/${slug}`);
  revalidatePath("/admin/journal");
  revalidatePath("/sitemap.xml");
}

export type SavedArticle = { id: string; slug: string; updatedAt: string };

export async function createArticle(input: ArticleInput): Promise<ActionResult<SavedArticle>> {
  return runAction("journal.create", {}, async () => {
    const data = articleSchema.parse(input);
    const slug = await uniqueSlug(data.slug || data.title, findBySlug);
    const body = await buildRichContent(data.content, data.contentHtml);

    const article = await prisma.journalArticle.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt || null,
        content: body.content,
        contentHtml: body.contentHtml,
        coverImage: data.coverImage || null,
        status: data.status,
        readingTime: body.readingTime,
        isFeatured: data.isFeatured,
        publishedAt: resolvePublishedAt(data.status === "PUBLISHED", null),
        ...(data.categoryId ? { category: { connect: { id: data.categoryId } } } : {}),
        tags: { connect: data.tagIds.map((id) => ({ id })) },
      },
    });

    revalidate(article.slug);
    return { id: article.id, slug: article.slug, updatedAt: article.updatedAt.toISOString() };
  });
}

export async function updateArticle(
  id: string,
  input: ArticleInput,
  options: { expectedUpdatedAt?: string } = {},
): Promise<ActionResult<SavedArticle>> {
  return runAction("journal.update", { id }, async () => {
    const data = articleSchema.parse(input);

    const existing = await prisma.journalArticle.findUnique({ where: { id } });
    if (!existing) throw new UserFacingError("This article no longer exists.", "NOT_FOUND");
    assertNotStale(existing.updatedAt, options.expectedUpdatedAt);

    const slug = data.slug && data.slug !== existing.slug
      ? await uniqueSlug(data.slug, findBySlug, id)
      : existing.slug;
    const body = await buildRichContent(data.content, data.contentHtml);

    // The updatedAt filter makes the stale check atomic with the write (P2025 if it lost the race).
    const article = await prisma.journalArticle.update({
      where: { id, ...(options.expectedUpdatedAt ? { updatedAt: existing.updatedAt } : {}) },
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt || null,
        content: body.content,
        contentHtml: body.contentHtml,
        coverImage: data.coverImage || null,
        status: data.status,
        readingTime: body.readingTime,
        isFeatured: data.isFeatured,
        publishedAt: resolvePublishedAt(data.status === "PUBLISHED", existing.publishedAt),
        category: data.categoryId ? { connect: { id: data.categoryId } } : { disconnect: true },
        tags: { set: data.tagIds.map((tagId) => ({ id: tagId })) },
      },
    });

    revalidate(existing.slug);
    revalidate(article.slug);
    return { id: article.id, slug: article.slug, updatedAt: article.updatedAt.toISOString() };
  });
}

function assertNotStale(current: Date, expected?: string) {
  if (expected && current.toISOString() !== expected) {
    throw new UserFacingError(
      "This article was saved from another tab or device after you opened it. Reload to get the latest version (your changes are kept on this device).",
      "CONFLICT",
    );
  }
}

export async function deleteArticle(id: string) {
  await requireAdmin();
  const article = await prisma.journalArticle.delete({ where: { id } });
  revalidate(article.slug);
}
