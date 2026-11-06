import Link from "next/link";
import type { Metadata } from "next";
import { Pencil, Plus, Eye } from "lucide-react";
import { requireAdminPage } from "@/lib/admin";
import { projectRepository } from "@/server/repositories/project";
import { formatDate } from "@/lib/utils";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { StatusSelect, ToggleButton } from "@/components/admin/RowActions";
import { deleteProject } from "@/server/actions/project";
import { setProjectStatus, toggleProjectFeatured } from "@/server/actions/status";
import { contentStatusOptions } from "@/components/admin/options";

export const metadata: Metadata = { title: "Projects" };

const statusOptions = contentStatusOptions;

export default async function AdminProjectsPage() {
  await requireAdminPage();
  const projects = await projectRepository.findAll();

  return (
    <>
      <div className="admin-header">
        <h1>Projects</h1>
        <Link href="/admin/projects/new" className="admin-btn admin-btn-primary">
          <Plus size={14} /> New project
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
              <th>ORDER</th>
              <th>UPDATED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id}>
                <td style={{ fontWeight: 500 }}>
                  <Link className="admin-title-link" href={`/admin/projects/${p.id}/edit`}>
                    {p.title}
                  </Link>
                </td>
                <td>
                  <StatusSelect id={p.id} value={p.status} options={statusOptions} action={setProjectStatus} />
                </td>
                <td>
                  <ToggleButton id={p.id} active={p.isFeatured} labels={["★ Featured", "Feature"]} action={toggleProjectFeatured} />
                </td>
                <td style={{ color: "var(--muted)" }}>{p.category?.name ?? "—"}</td>
                <td style={{ color: "var(--muted)" }}>{p.displayOrder}</td>
                <td style={{ color: "var(--muted)", fontSize: 12 }}>{formatDate(p.updatedAt)}</td>
                <td>
                  <div className="admin-btn-row">
                    <Link href={`/admin/projects/${p.id}/edit`} className="admin-btn admin-btn-sm">
                      <Pencil size={12} /> Edit
                    </Link>
                    {p.status === "PUBLISHED" && (
                      <Link href={`/projects/${p.slug}`} target="_blank" className="admin-btn admin-btn-sm" aria-label="View on site">
                        <Eye size={12} />
                      </Link>
                    )}
                    <DeleteButton id={p.id} action={deleteProject} label="project" />
                  </div>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "var(--muted)", padding: 40 }}>
                  No projects yet. <Link href="/admin/projects/new" style={{ color: "var(--blue)" }}>Create your first project</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
