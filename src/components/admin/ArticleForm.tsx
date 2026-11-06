"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, Save, Send } from "lucide-react";
import { articleSchema, type ArticleInput } from "@/schemas/journal";
import { createArticle, updateArticle } from "@/server/actions/journal";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { calculateReadingTime, slugify } from "@/lib/utils";
import { MediaField } from "./MediaField";
import { TagPicker } from "./TagPicker";
import { useDraftBackup } from "./useDraftBackup";
import type { MediaItem } from "./upload";

interface ArticleFormProps {
  article?: ArticleInput & { id: string; slug: string; updatedAt: string; persistedStatus: ArticleInput["status"] };
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  media: MediaItem[];
}

const empty: ArticleInput = {
  title: "",
  slug: "",
  excerpt: "",
  content: null,
  contentHtml: "",
  coverImage: "",
  status: "DRAFT",
  isFeatured: false,
  categoryId: "",
  tagIds: [],
};

const AUTOSAVE_MS = 12000;

function plainText(html: string) {
  return html.replace(/<[^>]+>/g, " ");
}

export function ArticleForm({ article, categories, tags, media }: ArticleFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [editorKey, setEditorKey] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [slugTouched, setSlugTouched] = useState(Boolean(article));
  const saving = useRef(false);

  const form = useForm<ArticleInput>({
    resolver: zodResolver(articleSchema),
    defaultValues: article ? { ...empty, ...article } : empty,
  });
  const { register, handleSubmit, control, setValue, getValues, reset, formState } = form;
  const values = useWatch({ control }) as ArticleInput;

  const backupKey = `article-draft:${article?.id ?? "new"}`;
  const backup = useDraftBackup(backupKey, values, article ? Date.parse(article.updatedAt) : 0, formState.isDirty);

  const readingTime = useMemo(() => calculateReadingTime(plainText(values.contentHtml ?? "")), [values.contentHtml]);

  const handleEditorChange = useCallback(
    (json: object, html: string) => {
      setValue("content", json as Record<string, unknown>, { shouldDirty: true });
      setValue("contentHtml", html, { shouldDirty: true });
    },
    [setValue],
  );

  const persist = async (data: ArticleInput, { silent = false } = {}) => {
    if (saving.current) return;
    saving.current = true;
    try {
      if (article) {
        await updateArticle(article.id, data);
        reset(data);
        backup.clear();
        setLastSaved(new Date());
        if (!silent) toast.success(data.status === "PUBLISHED" ? "Published" : "Saved");
        router.refresh();
      } else {
        const created = await createArticle(data);
        backup.clear();
        toast.success(data.status === "PUBLISHED" ? "Published" : "Draft created");
        router.push(`/admin/journal/${created.id}/edit`);
      }
    } catch (err) {
      if (!silent) toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      saving.current = false;
    }
  };

  const submitWith = (status: ArticleInput["status"]) =>
    handleSubmit((data) => persist({ ...data, status }), () => toast.error("Please fix the highlighted fields"));

  // Server autosave only for articles that are still drafts, so published posts never change silently.
  useEffect(() => {
    if (!article || article.persistedStatus !== "DRAFT" || values.status !== "DRAFT" || !formState.isDirty) return;
    const t = window.setTimeout(() => {
      const parsed = articleSchema.safeParse(getValues());
      if (parsed.success) void persist(parsed.data, { silent: true });
    }, AUTOSAVE_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, formState.isDirty]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!formState.isDirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [formState.isDirty]);

  const titleField = register("title", {
    onChange: (e) => {
      if (!slugTouched) setValue("slug", slugify(e.target.value));
    },
  });

  const isPublished = article?.persistedStatus === "PUBLISHED";

  return (
    <form onSubmit={submitWith(values.status)} noValidate>
      {backup.restorable && (
        <div className="admin-card admin-restore" role="status">
          <span>
            Unsaved changes from {new Date(backup.restorable.savedAt).toLocaleString()} were found on this device.
          </span>
          <div className="admin-btn-row">
            <button
              type="button"
              className="admin-btn admin-btn-sm admin-btn-primary"
              onClick={() => {
                reset({ ...getValues(), ...backup.restorable!.values }, { keepDefaultValues: true });
                setEditorKey((k) => k + 1);
                backup.dismiss();
              }}
            >
              Restore
            </button>
            <button type="button" className="admin-btn admin-btn-sm" onClick={backup.clear}>
              Discard
            </button>
          </div>
        </div>
      )}

      <div className="admin-form-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="admin-card">
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="title">TITLE *</label>
              <input id="title" {...titleField} className="admin-form-input article-title-input" aria-invalid={!!formState.errors.title} />
              {formState.errors.title && <span className="admin-form-error">{formState.errors.title.message}</span>}
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="slug">SLUG</label>
              <input
                id="slug"
                {...register("slug", { onChange: () => setSlugTouched(true) })}
                className="admin-form-input"
                placeholder="generated-from-title"
              />
              {formState.errors.slug ? (
                <span className="admin-form-error">{formState.errors.slug.message}</span>
              ) : (
                <span className="admin-form-hint">
                  /journal/{values.slug || slugify(values.title ?? "") || "…"}
                  {isPublished && " — changing this breaks existing links"}
                </span>
              )}
            </div>
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label className="admin-form-label" htmlFor="excerpt">EXCERPT</label>
              <textarea id="excerpt" {...register("excerpt")} className="admin-form-input admin-form-textarea" rows={3} style={{ minHeight: 80 }} />
            </div>
          </div>

          <div className="admin-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
              <div className="admin-tabs" role="tablist">
                <button type="button" role="tab" aria-selected={mode === "write"} className={mode === "write" ? "active" : ""} onClick={() => setMode("write")}>
                  WRITE
                </button>
                <button type="button" role="tab" aria-selected={mode === "preview"} className={mode === "preview" ? "active" : ""} onClick={() => setMode("preview")}>
                  <Eye size={11} style={{ verticalAlign: -1 }} /> PREVIEW
                </button>
              </div>
              <span className="admin-save-state">≈ {readingTime} MIN READ</span>
            </div>
            <div hidden={mode !== "write"}>
              <TiptapEditor key={editorKey} content={values.content ?? null} onChange={handleEditorChange} media={media} placeholder="Write the field note…" />
            </div>
            {mode === "preview" && (
              <div className="admin-preview">
                <h1 className="detail-title" style={{ fontSize: 40 }}>{values.title || "Untitled"}</h1>
                {values.excerpt && <p className="detail-lead">{values.excerpt}</p>}
                <div className="prose" dangerouslySetInnerHTML={{ __html: values.contentHtml ?? "" }} />
              </div>
            )}
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
            <div className="admin-btn-row" style={{ flexDirection: "column" }}>
              <button type="button" className="admin-btn" style={{ justifyContent: "center" }} disabled={formState.isSubmitting} onClick={submitWith("DRAFT")}>
                <Save size={14} /> {isPublished ? "Unpublish & save draft" : "Save draft"}
              </button>
              <button type="button" className="admin-btn admin-btn-primary" style={{ justifyContent: "center" }} disabled={formState.isSubmitting} onClick={submitWith("PUBLISHED")}>
                <Send size={14} /> {isPublished ? "Update published" : "Publish"}
              </button>
            </div>
            <p className="admin-save-state" style={{ marginTop: 12, marginBottom: 0 }}>
              {formState.isDirty ? "UNSAVED CHANGES" : lastSaved ? `SAVED ${lastSaved.toLocaleTimeString()}` : article ? "ALL CHANGES SAVED" : "NOT SAVED YET"}
              {article?.persistedStatus === "DRAFT" && " · AUTOSAVE ON"}
            </p>
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
        </div>
      </div>
    </form>
  );
}
