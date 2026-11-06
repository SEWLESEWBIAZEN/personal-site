import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Eye } from "lucide-react";
import { requireAdminPage } from "@/lib/admin";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteArticle } from "@/server/actions/journal";
import { journalRepository } from "@/server/repositories/journal";
import { categoryRepository } from "@/server/repositories/category";
import { tagRepository } from "@/server/repositories/tag";
import { mediaRepository } from "@/server/repositories/media";

export const metadata: Metadata = { title: "Edit article" };

type Props = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: Props) {
  await requireAdminPage();
  const { id } = await params;
  const [article, categories, tags, media] = await Promise.all([
    journalRepository.findById(id),
    categoryRepository.findAll(),
    tagRepository.findAll(),
    mediaRepository.findForPicker(),
  ]);
  if (!article) notFound();

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Edit article</h1>
          <p className="admin-subtitle">{article.status}</p>
        </div>
        <div className="admin-btn-row">
          {article.status === "PUBLISHED" && (
            <Link href={`/journal/${article.slug}`} target="_blank" className="admin-btn admin-btn-sm">
              <Eye size={12} /> View live
            </Link>
          )}
          <DeleteButton id={article.id} action={deleteArticle} label="article" redirectTo="/admin/journal" />
        </div>
      </div>
      <ArticleForm
        key={article.id}
        article={{
          id: article.id,
          slug: article.slug,
          updatedAt: article.updatedAt.toISOString(),
          persistedStatus: article.status,
          title: article.title,
          excerpt: article.excerpt ?? "",
          content: (article.content as Record<string, unknown> | null) ?? null,
          contentHtml: article.contentHtml ?? "",
          coverImage: article.coverImage ?? "",
          status: article.status,
          isFeatured: article.isFeatured,
          categoryId: article.categoryId ?? "",
          tagIds: article.tags.map((t) => t.id),
        }}
        categories={categories}
        tags={tags}
        media={media}
      />
    </>
  );
}
