import { prisma } from "@/lib/prisma";

export const categoryRepository = {
  findAll() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { projects: true, articles: true, ideas: true } } },
    });
  },

  findWithPublishedArticles() {
    return prisma.category.findMany({
      where: { articles: { some: { status: "PUBLISHED" } } },
      select: { name: true, slug: true },
      orderBy: { name: "asc" },
    });
  },
};
