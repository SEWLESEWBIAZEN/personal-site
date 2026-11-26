import { execSync } from "child_process";

// Integration tests run against a real, throwaway PostgreSQL database. It is migrated
// with the committed migrations (never `db push`) so the schema matches production.
export default function setup() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    console.warn("[tests] TEST_DATABASE_URL is not set: integration tests will be skipped.");
    return;
  }
  if (!/test/i.test(url)) throw new Error("TEST_DATABASE_URL must point at a database whose name contains 'test'.");
  execSync("pnpm prisma migrate deploy", { stdio: "inherit", env: { ...process.env, DATABASE_URL: url } });
}
