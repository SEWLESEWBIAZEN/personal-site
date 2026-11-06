"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ideaSchema, type IdeaInput } from "@/schemas/idea";
import { uniqueSlug } from "@/server/services/slug";
import { prepareRichContent, resolvePublishedAt, toJson } from "@/server/services/content";

const findBySlug = (slug: string) => prisma.idea.findUnique({ where: { slug }, select: { id: true } });

function revalidate(slug?: string) {
  revalidatePath("/");
  revalidatePath("/ideas");
  if (slug) revalidatePath(`/ideas/${slug}`);
  revalidatePath("/admin/ideas");
  revalidatePath("/sitemap.xml");
}

export async function createIdea(input: IdeaInput) {
  await requireAdmin();
  const data = ideaSchema.parse(input);
  const slug = await uniqueSlug(data.title, findBySlug);
  const { contentHtml } = prepareRichContent(data.contentHtml);

  const idea = await prisma.idea.create({
    data: {
      title: data.title,
      slug,
      summary: data.summary || null,
      content: toJson(data.content),
      contentHtml,
      status: data.status,
      coverImage: data.coverImage || null,
      isPublic: data.isPublic,
      publishedAt: resolvePublishedAt(data.isPublic, null),
      ...(data.categoryId ? { category: { connect: { id: data.categoryId } } } : {}),
      tags: { connect: data.tagIds.map((id) => ({ id })) },
    },
  });

  revalidate(idea.slug);
  return { id: idea.id, slug: idea.slug };
}

export async function updateIdea(id: string, input: IdeaInput) {
  await requireAdmin();
  const data = ideaSchema.parse(input);

  const existing = await prisma.idea.findUnique({ where: { id } });
  if (!existing) throw new Error("Idea not found");

  const { contentHtml } = prepareRichContent(data.contentHtml);

  const idea = await prisma.idea.update({
    where: { id },
    data: {
      title: data.title,
      summary: data.summary || null,
      content: toJson(data.content),
      contentHtml,
      status: data.status,
      coverImage: data.coverImage || null,
      isPublic: data.isPublic,
      publishedAt: resolvePublishedAt(data.isPublic, existing.publishedAt),
      category: data.categoryId ? { connect: { id: data.categoryId } } : { disconnect: true },
      tags: { set: data.tagIds.map((tagId) => ({ id: tagId })) },
    },
  });

  revalidate(idea.slug);
  return { id: idea.id, slug: idea.slug };
}

export async function deleteIdea(id: string) {
  await requireAdmin();
  const idea = await prisma.idea.delete({ where: { id } });
  revalidate(idea.slug);
}
