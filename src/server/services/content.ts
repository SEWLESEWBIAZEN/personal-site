import type { Prisma } from "@prisma/client";
import { sanitizeContent, htmlToText } from "@/lib/content";

// Tiptap JSON is validated as a plain object by Zod before it reaches here.
export function toJson(value: Record<string, unknown> | null | undefined): Prisma.InputJsonValue | undefined {
  return value ? (value as Prisma.InputJsonObject) : undefined;
}
import { calculateReadingTime } from "@/lib/utils";

export function prepareRichContent(html: string | null | undefined) {
  if (!html) return { contentHtml: null, readingTime: null };
  const contentHtml = sanitizeContent(html);
  return { contentHtml, readingTime: calculateReadingTime(htmlToText(contentHtml)) };
}

// Sets publishedAt the first time content becomes public, keeps it afterwards.
export function resolvePublishedAt(isPublic: boolean, existing: Date | null | undefined): Date | null {
  if (existing) return existing;
  return isPublic ? new Date() : null;
}
