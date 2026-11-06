"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { ideaSchema, type IdeaInput } from "@/schemas/idea";
import { createIdea, updateIdea } from "@/server/actions/idea";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { MediaField } from "./MediaField";
import { TagPicker } from "./TagPicker";
import { ideaStatusOptions } from "./options";
import type { MediaItem } from "./upload";

interface IdeaFormProps {
  idea?: IdeaInput & { id: string; slug: string };
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  media: MediaItem[];
}

const empty: IdeaInput = {
  title: "",
  summary: "",
  content: null,
  contentHtml: "",
  categoryId: "",
  status: "THOUGHT",
  coverImage: "",
  isPublic: false,
  tagIds: [],
};

export function IdeaForm({ idea, categories, tags, media }: IdeaFormProps) {
  const router = useRouter();
  const { register, handleSubmit, control, setValue, reset, formState } = useForm<IdeaInput>({
    resolver: zodResolver(ideaSchema),
    defaultValues: idea ? { ...empty, ...idea } : empty,
  });

  const handleEditorChange = useCallback(
    (json: object, html: string) => {
      setValue("content", json as Record<string, unknown>, { shouldDirty: true });
      setValue("contentHtml", html, { shouldDirty: true });
    },
    [setValue],
  );

  const onSubmit = async (data: IdeaInput) => {
    try {
      if (idea) {
        await updateIdea(idea.id, data);
        reset(data);
        toast.success("Idea saved");
        router.refresh();
      } else {
        const created = await createIdea(data);
        toast.success("Idea captured");
        router.push(`/admin/ideas/${created.id}/edit`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save idea");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="admin-form-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="admin-card">
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="title">TITLE *</label>
              <input id="title" {...register("title")} className="admin-form-input article-title-input" aria-invalid={!!formState.errors.title} />
              {formState.errors.title && <span className="admin-form-error">{formState.errors.title.message}</span>}
              {idea && <span className="admin-form-hint">/ideas/{idea.slug}</span>}
            </div>
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label className="admin-form-label" htmlFor="summary">SUMMARY</label>
              <textarea id="summary" {...register("summary")} className="admin-form-input admin-form-textarea" rows={3} style={{ minHeight: 80 }} placeholder="The idea in two sentences." />
            </div>
          </div>
          <div className="admin-card">
            <span className="admin-form-label">NOTES (OPTIONAL)</span>
            <TiptapEditor content={idea?.content ?? null} onChange={handleEditorChange} media={media} placeholder="Explore the idea…" />
          </div>
        </div>

        <div className="admin-form-side">
          <div className="admin-card">
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="status">EXPLORATION STAGE</label>
              <select id="status" {...register("status")} className="admin-form-input admin-form-select">
                {ideaStatusOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label className="admin-check">
                <input type="checkbox" {...register("isPublic")} /> Public on the website
              </label>
              <span className="admin-form-hint">Private ideas are only visible here.</span>
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
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <span className="admin-form-label">TAGS</span>
              <Controller control={control} name="tagIds" render={({ field }) => <TagPicker tags={tags} value={field.value} onChange={field.onChange} />} />
            </div>
          </div>
          <button type="submit" disabled={formState.isSubmitting || (!!idea && !formState.isDirty)} className="admin-btn admin-btn-primary" style={{ justifyContent: "center" }}>
            <Save size={14} /> {formState.isSubmitting ? "Saving…" : idea ? "Save changes" : "Capture idea"}
          </button>
        </div>
      </div>
    </form>
  );
}
