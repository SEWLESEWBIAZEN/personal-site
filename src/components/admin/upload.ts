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
  let res: Response;
  try {
    res = await fetch("/api/upload", { method: "POST", body });
  } catch {
    throw new Error("Upload failed: the network connection was interrupted. Check your connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${data.error || `Upload failed (HTTP ${res.status})`}${data.requestId ? ` (ref ${data.requestId})` : ""}`);
  return data as MediaItem;
}

export const ACCEPT = ".jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.pdf";
