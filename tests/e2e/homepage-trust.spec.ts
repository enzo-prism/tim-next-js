import { expect, test } from "@playwright/test";

// The first decision should work from server HTML even if hydration fails.
test("homepage shows its dentist, proof and patient paths without JavaScript", async ({ browser, baseURL }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL, viewport: testInfo.project.use.viewport });
  const page = await context.newPage();
  await page.goto("/");

  const dentist = page.getByRole("img", { name: "Dr. Tim J. Chuang, DDS", exact: true });
  await expect(dentist).toBeVisible();
  await expect(page.locator("[data-home-review-proof]")).toContainText("5.0 on Google");
  await expect(page.locator("[data-home-review-proof]")).toContainText("verified August 19, 2026");
  await expect(page.locator("[data-home-static-reviews] blockquote")).toHaveCount(3);
  await expect(page.getByRole("button", { name: "Next testimonial" })).toHaveCount(0);

  for (const [name, href] of [
    [/Your first visit/, "/new-patients"],
    [/Insurance & payment/, "/insurance-and-payment"],
    [/Something hurts/, "/urgent-dental-care"],
  ] as const) {
    await expect(page.getByRole("link", { name })).toHaveAttribute("href", href);
  }

  const portraitBox = await dentist.boundingBox();
  const tourBox = await page.getByRole("heading", { name: "A familiar place before your first visit" }).boundingBox();
  expect(portraitBox).not.toBeNull();
  expect(tourBox).not.toBeNull();
  expect(portraitBox!.y).toBeLessThan(tourBox!.y);
  await context.close();
});

test("the office tour loads only after play and closes back to its trigger", async ({ page }) => {
  // Keep this about the site's opt-in/focus behavior, not Vimeo's network.
  await page.route("https://player.vimeo.com/video/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "<html><body>Office tour player</body></html>" }),
  );
  await page.goto("/");
  const player = page.locator('iframe[title="Family First Smile Care Office Tour"]');
  await expect(player).toHaveCount(0);
  const play = page.getByRole("button", { name: "Play office tour: Family First Smile Care Office Tour" });
  await play.click();
  await expect(player).toBeVisible();
  const playerUrl = new URL((await player.getAttribute("src"))!);
  expect(playerUrl.searchParams.get("controls")).toBe("1");
  expect(playerUrl.searchParams.get("background")).toBe("0");
  expect(playerUrl.searchParams.get("muted")).toBe("0");
  expect(playerUrl.searchParams.get("loop")).toBe("0");
  await expect(player).toHaveAttribute("allowfullscreen", "");
  await page.getByRole("button", { name: "Close video: Family First Smile Care Office Tour" }).click();
  await expect(player).toHaveCount(0);
  await expect(play).toBeFocused();
});
