import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStorage, newStorageKey, validateUpload } from "@/lib/storage";

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
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Same-origin check: reject cross-site posts that carry the session cookie.
  // Compares hosts like Next's own Server Actions CSRF check, so it also works
  // behind a reverse proxy that sets X-Forwarded-Host.
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const { ext, mime, buffer } = await validateUpload(file);
    const storage = getStorage();
    const key = newStorageKey(ext);
    const url = await storage.put(key, buffer, mime);
    const altText = formData.get("altText");

    const media = await prisma.media.create({
      data: {
        filename: key,
        originalFilename: file.name.slice(0, 255),
        mimeType: mime,
        size: file.size,
        url,
        storageProvider: storage.name,
        altText: typeof altText === "string" && altText ? altText.slice(0, 300) : null,
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
