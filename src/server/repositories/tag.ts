import { prisma } from "@/lib/prisma";

export const tagRepository = {
  findAll() {
    return prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { projects: true, articles: true, ideas: true } } },
    });
  },
};
