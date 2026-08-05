import { expect, test, type Page } from "@playwright/test";
import { installAdminContactsMock } from "../fixtures/admin-contacts";

/**
 * UI tests for the Leads-first admin dashboard. All data is synthetic
 * (tests/fixtures/admin-contacts.ts) served through route interception;
 * no database or real lead data is involved.
 */

test.use({
  httpCredentials: {
    username: process.env.ADMIN_USERNAME ?? "admin",
    password: process.env.ADMIN_PASSWORD ?? "tim",
  },
});

const stubExternalServices = async (page: Page) => {
  await page.route("https://www.googletagmanager.com/**", (route) =>
    route.fulfill({ contentType: "application/javascript", body: "" }),
  );
  await page.route("https://cdn.jsdelivr.net/**", (route) =>
    route.fulfill({ contentType: "application/javascript", body: "" }),
  );
};

const openLeadsDashboard = async (page: Page) => {
  await stubExternalServices(page);
  const mock = await installAdminContactsMock(page);
  await page.goto("/admin");
  await expect(page.getByTestId("lead-row").first()).toBeVisible();
  return mock;
};

const statusChipGroup = (page: Page) => page.getByRole("group", { name: "Status" });
const sourceChipGroup = (page: Page) => page.getByRole("group", { name: "Source" });
const typeChipGroup = (page: Page) => page.getByRole("group", { name: "Type" });

