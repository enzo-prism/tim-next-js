import { expect, test } from "@playwright/test";

const retiredDashboardPages = ["/admin", "/admin/login", "/admin/leads"];
const retiredDashboardApis = [
  "/api/admin/contacts",
  "/api/admin/session",
  "/api/admin/changelog",
  "/api/admin/ga4/overview",
  "/api/admin/gsc/overview",
];

test.describe("retired on-site admin dashboard", () => {
  test("dashboard pages 404 and do not expose a leads board", async ({ page }) => {
    for (const path of retiredDashboardPages) {
      const response = await page.goto(path);

      expect(response?.status()).toBe(404);
      await expect(page.getByRole("heading", { name: /page not found/i })).toBeVisible();
      await expect(page.getByText(/patient contact details/i)).toHaveCount(0);
      await expect(page.getByRole("heading", { name: /leads/i })).toHaveCount(0);
      await expect(page.getByLabel(/password/i)).toHaveCount(0);
    }
  });

  test("dashboard APIs are gone", async ({ request }) => {
    for (const path of retiredDashboardApis) {
      const response = await request.get(path);
      expect(response.status()).toBe(404);
    }
  });
});
