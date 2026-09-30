import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("service picker fits a short viewport and reaches its final option by keyboard", async ({ page }) => {
  const viewport = page.viewportSize()!;
  await page.setViewportSize({ width: viewport.width, height: 540 });
  await page.goto("/contact");
  const trigger = page.getByRole("combobox", { name: "Service Interested In (optional)" });
  await trigger.click();
  const list = page.getByRole("listbox");
  await expect(list).toBeVisible();
  await expect(list).not.toHaveCSS("max-height", "none");
  const box = (await list.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(15);
  expect(box.y + box.height).toBeLessThanOrEqual(525);
  expect(box.x).toBeGreaterThanOrEqual(15);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width - 15);
  await page.getByRole("group", { name: "Options", exact: true }).focus();
  await page.keyboard.press("End");
  const lastOption = page.getByRole("option", { name: "Other", exact: true });
  await expect(lastOption).toBeFocused();
  await expect(lastOption).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveText("Other");
  await expect(trigger).toBeFocused();
  await trigger.press("ArrowDown");
  await expect(list).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(list).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("contact validation exposes all errors and focuses the first field", async ({ page }) => {
  let submissions = 0;
  await page.route("**/api/contacts", (route) => {
    submissions += 1;
    return route.fulfill({ status: 500, body: '{}' });
  });
  await page.goto("/contact");
  await page.getByRole("button", { name: "Send Message", exact: true }).click();
  const firstName = page.getByLabel("First Name *", { exact: true });
  await expect(firstName).toBeFocused();
  for (const text of ["First name is required", "Last name is required", "Email is required", "Please confirm that we may contact you"]) {
    await expect(page.getByText(text, { exact: true })).toBeVisible();
  }
  await expect(firstName).toHaveAttribute("aria-invalid", "true");
  const errorId = await firstName.getAttribute("aria-describedby");
  await expect(page.locator(`[id="${errorId}"]`)).toHaveText("!First name is required");
  await firstName.fill("Taylor");
  await page.getByLabel("Last Name *", { exact: true }).fill("Patient");
  await page.getByLabel("Email Address *", { exact: true }).fill("taylor@example.com");
  await page.getByRole("button", { name: "Send Message", exact: true }).click();
  await expect(page.getByRole("checkbox")).toBeFocused();
  expect(submissions).toBe(0);
});

test("booking fields provide consistent touch targets and readable mobile text", async ({ page }, testInfo) => {
  if (testInfo.project.name === "mobile") await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/book-appointment");
  for (const name of ["What can we help with?", "Who is the visit for?", "How should we contact you?", "Your first name", "Your last name", "Phone (required)"]) {
    const field = page.getByLabel(name, { exact: true });
    const size = await field.boundingBox();
    expect(size!.height).toBeGreaterThanOrEqual(44);
    if (testInfo.project.name === "mobile") {
      await expect(field).toHaveCSS("font-size", "16px");
    }
  }
  await page.getByLabel("Your first name", { exact: true }).fill("Taylor");
  await page.getByLabel("Your last name", { exact: true }).fill("Patient");
  await page.getByLabel("Phone (required)", { exact: true }).fill("4083588100");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Add any preferences" })).toBeVisible();
  const width = page.viewportSize()!.width;
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  const submit = (await page.getByRole("button", { name: "Send Appointment Request", exact: true }).boundingBox())!;
  expect(submit.height).toBeGreaterThanOrEqual(44);
  expect(submit.x + submit.width).toBeLessThanOrEqual(width);
});

test("optional service can be cleared and resets after successful contact submission", async ({ page }) => {
  let completeResponse!: () => void;
  const responseGate = new Promise<void>((resolve) => { completeResponse = resolve; });
  let submittedService: string | undefined;
  await page.route("**/api/contacts", async (route) => {
    submittedService = route.request().postDataJSON().service;
    await responseGate;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, created: true, delivered: true, leadId: "test-only", serviceId: "other" }) });
  });
  await page.goto("/contact");
  const trigger = page.getByRole("combobox");
  await trigger.click();
  await page.getByRole("option", { name: "Other", exact: true }).click();
  await trigger.click();
  await page.getByRole("option", { name: "No service preference", exact: true }).click();
  await expect(trigger).toHaveText("No service preference");
  await expect(page.locator('select[name="service"]')).toHaveValue("");
  await trigger.click();
  await page.getByRole("option", { name: "Other", exact: true }).click();
  await page.getByLabel("First Name *", { exact: true }).fill("Taylor");
  await page.getByLabel("Last Name *", { exact: true }).fill("Patient");
  await page.getByLabel("Email Address *", { exact: true }).fill("taylor@example.com");
  await page.getByRole("checkbox").check();
  const submit = page.getByRole("button", { name: "Send Message", exact: true });
  await submit.click();
  await expect.poll(() => submittedService).toBe("other");
  await expect(page.locator("form")).toHaveAttribute("aria-busy", "true");
  await expect(page.getByRole("button", { name: "Sending...", exact: true })).toBeDisabled();
  completeResponse();
  await expect(page.getByLabel("First Name *", { exact: true })).toHaveValue("");
  await expect(trigger).toHaveText("No service preference");
  await expect(page.getByRole("checkbox")).not.toBeChecked();
  await expect(page.getByRole("status").filter({ hasText: "Your message was saved." })).toBeFocused();
});

test("desktop services menu scrolls and restores keyboard focus", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Compact navigation uses the existing sheet tests.");
  await page.setViewportSize({ width: 1280, height: 500 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Services", exact: true });
  await trigger.focus();
  await trigger.press("ArrowDown");
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  const box = (await menu.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(64);
  expect(box.y + box.height).toBeLessThanOrEqual(485);
  await page.keyboard.press("End");
  const scanner = page.getByRole("menuitem", { name: "iTero Digital Scanner" });
  await expect(scanner).toBeFocused();
  await expect(scanner).toBeInViewport();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("service destinations keep their full action labels inside a narrow screen", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "This reproduces the narrow phone layout.");
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/services");
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  const actions = page.getByRole("link", { name: /^Learn More About / });
  expect(await actions.count()).toBeGreaterThan(0);
  for (const action of await actions.all()) {
    const box = (await action.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(320);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});
