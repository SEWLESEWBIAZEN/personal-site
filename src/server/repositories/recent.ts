import { prisma } from "@/lib/prisma";

export type RecentUpdate = { id: string; type: "Project" | "Article" | "Idea"; title: string; status: string; updatedAt: Date; href: string };

export async function findRecentUpdates(take = 8): Promise<RecentUpdate[]> {
  const select = { id: true, title: true, status: true, updatedAt: true } as const;
  const [projects, articles, ideas] = await Promise.all([
    prisma.project.findMany({ select, orderBy: { updatedAt: "desc" }, take }),
    prisma.journalArticle.findMany({ select, orderBy: { updatedAt: "desc" }, take }),
    prisma.idea.findMany({ select, orderBy: { updatedAt: "desc" }, take }),
  ]);

  return [
    ...projects.map((p) => ({ ...p, type: "Project" as const, href: `/admin/projects/${p.id}/edit` })),
    ...articles.map((a) => ({ ...a, type: "Article" as const, href: `/admin/journal/${a.id}/edit` })),
    ...ideas.map((i) => ({ ...i, type: "Idea" as const, href: `/admin/ideas/${i.id}/edit` })),
  ]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, take);
}
