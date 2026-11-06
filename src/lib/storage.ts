import "server-only";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export interface StorageProvider {
  readonly name: string;
  put(key: string, body: Buffer, contentType: string): Promise<string>;
  delete(key: string): Promise<void>;
}

// Extension -> MIME. SVG is intentionally excluded: it can carry scripts.
export const ALLOWED_TYPES: Record<string, { mime: string; kind: "IMAGE" | "VIDEO" | "DOCUMENT"; maxBytes: number }> = {
  ".jpg": { mime: "image/jpeg", kind: "IMAGE", maxBytes: 10 * 1024 * 1024 },
  ".jpeg": { mime: "image/jpeg", kind: "IMAGE", maxBytes: 10 * 1024 * 1024 },
  ".png": { mime: "image/png", kind: "IMAGE", maxBytes: 10 * 1024 * 1024 },
  ".gif": { mime: "image/gif", kind: "IMAGE", maxBytes: 10 * 1024 * 1024 },
  ".webp": { mime: "image/webp", kind: "IMAGE", maxBytes: 10 * 1024 * 1024 },
  ".mp4": { mime: "video/mp4", kind: "VIDEO", maxBytes: 100 * 1024 * 1024 },
  ".webm": { mime: "video/webm", kind: "VIDEO", maxBytes: 100 * 1024 * 1024 },
  ".pdf": { mime: "application/pdf", kind: "DOCUMENT", maxBytes: 25 * 1024 * 1024 },
};

const SIGNATURES: Record<string, (b: Buffer) => boolean> = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  "image/gif": (b) => b.subarray(0, 4).toString("ascii") === "GIF8",
  "image/webp": (b) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP",
  "video/mp4": (b) => b.subarray(4, 8).toString("ascii") === "ftyp",
  "video/webm": (b) => b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3,
  "application/pdf": (b) => b.subarray(0, 5).toString("ascii") === "%PDF-",
};

export type ValidatedFile = { ext: string; mime: string; buffer: Buffer };

export async function validateUpload(file: File): Promise<ValidatedFile> {
  const ext = path.extname(file.name).toLowerCase();
  const rule = ALLOWED_TYPES[ext];
  if (!rule) throw new Error(`File type "${ext || "unknown"}" is not allowed`);
  if (file.type && file.type !== rule.mime) throw new Error("File content type does not match its extension");
  if (file.size === 0) throw new Error("File is empty");
  if (file.size > rule.maxBytes) throw new Error(`File exceeds the ${rule.maxBytes / 1024 / 1024}MB limit`);

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!SIGNATURES[rule.mime](buffer)) throw new Error("File content does not match its type");

  return { ext, mime: rule.mime, buffer };
}

export function newStorageKey(ext: string) {
  return `${randomUUID()}${ext}`;
}

export const SAFE_KEY = /^[0-9a-f-]{36}\.[a-z0-9]{2,5}$/;

class LocalStorage implements StorageProvider {
  readonly name = "local";
  private dir = path.resolve(process.env.STORAGE_LOCAL_PATH || "./uploads");

  async put(key: string, body: Buffer) {
    await mkdir(this.dir, { recursive: true });
    await writeFile(path.join(this.dir, key), body);
    return `/api/upload/${key}`;
  }

  async delete(key: string) {
    if (!SAFE_KEY.test(key)) return;
    await unlink(path.join(this.dir, key)).catch(() => undefined);
  }

  async read(key: string) {
    if (!SAFE_KEY.test(key)) throw new Error("Invalid key");
    return readFile(path.join(this.dir, key));
  }
}

class S3Storage implements StorageProvider {
  readonly name = "s3";
  private client = new S3Client({
    endpoint: process.env.S3_ENDPOINT || undefined,
    region: process.env.S3_REGION || "auto",
    forcePathStyle: Boolean(process.env.S3_ENDPOINT),
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    },
  });
  private bucket = process.env.S3_BUCKET || "";
  private publicUrl = (process.env.S3_PUBLIC_URL || "").replace(/\/$/, "");

  async put(key: string, body: Buffer, contentType: string) {
    if (!this.bucket || !this.publicUrl) throw new Error("S3_BUCKET and S3_PUBLIC_URL must be configured");
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    return `${this.publicUrl}/${key}`;
  }

  async delete(key: string) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}

export const localFileStorage = new LocalStorage();
let s3: S3Storage | undefined;

export function getStorage(name = process.env.STORAGE_PROVIDER || "local"): StorageProvider {
  if (name === "local") return localFileStorage;
  if (name === "s3") return (s3 ??= new S3Storage());
  throw new Error(`Unknown storage provider "${name}"`);
}
