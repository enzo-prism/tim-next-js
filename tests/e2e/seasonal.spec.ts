import { expect, test } from "@playwright/test";

// The October layer is decided in the browser, so force it on or off with
// the query param instead of depending on the date CI runs.
test.describe("October seasonal layer", () => {
  test("previews on the homepage and stays decorative", async ({ page }) => {
    await page.goto("/?season=halloween");
    await expect(page.locator("html")).toHaveAttribute("data-ffsc-season", "halloween");
    await expect(page.getByText("Happy Halloween from Los Gatos")).toBeVisible();
    await expect(page.locator(".ffsc-moon")).toHaveAttribute("aria-hidden", "true");

    // Primary paths are unchanged.
    await expect(page.getByRole("link", { name: /request an appointment/i }).first()).toBeVisible();
    await expect(page.getByRole("img", { name: "Dr. Tim J. Chuang, DDS", exact: true })).toBeVisible();
  });

  test("the footer jack-o'-lanterns light up and blow out", async ({ page }) => {
    await page.goto("/?season=halloween");
    const lanterns = page.getByRole("button", { name: /light the jack-o'-lanterns/i });
    await lanterns.scrollIntoViewIfNeeded();
    await lanterns.click();
    const lit = page.getByRole("button", { name: /blow out the jack-o'-lanterns/i });
    await expect(lit).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("Enjoy the treats, and brush before bed.")).toBeVisible();
    await lit.click();
    await expect(page.getByRole("button", { name: /light the jack-o'-lanterns/i })).toHaveAttribute("aria-pressed", "false");
  });

  test("stays off the appointment form and when opted out", async ({ page }) => {
    await page.goto("/book-appointment?season=halloween");
    await expect(page.locator("html")).toHaveAttribute("data-ffsc-season", "halloween");
    await expect(page.locator(".ffsc-patch")).toHaveCount(0);

    await page.goto("/?season=off");
    await expect(page.locator("html")).not.toHaveAttribute("data-ffsc-season", /.+/);
    await expect(page.getByText("Happy Halloween from Los Gatos")).toBeHidden();
    await page.goto("/?season=auto");
  });

  test("decorations are hidden without JavaScript", async ({ browser, baseURL }, testInfo) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL, viewport: testInfo.project.use.viewport });
    const page = await context.newPage();
    await page.goto("/?season=halloween");
    await expect(page.getByRole("heading", { level: 1, name: "A Gentle Family Dentist in Los Gatos" })).toBeVisible();
    await expect(page.getByText("Happy Halloween from Los Gatos")).toBeHidden();
    await context.close();
  });
});
