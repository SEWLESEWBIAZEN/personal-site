import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { categoryRepository } from "@/server/repositories/category";
import { tagRepository } from "@/server/repositories/tag";
import { mediaRepository } from "@/server/repositories/media";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage() {
  await requireAdminPage();
  const [categories, tags, media] = await Promise.all([categoryRepository.findAll(), tagRepository.findAll(), mediaRepository.findForPicker()]);

  return (
    <>
      <div className="admin-header">
        <h1>New project</h1>
      </div>
      <ProjectForm categories={categories} tags={tags} media={media} />
      <p className="admin-form-hint" style={{ marginTop: 16 }}>The gallery becomes available after the project is created.</p>
    </>
  );
}
