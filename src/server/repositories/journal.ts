import { prisma } from "@/lib/prisma";
import type { ContentStatus, Prisma } from "@prisma/client";

const include = { tags: true, category: true } satisfies Prisma.JournalArticleInclude;

// Listing payload excludes the heavy content columns.
const listSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImage: true,
  publishedAt: true,
  readingTime: true,
  isFeatured: true,
  category: { select: { name: true, slug: true } },
  tags: { select: { name: true, slug: true } },
} satisfies Prisma.JournalArticleSelect;

export type JournalFilter = { q?: string; category?: string; tag?: string; page?: number; pageSize?: number };

export const journalRepository = {
  findAll() {
    return prisma.journalArticle.findMany({ include, orderBy: { updatedAt: "desc" } });
  },

  findRecent(take = 4) {
    return prisma.journalArticle.findMany({
      where: { status: "PUBLISHED" },
      select: listSelect,
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
      take,
    });
  },

  async findPublished({ q, category, tag, page = 1, pageSize = 10 }: JournalFilter = {}) {
    const where: Prisma.JournalArticleWhereInput = {
      status: "PUBLISHED",
      ...(category ? { category: { slug: category } } : {}),
      ...(tag ? { tags: { some: { slug: tag } } } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { excerpt: { contains: q, mode: "insensitive" } },
              { contentHtml: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [items, total] = await prisma.$transaction([
      prisma.journalArticle.findMany({
        where,
        select: listSelect,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.journalArticle.count({ where }),
    ]);
    return { items, total, pages: Math.max(1, Math.ceil(total / pageSize)) };
  },

  findPublishedBySlug(slug: string) {
    return prisma.journalArticle.findFirst({ where: { slug, status: "PUBLISHED" }, include });
  },

  async findRelated(article: { id: string; categoryId: string | null; tags: { id: string }[] }, take = 3) {
    const tagIds = article.tags.map((t) => t.id);
    if (!article.categoryId && tagIds.length === 0) return [];
    return prisma.journalArticle.findMany({
      where: {
        status: "PUBLISHED",
        id: { not: article.id },
        OR: [
          ...(article.categoryId ? [{ categoryId: article.categoryId }] : []),
          ...(tagIds.length ? [{ tags: { some: { id: { in: tagIds } } } }] : []),
        ],
      },
      select: listSelect,
      orderBy: { publishedAt: "desc" },
      take,
    });
  },

  findById(id: string) {
    return prisma.journalArticle.findUnique({ where: { id }, include });
  },

  count(status?: ContentStatus) {
    return prisma.journalArticle.count({ where: status ? { status } : undefined });
  },
};
