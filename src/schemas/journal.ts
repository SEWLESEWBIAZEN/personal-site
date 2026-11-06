import { z } from "zod";
import { mediaUrl } from "./project";

export const articleSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  slug: z
    .string()
    .trim()
    .max(200)
    .regex(/^[a-z0-9-]*$/, "Lowercase letters, numbers and dashes only")
    .optional()
    .nullable(),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.record(z.string(), z.unknown()).optional().nullable(),
  contentHtml: z.string().max(500000).optional().nullable(),
  coverImage: mediaUrl,
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  isFeatured: z.boolean(),
  categoryId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).max(50),
});

export type ArticleInput = z.infer<typeof articleSchema>;
