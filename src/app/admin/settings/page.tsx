import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin";
import { settingsRepository } from "@/server/repositories/settings";
import { nowRepository } from "@/server/repositories/now";
import { categoryRepository } from "@/server/repositories/category";
import { tagRepository } from "@/server/repositories/tag";
import { mediaRepository } from "@/server/repositories/media";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { NowItemsManager } from "@/components/admin/NowItemsManager";
import { TaxonomyManager } from "@/components/admin/TaxonomyManager";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  await requireAdminPage();
  const [settings, nowItems, categories, tags, media] = await Promise.all([
    settingsRepository.get(),
    nowRepository.findAll(),
    categoryRepository.findAll(),
    tagRepository.findAll(),
    mediaRepository.findForPicker(),
  ]);

  return (
    <>
      <div className="admin-header">
        <h1>Settings</h1>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 820 }}>
        <SettingsForm settings={settings} media={media} />
        <NowItemsManager items={nowItems} />
        <TaxonomyManager
          categories={categories.map((c) => ({ id: c.id, name: c.name, count: c._count.projects + c._count.articles + c._count.ideas }))}
          tags={tags.map((t) => ({ id: t.id, name: t.name, count: t._count.projects + t._count.articles + t._count.ideas }))}
        />
      </div>
    </>
  );
}
