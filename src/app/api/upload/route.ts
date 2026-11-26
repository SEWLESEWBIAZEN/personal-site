import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_UPLOAD_BYTES, getStorage, newStorageKey, validateUpload } from "@/lib/storage";
import { errorFields, logger, newRequestId } from "@/lib/logger";

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return request.headers.get("sec-fetch-site") !== "cross-site";
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() || request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const requestId = newRequestId();
  const fail = (status: number, error: string, extra: Record<string, unknown> = {}) => {
    (status >= 500 ? logger.error : logger.warn)("upload.failed", { requestId, status, reason: error, ...extra });
    return NextResponse.json({ error, requestId }, { status, headers: { "X-Request-Id": requestId } });
  };

  const session = await auth();
  if (session?.user?.role !== "ADMIN") return fail(401, "Your session has expired. Sign in again to upload.");

  // Same-origin check: reject cross-site posts that carry the session cookie.
  // Compares hosts like Next's own Server Actions CSRF check, so it also works
  // behind a reverse proxy that sets X-Forwarded-Host.
  if (!isSameOrigin(request)) return fail(403, "Invalid origin");

  // Reject obviously oversized bodies before buffering them.
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > MAX_UPLOAD_BYTES + 64 * 1024) return fail(413, `File exceeds the ${MAX_UPLOAD_BYTES / 1024 / 1024}MB upload limit`);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (error) {
    return fail(400, "The upload was interrupted or is not valid multipart data. Try again.", errorFields(error));
  }
  const file = formData.get("file");
  if (!(file instanceof File)) return fail(400, "No file provided");

  let validated: Awaited<ReturnType<typeof validateUpload>>;
  try {
    validated = await validateUpload(file);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid file";
    return fail(/exceeds/.test(message) ? 413 : 415, message, { size: file.size });
  }

  const storage = getStorage();
  const key = newStorageKey(validated.ext);
  let url: string;
  try {
    url = await storage.put(key, validated.buffer, validated.mime);
  } catch (error) {
    return fail(502, "The file could not be written to media storage. Nothing was saved; try again.", { provider: storage.name, ...errorFields(error) });
  }

  try {
    const altText = formData.get("altText");
    const media = await prisma.media.create({
      data: {
        filename: key,
        originalFilename: safeOriginalName(file.name),
        mimeType: validated.mime,
        size: validated.buffer.length,
        url,
        storageProvider: storage.name,
        altText: typeof altText === "string" && altText ? altText.slice(0, 300) : null,
      },
    });
    logger.info("upload.success", { requestId, mediaId: media.id, key, mime: validated.mime, size: media.size, provider: storage.name });
    return NextResponse.json(media, { status: 201, headers: { "X-Request-Id": requestId } });
  } catch (error) {
    // Storage and PostgreSQL are not one transaction: compensate so no file is left
    // in storage without a media-library row.
    await storage.delete(key).catch((cleanupError) =>
      logger.error("upload.cleanup_failed", { requestId, key, provider: storage.name, ...errorFields(cleanupError) }),
    );
    return fail(500, "The file was uploaded but could not be recorded in the media library, so it was discarded. Try again.", errorFields(error));
  }
}

// Keeps a readable original name for the library without control or path characters.
function safeOriginalName(name: string) {
  return (name.split(/[\\/]/).pop() || "file").replace(/[\u0000-\u001f\u007f<>:"|?*]/g, "_").slice(0, 255);
}
