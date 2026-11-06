import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const ideaStatusLabels: Record<string, string> = {
  THOUGHT: "THOUGHT",
  EXPLORING: "EXPLORING",
  EXPERIMENTING: "EXPERIMENTING",
  IMPLEMENTED: "IMPLEMENTED",
  ARCHIVED: "ARCHIVED",
};

export interface IdeaCardData {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  status: string;
  publishedAt: Date | null;
  createdAt: Date;
  category: { name: string } | null;
}

export function IdeaCard({ idea }: { idea: IdeaCardData }) {
  return (
    <Link href={`/ideas/${idea.slug}`} className="idea-card">
      <div className="idea-card-top">
        <span className={`idea-status idea-status-${idea.status.toLowerCase()}`}>{ideaStatusLabels[idea.status]}</span>
        <ArrowUpRight size={16} className="idea-card-arrow" />
      </div>
      <h3>{idea.title}</h3>
      {idea.summary && <p>{idea.summary}</p>}
      <div className="article-meta">
        {formatDate(idea.publishedAt ?? idea.createdAt)}
        {idea.category && (
          <>
            <span>&middot;</span>
            {idea.category.name.toUpperCase()}
          </>
        )}
      </div>
    </Link>
  );
}
