"use client";

import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { MediaPicker } from "./MediaPicker";
import type { MediaItem } from "./upload";

interface MediaFieldProps {
  id: string;
  label: string;
  value: string | null | undefined;
  media: MediaItem[];
  onChange: (url: string) => void;
  error?: string;
}

export function MediaField({ id, label, value, media, onChange, error }: MediaFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-form-group">
      <label className="admin-form-label" htmlFor={id}>
        {label}
      </label>
      {value && (
        <div className="media-field-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" />
          <button type="button" className="admin-btn admin-btn-sm" onClick={() => onChange("")} aria-label="Remove image">
            <X size={12} />
          </button>
        </div>
      )}
      <div style={{ display: "flex", gap: 6 }}>
        <input
          id={id}
          className="admin-form-input"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… or choose from library"
        />
        <button type="button" className="admin-btn admin-btn-sm" onClick={() => setOpen(true)} aria-label="Choose from media library">
          <ImagePlus size={14} />
        </button>
      </div>
      {error && <span className="admin-form-error">{error}</span>}
      <MediaPicker
        open={open}
        media={media}
        onClose={() => setOpen(false)}
        onSelect={(item) => {
          onChange(item.url);
          setOpen(false);
        }}
      />
    </div>
  );
}
