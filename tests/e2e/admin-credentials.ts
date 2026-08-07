import type { Page } from "@playwright/test";

// The admin surface sits behind a single-password cookie gate. `npm run start`
// runs in production mode, so the Playwright web server supplies this test-only
// password and the specs sign in with it. A real password comes from the
// environment when it provides one.
export const adminPassword = process.env.ADMIN_PASSWORD ?? "e2e-local-only";

// Sign in once, then land on the requested admin path. Every admin spec starts
// here instead of poking at cookies directly, so the specs break if the real
// sign-in flow breaks.
export const signInToAdmin = async (page: Page, destination = "/admin") => {
  await page.goto("/admin/login");
  await page.getByLabel("Password").fill(adminPassword);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/admin**");
  if (destination !== "/admin") {
    await page.goto(destination);
  }
};
