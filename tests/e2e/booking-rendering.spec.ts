import { expect, test, type Page } from "@playwright/test";
import { GOOGLE_ADS_CONVERSION_EVENT } from "../../src/lib/tracking-config";

const countDataLayerEvents = async (
  page: Page,
  eventName: string,
) =>
  page.evaluate(
    (name) =>
      window.dataLayer.filter(
        (entry) => entry?.[0] === "event" && entry?.[1] === name,
      ).length,
    eventName,
  );

const countAppointmentAdsConversions = async (page: Page) =>
  page.evaluate(
    (eventName) =>
      window.dataLayer.filter(
        (entry) => entry?.[0] === "event" && entry?.[1] === eventName,
      ).length,
    GOOGLE_ADS_CONVERSION_EVENT,
  );

test.describe("appointment request rendering and retry", () => {
  test("renders meaningful booking content without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    await page.goto("/book-appointment?service=invisalign");

    await expect(page.getByRole("heading", { name: "Tell us how we can help" })).toBeVisible();
    await expect(page.getByLabel("What can we help with?")).toHaveValue("invisalign");
    await expect(page.getByLabel("First name")).toBeVisible();

    const html = await page.content();
    expect(html).not.toContain("BAILOUT_TO_CLIENT_SIDE_RENDERING");

    await context.close();
  });

  test("keeps form values and the retry id when notification delivery is delayed", async ({
    page,
  }) => {
    const requestBodies: Array<Record<string, unknown>> = [];
    let attempt = 0;

    await page.route("https://www.googletagmanager.com/gtag/js**", async (route) => {
      await route.fulfill({ contentType: "application/javascript", body: "" });
    });
    await page.route("**/api/appointments", async (route) => {
      attempt += 1;
      requestBodies.push(route.request().postDataJSON());
      await route.fulfill({
        status: attempt === 1 ? 202 : 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          created: attempt === 1,
          delivered: attempt > 1,
          leadId: "lead-1",
          serviceId: "dental-exams",
          ...(attempt === 1
            ? { fallbackMessage: "Notification delayed. Please try delivery again." }
            : {}),
        }),
      });
    });

    await page.goto("/book-appointment?service=dental-exams");
    await page.getByRole("button", { name: "Allow analytics" }).click();
    await page.getByLabel("First name").fill("Taylor");
    await page.getByLabel("Last name").fill("Patient");
    await page.getByLabel("Email").fill("taylor@example.com");
    await page.getByLabel("Phone").fill("4083588100");
    await page.getByRole("button", { name: "Continue" }).click();
    await page
      .getByLabel(/I agree that Family First Smile Care may contact me/i)
      .check();
    await page.getByRole("button", { name: "Send Appointment Request" }).click();

    await expect(page.getByRole("heading", { name: "Your request was saved" })).toBeVisible();
    await expect(page.getByRole("status")).toBeFocused();
    await expect.poll(() => countDataLayerEvents(page, "generate_lead")).toBe(1);
    await expect.poll(() => countAppointmentAdsConversions(page)).toBe(0);
    await expect.poll(() => countDataLayerEvents(page, "form_submit_fallback")).toBe(1);
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pagehide")));
    expect(
      await page.evaluate(() =>
        window.dataLayer.some(
          (entry) =>
            entry?.[0] === "event" &&
            entry?.[1] === "appointment_form_abandon",
        ),
      ),
    ).toBe(false);
    await page.getByRole("button", { name: "Try delivery again" }).click();
    await expect(page.getByRole("heading", { name: "Add any preferences" })).toBeFocused();
    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByLabel("Email")).toHaveValue("taylor@example.com");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Send Appointment Request" }).click();

    await expect(
      page.getByRole("heading", { name: "Your appointment request was received" }),
    ).toBeVisible();
    await expect.poll(() => countDataLayerEvents(page, "generate_lead")).toBe(1);
    await expect.poll(() => countAppointmentAdsConversions(page)).toBe(0);
    await expect.poll(() => countDataLayerEvents(page, "form_submit_fallback")).toBe(1);
    expect(requestBodies).toHaveLength(2);
    expect(requestBodies[1]?.submissionId).toBe(requestBodies[0]?.submissionId);
  });

  test("recovers instead of looping when an edited retry conflicts with the stored lead", async ({
    page,
  }) => {
    // A delivery fallback keeps the form populated and invites a retry. If the
    // patient corrects a field first, the reused submission UUID no longer
    // matches the stored payload and the API answers 409. The client must
    // retire that UUID so the next attempt lands as a fresh lead rather than
    // conflicting forever.
    const requestBodies: Array<Record<string, unknown>> = [];
    let attempt = 0;

    await page.route("https://www.googletagmanager.com/gtag/js**", async (route) => {
      await route.fulfill({ contentType: "application/javascript", body: "" });
    });
    await page.route("**/api/appointments", async (route) => {
      attempt += 1;
      requestBodies.push(route.request().postDataJSON());

      if (attempt === 1) {
        await route.fulfill({
          status: 202,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            created: true,
            delivered: false,
            leadId: "lead-1",
            serviceId: "dental-exams",
            fallbackMessage: "Notification delayed. Please try delivery again.",
          }),
        });
        return;
      }

      if (attempt === 2) {
        await route.fulfill({
          status: 409,
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            message: "This submission ID is already associated with different form data.",
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          created: true,
          delivered: true,
          leadId: "lead-2",
          serviceId: "dental-exams",
        }),
      });
    });

    await page.goto("/book-appointment?service=dental-exams");
    await page.getByRole("button", { name: "Allow analytics" }).click();
    await page.getByLabel("First name").fill("Taylor");
    await page.getByLabel("Last name").fill("Patient");
    await page.getByLabel("Email").fill("taylor@example.com");
    await page.getByLabel("Phone").fill("4083588100");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByLabel(/I agree that Family First Smile Care may contact me/i).check();
    await page.getByRole("button", { name: "Send Appointment Request" }).click();

    await expect(page.getByRole("heading", { name: "Your request was saved" })).toBeVisible();

    // Correct a detail, which is exactly what makes the retry conflict.
    await page.getByRole("button", { name: "Try delivery again" }).click();
    await page.getByRole("button", { name: "Back" }).click();
    await page.getByLabel("Phone").fill("4083588101");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Send Appointment Request" }).click();

    // The conflict must not strand the patient on a dead form.
    await expect(page.getByText(/Your request changed since the last attempt/i)).toBeVisible();

    await page.getByRole("button", { name: "Send Appointment Request" }).click();
    await expect(
      page.getByRole("heading", { name: "Your appointment request was received" }),
    ).toBeVisible();

    expect(requestBodies).toHaveLength(3);
    expect(requestBodies[1]?.submissionId).toBe(requestBodies[0]?.submissionId);
    expect(requestBodies[2]?.submissionId).not.toBe(requestBodies[1]?.submissionId);
    expect(requestBodies[2]?.phone).toBe("4083588101");
  });
});

