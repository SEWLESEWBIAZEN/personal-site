"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserFacingError, type ActionResult } from "@/lib/action-result";
import { ideaSchema, type IdeaInput } from "@/schemas/idea";
import { uniqueSlug } from "@/server/services/slug";
import { buildRichContent, resolvePublishedAt } from "@/server/services/content";
import { runAction } from "@/server/services/action";

const findBySlug = (slug: string) => prisma.idea.findUnique({ where: { slug }, select: { id: true } });

function revalidate(slug?: string) {
  revalidatePath("/");
  revalidatePath("/ideas");
  if (slug) revalidatePath(`/ideas/${slug}`);
  revalidatePath("/admin/ideas");
  revalidatePath("/sitemap.xml");
}

export type SavedIdea = { id: string; slug: string; updatedAt: string };

export async function createIdea(input: IdeaInput): Promise<ActionResult<SavedIdea>> {
  return runAction("idea.create", {}, async () => {
    const data = ideaSchema.parse(input);
    const slug = await uniqueSlug(data.title, findBySlug);
    const body = await buildRichContent(data.content, data.contentHtml);

    const idea = await prisma.idea.create({
      data: {
        title: data.title,
        slug,
        summary: data.summary || null,
        content: body.content,
        contentHtml: body.contentHtml,
        status: data.status,
        coverImage: data.coverImage || null,
        isPublic: data.isPublic,
        publishedAt: resolvePublishedAt(data.isPublic, null),
        ...(data.categoryId ? { category: { connect: { id: data.categoryId } } } : {}),
        tags: { connect: data.tagIds.map((id) => ({ id })) },
      },
    });

    revalidate(idea.slug);
    return { id: idea.id, slug: idea.slug, updatedAt: idea.updatedAt.toISOString() };
  });
}

export async function updateIdea(
  id: string,
  input: IdeaInput,
  options: { expectedUpdatedAt?: string } = {},
): Promise<ActionResult<SavedIdea>> {
  return runAction("idea.update", { id }, async () => {
    const data = ideaSchema.parse(input);

    const existing = await prisma.idea.findUnique({ where: { id } });
    if (!existing) throw new UserFacingError("This idea no longer exists.", "NOT_FOUND");
    if (options.expectedUpdatedAt && existing.updatedAt.toISOString() !== options.expectedUpdatedAt) {
      throw new UserFacingError(
        "This idea was saved from another tab or device after you opened it. Reload to get the latest version.",
        "CONFLICT",
      );
    }

    const body = await buildRichContent(data.content, data.contentHtml);

    const idea = await prisma.idea.update({
      where: { id, ...(options.expectedUpdatedAt ? { updatedAt: existing.updatedAt } : {}) },
      data: {
        title: data.title,
        summary: data.summary || null,
        content: body.content,
        contentHtml: body.contentHtml,
        status: data.status,
        coverImage: data.coverImage || null,
        isPublic: data.isPublic,
        publishedAt: resolvePublishedAt(data.isPublic, existing.publishedAt),
        category: data.categoryId ? { connect: { id: data.categoryId } } : { disconnect: true },
        tags: { set: data.tagIds.map((tagId) => ({ id: tagId })) },
      },
    });

    revalidate(idea.slug);
    return { id: idea.id, slug: idea.slug, updatedAt: idea.updatedAt.toISOString() };
  });
}

export async function deleteIdea(id: string) {
  await requireAdmin();
  const idea = await prisma.idea.delete({ where: { id } });
  revalidate(idea.slug);
}
