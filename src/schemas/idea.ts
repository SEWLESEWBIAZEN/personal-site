import { z } from "zod";
import { mediaUrl } from "./project";

export const ideaSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  summary: z.string().max(500).optional().nullable(),
  content: z.record(z.string(), z.unknown()).optional().nullable(),
  contentHtml: z.string().max(500000).optional().nullable(),
  categoryId: z.string().optional().nullable(),
  status: z.enum(["THOUGHT", "EXPLORING", "EXPERIMENTING", "IMPLEMENTED", "ARCHIVED"]),
  coverImage: mediaUrl,
  isPublic: z.boolean(),
  tagIds: z.array(z.string()).max(50),
});

export type IdeaInput = z.infer<typeof ideaSchema>;
