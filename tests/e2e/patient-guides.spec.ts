import { expect, test } from "@playwright/test";

for (const path of ["/new-patients", "/insurance-and-payment", "/urgent-dental-care"]) {
  test(`${path} is available without JavaScript`, async ({ browser, baseURL }, testInfo) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL, viewport: testInfo.project.use.viewport });
    const page = await context.newPage();
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator('main a[href="tel:+14083588100"]').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await context.close();
  });
}

test("service explanation precedes patient reviews and scheduling is available early", async ({ page }) => {
  await page.goto("/services/dental-crowns");
  await expect(page.getByRole("link", { name: "Request a visit", exact: true })).toBeVisible();
  const about = page.getByRole("heading", { name: "About Dental Crowns" });
  const reviews = page.getByRole("heading", { name: "Dental Crowns Patient Reviews" });
  expect((await about.boundingBox())!.y).toBeLessThan((await reviews.boundingBox())!.y);
  await expect(page.getByRole("link", { name: "Questions about an estimate or your plan" })).toHaveAttribute("href", "/insurance-and-payment");
});
