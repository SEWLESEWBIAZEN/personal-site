import { mkdtempSync } from "fs";
import os from "os";
import path from "path";
import { vi } from "vitest";

// Must run before any module that constructs the Prisma client or storage.
export const integrationEnabled = Boolean(process.env.TEST_DATABASE_URL);
if (integrationEnabled) process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
export const uploadDir = mkdtempSync(path.join(os.tmpdir(), "studio-uploads-"));
process.env.STORAGE_LOCAL_PATH = uploadDir;
process.env.STORAGE_PROVIDER = "local";

export const session: { current: { user: { role: string; id: string } } | null } = {
  current: { user: { role: "ADMIN", id: "test-admin" } },
};

vi.mock("@/lib/auth", () => ({
  auth: async () => session.current,
  requireAdmin: async () => {
    if (session.current?.user.role !== "ADMIN") throw new Error("Unauthorized");
    return session.current;
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: () => undefined }));
