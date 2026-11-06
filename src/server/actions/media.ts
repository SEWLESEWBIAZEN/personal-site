"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mediaService } from "@/server/services/media";

export async function deleteMedia(id: string) {
  await requireAdmin();
  const result = await mediaService.deleteIfUnused(id);
  revalidatePath("/admin/media");
  return result;
}

export async function updateMediaAltText(id: string, altText: string) {
  await requireAdmin();
  await prisma.media.update({ where: { id }, data: { altText: altText.slice(0, 300) || null } });
  revalidatePath("/admin/media");
}
