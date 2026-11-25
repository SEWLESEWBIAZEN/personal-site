import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "server-only": path.resolve(__dirname, "tests/support/empty.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    // Integration tests share one real PostgreSQL database.
    fileParallelism: false,
    globalSetup: ["tests/support/global-setup.ts"],
    setupFiles: ["tests/support/integration.ts"],
    testTimeout: 30000,
    silent: "passed-only",
    hookTimeout: 60000,
  },
});
