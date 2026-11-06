import { prisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage";

export const mediaService = {
  async findUsages(url: string) {
    const [projects, projectMedia, articles, ideas, settings] = await Promise.all([
      prisma.project.count({ where: { coverImage: url } }),
      prisma.projectMedia.count({ where: { OR: [{ url }, { thumbnailUrl: url }] } }),
      prisma.journalArticle.count({ where: { OR: [{ coverImage: url }, { contentHtml: { contains: url } }] } }),
      prisma.idea.count({ where: { OR: [{ coverImage: url }, { contentHtml: { contains: url } }] } }),
      prisma.siteSettings.count({ where: { profileImage: url } }),
    ]);
    return projects + projectMedia + articles + ideas + settings;
  },

  async deleteIfUnused(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) return { ok: false, error: "Media not found" };

    const usages = await this.findUsages(media.url);
    if (usages > 0) {
      return { ok: false, error: `This file is still used in ${usages} place(s). Remove those references first.` };
    }

    await prisma.media.delete({ where: { id } });
    await getStorage(media.storageProvider).delete(media.filename);
    return { ok: true };
  },
};
