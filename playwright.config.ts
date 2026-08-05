import { defineConfig, devices } from "@playwright/test";
import { adminCredentials } from "./tests/e2e/admin-credentials";

const port = 3100;
const baseURL = `http://127.0.0.1:${port}`;
const productionServerCommand = `npm run start -- --hostname 127.0.0.1 --port ${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  workers: process.env.CI ? 3 : undefined,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: process.env.CI
      ? productionServerCommand
      : `npm run build && ${productionServerCommand}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    // `npm run start` runs in production mode, where the middleware makes every
    // /admin path unreachable unless both admin variables are set. CI provides
    // no admin secrets, so the admin specs need these test-only values.
    env: {
      ADMIN_USERNAME: adminCredentials.username,
      ADMIN_PASSWORD: adminCredentials.password,
    },
  },
  projects: [
    {
      name: "desktop",
      use: {
        browserName: "chromium",
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "tablet",
      use: {
        browserName: "chromium",
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["iPhone 13"],
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
      },
    },
  ],
});
