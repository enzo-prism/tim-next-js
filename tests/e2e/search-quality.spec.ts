import { expect, test } from "./fixtures";

const serviceRoutes = ["/tmj", "/services/dental-exams", "/services/dental-hygiene", "/services/family-dentistry", "/services/children-dentistry", "/services/invisalign"];

test("priority service answers and canonicals are present before JavaScript", async ({ request }) => {
  for (const path of serviceRoutes) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    const html = await response.text();
    expect(html.match(/<h1\b/g), path).toHaveLength(1);
    expect(html, path).toContain(`rel="canonical" href="https://www.famfirstsmile.com${path}"`);
    expect(html, path).toContain("application/ld+json");
    expect(html, path).not.toMatch(/name="robots" content="noindex/);
  }
});

test("service planning is readable, linked, and usable on narrow screens", async ({ page }) => {
  await page.goto("/services/dental-hygiene");
  await page.getByRole("button", { name: "No thanks", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Teeth Cleaning");
  const question = page.locator("summary").filter({ hasText: "Is teeth cleaning the same as deep cleaning?" });
  await question.scrollIntoViewIfNeeded();
  await question.click();
  await expect(page.getByText(/Periodontal deep cleaning treats diagnosed gum disease/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Questions about an estimate or your plan" })).toHaveAttribute("href", "/insurance-and-payment");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("TMJ guidance avoids a bite-changing treatment promise", async ({ page }) => {
  await page.goto("/tmj");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Jaw Pain Evaluation");
  await expect(page.getByText(/changing the teeth or bite treats TMD/).first()).toBeAttached();
  await expect(page.getByRole("link", { name: "NIDCR: Temporomandibular disorders", exact: false })).toHaveAttribute("href", "https://www.nidcr.nih.gov/health-info/tmd");
  await expect(page.getByRole("heading", { name: "Orthodontic Solutions" })).toHaveCount(0);
});

test("sedation article answers the question and accurately scopes local services", async ({ page }) => {
  await page.goto("/blog/dental-sedation-for-kids-los-gatos");
  await expect(page.getByRole("heading", { name: "What makes the safety discussion individual?" })).toBeAttached();
  await expect(page.getByText(/does not establish that any particular sedation service/)).toBeAttached();
  await expect(page.getByText(/Clinically reviewed by/)).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("appointment links keep visit intent without proliferating source URLs", async ({ page }) => {
  await page.goto("/services/family-dentistry");
  const request = page.getByRole("link", { name: "Request a visit", exact: true });
  await expect(request).toHaveAttribute("href", "/book-appointment?service=family-dentistry");
  await request.click();
  await expect(page).toHaveURL(/\/book-appointment\?service=family-dentistry$/);
});
