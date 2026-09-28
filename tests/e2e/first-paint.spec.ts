import { expect, test } from "@playwright/test";

// Pages that ads and search land on must be readable from the server HTML,
// before (or without) JavaScript. Scroll-reveal wrappers used to ship these
// headings at opacity:0 until hydration.
const landingRoutes = [
  { route: "/", heading: "A Gentle Family Dentist in Los Gatos" },
  { route: "/services", heading: "Our Comprehensive Services" },
  { route: "/services/family-dentistry", heading: "General & Family Dentistry in Los Gatos" },
  { route: "/services/invisalign", heading: "Invisalign Clear Aligners in Los Gatos" },
  { route: "/technology/itero-digital-scanner", heading: /iTero/ },
  { route: "/services/childrens-dentistry/babys-first-visit", heading: /Baby/ },
  { route: "/testimonials", heading: /Patient/ },
  { route: "/about", heading: /About/ },
];

test.describe("content is visible on first paint", () => {
  for (const { route } of landingRoutes) {
    test(`${route} server HTML has no hidden reveal wrappers`, async ({ request }) => {
      const response = await request.get(route);
      expect(response.ok()).toBeTruthy();
      expect(await response.text()).not.toMatch(/style="opacity:0/);
    });
  }

  test("service headings and calls to action render without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    for (const { route, heading } of landingRoutes) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    }

    await page.goto("/services/family-dentistry");
    await expect(page.getByRole("link", { name: "or call (408) 358-8100" })).toHaveAttribute(
      "href",
      "tel:+14083588100",
    );

    await context.close();
  });
});
