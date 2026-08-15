import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  snapshotPathTemplate: "{testDir}/__snapshots__/{arg}{ext}",
  use: { baseURL: "http://127.0.0.1:48741", trace: "retain-on-failure" },
  webServer: {
    command: "pnpm dev --port 48741",
    url: "http://127.0.0.1:48741",
    reuseExistingServer: false,
  },
});
