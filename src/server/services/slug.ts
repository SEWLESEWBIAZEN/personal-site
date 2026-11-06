import { slugify } from "@/lib/utils";

type SlugLookup = (slug: string) => Promise<{ id: string } | null>;

export async function uniqueSlug(base: string, lookup: SlugLookup, excludeId?: string): Promise<string> {
  const root = slugify(base) || "untitled";
  for (let i = 0; ; i++) {
    const candidate = i === 0 ? root : `${root}-${i}`;
    const existing = await lookup(candidate);
    if (!existing || existing.id === excludeId) return candidate;
  }
}
