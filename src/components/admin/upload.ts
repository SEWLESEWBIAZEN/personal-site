export interface MediaItem {
  id: string;
  url: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  altText: string | null;
}

export async function uploadFile(file: File, altText?: string): Promise<MediaItem> {
  const body = new FormData();
  body.append("file", file);
  if (altText) body.append("altText", altText);
  const res = await fetch("/api/upload", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data as MediaItem;
}

export const ACCEPT = ".jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.pdf";
