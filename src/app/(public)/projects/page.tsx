import Link from "next/link";
import type { Metadata } from "next";
import { projectRepository } from "@/server/repositories/project";
import { ProjectCardBody } from "@/components/projects/ProjectCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { pageParam, stringParam } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Projects",
  description: "Products, systems, and experiments — engineering case studies by Sewlesew Biazen.",
  alternates: { canonical: "/projects" },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ProjectsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const category = stringParam(sp.category);
  const tech = stringParam(sp.tech);
  const page = pageParam(sp.page);

  const [{ items, pages }, facets] = await Promise.all([
    projectRepository.findPublished({ category, tech, page }),
    projectRepository.publishedFacets(),
  ]);

  const filterHref = (next: { category?: string; tech?: string }) => {
    const qs = new URLSearchParams();
    if (next.category) qs.set("category", next.category);
    if (next.tech) qs.set("tech", next.tech);
    const s = qs.toString();
    return s ? `/projects?${s}` : "/projects";
  };

  return (
    <section className="work-section section-wrap">
      <div className="section-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> SELECTED WORK / ARCHIVE
          </div>
          <h1 className="page-title">
            All <span className="serif-italic">projects.</span>
          </h1>
        </div>
        <p className="section-aside">Products, systems, and experiments — each one representing real engineering work.</p>
      </div>

      {facets.categories.length > 0 && (
        <div className="filter-row" aria-label="Filter by category">
          <Link className={!category ? "filter active" : "filter"} href={filterHref({ tech })}>
            ALL WORK
          </Link>
          {facets.categories.map((c) => (
            <Link key={c.slug} className={category === c.slug ? "filter active" : "filter"} href={filterHref({ category: c.slug, tech })}>
              {c.name.toUpperCase()}
            </Link>
          ))}
        </div>
      )}
      {facets.technologies.length > 0 && (
        <div className="filter-row filter-row-quiet" aria-label="Filter by technology">
          {facets.technologies.map((t) => (
            <Link
              key={t}
              className={tech === t ? "filter active" : "filter"}
              href={filterHref({ category, tech: tech === t ? undefined : t })}
            >
              {t}
            </Link>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState message={category || tech ? "NO PROJECTS MATCH THESE FILTERS." : "NO PUBLISHED PROJECTS YET."} />
      ) : (
        <div className="project-grid">
          {items.map((project, i) => (
            <article key={project.id} className={`project-card${i === 0 && page === 1 ? " project-01" : ""}`}>
              <ProjectCardBody project={project} index={(page - 1) * 12 + i} />
            </article>
          ))}
        </div>
      )}

      <Pagination page={page} pages={pages} basePath="/projects" params={{ category, tech }} />
    </section>
  );
}
