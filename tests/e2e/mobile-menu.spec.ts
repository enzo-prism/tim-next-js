import { expect, test } from "@playwright/test";

test("mobile menu actions remain reachable on a short viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 568 });
  await page.goto("/");

  await page.getByRole("button", { name: "Toggle mobile menu" }).click();

  const menu = page.getByRole("dialog");
  const menuNavigation = menu.getByRole("navigation");
  const payBillLink = menu.getByRole("link", { name: "Pay Bill Online" });

  await expect(menu).toBeVisible();
  await expect
    .poll(() =>
      menuNavigation.evaluate(
        (element) => element.scrollHeight > element.clientHeight,
      ),
    )
    .toBe(true);

  await payBillLink.scrollIntoViewIfNeeded();
  await expect(payBillLink).toBeInViewport();
  await expect(payBillLink).toBeVisible();
});
