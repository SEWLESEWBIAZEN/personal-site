import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, Search } from "lucide-react";
import { journalRepository } from "@/server/repositories/journal";
import { categoryRepository } from "@/server/repositories/category";
import { ArticleMeta } from "@/components/journal/ArticleMeta";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { pageParam, stringParam } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Journal",
  description: "Technical articles, tutorials, and engineering case studies.",
  alternates: { canonical: "/journal" },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function JournalPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = stringParam(sp.q);
  const category = stringParam(sp.category);
  const tag = stringParam(sp.tag);
  const page = pageParam(sp.page);
  const pageSize = 10;

  const [{ items, total, pages }, categories] = await Promise.all([
    journalRepository.findPublished({ q, category, tag, page, pageSize }),
    categoryRepository.findWithPublishedArticles(),
  ]);

  const filtered = Boolean(q || category || tag);

  return (
    <section className="section-wrap listing-page">
      <div className="section-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> THE ENGINEERING JOURNAL
          </div>
          <h1 className="page-title">
            Field <span className="serif-italic">notes.</span>
          </h1>
        </div>
        <p className="section-aside">Technical articles, experiments, and lessons from real engineering work.</p>
      </div>

      <form className="search-row" action="/journal" role="search">
        <Search size={15} aria-hidden="true" />
        <input type="search" name="q" defaultValue={q} placeholder="Search the journal" aria-label="Search articles" maxLength={100} />
        {category && <input type="hidden" name="category" value={category} />}
        <button type="submit" className="filter">
          SEARCH
        </button>
      </form>

      {categories.length > 0 && (
        <div className="filter-row" aria-label="Filter by category">
          <Link className={!category ? "filter active" : "filter"} href={q ? `/journal?q=${encodeURIComponent(q)}` : "/journal"}>
            ALL NOTES
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              className={category === c.slug ? "filter active" : "filter"}
              href={`/journal?category=${c.slug}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            >
              {c.name.toUpperCase()}
            </Link>
          ))}
        </div>
      )}

      {filtered && (
        <p className="result-count">
          {total} RESULT{total === 1 ? "" : "S"}
          {tag && <> TAGGED &ldquo;{tag.toUpperCase()}&rdquo;</>}
          {" · "}
          <Link href="/journal">CLEAR</Link>
        </p>
      )}

      {items.length === 0 ? (
        <EmptyState message={filtered ? "NOTHING MATCHES THAT SEARCH." : "NO PUBLISHED ARTICLES YET."} />
      ) : (
        <div className="article-list">
          {items.map((a, i) => (
            <article className="article-row" key={a.id}>
              <div className="article-number">{String((page - 1) * pageSize + i + 1).padStart(2, "0")}</div>
              <div className="article-body">
                <ArticleMeta category={a.category} publishedAt={a.publishedAt} readingTime={a.readingTime} />
                <h2 className="article-row-title">
                  <Link href={`/journal/${a.slug}`}>{a.title}</Link>
                </h2>
                {a.excerpt && <p>{a.excerpt}</p>}
                <Link href={`/journal/${a.slug}`} aria-label={`Read ${a.title}`}>
                  <ArrowUpRight size={17} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <Pagination page={page} pages={pages} basePath="/journal" params={{ q, category, tag }} />
    </section>
  );
}
