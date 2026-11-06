"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { settingsSchema, type SettingsInput } from "@/schemas/settings";
import { updateSettings } from "@/server/actions/settings";
import { MediaField } from "./MediaField";
import type { MediaItem } from "./upload";

interface SettingsFormProps {
  settings: {
    siteTitle: string;
    tagline: string;
    introduction: string | null;
    email: string | null;
    githubUrl: string | null;
    linkedinUrl: string | null;
    location: string | null;
    profileImage: string | null;
  };
  media: MediaItem[];
}

const fields = [
  ["siteTitle", "SITE TITLE", "text"],
  ["tagline", "TAGLINE", "text"],
  ["email", "CONTACT EMAIL", "email"],
  ["location", "LOCATION", "text"],
  ["githubUrl", "GITHUB URL", "url"],
  ["linkedinUrl", "LINKEDIN URL", "url"],
] as const;

export function SettingsForm({ settings, media }: SettingsFormProps) {
  const router = useRouter();
  const { register, handleSubmit, control, reset, formState } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteTitle: settings.siteTitle,
      tagline: settings.tagline,
      introduction: settings.introduction ?? "",
      email: settings.email ?? "",
      githubUrl: settings.githubUrl ?? "",
      linkedinUrl: settings.linkedinUrl ?? "",
      location: settings.location ?? "",
      profileImage: settings.profileImage ?? "",
    },
  });

  const onSubmit = async (data: SettingsInput) => {
    try {
      await updateSettings(data);
      reset(data);
      toast.success("Settings saved");
      router.refresh();
    } catch {
      toast.error("Failed to save settings");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="admin-card">
      <h2 className="admin-section-title">Profile &amp; site</h2>
      <div className="admin-form-group">
        <label className="admin-form-label" htmlFor="introduction">HOMEPAGE INTRODUCTION</label>
        <textarea id="introduction" {...register("introduction")} className="admin-form-input admin-form-textarea" rows={3} style={{ minHeight: 90 }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "0 16px" }}>
        {fields.map(([name, label, type]) => (
          <div className="admin-form-group" key={name}>
            <label className="admin-form-label" htmlFor={name}>{label}</label>
            <input id={name} type={type} {...register(name)} className="admin-form-input" aria-invalid={!!formState.errors[name]} />
            {formState.errors[name] && <span className="admin-form-error">{formState.errors[name]?.message}</span>}
          </div>
        ))}
      </div>
      <Controller
        control={control}
        name="profileImage"
        render={({ field, fieldState }) => (
          <MediaField id="profileImage" label="PORTRAIT (ABOUT SECTION)" value={field.value} media={media} onChange={field.onChange} error={fieldState.error?.message} />
        )}
      />
      <button type="submit" disabled={formState.isSubmitting || !formState.isDirty} className="admin-btn admin-btn-primary">
        <Save size={14} /> {formState.isSubmitting ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
