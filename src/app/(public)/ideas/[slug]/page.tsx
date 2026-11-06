import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ideaRepository } from "@/server/repositories/idea";
import { ideaStatusLabels } from "@/components/ideas/IdeaCard";
import { RichContent } from "@/components/journal/RichContent";
import { absoluteUrl, formatDate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const idea = await ideaRepository.findPublicBySlug(slug);
  if (!idea) return { title: "Not found", robots: { index: false } };
  return {
    title: idea.title,
    description: idea.summary ?? undefined,
    alternates: { canonical: `/ideas/${idea.slug}` },
    openGraph: {
      title: idea.title,
      description: idea.summary ?? undefined,
      url: `/ideas/${idea.slug}`,
      images: idea.coverImage ? [absoluteUrl(idea.coverImage)] : undefined,
    },
  };
}

export default async function IdeaPage({ params }: Props) {
  const { slug } = await params;
  const idea = await ideaRepository.findPublicBySlug(slug);
  if (!idea) notFound();

  return (
    <article className="section-wrap detail-page">
      <Link href="/ideas" className="text-link back-link">
        &larr; ALL IDEAS
      </Link>
      <div className="eyebrow detail-eyebrow">
        <span className="eyebrow-line" /> IDEA
        <span className={`idea-status idea-status-${idea.status.toLowerCase()}`}>{ideaStatusLabels[idea.status]}</span>
      </div>
      <h1 className="detail-title">{idea.title}</h1>
      <div className="article-meta">
        {formatDate(idea.publishedAt ?? idea.createdAt)}
        {idea.category && (
          <>
            <span>&middot;</span>
            {idea.category.name.toUpperCase()}
          </>
        )}
      </div>
      {idea.summary && <p className="detail-lead">{idea.summary}</p>}
      {idea.coverImage && (
        <figure className="detail-cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={idea.coverImage} alt="" />
        </figure>
      )}
      {idea.contentHtml && (
        <div className="article-grid article-grid-single">
          <RichContent html={idea.contentHtml} />
        </div>
      )}
      {idea.tags.length > 0 && (
        <div className="tag-list detail-tags">
          {idea.tags.map((t) => (
            <span key={t.id}>#{t.name}</span>
          ))}
        </div>
      )}
    </article>
  );
}
