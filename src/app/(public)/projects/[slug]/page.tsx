import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ExternalLink, Github } from "lucide-react";
import { projectRepository } from "@/server/repositories/project";
import { JsonLd } from "@/components/ui/JsonLd";
import { absoluteUrl, formatDate } from "@/lib/utils";
import { isDirectVideo, toEmbedUrl } from "@/lib/video";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await projectRepository.findPublishedBySlug(slug);
  if (!project) return { title: "Not found", robots: { index: false } };
  const description = project.shortDescription || project.description?.slice(0, 160) || undefined;
  return {
    title: project.title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: project.title,
      description,
      url: `/projects/${project.slug}`,
      images: project.coverImage ? [absoluteUrl(project.coverImage)] : undefined,
    },
  };
}

const sections = [
  ["description", "Overview"],
  ["problemStatement", "The problem"],
  ["solution", "The solution"],
  ["architecture", "Architecture"],
  ["technicalChallenges", "Technical challenges"],
  ["keyFeatures", "Key features"],
] as const;

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i}>{p}</p>
        ))}
    </>
  );
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await projectRepository.findPublishedBySlug(slug);
  if (!project) notFound();

  const embed = toEmbedUrl(project.videoUrl);
  const directVideo = isDirectVideo(project.videoUrl) ? project.videoUrl : null;
  const images = project.media.filter((m) => m.mediaType === "IMAGE");
  const videos = project.media.filter((m) => m.mediaType === "VIDEO");
  const documents = project.media.filter((m) => m.mediaType === "DOCUMENT");

  return (
    <article className="section-wrap detail-page">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.title,
          description: project.shortDescription ?? undefined,
          url: absoluteUrl(`/projects/${project.slug}`),
          image: project.coverImage ? absoluteUrl(project.coverImage) : undefined,
          datePublished: project.publishedAt?.toISOString(),
          author: { "@type": "Person", name: "Sewlesew Biazen" },
          keywords: project.technologies.join(", "),
        }}
      />
      <Link href="/projects" className="text-link back-link">
        &larr; ALL PROJECTS
      </Link>
      <div className="eyebrow detail-eyebrow">
        <span className="eyebrow-line" /> {project.category?.name.toUpperCase() ?? "PROJECT"}
        {project.publishedAt && <> / {formatDate(project.publishedAt)}</>}
      </div>
      <h1 className="detail-title">{project.title}</h1>
      {project.shortDescription && <p className="detail-lead">{project.shortDescription}</p>}

      <div className="detail-actions">
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="button-primary">
            VIEW LIVE <ExternalLink size={14} />
          </a>
        )}
        {project.repositoryUrl && (
          <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer" className="text-link">
            <Github size={13} /> SOURCE CODE
          </a>
        )}
      </div>

      {project.coverImage && (
        <figure className="detail-cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={project.coverImage} alt={`${project.title} cover`} />
        </figure>
      )}

      <div className="detail-grid">
        <div className="prose">
          {sections.map(([key, label]) =>
            project[key] ? (
              <section key={key}>
                <h2>{label}</h2>
                <Paragraphs text={project[key] as string} />
              </section>
            ) : null,
          )}

          {(embed || directVideo) && (
            <section>
              <h2>Demo</h2>
              {embed ? (
                <div className="video-frame">
                  <iframe src={embed} title={`${project.title} demo`} loading="lazy" allowFullScreen />
                </div>
              ) : (
                <video src={directVideo!} controls preload="metadata" className="video-frame-native" />
              )}
            </section>
          )}
        </div>

        <aside className="detail-aside">
          {project.technologies.length > 0 && (
            <div>
              <h2 className="aside-label">TECHNOLOGIES</h2>
              <div className="tag-list">
                {project.technologies.map((t) => (
                  <Link key={t} href={`/projects?tech=${encodeURIComponent(t)}`}>
                    <span>{t}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {documents.length > 0 && (
            <div>
              <h2 className="aside-label">DOCUMENTS</h2>
              <ul className="doc-list">
                {documents.map((d) => (
                  <li key={d.id}>
                    <a href={d.url} target="_blank" rel="noopener noreferrer">
                      {d.caption || d.altText || "Document"} <ExternalLink size={11} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {(images.length > 0 || videos.length > 0) && (
        <section className="gallery">
          <h2 className="aside-label">GALLERY</h2>
          <div className="gallery-grid">
            {images.map((m) => (
              <figure key={m.id}>
                <a href={m.url} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.thumbnailUrl || m.url} alt={m.altText || ""} loading="lazy" />
                </a>
                {m.caption && <figcaption>{m.caption}</figcaption>}
              </figure>
            ))}
            {videos.map((m) => {
              const e = toEmbedUrl(m.url);
              return (
                <figure key={m.id}>
                  {e ? (
                    <div className="video-frame">
                      <iframe src={e} title={m.caption || "Video"} loading="lazy" allowFullScreen />
                    </div>
                  ) : (
                    <video src={m.url} controls preload="metadata" className="video-frame-native" />
                  )}
                  {m.caption && <figcaption>{m.caption}</figcaption>}
                </figure>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
}
