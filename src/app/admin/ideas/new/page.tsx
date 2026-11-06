import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin";
import { IdeaForm } from "@/components/admin/IdeaForm";
import { categoryRepository } from "@/server/repositories/category";
import { tagRepository } from "@/server/repositories/tag";
import { mediaRepository } from "@/server/repositories/media";

export const metadata: Metadata = { title: "New idea" };

export default async function NewIdeaPage() {
  await requireAdminPage();
  const [categories, tags, media] = await Promise.all([categoryRepository.findAll(), tagRepository.findAll(), mediaRepository.findForPicker()]);

  return (
    <>
      <div className="admin-header">
        <h1>New idea</h1>
      </div>
      <IdeaForm categories={categories} tags={tags} media={media} />
    </>
  );
}
