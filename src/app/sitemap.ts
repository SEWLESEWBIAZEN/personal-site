import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/utils";
import { publicIdeaWhere } from "@/server/repositories/idea";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, articles, ideas] = await Promise.all([
    prisma.project.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.journalArticle.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.idea.findMany({ where: publicIdeaWhere, select: { slug: true, updatedAt: true } }),
  ]);

  const staticPages = ["/", "/projects", "/journal", "/ideas", "/about", "/now"].map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.8,
  }));

  return [
    ...staticPages,
    ...projects.map((p) => ({ url: absoluteUrl(`/projects/${p.slug}`), lastModified: p.updatedAt, priority: 0.7 })),
    ...articles.map((a) => ({ url: absoluteUrl(`/journal/${a.slug}`), lastModified: a.updatedAt, priority: 0.7 })),
    ...ideas.map((i) => ({ url: absoluteUrl(`/ideas/${i.slug}`), lastModified: i.updatedAt, priority: 0.5 })),
  ];
}
