import { defineConfig, devices } from "@playwright/test";

// End-to-end tests drive the production build (`pnpm build` first) against a real,
// throwaway PostgreSQL database and real local file storage.
const PORT = Number(process.env.E2E_PORT || 4100);
const DATABASE_URL = process.env.E2E_DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/personal_studio_e2e";

export const e2eEnv = {
  DATABASE_URL,
  AUTH_SECRET: "e2e-only-secret-0123456789abcdef0123456789",
  AUTH_URL: `http://localhost:${PORT}`,
  AUTH_TRUST_HOST: "true",
  ADMIN_EMAIL: "e2e-admin@example.com",
  ADMIN_PASSWORD: "e2e-password-123",
  SEED_SAMPLE_CONTENT: "true",
  STORAGE_PROVIDER: "local",
  STORAGE_LOCAL_PATH: "./.e2e-uploads",
};

if (!/e2e|test/i.test(DATABASE_URL)) throw new Error("E2E_DATABASE_URL must be a throwaway database");

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "off", screenshot: "only-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Applies migrations and the idempotent seed (non-destructive) before serving the production build.
    command: `pnpm db:deploy && pnpm db:seed && pnpm exec next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: { ...e2eEnv, NODE_ENV: "production" },
  },
});
