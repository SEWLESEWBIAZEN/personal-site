import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sanitizeContent, htmlToText } from "@/lib/content";
import { UserFacingError } from "@/lib/action-result";
import { collectHtmlImageSources, collectMedia, isUploadPath, type RichTextDocument } from "@/lib/rich-text";
import { calculateReadingTime } from "@/lib/utils";

// The document has already been validated (and rebuilt as plain objects) by
// richTextDocumentSchema before it reaches here.
export function toJson(value: RichTextDocument | Record<string, unknown> | null | undefined): Prisma.InputJsonValue | undefined {
  return value ? (value as unknown as Prisma.InputJsonObject) : undefined;
}

export function prepareRichContent(html: string | null | undefined) {
  if (!html) return { contentHtml: null, readingTime: null };
  const contentHtml = sanitizeContent(html);
  return { contentHtml, readingTime: calculateReadingTime(htmlToText(contentHtml)) };
}

/**
 * Checks every image referenced by the document and its HTML. Uploaded files and
 * bucket URLs must exist in the media library; anything else must be an https URL.
 * Browser-supplied references are never trusted.
 */
export async function assertMediaReferences(doc: RichTextDocument | null | undefined, html: string | null | undefined) {
  const sources = new Set<string>([
    ...collectMedia(doc).filter((m) => m.type === "image").map((m) => m.src),
    ...collectHtmlImageSources(html),
  ]);
  if (sources.size === 0) return { images: 0 };

  const publicBase = (process.env.S3_PUBLIC_URL || "").replace(/\/$/, "");
  const managed = [...sources].filter((s) => isUploadPath(s) || (publicBase && s.startsWith(`${publicBase}/`)));
  const external = [...sources].filter((s) => !managed.includes(s));

  for (const src of external) {
    if (!/^https:\/\//i.test(src)) {
      throw new UserFacingError(
        `An image uses an unsupported source (${src.slice(0, 60)}). Insert images from the media library or use an https URL.`,
        "MEDIA",
      );
    }
  }

  if (managed.length) {
    const found = await prisma.media.findMany({ where: { url: { in: managed } }, select: { url: true } });
    const known = new Set(found.map((m) => m.url));
    const missing = managed.filter((s) => !known.has(s));
    if (missing.length) {
      throw new UserFacingError(
        `${missing.length} image(s) are not in the media library (they may have been deleted or the upload failed): ${missing.map((m) => m.split("/").pop()).join(", ")}. Remove them or upload them again.`,
        "MEDIA",
      );
    }
  }
  return { images: sources.size };
}

/** Validated, sanitized fields for a rich-text body, shared by articles and ideas. */
export async function buildRichContent(doc: RichTextDocument | null | undefined, html: string | null | undefined) {
  const { contentHtml, readingTime } = prepareRichContent(html);
  const { images } = await assertMediaReferences(doc, contentHtml);
  return { content: toJson(doc), contentHtml, readingTime, images };
}

// Sets publishedAt the first time content becomes public, keeps it afterwards.
export function resolvePublishedAt(isPublic: boolean, existing: Date | null | undefined): Date | null {
  if (existing) return existing;
  return isPublic ? new Date() : null;
}
