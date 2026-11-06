import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { ArticleMeta } from "@/components/journal/ArticleMeta";
import { EmptyState } from "@/components/ui/EmptyState";

export interface ArticleListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: Date | null;
  readingTime: number | null;
  category: { name: string; slug: string } | null;
}

function WorkflowGraphic() {
  return (
    <div className="feature-graphic">
      <div className="graphic-grid" />
      <div className="node node-one">TRIGGER</div>
      <div className="node node-two">AGENT</div>
      <div className="node node-three">TOOL</div>
      <div className="node node-four">RESULT</div>
      <svg viewBox="0 0 500 260" preserveAspectRatio="none" aria-hidden="true">
        <path d="M75 120 C130 120 125 55 190 55 S270 120 320 120 S390 195 435 195" />
        <path d="M75 120 C130 120 125 195 190 195 S270 120 320 120" />
      </svg>
      <span className="graphic-caption">A SIMPLE AGENT WORKFLOW / CONCEPT 01</span>
    </div>
  );
}

export function JournalSection({ articles }: { articles: ArticleListItem[] }) {
  const [featured, ...rest] = articles;

  return (
    <section className="journal-section" id="journal">
      <div className="section-wrap journal-inner">
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> 02 / THE ENGINEERING JOURNAL
            </div>
            <h2>
              Thinking out <span className="serif-italic">loud.</span>
            </h2>
          </div>
          <p className="section-aside">A living notebook of things I build, problems I solve, and ideas I&apos;m still figuring out.</p>
        </div>

        {!featured ? (
          <EmptyState message="THE NOTEBOOK IS OPEN. THE FIRST FIELD NOTE IS BEING WRITTEN." />
        ) : (
          <div className="journal-layout">
            <article className="journal-feature">
              <div className="feature-label">
                <BookOpen size={15} /> LATEST FIELD NOTE
              </div>
              {featured.coverImage ? (
                <div className="feature-graphic feature-cover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featured.coverImage} alt="" loading="lazy" />
                </div>
              ) : (
                <WorkflowGraphic />
              )}
              <div className="feature-content">
                <ArticleMeta category={featured.category} publishedAt={featured.publishedAt} readingTime={featured.readingTime} />
                <h3>{featured.title}</h3>
                {featured.excerpt && <p>{featured.excerpt}</p>}
                <Link className="read-link" href={`/journal/${featured.slug}`}>
                  READ FIELD NOTE <ArrowUpRight size={15} />
                </Link>
              </div>
            </article>
            <div className="article-list">
              {rest.map((a, i) => (
                <article className="article-row" key={a.id}>
                  <div className="article-number">{String(i + 2).padStart(2, "0")}</div>
                  <div className="article-body">
                    <ArticleMeta category={a.category} publishedAt={a.publishedAt} readingTime={a.readingTime} />
                    <h3>
                      <Link href={`/journal/${a.slug}`}>{a.title}</Link>
                    </h3>
                    {a.excerpt && <p>{a.excerpt}</p>}
                    <Link href={`/journal/${a.slug}`} aria-label={`Read ${a.title}`}>
                      <ArrowUpRight size={17} />
                    </Link>
                  </div>
                </article>
              ))}
              <div className="journal-archive">
                <span>THE NOTEBOOK IS ALWAYS OPEN.</span>
                <Link href="/journal">
                  EXPLORE ALL NOTES <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
