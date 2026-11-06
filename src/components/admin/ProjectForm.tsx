"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Save, X } from "lucide-react";
import { projectSchema, type ProjectInput } from "@/schemas/project";
import { createProject, updateProject } from "@/server/actions/project";
import { MediaField } from "./MediaField";
import { TagPicker } from "./TagPicker";
import type { MediaItem } from "./upload";

interface ProjectFormProps {
  project?: ProjectInput & { id: string; slug: string };
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  media: MediaItem[];
}

const empty: ProjectInput = {
  title: "",
  shortDescription: "",
  description: "",
  problemStatement: "",
  solution: "",
  technicalChallenges: "",
  architecture: "",
  keyFeatures: "",
  technologies: [],
  categoryId: "",
  coverImage: "",
  videoUrl: "",
  liveUrl: "",
  repositoryUrl: "",
  status: "DRAFT",
  isFeatured: false,
  displayOrder: 0,
  tagIds: [],
};

const longFields = [
  ["description", "OVERVIEW", "What the project is and who it is for."],
  ["problemStatement", "PROBLEM STATEMENT", "The problem worth solving."],
  ["solution", "SOLUTION", "How the product addresses it."],
  ["architecture", "ARCHITECTURE", "Components, boundaries, data flow. Blank lines separate paragraphs."],
  ["technicalChallenges", "TECHNICAL CHALLENGES", "Trade-offs and hard parts."],
  ["keyFeatures", "KEY FEATURES", "What it does well."],
] as const;

export function ProjectForm({ project, categories, tags, media }: ProjectFormProps) {
  const router = useRouter();
  const [techInput, setTechInput] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: project ? { ...empty, ...project } : empty,
  });

  const technologies = watch("technologies");

  const addTech = () => {
    const value = techInput.trim();
    if (value && !technologies.includes(value)) setValue("technologies", [...technologies, value], { shouldDirty: true });
    setTechInput("");
  };

  const onSubmit = async (data: ProjectInput) => {
    try {
      if (project) {
        await updateProject(project.id, data);
        reset(data);
        toast.success("Project saved");
        router.refresh();
      } else {
        const created = await createProject(data);
        toast.success("Project created");
        router.push(`/admin/projects/${created.id}/edit`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save project");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="admin-form-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="admin-card">
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="title">TITLE *</label>
              <input id="title" {...register("title")} className="admin-form-input" aria-invalid={!!errors.title} />
              {errors.title && <span className="admin-form-error">{errors.title.message}</span>}
              {project && <span className="admin-form-hint">URL: /projects/{project.slug}</span>}
            </div>
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label className="admin-form-label" htmlFor="shortDescription">SHORT DESCRIPTION</label>
              <textarea id="shortDescription" {...register("shortDescription")} className="admin-form-input admin-form-textarea" rows={3} style={{ minHeight: 80 }} />
              <span className="admin-form-hint">Shown on cards and in search results.</span>
            </div>
          </div>

          <div className="admin-card">
            <h2 className="admin-section-title">Case study</h2>
            {longFields.map(([name, label, hint]) => (
              <div className="admin-form-group" key={name}>
                <label className="admin-form-label" htmlFor={name}>{label}</label>
                <textarea id={name} {...register(name)} className="admin-form-input admin-form-textarea" rows={5} placeholder={hint} />
              </div>
            ))}
          </div>

          <div className="admin-card">
            <h2 className="admin-section-title">Links</h2>
            {(
              [
                ["liveUrl", "LIVE URL", "https://"],
                ["repositoryUrl", "REPOSITORY URL", "https://github.com/…"],
                ["videoUrl", "DEMO VIDEO (YOUTUBE, VIMEO OR .MP4)", "https://youtube.com/watch?v=…"],
              ] as const
            ).map(([name, label, ph]) => (
              <div className="admin-form-group" key={name}>
                <label className="admin-form-label" htmlFor={name}>{label}</label>
                <input id={name} {...register(name)} className="admin-form-input" placeholder={ph} inputMode="url" />
                {errors[name] && <span className="admin-form-error">{errors[name]?.message}</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="admin-form-side">
          <div className="admin-card">
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="status">STATUS</label>
              <select id="status" {...register("status")} className="admin-form-input admin-form-select">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-check">
                <input type="checkbox" {...register("isFeatured")} /> Featured on homepage
              </label>
            </div>
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label className="admin-form-label" htmlFor="displayOrder">DISPLAY ORDER</label>
              <input id="displayOrder" {...register("displayOrder", { valueAsNumber: true })} className="admin-form-input" type="number" min={0} />
              <span className="admin-form-hint">Lower numbers appear first.</span>
            </div>
          </div>

          <div className="admin-card">
            <Controller
              control={control}
              name="coverImage"
              render={({ field, fieldState }) => (
                <MediaField id="coverImage" label="COVER IMAGE" value={field.value} media={media} onChange={field.onChange} error={fieldState.error?.message} />
              )}
            />
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="categoryId">CATEGORY</label>
              <select id="categoryId" {...register("categoryId")} className="admin-form-input admin-form-select">
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="tech">TECHNOLOGIES</label>
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <input
                  id="tech"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTech();
                    }
                  }}
                  className="admin-form-input"
                  placeholder="Type and press Enter"
                />
                <button type="button" onClick={addTech} className="admin-btn admin-btn-sm">Add</button>
              </div>
              <div className="admin-chip-list">
                {technologies.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="admin-chip"
                    aria-label={`Remove ${t}`}
                    onClick={() => setValue("technologies", technologies.filter((x) => x !== t), { shouldDirty: true })}
                  >
                    {t} <X size={10} />
                  </button>
                ))}
              </div>
            </div>
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <span className="admin-form-label">TAGS</span>
              <Controller control={control} name="tagIds" render={({ field }) => <TagPicker tags={tags} value={field.value} onChange={field.onChange} />} />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting || (!!project && !isDirty)} className="admin-btn admin-btn-primary" style={{ justifyContent: "center" }}>
            <Save size={14} />
            {isSubmitting ? "Saving…" : project ? "Save changes" : "Create project"}
          </button>
        </div>
      </div>
    </form>
  );
}
