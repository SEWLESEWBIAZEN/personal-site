"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { ACCEPT, uploadFile, type MediaItem } from "./upload";

interface MediaPickerProps {
  open: boolean;
  media: MediaItem[];
  kind?: "image" | "any";
  onClose: () => void;
  onSelect: (item: MediaItem) => void;
}

export function MediaPicker({ open, media, kind = "image", onClose, onSelect }: MediaPickerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState(media);
  const [uploading, setUploading] = useState(false);

  useEffect(() => setItems(media), [media]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const visible = kind === "image" ? items.filter((m) => m.mimeType.startsWith("image/")) : items;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const item = await uploadFile(file);
      setItems((prev) => [item, ...prev]);
      onSelect(item);
      toast.success("Uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <dialog ref={dialogRef} className="media-dialog" onClose={onClose} onCancel={onClose}>
      <div className="media-dialog-head">
        <h2 className="admin-section-title" style={{ margin: 0 }}>Choose media</h2>
        <div className="admin-btn-row">
          <label className="admin-btn admin-btn-sm admin-btn-primary" style={{ cursor: "pointer" }}>
            <Upload size={12} /> {uploading ? "Uploading…" : "Upload"}
            <input type="file" hidden accept={kind === "image" ? ".jpg,.jpeg,.png,.gif,.webp" : ACCEPT} onChange={handleUpload} disabled={uploading} />
          </label>
          <button type="button" className="admin-btn admin-btn-sm" onClick={onClose} aria-label="Close">
            <X size={12} />
          </button>
        </div>
      </div>
      {visible.length === 0 ? (
        <p className="admin-list-meta" style={{ padding: "32px 0", textAlign: "center" }}>
          No {kind === "image" ? "images" : "files"} in the library yet. Upload one.
        </p>
      ) : (
        <div className="admin-picker">
          {visible.map((m) => (
            <button type="button" key={m.id} onClick={() => onSelect(m)} title={m.originalFilename}>
              {m.mimeType.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt={m.altText ?? m.originalFilename} loading="lazy" />
              ) : (
                <span className="admin-gallery-thumb" style={{ height: "100%" }}>
                  <FileText size={20} />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </dialog>
  );
}
