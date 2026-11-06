import { z } from "zod";
import { mediaUrl } from "./project";

const optionalHttpUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\//i.test(v), "Must be an http(s) URL");

export const settingsSchema = z.object({
  siteTitle: z.string().trim().min(1).max(200),
  tagline: z.string().trim().max(300),
  introduction: z.string().max(2000),
  email: z.string().trim().max(254).refine((v) => v === "" || z.string().email().safeParse(v).success, "Invalid email"),
  githubUrl: optionalHttpUrl,
  linkedinUrl: optionalHttpUrl,
  location: z.string().trim().max(200),
  profileImage: mediaUrl,
});

export type SettingsInput = z.infer<typeof settingsSchema>;

export const nowItemSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
  category: z.string().max(60).optional().nullable(),
  displayOrder: z.number().int().min(0).max(999),
  isActive: z.boolean(),
});

export type NowItemInput = z.infer<typeof nowItemSchema>;

export const taxonomySchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().max(300).optional().nullable(),
});
