import { CANONICAL_GA_MEASUREMENT_ID } from "../../src/lib/tracking-config";
import { expect, test, type Page, type Route } from "./fixtures";

type GtagCall = unknown[];
type ContactsMock =
  | { kind: "json"; status: number; body: unknown }
  | { kind: "text"; status: number; body: string }
  | { kind: "abort" };

const leadEvents = (calls: GtagCall[]) =>
  calls.filter((call) => call[0] === "event" && call[1] === "generate_lead");

const gtagCalls = async (page: Page) =>
  page.evaluate(() => (window as Window & { __ffscGtagCalls?: GtagCall[] }).__ffscGtagCalls ?? []);

const fillContactForm = async (page: Page) => {
  await page.getByLabel("First Name *").fill("Taylor");
  await page.getByLabel("Last Name *").fill("Patient");
  await page.getByLabel("Email Address *").fill("taylor@example.com");
  await page.getByLabel(/I agree that Family First Smile Care may contact me/i).check();
};

const mockContacts = async (page: Page, mock: ContactsMock) => {
  await page.unroute("**/api/contacts").catch(() => undefined);
  await page.route("**/api/contacts", async (route: Route) => {
    if (mock.kind === "abort") {
      await route.abort("failed");
      return;
    }
    if (mock.kind === "text") {
      await route.fulfill({
        status: mock.status,
        contentType: "text/plain",
        body: mock.body,
      });
      return;
    }
    await route.fulfill({
      status: mock.status,
      contentType: "application/json",
      body: JSON.stringify(mock.body),
    });
  });
};

const submitContact = async (page: Page) => {
  await page.getByRole("button", { name: "Send Message" }).click();
};

test.describe("GA4 consent collection", () => {
  test("includes Allow, No thanks, and production-only Consent Mode defaults in the first HTML", async ({
    request,
  }) => {
    const response = await request.get("/");
    expect(response.ok()).toBeTruthy();
    const html = await response.text();
    expect(html).toContain('aria-label="Allow analytics"');
    expect(html).toContain("No thanks");
    expect(html).toContain("Analytics privacy choices");
    expect(html).toContain("Analytics choices");
    expect(html).toContain("famfirstsmile.com");
    expect(html).toContain("www.famfirstsmile.com");
    expect(html).toContain("analytics_storage: 'granted'");
    expect(html).toContain('"GB"');
    expect(html).toContain('"CH"');
    expect(html).toContain("ga-disable-G-L7MH47XYXL");
    expect(html).not.toContain("analytics_test");
  });

  test("does not load gtag.js on localhost and keeps the banner available", async ({ page }) => {
    const googleRequests: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (/google|doubleclick|pagead2/i.test(url)) {
        googleRequests.push(url);
      }
    });

    await page.goto("/");
    await expect(page.getByRole("button", { name: "Allow analytics" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Analytics choices" })).toBeVisible();
    expect(await page.locator("#google-analytics").count()).toBe(0);
    expect(googleRequests).toEqual([]);
  });

  test("No thanks is remembered in localStorage and a first-party cookie", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "No thanks" }).click();
    await expect(page.getByRole("region", { name: "Analytics privacy choices" })).toHaveCount(0);

    expect(await page.evaluate(() => window.localStorage.getItem("ffsc_analytics_consent_v1"))).toBe(
      "denied",
    );
    expect(await page.evaluate(() => document.cookie)).toContain("ffsc_analytics_consent_v1=denied");
    expect(await page.evaluate(() => window["ga-disable-G-L7MH47XYXL"])).toBe(true);

    await page.reload();
    await expect(page.getByRole("region", { name: "Analytics privacy choices" })).toHaveCount(0);
    expect(await page.locator("#google-analytics").count()).toBe(0);
  });

  test("Analytics choices reopens the notice so Allow can be revoked", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Allow analytics" }).click();
    await expect(page.getByRole("region", { name: "Analytics privacy choices" })).toHaveCount(0);

    await page.getByRole("button", { name: "Analytics choices" }).click();
    const notice = page.getByRole("region", { name: "Analytics privacy choices" });
    await expect(notice).toBeVisible();
    await page.getByRole("button", { name: "No thanks" }).click();
    await expect(notice).toHaveCount(0);
    expect(await page.evaluate(() => window.localStorage.getItem("ffsc_analytics_consent_v1"))).toBe(
      "denied",
    );
  });

  test("records the EEA/UK/CH denied default in the bootstrap script", async ({ request }) => {
    const html = await (await request.get("/")).text();
    expect(html).toContain("analytics_storage: 'denied'");
    expect(html).toContain('"GF"');
    expect(html).toContain('"IM"');
  });
});

