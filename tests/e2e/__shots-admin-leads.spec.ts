import { expect, test } from "@playwright/test";
import { installAdminContactsMock } from "../fixtures/admin-contacts";

// TEMPORARY screenshot capture for the Leads dashboard preview (synthetic data).
// Not committed — removed after capture.

const OUT = "/Users/enzo/.buzz/.scratch/dr-tim-dashboard/screenshots";

test.use({
  httpCredentials: {
    username: process.env.ADMIN_USERNAME ?? "admin",
    password: process.env.ADMIN_PASSWORD ?? "tim",
  },
});

test("capture desktop list and drawer", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop only");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("https://www.googletagmanager.com/**", (route) =>
    route.fulfill({ contentType: "application/javascript", body: "" }),
  );
  await installAdminContactsMock(page);
  await page.goto("/admin");
  await expect(page.getByTestId("lead-row").first()).toBeVisible();
  await page.screenshot({ path: `${OUT}/desktop-1440-list.png`, fullPage: false });

  await page.getByRole("button", { name: "Test Patient Alpha", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.screenshot({ path: `${OUT}/desktop-1440-drawer.png`, fullPage: false });
});

test("capture mobile cards and drawer", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile only");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("https://www.googletagmanager.com/**", (route) =>
    route.fulfill({ contentType: "application/javascript", body: "" }),
  );
  await installAdminContactsMock(page);
  await page.goto("/admin");
  await expect(page.getByTestId("lead-card").first()).toBeVisible();
  await page.screenshot({ path: `${OUT}/mobile-390-cards.png`, fullPage: false });

  await page.getByTestId("lead-card").first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.screenshot({ path: `${OUT}/mobile-390-drawer.png`, fullPage: false });
});
