"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, FileText, Film, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { addProjectMedia, moveProjectMedia, removeProjectMedia } from "@/server/actions/project";
import { MediaPicker } from "./MediaPicker";
import type { MediaItem } from "./upload";

interface GalleryItem {
  id: string;
  url: string;
  mediaType: "IMAGE" | "VIDEO" | "DOCUMENT";
  altText: string | null;
  caption: string | null;
}

function kindOf(mime: string): GalleryItem["mediaType"] {
  if (mime.startsWith("image/")) return "IMAGE";
  if (mime.startsWith("video/")) return "VIDEO";
  return "DOCUMENT";
}

export function ProjectGallery({ projectId, items, media }: { projectId: string; items: GalleryItem[]; media: MediaItem[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const run = (fn: () => Promise<void>, ok: string) =>
    start(async () => {
      try {
        await fn();
        toast.success(ok);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gallery update failed");
      }
    });

  const addFromLibrary = (item: MediaItem) => {
    setPickerOpen(false);
    run(
      () => addProjectMedia(projectId, { url: item.url, mediaType: kindOf(item.mimeType), altText: item.altText, caption: caption || null }),
      "Added to gallery",
    );
    setCaption("");
  };

  const addVideo = () => {
    if (!videoUrl.trim()) return;
    run(() => addProjectMedia(projectId, { url: videoUrl.trim(), mediaType: "VIDEO", caption: caption || null }), "Video added");
    setVideoUrl("");
    setCaption("");
  };

  return (
    <div className="admin-card" style={{ marginTop: 24 }}>
      <div className="admin-header" style={{ marginBottom: 16 }}>
        <h2 className="admin-section-title" style={{ margin: 0 }}>Gallery &amp; attachments</h2>
      </div>

      <div className="admin-form-grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 12, marginBottom: 20 }}>
        <input className="admin-form-input" placeholder="Caption for next item (optional)" value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={500} />
        <div className="admin-btn-row">
          <button type="button" className="admin-btn" onClick={() => setPickerOpen(true)} disabled={pending}>
            <Plus size={14} /> From library / upload
          </button>
        </div>
        <input className="admin-form-input" placeholder="External video URL (YouTube, Vimeo)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} inputMode="url" />
        <div className="admin-btn-row">
          <button type="button" className="admin-btn" onClick={addVideo} disabled={pending || !videoUrl.trim()}>
            <Film size={14} /> Add video link
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="admin-list-meta">No gallery items yet. Screenshots, demo videos and PDFs added here appear on the project page.</p>
      ) : (
        <div className="admin-gallery">
          {items.map((item, i) => (
            <div className="admin-gallery-item" key={item.id}>
              {item.mediaType === "IMAGE" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt={item.altText ?? ""} />
              ) : (
                <span className="admin-gallery-thumb">{item.mediaType === "VIDEO" ? <Film size={22} /> : <FileText size={22} />}</span>
              )}
              <div className="admin-gallery-item-body">
                <span className="admin-list-meta">
                  {String(i + 1).padStart(2, "0")} · {item.mediaType}
                </span>
                {item.caption && <span>{item.caption}</span>}
                <div className="admin-btn-row">
                  <button type="button" className="admin-btn admin-btn-sm" aria-label="Move earlier" disabled={pending || i === 0} onClick={() => run(() => moveProjectMedia(item.id, "up"), "Reordered")}>
                    <ArrowLeft size={12} />
                  </button>
                  <button type="button" className="admin-btn admin-btn-sm" aria-label="Move later" disabled={pending || i === items.length - 1} onClick={() => run(() => moveProjectMedia(item.id, "down"), "Reordered")}>
                    <ArrowRight size={12} />
                  </button>
                  <button type="button" className="admin-btn admin-btn-sm admin-btn-danger" aria-label="Remove from gallery" disabled={pending} onClick={() => run(() => removeProjectMedia(item.id), "Removed")}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <MediaPicker open={pickerOpen} kind="any" media={media} onClose={() => setPickerOpen(false)} onSelect={addFromLibrary} />
    </div>
  );
}
