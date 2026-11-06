import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { journalRepository } from "@/server/repositories/journal";
import { ArticleMeta } from "@/components/journal/ArticleMeta";
import { TableOfContents } from "@/components/journal/TableOfContents";
import { RichContent } from "@/components/journal/RichContent";
import { JsonLd } from "@/components/ui/JsonLd";
import { withHeadingAnchors } from "@/lib/content";
import { absoluteUrl } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await journalRepository.findPublishedBySlug(slug);
  if (!article) return { title: "Not found", robots: { index: false } };
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    alternates: { canonical: `/journal/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      type: "article",
      url: `/journal/${article.slug}`,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      tags: article.tags.map((t) => t.name),
      images: article.coverImage ? [absoluteUrl(article.coverImage)] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await journalRepository.findPublishedBySlug(slug);
  if (!article) notFound();

  const related = await journalRepository.findRelated(article);
  const { html, toc } = withHeadingAnchors(article.contentHtml ?? "");

  return (
    <article className="section-wrap detail-page">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: article.title,
          description: article.excerpt ?? undefined,
          url: absoluteUrl(`/journal/${article.slug}`),
          mainEntityOfPage: absoluteUrl(`/journal/${article.slug}`),
          image: article.coverImage ? absoluteUrl(article.coverImage) : undefined,
          datePublished: article.publishedAt?.toISOString(),
          dateModified: article.updatedAt.toISOString(),
          author: { "@type": "Person", name: "Sewlesew Biazen", url: absoluteUrl("/about") },
          keywords: article.tags.map((t) => t.name).join(", ") || undefined,
          articleSection: article.category?.name,
        }}
      />
      <Link href="/journal" className="text-link back-link">
        &larr; ALL NOTES
      </Link>
      <header className="article-header">
        <ArticleMeta category={article.category} publishedAt={article.publishedAt} readingTime={article.readingTime} />
        <h1 className="detail-title">{article.title}</h1>
        {article.excerpt && <p className="detail-lead">{article.excerpt}</p>}
        {article.tags.length > 0 && (
          <div className="tag-list">
            {article.tags.map((t) => (
              <Link key={t.id} href={`/journal?tag=${t.slug}`}>
                <span>#{t.name}</span>
              </Link>
            ))}
          </div>
        )}
      </header>

      {article.coverImage && (
        <figure className="detail-cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.coverImage} alt="" />
        </figure>
      )}

      <div className={toc.length >= 2 ? "article-grid" : "article-grid article-grid-single"}>
        <TableOfContents entries={toc} />
        <RichContent html={html} />
      </div>

      {related.length > 0 && (
        <section className="related">
          <h2 className="aside-label">RELATED NOTES</h2>
          <div className="article-list">
            {related.map((r, i) => (
              <article className="article-row" key={r.id}>
                <div className="article-number">{String(i + 1).padStart(2, "0")}</div>
                <div className="article-body">
                  <ArticleMeta category={r.category} publishedAt={r.publishedAt} readingTime={r.readingTime} />
                  <h3>
                    <Link href={`/journal/${r.slug}`}>{r.title}</Link>
                  </h3>
                  {r.excerpt && <p>{r.excerpt}</p>}
                  <Link href={`/journal/${r.slug}`} aria-label={`Read ${r.title}`}>
                    <ArrowUpRight size={17} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
