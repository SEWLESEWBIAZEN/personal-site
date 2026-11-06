import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === "" || /^https?:\/\//i.test(v), "Must be an http(s) URL")
  .optional()
  .nullable();

// Accepts absolute http(s) URLs or site-relative upload paths.
export const mediaUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === "" || /^https?:\/\//i.test(v) || v.startsWith("/api/upload/"), "Must be an http(s) URL or uploaded file")
  .optional()
  .nullable();

export const projectSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  shortDescription: z.string().max(500).optional().nullable(),
  description: z.string().max(20000).optional().nullable(),
  problemStatement: z.string().max(20000).optional().nullable(),
  solution: z.string().max(20000).optional().nullable(),
  technicalChallenges: z.string().max(20000).optional().nullable(),
  architecture: z.string().max(20000).optional().nullable(),
  keyFeatures: z.string().max(20000).optional().nullable(),
  technologies: z.array(z.string().trim().min(1).max(60)).max(40),
  categoryId: z.string().optional().nullable(),
  coverImage: mediaUrl,
  videoUrl: optionalUrl,
  liveUrl: optionalUrl,
  repositoryUrl: optionalUrl,
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  isFeatured: z.boolean(),
  displayOrder: z.number().int().min(0).max(9999),
  tagIds: z.array(z.string()).max(50),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export const projectMediaSchema = z.object({
  url: z.string().trim().min(1).max(2000).refine((v) => /^https?:\/\//i.test(v) || v.startsWith("/api/upload/"), "Invalid URL"),
  mediaType: z.enum(["IMAGE", "VIDEO", "DOCUMENT"]),
  altText: z.string().max(300).optional().nullable(),
  caption: z.string().max(500).optional().nullable(),
});

export type ProjectMediaInput = z.infer<typeof projectMediaSchema>;
