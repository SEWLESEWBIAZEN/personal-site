import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { categoryRepository } from "@/server/repositories/category";
import { tagRepository } from "@/server/repositories/tag";
import { mediaRepository } from "@/server/repositories/media";

export const metadata: Metadata = { title: "New article" };

export default async function NewArticlePage() {
  await requireAdminPage();
  const [categories, tags, media] = await Promise.all([categoryRepository.findAll(), tagRepository.findAll(), mediaRepository.findForPicker()]);

  return (
    <>
      <div className="admin-header">
        <h1>New article</h1>
      </div>
      <ArticleForm categories={categories} tags={tags} media={media} />
    </>
  );
}
