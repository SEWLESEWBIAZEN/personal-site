"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projectSchema, projectMediaSchema, type ProjectInput, type ProjectMediaInput } from "@/schemas/project";
import { uniqueSlug } from "@/server/services/slug";
import { resolvePublishedAt } from "@/server/services/content";

const findBySlug = (slug: string) => prisma.project.findUnique({ where: { slug }, select: { id: true } });

function revalidate(slug?: string) {
  revalidatePath("/");
  revalidatePath("/projects");
  if (slug) revalidatePath(`/projects/${slug}`);
  revalidatePath("/admin/projects");
  revalidatePath("/sitemap.xml");
}

function toData(data: ProjectInput) {
  return {
    title: data.title,
    shortDescription: data.shortDescription || null,
    description: data.description || null,
    problemStatement: data.problemStatement || null,
    solution: data.solution || null,
    technicalChallenges: data.technicalChallenges || null,
    architecture: data.architecture || null,
    keyFeatures: data.keyFeatures || null,
    technologies: [...new Set(data.technologies)],
    coverImage: data.coverImage || null,
    videoUrl: data.videoUrl || null,
    liveUrl: data.liveUrl || null,
    repositoryUrl: data.repositoryUrl || null,
    status: data.status,
    isFeatured: data.isFeatured,
    displayOrder: data.displayOrder,
  };
}

export async function createProject(input: ProjectInput) {
  await requireAdmin();
  const data = projectSchema.parse(input);
  const slug = await uniqueSlug(data.title, findBySlug);

  const project = await prisma.project.create({
    data: {
      ...toData(data),
      slug,
      publishedAt: resolvePublishedAt(data.status === "PUBLISHED", null),
      ...(data.categoryId ? { category: { connect: { id: data.categoryId } } } : {}),
      tags: { connect: data.tagIds.map((id) => ({ id })) },
    },
  });

  revalidate(project.slug);
  return { id: project.id, slug: project.slug };
}

export async function updateProject(id: string, input: ProjectInput) {
  await requireAdmin();
  const data = projectSchema.parse(input);

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) throw new Error("Project not found");

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...toData(data),
      publishedAt: resolvePublishedAt(data.status === "PUBLISHED", existing.publishedAt),
      category: data.categoryId ? { connect: { id: data.categoryId } } : { disconnect: true },
      tags: { set: data.tagIds.map((tagId) => ({ id: tagId })) },
    },
  });

  revalidate(project.slug);
  return { id: project.id, slug: project.slug };
}

export async function deleteProject(id: string) {
  await requireAdmin();
  const project = await prisma.project.delete({ where: { id } });
  revalidate(project.slug);
}

export async function addProjectMedia(projectId: string, input: ProjectMediaInput) {
  await requireAdmin();
  const data = projectMediaSchema.parse(input);

  const project = await prisma.$transaction(async (tx) => {
    const last = await tx.projectMedia.aggregate({ where: { projectId }, _max: { displayOrder: true } });
    await tx.projectMedia.create({
      data: {
        projectId,
        url: data.url,
        mediaType: data.mediaType,
        altText: data.altText || null,
        caption: data.caption || null,
        displayOrder: (last._max.displayOrder ?? -1) + 1,
      },
    });
    return tx.project.findUniqueOrThrow({ where: { id: projectId }, select: { slug: true } });
  });

  revalidate(project.slug);
}

export async function removeProjectMedia(mediaId: string) {
  await requireAdmin();
  const media = await prisma.projectMedia.delete({ where: { id: mediaId }, include: { project: { select: { slug: true } } } });
  revalidate(media.project.slug);
}

export async function moveProjectMedia(mediaId: string, direction: "up" | "down") {
  await requireAdmin();

  const slug = await prisma.$transaction(async (tx) => {
    const item = await tx.projectMedia.findUniqueOrThrow({ where: { id: mediaId }, include: { project: { select: { slug: true } } } });
    const siblings = await tx.projectMedia.findMany({
      where: { projectId: item.projectId },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    });
    const index = siblings.findIndex((s) => s.id === mediaId);
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= siblings.length) return item.project.slug;

    [siblings[index], siblings[target]] = [siblings[target], siblings[index]];
    await Promise.all(
      siblings.map((s, i) => tx.projectMedia.update({ where: { id: s.id }, data: { displayOrder: i } })),
    );
    return item.project.slug;
  });

  revalidate(slug);
}
