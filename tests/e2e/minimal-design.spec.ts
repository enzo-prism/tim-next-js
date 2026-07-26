import { expect, test, type Page } from "@playwright/test";

const publicRoutes = [
  "/",
  "/about",
  "/services",
  "/services/children-dentistry",
  "/patient-info",
  "/book-appointment",
  "/contact",
  "/testimonials",
  "/areas-we-serve/santa-cruz",
  "/blog",
  "/tmj",
];

const retiredAssetReferences = [
  "soft-blue",
  "icon-tooth",
  "icon-child",
  "icon-sparkles",
  "icon-smile",
  "icon-jaw",
  "sticker-tooth-sparkle",
  "mesh-hero",
];

async function gotoReady(page: Page, route: string) {
  await page.goto(route, { waitUntil: "domcontentloaded" });
  await expect(page.locator("main")).toBeVisible();
}

test.describe("minimal clinical design guard", () => {
  for (const route of publicRoutes) {
    test(`${route} avoids retired generated icon visuals`, async ({ page }) => {
      await gotoReady(page, route);

      await expect(page.locator('img[src*="/icons/soft-blue/"]')).toHaveCount(0);
      await expect(page.locator("svg.lucide")).toHaveCount(0);

      const html = await page.content();
      for (const reference of retiredAssetReferences) {
        expect(html).not.toContain(reference);
      }

    });
  }

  test("breadcrumb separators stay compact across public pages", async ({ page }) => {
    for (const route of publicRoutes.filter((path) => path !== "/")) {
      await gotoReady(page, route);

      const separators = page.locator('nav[aria-label="breadcrumb"] [role="presentation"] svg');
      const count = await separators.count();

      for (let index = 0; index < count; index += 1) {
        const box = await separators.nth(index).boundingBox();
        expect(box?.width ?? 0).toBeLessThanOrEqual(20);
        expect(box?.height ?? 0).toBeLessThanOrEqual(20);
      }
    }
  });

  test("primary appointment paths remain visible", async ({ page }) => {
    await gotoReady(page, "/");
    await expect(page.getByRole("link", { name: /request an appointment/i }).first()).toBeVisible();

    await gotoReady(page, "/book-appointment");
    await expect(page.getByRole("heading", { name: /start with the essentials/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue" })).toBeEnabled();

    await gotoReady(page, "/contact");
    await expect(page.getByRole("heading", { name: /send us a message/i })).toBeVisible();
  });
});
