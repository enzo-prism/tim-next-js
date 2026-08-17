import { expect, test, type Page } from "@playwright/test";
import { CANONICAL_GA_MEASUREMENT_ID } from "../../src/lib/tracking-config";

const countDataLayerEvents = async (page: Page, eventName: string) =>
  page.evaluate(
    (name) =>
      window.dataLayer.filter(
        (entry) => entry?.[0] === "event" && entry?.[1] === name,
      ).length,
    eventName,
  );

test.describe("GA4 consent collection", () => {
  test("includes Allow and No thanks in the first HTML", async ({ request }) => {
    const response = await request.get("/");
    expect(response.ok()).toBeTruthy();
    const html = await response.text();
    expect(html).toContain('aria-label="Allow analytics"');
    expect(html).toContain("No thanks");
    expect(html).toContain("Analytics privacy choices");
  });

  test("loads G-L7MH47XYXL and records page_view after Allow", async ({ page }) => {
    const gtagRequests: string[] = [];

    await page.route("https://www.googletagmanager.com/gtag/js**", async (route) => {
      gtagRequests.push(route.request().url());
      await route.fulfill({ contentType: "application/javascript", body: "" });
    });

    await page.goto("/");
    await expect(page.getByRole("button", { name: "Allow analytics" })).toBeVisible();
    expect(gtagRequests).toEqual([]);

    await page.getByRole("button", { name: "Allow analytics" }).click();

    await expect.poll(() => gtagRequests.length).toBeGreaterThan(0);
    expect(gtagRequests.some((url) => url.includes(`id=${CANONICAL_GA_MEASUREMENT_ID}`))).toBe(
      true,
    );
    expect(gtagRequests.some((url) => url.includes("G-54ESSN4BF8"))).toBe(false);

    await expect.poll(async () => countDataLayerEvents(page, "page_view")).toBeGreaterThan(0);

    const sendTo = await page.evaluate(() => {
      const event = window.dataLayer.find(
        (entry) => entry?.[0] === "event" && entry?.[1] === "page_view",
      );
      return event?.[2]?.send_to;
    });
    expect(sendTo).toBe(CANONICAL_GA_MEASUREMENT_ID);
  });
});
