import { prisma } from "@/lib/prisma";

const pickerSelect = { id: true, url: true, originalFilename: true, mimeType: true, size: true, altText: true } as const;

export const mediaRepository = {
  findAll() {
    return prisma.media.findMany({ orderBy: { createdAt: "desc" } });
  },

  findForPicker() {
    return prisma.media.findMany({ select: pickerSelect, orderBy: { createdAt: "desc" }, take: 300 });
  },

  count() {
    return prisma.media.count();
  },
};
