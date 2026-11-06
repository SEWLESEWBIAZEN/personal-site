import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const include = { tags: true, category: true } satisfies Prisma.IdeaInclude;

export const publicIdeaWhere = {
  isPublic: true,
  status: { not: "ARCHIVED" },
} satisfies Prisma.IdeaWhereInput;

export const ideaRepository = {
  findAll() {
    return prisma.idea.findMany({ include, orderBy: { updatedAt: "desc" } });
  },

  findPublic(take?: number) {
    return prisma.idea.findMany({
      where: publicIdeaWhere,
      include,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      ...(take ? { take } : {}),
    });
  },

  findPublicBySlug(slug: string) {
    return prisma.idea.findFirst({ where: { slug, ...publicIdeaWhere }, include });
  },

  findById(id: string) {
    return prisma.idea.findUnique({ where: { id }, include });
  },

  countPublic() {
    return prisma.idea.count({ where: publicIdeaWhere });
  },

  count() {
    return prisma.idea.count();
  },
};
