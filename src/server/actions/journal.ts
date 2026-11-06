"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { articleSchema, type ArticleInput } from "@/schemas/journal";
import { uniqueSlug } from "@/server/services/slug";
import { prepareRichContent, resolvePublishedAt, toJson } from "@/server/services/content";

const findBySlug = (slug: string) => prisma.journalArticle.findUnique({ where: { slug }, select: { id: true } });

function revalidate(slug?: string) {
  revalidatePath("/");
  revalidatePath("/journal");
  if (slug) revalidatePath(`/journal/${slug}`);
  revalidatePath("/admin/journal");
  revalidatePath("/sitemap.xml");
}

export async function createArticle(input: ArticleInput) {
  await requireAdmin();
  const data = articleSchema.parse(input);
  const slug = await uniqueSlug(data.slug || data.title, findBySlug);
  const { contentHtml, readingTime } = prepareRichContent(data.contentHtml);

  const article = await prisma.journalArticle.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt || null,
      content: toJson(data.content),
      contentHtml,
      coverImage: data.coverImage || null,
      status: data.status,
      readingTime,
      isFeatured: data.isFeatured,
      publishedAt: resolvePublishedAt(data.status === "PUBLISHED", null),
      ...(data.categoryId ? { category: { connect: { id: data.categoryId } } } : {}),
      tags: { connect: data.tagIds.map((id) => ({ id })) },
    },
  });

  revalidate(article.slug);
  return { id: article.id, slug: article.slug };
}

export async function updateArticle(id: string, input: ArticleInput) {
  await requireAdmin();
  const data = articleSchema.parse(input);

  const existing = await prisma.journalArticle.findUnique({ where: { id } });
  if (!existing) throw new Error("Article not found");

  const slug = data.slug && data.slug !== existing.slug
    ? await uniqueSlug(data.slug, findBySlug, id)
    : existing.slug;
  const { contentHtml, readingTime } = prepareRichContent(data.contentHtml);

  const article = await prisma.journalArticle.update({
    where: { id },
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt || null,
      content: toJson(data.content),
      contentHtml,
      coverImage: data.coverImage || null,
      status: data.status,
      readingTime,
      isFeatured: data.isFeatured,
      publishedAt: resolvePublishedAt(data.status === "PUBLISHED", existing.publishedAt),
      category: data.categoryId ? { connect: { id: data.categoryId } } : { disconnect: true },
      tags: { set: data.tagIds.map((tagId) => ({ id: tagId })) },
    },
  });

  revalidate(existing.slug);
  revalidate(article.slug);
  return { id: article.id, slug: article.slug };
}

export async function deleteArticle(id: string) {
  await requireAdmin();
  const article = await prisma.journalArticle.delete({ where: { id } });
  revalidate(article.slug);
}
