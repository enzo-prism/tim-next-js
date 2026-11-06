import { test as base } from "@playwright/test";
export * from "@playwright/test";

// Exercise the consented queue locally while preventing synthetic test traffic
// from reaching Google or Vercel, even when tests click Allow.
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route("https://www.googletagmanager.com/**", (route) => route.fulfill({ contentType: "application/javascript", body: "" }));
    await page.route(/https:\/\/[^/]*google-analytics\.com\//, (route) => route.fulfill({ status: 204, body: "" }));
    await page.route("**/_vercel/insights/**", (route) => route.fulfill({ contentType: "application/javascript", body: "" }));
    await use(page);
  },
});