test.describe("admin leads dashboard (desktop 1440px)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop",
      "Desktop sweep runs on the desktop project only.",
    );
  });

  test("lands on the Leads tab with five fields per row and no phone/email", async ({
    page,
  }) => {
    await openLeadsDashboard(page);

    await expect(page.getByRole("tab", { name: "Leads" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    const table = page.getByTestId("leads-table");
    await expect(table).toBeVisible();
    for (const column of ["Received", "Name", "Source", "Service", "Status"]) {
      await expect(
        table.getByRole("columnheader", { name: column }),
      ).toHaveAttribute("scope", "col");
    }

    // Page 1 is a 25-row server window; one fixture row is a test lead, which
    // the operational view hides by default. Phone/email never appear here.
    await expect(page.getByTestId("lead-row")).toHaveCount(24);
    const tableText = (await table.textContent()) ?? "";
    expect(tableText).not.toContain("example.test");
    expect(tableText).not.toContain("+1555");

    const firstRow = page.getByTestId("lead-row").first();
    await expect(firstRow).toContainText("Test Patient Phoneonly");
    await expect(firstRow.locator("time")).toHaveAttribute("title", /.+/);
    await expect(firstRow.locator("time")).toContainText(/ago|Just now/);
    await expect(firstRow.getByTestId("source-badge")).toHaveText("Google Ads");
    await expect(firstRow.getByTestId("status-pill")).toHaveText("New");
  });

  test("marks fresh new leads with a NEW marker and skips older ones", async ({
    page,
  }) => {
    await openLeadsDashboard(page);

    const freshRow = page
      .getByTestId("lead-row")
      .filter({ hasText: "Patient Upsilon" });
    await expect(freshRow.getByTestId("new-marker")).toBeVisible();

    // seed-0005 is status=new but ~50h old — outside the 24h freshness window.
    const olderNewRow = page
      .getByTestId("lead-row")
      .filter({ hasText: "Patient Epsilon" });
    await expect(olderNewRow.getByTestId("new-marker")).toHaveCount(0);
  });

  test("hides test leads by default and reveals them with the toggle", async ({
    page,
  }) => {
    await openLeadsDashboard(page);

    await expect(page.getByTestId("test-badge")).toHaveCount(0);
    await expect(page.getByText("Patient Beta")).toHaveCount(0);

    const toggle = page.getByRole("button", { name: "Show test leads" });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");

    await expect(page.getByTestId("test-badge").first()).toBeVisible();
    await expect(
      page.getByTestId("lead-row").filter({ hasText: "Patient Beta" }),
    ).toBeVisible();
  });

  test("filter chips narrow the list and report their pressed state", async ({
    page,
  }) => {
    await openLeadsDashboard(page);

    const contacted = statusChipGroup(page).getByRole("button", { name: "Contacted" });
    await expect(contacted).toHaveAttribute("aria-pressed", "false");
    await contacted.click();
    await expect(contacted).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("lead-row").first()).toBeVisible();
    const pills = page.getByTestId("lead-row").getByTestId("status-pill");
    for (const pill of await pills.all()) {
      await expect(pill).toHaveText("Contacted");
    }

    await statusChipGroup(page).getByRole("button", { name: "All" }).click();
    await sourceChipGroup(page).getByRole("button", { name: "Google Ads" }).click();
    await expect(page.getByTestId("lead-row").first()).toBeVisible();
    const badges = page.getByTestId("lead-row").getByTestId("source-badge");
    for (const badge of await badges.all()) {
      await expect(badge).toHaveText("Google Ads");
    }
    await expect(page.getByText("Patient Theta")).toHaveCount(0); // formspree row

    await sourceChipGroup(page).getByRole("button", { name: "All" }).click();
    await typeChipGroup(page).getByRole("button", { name: "Appointment" }).click();
    // Five operational appointment leads in the fixture.
    await expect(page.getByTestId("lead-row")).toHaveCount(5);
    await expect(page.getByText("Patient Alpha")).toHaveCount(0);
  });

  test("new-lead pill shows the operational new count and filters to new", async ({
    page,
  }) => {
    await openLeadsDashboard(page);

    // 8 non-test leads with status=new in the fixture (test leads excluded).
    const pill = page.getByRole("button", { name: "8 new" });
    await pill.click();
    await expect(pill).toHaveAttribute("aria-pressed", "true");
    const pills = page.getByTestId("lead-row").getByTestId("status-pill");
    for (const statusPill of await pills.all()) {
      await expect(statusPill).toHaveText("New");
    }
  });

  test("paginates with a total-count label", async ({ page }) => {
    await openLeadsDashboard(page);

    // The window counts the server page; the suffix accounts for the test
    // leads the operational view hides (1 on page 1, 2 on page 2).
    await expect(page.getByText("Showing 1–25 of 31")).toBeVisible();
    await expect(page.getByText("(1 hidden on this page)")).toBeVisible();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.getByText("Showing 26–31 of 31")).toBeVisible();
    await expect(page.getByTestId("lead-row")).toHaveCount(4);
    await expect(page.getByText("(2 hidden on this page)")).toBeVisible();
    await page.getByRole("button", { name: "Prev", exact: true }).click();
    await expect(page.getByText("Showing 1–25 of 31")).toBeVisible();
  });

  test("drawer opens with follow-up actions and restores focus on Esc", async ({
    page,
  }) => {
    await openLeadsDashboard(page);

    const nameButton = page.getByRole("button", {
      name: "Test Patient Alpha",
      exact: true,
    });
    await nameButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(dialog.getByRole("heading", { name: "Test Patient Alpha" })).toBeVisible();
    await expect(dialog.getByRole("link", { name: /Call \+15550001001/ })).toHaveAttribute(
      "href",
      "tel:+15550001001",
    );
    await expect(
      dialog.getByRole("link", { name: /Email test\.alpha@example\.test/ }),
    ).toHaveAttribute("href", "mailto:test.alpha@example.test");
    await expect(dialog.getByLabel("Patient stage")).toBeVisible();
    await expect(dialog.getByText("Saw the ad for implants")).toBeVisible();

    // Focus is trapped inside the dialog while open.
    for (let i = 0; i < 15; i += 1) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(() => {
        const active = document.activeElement;
        const dialogEl = document.querySelector('[role="dialog"]');
        return Boolean(dialogEl && active && dialogEl.contains(active));
      });
      expect(inside).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(nameButton).toBeFocused();
  });

  test("drawer closes on backdrop click", async ({ page }) => {
    await openLeadsDashboard(page);
    await page
      .getByRole("button", { name: "Test Patient Alpha", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.mouse.click(20, 450); // overlay, far left of the 420px drawer
    await expect(dialog).toBeHidden();
  });

  test("omits the Email action for a phone-only lead and Call for an email-only lead", async ({
    page,
  }) => {
    await openLeadsDashboard(page);

    await page
      .getByRole("button", { name: "Test Patient Phoneonly", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("link", { name: /^Call / })).toBeVisible();
    await expect(dialog.getByRole("link", { name: /^Email / })).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    await page
      .getByRole("button", { name: "Test Patient Epsilon", exact: true })
      .click();
    await expect(dialog.getByRole("link", { name: /^Email / })).toBeVisible();
    await expect(dialog.getByRole("link", { name: /^Call / })).toHaveCount(0);
  });

  test("copy button gives aria-live feedback and writes to the clipboard", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      httpCredentials: {
        username: process.env.ADMIN_USERNAME ?? "admin",
        password: process.env.ADMIN_PASSWORD ?? "tim",
      },
      permissions: ["clipboard-read", "clipboard-write"],
    });
    const page = await context.newPage();
    await openLeadsDashboard(page);

    await page
      .getByRole("button", { name: "Test Patient Alpha", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog
      .getByRole("button", { name: "Copy phone number for Test Patient Alpha" })
      .click();
    await expect(dialog.getByText("Copied")).toBeVisible();
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toBe("+15550001001");

    await context.close();
  });

  test("saves a stage change through the mocked PATCH and updates the list", async ({
    page,
  }) => {
    const mock = await openLeadsDashboard(page);

    await page
      .getByRole("button", { name: "Test Patient Alpha", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Patient stage").click();
    await page.getByRole("option", { name: "Contacted" }).click();
    await dialog.getByRole("button", { name: "Save stage" }).click();

    await expect(dialog.getByTestId("status-pill")).toHaveText("Contacted");
    expect(mock.patchLog).toHaveLength(1);
    expect(mock.patchLog[0].id).toBe("seed-0001");
    expect(mock.patchLog[0].input.leadStatus).toBe("contacted");
    expect(mock.patchLog[0].input.expectedUpdatedAt).toBeTruthy();

    // The invalidated list query refetches and shows the new stage.
    await page.keyboard.press("Escape");
    const row = page.getByTestId("lead-row").filter({ hasText: "Patient Alpha" });
    await expect(row.getByTestId("status-pill")).toHaveText("Contacted");
  });

  test("supports a keyboard-only walkthrough into and out of the drawer", async ({
    page,
  }) => {
    await openLeadsDashboard(page);

    await page.getByLabel("Search leads").focus();
    let found = false;
    for (let i = 0; i < 40 && !found; i += 1) {
      await page.keyboard.press("Tab");
      found = await page.evaluate(() => {
        const active = document.activeElement;
        return (
          active instanceof HTMLButtonElement &&
          active.textContent?.trim() === "Test Patient Phoneonly"
        );
      });
    }
    expect(found).toBe(true);

    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(
      page.getByRole("button", { name: "Test Patient Phoneonly", exact: true }),
    ).toBeFocused();
  });
});

test.describe("admin leads dashboard (mobile 390px)", () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name !== "mobile",
      "Mobile sweep runs on the mobile project only.",
    );
  });

  test("renders stacked cards with the same five fields, table hidden", async ({
    page,
  }) => {
    await stubExternalServices(page);
    await installAdminContactsMock(page);
    await page.goto("/admin");
    const cards = page.getByTestId("lead-card");
    await expect(cards.first()).toBeVisible();

    await expect(page.getByTestId("leads-cards")).toBeVisible();
    await expect(page.getByTestId("leads-table")).toBeHidden();
    await expect(cards).toHaveCount(24); // 25-row window, 1 test lead hidden

    const firstCard = cards.first();
    const text = (await firstCard.textContent()) ?? "";
    expect(text).toContain("Test Patient Phoneonly"); // name
    expect(text).toContain("Google Ads"); // source badge
    expect(text).toContain("emergency"); // service
    expect(text).toContain("New"); // status pill + NEW marker
    await expect(firstCard.locator("time")).toHaveAttribute("title", /.+/); // received
    expect(text).not.toContain("example.test");
    expect(text).not.toContain("+1555");
  });

  test("full-card tap opens a full-screen drawer", async ({ page }) => {
    await stubExternalServices(page);
    await installAdminContactsMock(page);
    await page.goto("/admin");
    const firstCard = page.getByTestId("lead-card").first();
    await expect(firstCard).toBeVisible();

    await firstCard.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Test Patient Phoneonly" })).toBeVisible();

    const width = await dialog.evaluate((el) => el.getBoundingClientRect().width);
    expect(width).toBeGreaterThanOrEqual(390);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(firstCard).toBeFocused();
  });
});
