import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { ProjectGallery } from "@/components/admin/ProjectGallery";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteProject } from "@/server/actions/project";
import { projectRepository } from "@/server/repositories/project";
import { categoryRepository } from "@/server/repositories/category";
import { tagRepository } from "@/server/repositories/tag";
import { mediaRepository } from "@/server/repositories/media";

export const metadata: Metadata = { title: "Edit project" };

type Props = { params: Promise<{ id: string }> };

export default async function EditProjectPage({ params }: Props) {
  await requireAdminPage();
  const { id } = await params;
  const [project, categories, tags, media] = await Promise.all([
    projectRepository.findById(id),
    categoryRepository.findAll(),
    tagRepository.findAll(),
    mediaRepository.findForPicker(),
  ]);
  if (!project) notFound();

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Edit project</h1>
          <p className="admin-subtitle">{project.status}</p>
        </div>
        <DeleteButton id={project.id} action={deleteProject} label="project" redirectTo="/admin/projects" />
      </div>
      <ProjectForm
        project={{
          id: project.id,
          slug: project.slug,
          title: project.title,
          shortDescription: project.shortDescription ?? "",
          description: project.description ?? "",
          problemStatement: project.problemStatement ?? "",
          solution: project.solution ?? "",
          technicalChallenges: project.technicalChallenges ?? "",
          architecture: project.architecture ?? "",
          keyFeatures: project.keyFeatures ?? "",
          technologies: project.technologies,
          categoryId: project.categoryId ?? "",
          coverImage: project.coverImage ?? "",
          videoUrl: project.videoUrl ?? "",
          liveUrl: project.liveUrl ?? "",
          repositoryUrl: project.repositoryUrl ?? "",
          status: project.status,
          isFeatured: project.isFeatured,
          displayOrder: project.displayOrder,
          tagIds: project.tags.map((t) => t.id),
        }}
        categories={categories}
        tags={tags}
        media={media}
      />
      <ProjectGallery projectId={project.id} items={project.media} media={media} />
    </>
  );
}
