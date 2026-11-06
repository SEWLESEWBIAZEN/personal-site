"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { settingsRepository } from "@/server/repositories/settings";
import { uniqueSlug } from "@/server/services/slug";
import { nowItemSchema, settingsSchema, taxonomySchema, type NowItemInput, type SettingsInput } from "@/schemas/settings";

function revalidatePublic() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}

export async function updateSettings(input: SettingsInput) {
  await requireAdmin();
  const data = settingsSchema.parse(input);
  await settingsRepository.update({
    siteTitle: data.siteTitle,
    tagline: data.tagline,
    introduction: data.introduction || null,
    email: data.email || null,
    githubUrl: data.githubUrl || null,
    linkedinUrl: data.linkedinUrl || null,
    location: data.location || null,
    profileImage: data.profileImage || null,
  });
  revalidatePublic();
}

export async function createNowItem(input: NowItemInput) {
  await requireAdmin();
  const data = nowItemSchema.parse(input);
  await prisma.nowItem.create({ data });
  revalidatePublic();
}

export async function updateNowItem(id: string, input: NowItemInput) {
  await requireAdmin();
  const data = nowItemSchema.parse(input);
  await prisma.nowItem.update({ where: { id }, data });
  revalidatePublic();
}

export async function deleteNowItem(id: string) {
  await requireAdmin();
  await prisma.nowItem.delete({ where: { id } });
  revalidatePublic();
}

export async function createCategory(input: { name: string; description?: string | null }) {
  await requireAdmin();
  const data = taxonomySchema.parse(input);
  const slug = await uniqueSlug(data.name, (s) => prisma.category.findUnique({ where: { slug: s }, select: { id: true } }));
  await prisma.category.create({ data: { name: data.name, slug, description: data.description || null } });
  revalidatePublic();
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  // Content keeps existing; the relation is set to NULL by the FK (onDelete: SetNull).
  await prisma.category.delete({ where: { id } });
  revalidatePublic();
}

export async function createTag(input: { name: string }) {
  await requireAdmin();
  const data = taxonomySchema.parse(input);
  const slug = slugify(data.name);
  await prisma.tag.upsert({ where: { slug }, create: { name: data.name, slug }, update: {} });
  revalidatePublic();
}

export async function deleteTag(id: string) {
  await requireAdmin();
  await prisma.tag.delete({ where: { id } });
  revalidatePublic();
}
