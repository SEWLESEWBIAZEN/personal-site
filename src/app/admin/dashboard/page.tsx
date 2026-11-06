import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { requireAdminPage } from "@/lib/admin";
import { projectRepository } from "@/server/repositories/project";
import { journalRepository } from "@/server/repositories/journal";
import { ideaRepository } from "@/server/repositories/idea";
import { mediaRepository } from "@/server/repositories/media";
import { findRecentUpdates } from "@/server/repositories/recent";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  await requireAdminPage();

  const [totalProjects, publishedProjects, draftProjects, publishedArticles, draftArticles, publicIdeas, totalIdeas, totalMedia, recent] =
    await Promise.all([
      projectRepository.count(),
      projectRepository.count("PUBLISHED"),
      projectRepository.count("DRAFT"),
      journalRepository.count("PUBLISHED"),
      journalRepository.count("DRAFT"),
      ideaRepository.countPublic(),
      ideaRepository.count(),
      mediaRepository.count(),
      findRecentUpdates(8),
    ]);

  const stats = [
    ["TOTAL PROJECTS", totalProjects],
    ["PUBLISHED PROJECTS", publishedProjects],
    ["DRAFT PROJECTS", draftProjects],
    ["PUBLISHED ARTICLES", publishedArticles],
    ["DRAFT ARTICLES", draftArticles],
    ["PUBLIC IDEAS", `${publicIdeas} / ${totalIdeas}`],
    ["MEDIA FILES", totalMedia],
  ] as const;

  return (
    <>
      <div className="admin-header">
        <h1>Dashboard</h1>
        <div className="admin-btn-row">
          <Link href="/admin/journal/new" className="admin-btn admin-btn-primary">
            <Plus size={14} /> Article
          </Link>
          <Link href="/admin/projects/new" className="admin-btn">
            <Plus size={14} /> Project
          </Link>
          <Link href="/admin/ideas/new" className="admin-btn">
            <Plus size={14} /> Idea
          </Link>
        </div>
      </div>
      <div className="admin-stat-grid">
        {stats.map(([label, value]) => (
          <div className="admin-stat" key={label}>
            <div className="admin-stat-label">{label}</div>
            <div className="admin-stat-value">{value}</div>
          </div>
        ))}
      </div>
      <div className="admin-card">
        <h2 className="admin-section-title">Recent updates</h2>
        {recent.length === 0 ? (
          <p className="admin-list-meta">Nothing yet — create your first piece of content.</p>
        ) : (
          <div className="admin-list">
            {recent.map((r) => (
              <div className="admin-list-row" key={`${r.type}-${r.id}`}>
                <div>
                  <span className="admin-list-meta">{r.type.toUpperCase()} · </span>
                  <Link href={r.href}>{r.title}</Link>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span className={`admin-badge admin-badge-${r.status.toLowerCase()}`}>{r.status}</span>
                  <span className="admin-list-meta">{formatDate(r.updatedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
