import { expect, test, type Page } from "@playwright/test";

const bar = (page: Page) => page.getByRole("navigation", { name: "Call or request a visit" });

// Instants are UTC; comments give Los Angeles wall-clock time.
const MONDAY_10AM = new Date("2026-09-28T17:00:00Z");
const FRIDAY_NOON = new Date("2026-10-02T19:00:00Z");

test.describe("mobile action bar", () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "The bar only renders below the md breakpoint.");
  });

  test("leads with the call during office hours", async ({ page }) => {
    await page.clock.setFixedTime(MONDAY_10AM);
    await page.goto("/services/family-dentistry");

    const call = bar(page).getByRole("link", { name: /Call \(408\) 358-8100/ });
    await expect(call).toHaveAttribute("href", "tel:+14083588100");
    await expect(page.getByTestId("practice-status")).toHaveText("Open now · until 5 PM");
    await expect(call).toHaveClass(/bg-primary/);
    await expect(bar(page).getByRole("link", { name: "Request visit" })).toHaveAttribute(
      "href",
      /\/book-appointment\?source=mobile_action_bar/,
    );
  });

  test("leads with the request when the office is closed", async ({ page }) => {
    await page.clock.setFixedTime(FRIDAY_NOON);
    await page.goto("/");

    await expect(page.getByTestId("practice-status")).toHaveText("Closed · opens Mon 9 AM");
    await expect(bar(page).getByRole("link", { name: "Request visit" })).toHaveClass(/bg-primary/);
  });

  test("keeps the privacy prompt and the assistant above the bar", async ({ page }) => {
    await page.goto("/");

    const barBox = await bar(page).boundingBox();
    const promptBox = await page.getByRole("region", { name: "Analytics privacy choices" }).boundingBox();
    expect(barBox && promptBox).toBeTruthy();
    expect(promptBox!.y + promptBox!.height).toBeLessThanOrEqual(barBox!.y);

    await page.getByRole("button", { name: "No thanks" }).click();
    const launcherBox = await page.getByTestId("assistant-launcher").boundingBox();
    expect(launcherBox!.y + launcherBox!.height).toBeLessThanOrEqual(barBox!.y);
  });

  test("lets the footer scroll clear of the bar", async ({ page }) => {
    await page.goto("/");
    // The site enables smooth scrolling, so jump instantly and let layout settle.
    await page.evaluate(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
    );

    await expect
      .poll(async () => {
        const barBox = await bar(page).boundingBox();
        const legalBox = await page.getByRole("link", { name: "Site Map" }).boundingBox();
        return legalBox!.y + legalBox!.height <= barBox!.y;
      })
      .toBe(true);
  });

  test("stays off form routes, which already lead with a call link", async ({ page }) => {
    for (const route of ["/book-appointment", "/contact"]) {
      await page.goto(route);
      await expect(page.getByRole("main")).toBeVisible();
      await expect(bar(page)).toHaveCount(0);
    }
  });

  test("offers the phone number in the mobile menu", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Toggle mobile menu" });
    const menu = page.getByRole("dialog");

    await expect(async () => {
      if (!(await menu.isVisible())) await trigger.click();
      await expect(menu).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 30_000 });

    await expect(menu.getByRole("link", { name: "Call (408) 358-8100" })).toHaveAttribute(
      "href",
      "tel:+14083588100",
    );
  });
});

test("the bar does not render on tablet and desktop widths", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Covered by the mobile tests above.");
  await page.goto("/");
  await expect(page.getByRole("main")).toBeVisible();
  await expect(bar(page)).toBeHidden();
});
