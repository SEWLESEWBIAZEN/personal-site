import Link from "next/link";
import type { Metadata } from "next";
import { Pencil, Plus, Eye } from "lucide-react";
import { requireAdminPage } from "@/lib/admin";
import { journalRepository } from "@/server/repositories/journal";
import { formatDate } from "@/lib/utils";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { StatusSelect, ToggleButton } from "@/components/admin/RowActions";
import { deleteArticle } from "@/server/actions/journal";
import { setArticleStatus, toggleArticleFeatured } from "@/server/actions/status";
import { contentStatusOptions } from "@/components/admin/options";

export const metadata: Metadata = { title: "Journal" };

const statusOptions = contentStatusOptions;

export default async function AdminJournalPage() {
  await requireAdminPage();
  const articles = await journalRepository.findAll();

  return (
    <>
      <div className="admin-header">
        <h1>Journal</h1>
        <Link href="/admin/journal/new" className="admin-btn admin-btn-primary">
          <Plus size={14} /> New article
        </Link>
      </div>
      <div className="admin-card admin-table-wrap" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>TITLE</th>
              <th>STATUS</th>
              <th>FEATURED</th>
              <th>CATEGORY</th>
              <th>READ</th>
              <th>UPDATED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id}>
                <td style={{ fontWeight: 500 }}>
                  <Link className="admin-title-link" href={`/admin/journal/${a.id}/edit`}>
                    {a.title}
                  </Link>
                </td>
                <td>
                  <StatusSelect id={a.id} value={a.status} options={statusOptions} action={setArticleStatus} />
                </td>
                <td>
                  <ToggleButton id={a.id} active={a.isFeatured} labels={["★ Featured", "Feature"]} action={toggleArticleFeatured} />
                </td>
                <td style={{ color: "var(--muted)" }}>{a.category?.name ?? "—"}</td>
                <td style={{ color: "var(--muted)" }}>{a.readingTime ? `${a.readingTime} min` : "—"}</td>
                <td style={{ color: "var(--muted)", fontSize: 12 }}>{formatDate(a.updatedAt)}</td>
                <td>
                  <div className="admin-btn-row">
                    <Link href={`/admin/journal/${a.id}/edit`} className="admin-btn admin-btn-sm">
                      <Pencil size={12} /> Edit
                    </Link>
                    {a.status === "PUBLISHED" && (
                      <Link href={`/journal/${a.slug}`} target="_blank" className="admin-btn admin-btn-sm" aria-label="View on site">
                        <Eye size={12} />
                      </Link>
                    )}
                    <DeleteButton id={a.id} action={deleteArticle} label="article" />
                  </div>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "var(--muted)", padding: 40 }}>
                  No articles yet. <Link href="/admin/journal/new" style={{ color: "var(--blue)" }}>Write your first article</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
