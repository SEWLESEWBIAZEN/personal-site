import { prisma } from "@/lib/prisma";
import type { ContentStatus, Prisma } from "@prisma/client";

const include = {
  tags: true,
  category: true,
  media: { orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] },
} satisfies Prisma.ProjectInclude;

const publicOrder: Prisma.ProjectOrderByWithRelationInput[] = [
  { isFeatured: "desc" },
  { displayOrder: "asc" },
  { publishedAt: "desc" },
];

export type PublicProjectFilter = { category?: string; tech?: string; page?: number; pageSize?: number };

export const projectRepository = {
  findAll() {
    return prisma.project.findMany({ include, orderBy: [{ updatedAt: "desc" }] });
  },

  async findPublished({ category, tech, page = 1, pageSize = 12 }: PublicProjectFilter = {}) {
    const where: Prisma.ProjectWhereInput = {
      status: "PUBLISHED",
      ...(category ? { category: { slug: category } } : {}),
      ...(tech ? { technologies: { has: tech } } : {}),
    };
    const [items, total] = await prisma.$transaction([
      prisma.project.findMany({ where, include, orderBy: publicOrder, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.project.count({ where }),
    ]);
    return { items, total, pages: Math.max(1, Math.ceil(total / pageSize)) };
  },

  findFeatured(take = 6) {
    return prisma.project.findMany({ where: { status: "PUBLISHED" }, include, orderBy: publicOrder, take });
  },

  async publishedFacets() {
    const rows = await prisma.project.findMany({
      where: { status: "PUBLISHED" },
      select: { technologies: true, category: { select: { name: true, slug: true } } },
    });
    const categories = new Map<string, string>();
    const technologies = new Set<string>();
    for (const r of rows) {
      if (r.category) categories.set(r.category.slug, r.category.name);
      r.technologies.forEach((t) => technologies.add(t));
    }
    return {
      categories: [...categories].map(([slug, name]) => ({ slug, name })),
      technologies: [...technologies].sort((a, b) => a.localeCompare(b)),
    };
  },

  findPublishedBySlug(slug: string) {
    return prisma.project.findFirst({ where: { slug, status: "PUBLISHED" }, include });
  },

  findById(id: string) {
    return prisma.project.findUnique({ where: { id }, include });
  },

  count(status?: ContentStatus) {
    return prisma.project.count({ where: status ? { status } : undefined });
  },
};
