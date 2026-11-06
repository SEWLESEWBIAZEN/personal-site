import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const settingsRepository = {
  // Deduplicated per request: layout, page and metadata all read settings.
  get: cache(async () => {
    const settings = await prisma.siteSettings.findFirst();
    return settings ?? prisma.siteSettings.create({ data: {} });
  }),

  async update(data: Prisma.SiteSettingsUpdateInput) {
    const existing = await prisma.siteSettings.findFirst({ select: { id: true } });
    if (!existing) {
      return prisma.siteSettings.create({ data: data as Prisma.SiteSettingsCreateInput });
    }
    return prisma.siteSettings.update({ where: { id: existing.id }, data });
  },
};
