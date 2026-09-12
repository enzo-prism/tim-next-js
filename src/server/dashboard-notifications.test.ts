import { afterEach, describe, expect, it, vi } from "vitest";
import { sendGenericLeadAlert } from "@/server/dashboard-notifications";

describe("sendGenericLeadAlert", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.LEAD_DASHBOARD_NOTIFICATIONS_ENABLED;
    delete process.env.LEAD_DASHBOARD_NOTIFICATION_RECIPIENTS;
    delete process.env.LEAD_DASHBOARD_URL;
    delete process.env.LEAD_NOTIFICATION_WEBHOOK_URL;
  });

  it("posts a no-PII staff alert", async () => {
    process.env.LEAD_DASHBOARD_NOTIFICATIONS_ENABLED = "true";
    process.env.LEAD_DASHBOARD_NOTIFICATION_RECIPIENTS = "staff@example.com";
    process.env.LEAD_DASHBOARD_URL = "https://chuang-leads-dashboard.vercel.app";
    process.env.LEAD_NOTIFICATION_WEBHOOK_URL = "https://example.com/lead-hook";

    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await sendGenericLeadAlert("outbox-event-1");

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(init.headers).toEqual(
      expect.objectContaining({ "Idempotency-Key": "outbox-event-1" }),
    );
    expect(body.subject).toBe("A new lead just came in");
    expect(String(body.body)).toContain("No patient details are included");
    expect(String(body.body)).toContain("https://chuang-leads-dashboard.vercel.app");
    expect(JSON.stringify(body)).not.toContain("firstName");
    expect(JSON.stringify(body)).not.toContain("lastName");
    expect(JSON.stringify(body)).not.toContain("email");
    expect(JSON.stringify(body)).not.toContain("phone");
    expect(JSON.stringify(body)).not.toContain("jane@");
  });
});
