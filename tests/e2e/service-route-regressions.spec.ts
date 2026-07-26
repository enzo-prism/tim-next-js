import { expect, test } from "@playwright/test";

test("unknown services stay hard-404 and valid services keep canonical metadata", async ({
  page,
}) => {
  const missingResponse = await page.goto("/services/not-a-real-service", {
    waitUntil: "domcontentloaded",
  });

  expect(missingResponse?.status()).toBe(404);

  await page.goto("/services/invisalign", { waitUntil: "domcontentloaded" });
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://www.famfirstsmile.com/services/invisalign",
  );
});
