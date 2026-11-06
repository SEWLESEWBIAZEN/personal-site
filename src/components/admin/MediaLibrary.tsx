"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, FileText, Film, Upload } from "lucide-react";
import { toast } from "sonner";
import { deleteMedia, updateMediaAltText } from "@/server/actions/media";
import { DeleteButton } from "./DeleteButton";
import { ACCEPT, uploadFile } from "./upload";

interface MediaRow {
  id: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  url: string;
  altText: string | null;
  storageProvider: string;
  createdAt: Date;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AltTextInput({ id, initial }: { id: string; initial: string | null }) {
  const [value, setValue] = useState(initial ?? "");
  const [pending, start] = useTransition();
  return (
    <input
      className="admin-form-input"
      style={{ padding: "6px 8px", fontSize: 12 }}
      placeholder="Alt text"
      aria-label="Alt text"
      value={value}
      maxLength={300}
      disabled={pending}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        if (value === (initial ?? "")) return;
        start(async () => {
          await updateMediaAltText(id, value);
          toast.success("Alt text saved");
        });
      }}
    />
  );
}

export function MediaLibrary({ media }: { media: MediaRow[] }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(0);
  const [filter, setFilter] = useState<"all" | "image" | "video" | "application">("all");

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files);
    setUploading(list.length);
    for (const file of list) {
      try {
        await uploadFile(file);
        toast.success(`Uploaded ${file.name}`);
      } catch (err) {
        toast.error(`${file.name}: ${err instanceof Error ? err.message : "Upload failed"}`);
      }
      setUploading((n) => n - 1);
    }
    router.refresh();
  };

  const copyUrl = (url: string) => {
    const full = url.startsWith("/") ? `${window.location.origin}${url}` : url;
    navigator.clipboard.writeText(full).then(() => toast.success("URL copied"));
  };

  const visible = filter === "all" ? media : media.filter((m) => m.mimeType.startsWith(filter));

  return (
    <>
      <label
        className="admin-card media-dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void handleFiles(e.dataTransfer.files);
        }}
      >
        <Upload size={20} />
        <span style={{ fontWeight: 500 }}>{uploading ? `Uploading ${uploading} file(s)…` : "Drop files here or click to upload"}</span>
        <span className="admin-form-hint" style={{ marginTop: 0 }}>
          JPG, PNG, GIF, WebP (10 MB) · MP4, WebM (100 MB) · PDF (25 MB)
        </span>
        <input type="file" multiple accept={ACCEPT} hidden disabled={uploading > 0} onChange={(e) => void handleFiles(e.target.files)} />
      </label>

      <div className="admin-tabs" style={{ margin: "20px 0 16px" }}>
        {(["all", "image", "video", "application"] as const).map((f) => (
          <button key={f} type="button" className={filter === f ? "active" : ""} onClick={() => setFilter(f)}>
            {f === "application" ? "DOCUMENTS" : f.toUpperCase()}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="admin-list-meta" style={{ padding: 40, textAlign: "center" }}>No media here yet.</p>
      ) : (
        <div className="admin-gallery" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))" }}>
          {visible.map((item) => (
            <div key={item.id} className="admin-gallery-item">
              {item.mimeType.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt={item.altText ?? item.originalFilename} loading="lazy" />
              ) : (
                <span className="admin-gallery-thumb">{item.mimeType.startsWith("video/") ? <Film size={24} /> : <FileText size={24} />}</span>
              )}
              <div className="admin-gallery-item-body media-card-body">
                <span style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.originalFilename}>
                  {item.originalFilename}
                </span>
                <span className="admin-list-meta">
                  {formatSize(item.size)} · {item.mimeType.split("/")[1]?.toUpperCase()} · {item.storageProvider.toUpperCase()}
                </span>
                <AltTextInput id={item.id} initial={item.altText} />
                <div className="admin-btn-row">
                  <button type="button" onClick={() => copyUrl(item.url)} className="admin-btn admin-btn-sm" style={{ flex: 1, justifyContent: "center" }}>
                    <Copy size={12} /> Copy URL
                  </button>
                  <DeleteButton id={item.id} action={deleteMedia} label="file" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
