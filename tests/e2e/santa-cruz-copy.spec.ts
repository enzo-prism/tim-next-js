import { expect, test } from "@playwright/test";

const WIDGET_SCRIPT_URL =
  "https://unpkg.com/@elevenlabs/convai-widget-embed@0.11.4";

const widgetStubScript = `
(() => {
  if (customElements.get("elevenlabs-convai")) return;
  customElements.define("elevenlabs-convai", class extends HTMLElement {});
})();
`;

test.beforeEach(async ({ page }) => {
  await page.route(WIDGET_SCRIPT_URL, async (route) => {
    await route.fulfill({
      contentType: "application/javascript",
      body: widgetStubScript,
    });
  });
});

test("Santa Cruz page clearly presents a Los Gatos office serving Santa Cruz patients", async ({
  page,
}) => {
  await page.goto("/areas-we-serve/santa-cruz");

  await expect(page).toHaveTitle(
    "Los Gatos Family Dentist Serving Santa Cruz | Family First Smile Care",
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Family First Smile Care is physically located in Los Gatos, just off Highway 17, and serves Santa Cruz patients who want gentle family dentistry.",
  );

  await expect(page.locator("body")).not.toContainText("Los Gatos Family Dentistry");
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toContainText(
    "Los Gatos Family Dentist",
  );
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /Los Gatos family dentist serving Santa Cruz patients over Highway 17\./,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Family First Smile Care is physically located in Los Gatos, not Santa Cruz."),
  ).toBeVisible();
  await expect(
    page.getByText("Office address: 15251 National Ave, Suite 102, Los Gatos, CA."),
  ).toBeVisible();

  const locationFaq = page.locator("details").filter({
    hasText: "Is your dental office located in Santa Cruz?",
  });
  await locationFaq.click();
  await expect(locationFaq).toContainText(
    "No. Family First Smile Care is physically located in Los Gatos at 15251 National Ave, Suite 102.",
  );
});
