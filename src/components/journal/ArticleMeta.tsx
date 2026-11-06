import { formatDate } from "@/lib/utils";

export function ArticleMeta({
  category,
  publishedAt,
  readingTime,
}: {
  category?: { name: string } | null;
  publishedAt: Date | null;
  readingTime: number | null;
}) {
  const parts = [
    category?.name.toUpperCase(),
    publishedAt ? formatDate(publishedAt) : null,
    readingTime ? `${readingTime} MIN READ` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="article-meta">
      {parts.map((p, i) => (
        <span key={p} className="article-meta-part">
          {i > 0 && <span>&middot;</span>}
          {p}
        </span>
      ))}
    </div>
  );
}
