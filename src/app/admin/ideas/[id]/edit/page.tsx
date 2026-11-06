import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin";
import { IdeaForm } from "@/components/admin/IdeaForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteIdea } from "@/server/actions/idea";
import { ideaRepository } from "@/server/repositories/idea";
import { categoryRepository } from "@/server/repositories/category";
import { tagRepository } from "@/server/repositories/tag";
import { mediaRepository } from "@/server/repositories/media";

export const metadata: Metadata = { title: "Edit idea" };

type Props = { params: Promise<{ id: string }> };

export default async function EditIdeaPage({ params }: Props) {
  await requireAdminPage();
  const { id } = await params;
  const [idea, categories, tags, media] = await Promise.all([
    ideaRepository.findById(id),
    categoryRepository.findAll(),
    tagRepository.findAll(),
    mediaRepository.findForPicker(),
  ]);
  if (!idea) notFound();

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Edit idea</h1>
          <p className="admin-subtitle">
            {idea.status} · {idea.isPublic ? "PUBLIC" : "PRIVATE"}
          </p>
        </div>
        <DeleteButton id={idea.id} action={deleteIdea} label="idea" redirectTo="/admin/ideas" />
      </div>
      <IdeaForm
        key={idea.id}
        idea={{
          id: idea.id,
          slug: idea.slug,
          title: idea.title,
          summary: idea.summary ?? "",
          content: (idea.content as Record<string, unknown> | null) ?? null,
          contentHtml: idea.contentHtml ?? "",
          categoryId: idea.categoryId ?? "",
          status: idea.status,
          coverImage: idea.coverImage ?? "",
          isPublic: idea.isPublic,
          tagIds: idea.tags.map((t) => t.id),
        }}
        categories={categories}
        tags={tags}
        media={media}
      />
    </>
  );
}
