import { test as base } from "@playwright/test";
import { isolateGoogleAnalytics } from "./google-block";

export const test = base.extend({
  context: async ({ context }, use) => {
    await isolateGoogleAnalytics(context);
    await use(context);
  },
});

export { expect } from "@playwright/test";
export type { BrowserContext, Page, Route } from "@playwright/test";
