import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "core-api-e2e",
    include: ["test/**/*.e2e-spec.ts"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    pool: "forks",
    env: {
      JWT_SECRET: "test-secret",
      AUTH_MOCK: "true",
      NODE_ENV: "test",
    },
  },
});