test.describe("contact request conversion tracking", () => {
  test("tracks a newly saved lead once when its delivery retry later succeeds", async ({
    page,
  }) => {
    const requestBodies: Array<Record<string, unknown>> = [];
    let attempt = 0;

    await page.route("https://www.googletagmanager.com/gtag/js**", async (route) => {
      await route.fulfill({ contentType: "application/javascript", body: "" });
    });
    await page.route("**/api/contacts", async (route) => {
      attempt += 1;
      requestBodies.push(route.request().postDataJSON());
      await route.fulfill({
        status: attempt === 1 ? 202 : 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          created: attempt === 1,
          delivered: attempt > 1,
          leadId: "lead-1",
          serviceId: null,
          ...(attempt === 1
            ? { fallbackMessage: "Notification delayed. Please try delivery again." }
            : {}),
        }),
      });
    });

    await page.goto("/contact");
    await page.getByRole("button", { name: "Allow analytics" }).click();
    await page.getByLabel("First Name *").fill("Taylor");
    await page.getByLabel("Last Name *").fill("Patient");
    await page.getByLabel("Email Address *").fill("taylor@example.com");
    await page
      .getByLabel(/I agree that Family First Smile Care may contact me/i)
      .check();
    await page.getByRole("button", { name: "Send Message" }).click();

    await expect(page.getByText("Your message was saved.")).toBeVisible();
    await expect.poll(() => countDataLayerEvents(page, "generate_lead")).toBe(1);

    await page.getByRole("button", { name: "Send Message" }).click();
    await expect(
      page
        .getByRole("status")
        .getByText("Thank you. Our team will get back to you soon."),
    ).toBeVisible();
    await expect.poll(() => countDataLayerEvents(page, "generate_lead")).toBe(1);

    expect(requestBodies).toHaveLength(2);
    expect(requestBodies[1]?.submissionId).toBe(requestBodies[0]?.submissionId);
  });
});
