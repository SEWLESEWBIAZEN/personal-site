import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export interface ProjectCardData {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  technologies: string[];
  coverImage: string | null;
  publishedAt: Date | null;
  category: { name: string; slug: string } | null;
}

export function ProjectCardBody({ project, index }: { project: ProjectCardData; index: number }) {
  const year = project.publishedAt ? new Date(project.publishedAt).getFullYear() : null;
  return (
    <>
      <Link href={`/projects/${project.slug}`} className="project-image" aria-label={`View ${project.title} details`}>
        {project.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.coverImage} alt={`${project.title} visual`} loading={index === 0 ? "eager" : "lazy"} />
        ) : null}
        <span className="image-index">PROJECT / {String(index + 1).padStart(2, "0")}</span>
        <span className="image-open">
          <ArrowUpRight size={20} />
        </span>
      </Link>
      <div className="project-meta">
        <span>{project.category?.name.toUpperCase() ?? "PROJECT"}</span>
        {year && <span>{year}</span>}
      </div>
      <Link href={`/projects/${project.slug}`} className="project-title-row">
        <h3>{project.title}</h3>
        <ArrowUpRight className="project-arrow" size={19} />
      </Link>
      {project.shortDescription && <p>{project.shortDescription}</p>}
      <div className="tag-list">
        {project.technologies.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </>
  );
}