test.describe("contact generate_lead", () => {
  test.describe.configure({ mode: "serial" });

  test("fires exactly one generate_lead on a 200 created response", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Lead-count proof is recorded on desktop.");
    await page.goto("/contact");
    await mockContacts(page, {
      kind: "json",
      status: 200,
      body: {
        success: true,
        created: true,
        delivered: true,
        leadId: "lead-created",
        serviceId: null,
      },
    });
    await fillContactForm(page);
    await submitContact(page);
    await expect(page.getByText("Thank you. Our team will get back to you soon.")).toBeVisible();

    const leads = leadEvents(await gtagCalls(page));
    expect(leads).toHaveLength(1);
    expect(leads[0]?.[2]).toEqual(
      expect.objectContaining({
        send_to: CANONICAL_GA_MEASUREMENT_ID,
        form_type: "contact",
        lead_source: "contact_form",
      }),
    );
  });

  test("fires exactly one generate_lead on a 200 queued response", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Lead-count proof is recorded on desktop.");
    await page.goto("/contact");
    await mockContacts(page, {
      kind: "json",
      status: 200,
      body: {
        success: true,
        created: true,
        queued: true,
        delivered: false,
        leadId: "lead-queued",
        serviceId: null,
        fallbackMessage: "Notification delayed.",
      },
    });
    await fillContactForm(page);
    await submitContact(page);
    await expect(page.getByText("Thank you. Our team will get back to you soon.")).toBeVisible();
    expect(leadEvents(await gtagCalls(page))).toHaveLength(1);
  });

  test("does not fire generate_lead on HTTP errors", async ({ context }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Lead-count proof is recorded on desktop.");
    for (const status of [400, 403, 422, 429, 500, 503]) {
      const page = await context.newPage();
      await page.goto("/contact");
      await mockContacts(page, {
        kind: "json",
        status,
        body: { success: false, message: "Unable to send your message." },
      });
      await fillContactForm(page);
      await submitContact(page);
      await expect(page.getByText("Error sending message")).toBeVisible();
      expect(leadEvents(await gtagCalls(page)), `status ${status}`).toHaveLength(0);
      await page.close();
    }
  });

  test("does not fire generate_lead on abort, dup, success:false, or non-JSON", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Lead-count proof is recorded on desktop.");

    const cases: Array<{ name: string; mock: ContactsMock }> = [
      { name: "abort", mock: { kind: "abort" } },
      {
        name: "dup",
        mock: {
          kind: "json",
          status: 200,
          body: { success: true, created: false, delivered: true, leadId: "lead-dup" },
        },
      },
      {
        name: "success:false",
        mock: { kind: "json", status: 200, body: { success: false, message: "No" } },
      },
      { name: "non-JSON", mock: { kind: "text", status: 200, body: "not-json" } },
    ];

    for (const { name, mock } of cases) {
      await page.goto("/contact");
      await mockContacts(page, mock);
      await fillContactForm(page);
      await submitContact(page);
      if (name === "dup") {
        await expect(page.getByText("Thank you. Our team will get back to you soon.")).toBeVisible();
      } else {
        await expect(page.getByText("Error sending message")).toBeVisible();
      }
      expect(leadEvents(await gtagCalls(page)), name).toHaveLength(0);
    }
  });

  test("does not fire generate_lead after No thanks", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Lead-count proof is recorded on desktop.");
    await page.goto("/contact");
    await page.getByRole("button", { name: "No thanks" }).click();
    await mockContacts(page, {
      kind: "json",
      status: 200,
      body: {
        success: true,
        created: true,
        delivered: true,
        leadId: "lead-opted-out",
      },
    });
    await fillContactForm(page);
    await submitContact(page);
    await expect(page.getByText("Thank you. Our team will get back to you soon.")).toBeVisible();
    expect(leadEvents(await gtagCalls(page))).toHaveLength(0);
  });
});
