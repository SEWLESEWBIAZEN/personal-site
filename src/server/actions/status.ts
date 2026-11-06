"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const contentStatus = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function setProjectStatus(id: string, status: z.infer<typeof contentStatus>) {
  await requireAdmin();
  const next = contentStatus.parse(status);
  const existing = await prisma.project.findUniqueOrThrow({ where: { id }, select: { publishedAt: true } });
  await prisma.project.update({
    where: { id },
    data: { status: next, publishedAt: existing.publishedAt ?? (next === "PUBLISHED" ? new Date() : null) },
  });
  revalidateAll();
}

export async function toggleProjectFeatured(id: string) {
  await requireAdmin();
  const existing = await prisma.project.findUniqueOrThrow({ where: { id }, select: { isFeatured: true } });
  await prisma.project.update({ where: { id }, data: { isFeatured: !existing.isFeatured } });
  revalidateAll();
}

export async function setArticleStatus(id: string, status: z.infer<typeof contentStatus>) {
  await requireAdmin();
  const next = contentStatus.parse(status);
  const existing = await prisma.journalArticle.findUniqueOrThrow({ where: { id }, select: { publishedAt: true } });
  await prisma.journalArticle.update({
    where: { id },
    data: { status: next, publishedAt: existing.publishedAt ?? (next === "PUBLISHED" ? new Date() : null) },
  });
  revalidateAll();
}

export async function toggleArticleFeatured(id: string) {
  await requireAdmin();
  const existing = await prisma.journalArticle.findUniqueOrThrow({ where: { id }, select: { isFeatured: true } });
  await prisma.journalArticle.update({ where: { id }, data: { isFeatured: !existing.isFeatured } });
  revalidateAll();
}

export async function toggleIdeaVisibility(id: string) {
  await requireAdmin();
  const existing = await prisma.idea.findUniqueOrThrow({ where: { id }, select: { isPublic: true, publishedAt: true } });
  const isPublic = !existing.isPublic;
  await prisma.idea.update({
    where: { id },
    data: { isPublic, publishedAt: existing.publishedAt ?? (isPublic ? new Date() : null) },
  });
  revalidateAll();
}

export async function setIdeaStatus(id: string, status: string) {
  await requireAdmin();
  const next = z.enum(["THOUGHT", "EXPLORING", "EXPERIMENTING", "IMPLEMENTED", "ARCHIVED"]).parse(status);
  await prisma.idea.update({ where: { id }, data: { status: next } });
  revalidateAll();
}
