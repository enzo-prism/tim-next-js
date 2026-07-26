import { expect, test } from "@playwright/test";

test("mobile menu actions remain reachable on a short viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 568 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const trigger = page.getByRole("button", { name: "Toggle mobile menu" });
  const menu = page.getByRole("dialog");
  const menuNavigation = menu.getByRole("navigation");
  const payBillLink = menu.getByRole("link", { name: "Pay Bill Online" });

  // The trigger is server-rendered but only functions once React has hydrated,
  // and `domcontentloaded` resolves before that. Retry opening until the sheet
  // appears, clicking only while it is still closed so a late-registered first
  // click cannot be toggled back shut.
  await expect(async () => {
    if (!(await menu.isVisible())) {
      await trigger.click();
    }
    await expect(menu).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 30_000 });
  await expect
    .poll(() =>
      Promise.all([
        menuNavigation.evaluate((element) => element.scrollHeight > element.clientHeight),
        payBillLink.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return rect.top >= 0 && rect.bottom <= window.innerHeight;
        }),
      ]).then(([isScrollable, alreadyVisible]) => isScrollable || alreadyVisible),
    )
    .toBe(true);

  await payBillLink.scrollIntoViewIfNeeded();
  await expect(payBillLink).toBeInViewport();
  await expect(payBillLink).toBeVisible();
});
