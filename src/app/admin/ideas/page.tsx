import Link from "next/link";
import type { Metadata } from "next";
import { Pencil, Plus, Eye } from "lucide-react";
import { requireAdminPage } from "@/lib/admin";
import { ideaRepository } from "@/server/repositories/idea";
import { formatDate } from "@/lib/utils";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { StatusSelect, ToggleButton } from "@/components/admin/RowActions";
import { deleteIdea } from "@/server/actions/idea";
import { setIdeaStatus, toggleIdeaVisibility } from "@/server/actions/status";
import { ideaStatusOptions } from "@/components/admin/options";

export const metadata: Metadata = { title: "Ideas" };

export default async function AdminIdeasPage() {
  await requireAdminPage();
  const ideas = await ideaRepository.findAll();

  return (
    <>
      <div className="admin-header">
        <h1>Ideas</h1>
        <Link href="/admin/ideas/new" className="admin-btn admin-btn-primary">
          <Plus size={14} /> New idea
        </Link>
      </div>
      <div className="admin-card admin-table-wrap" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>TITLE</th>
              <th>STAGE</th>
              <th>VISIBILITY</th>
              <th>CATEGORY</th>
              <th>UPDATED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {ideas.map((idea) => (
              <tr key={idea.id}>
                <td style={{ fontWeight: 500 }}>
                  <Link className="admin-title-link" href={`/admin/ideas/${idea.id}/edit`}>
                    {idea.title}
                  </Link>
                </td>
                <td>
                  <StatusSelect id={idea.id} value={idea.status} options={ideaStatusOptions} action={setIdeaStatus} />
                </td>
                <td>
                  <ToggleButton id={idea.id} active={idea.isPublic} labels={["Public", "Private"]} action={toggleIdeaVisibility} />
                </td>
                <td style={{ color: "var(--muted)" }}>{idea.category?.name ?? "—"}</td>
                <td style={{ color: "var(--muted)", fontSize: 12 }}>{formatDate(idea.updatedAt)}</td>
                <td>
                  <div className="admin-btn-row">
                    <Link href={`/admin/ideas/${idea.id}/edit`} className="admin-btn admin-btn-sm">
                      <Pencil size={12} /> Edit
                    </Link>
                    {idea.isPublic && idea.status !== "ARCHIVED" && (
                      <Link href={`/ideas/${idea.slug}`} target="_blank" className="admin-btn admin-btn-sm" aria-label="View on site">
                        <Eye size={12} />
                      </Link>
                    )}
                    <DeleteButton id={idea.id} action={deleteIdea} label="idea" />
                  </div>
                </td>
              </tr>
            ))}
            {ideas.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: 40 }}>
                  No ideas yet. <Link href="/admin/ideas/new" style={{ color: "var(--blue)" }}>Capture your first idea</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
