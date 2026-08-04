import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  listContacts: vi.fn(),
  getLeadSourceSummary: vi.fn(),
  getCountsByStatus: vi.fn(),
}));

vi.mock("@/server/storage", () => ({
  storage: {
    listContacts: mocks.listContacts,
    getLeadSourceSummary: mocks.getLeadSourceSummary,
    getCountsByStatus: mocks.getCountsByStatus,
  },
}));

import { GET, POST } from "@/app/api/admin/contacts/route";

const auth = () =>
  `Basic ${Buffer.from("office-admin:test-password").toString("base64")}`;

const contact = {
  id: "lead-1",
  submissionId: "0d9f6471-7120-4b5a-a1af-e1f77b0dcacf",
  firstName: "Jamie",
  lastName: "Lee",
  email: "jamie@example.com",
  phone: "408-555-1212",
  service: "invisalign",
  message: "Please call after 3.",
  requestType: "appointment",
  preferredDate: "2026-08-10",
  preferredTime: "afternoon",
  formspreeStatus: "delivered",
  landingPage: "/services/invisalign",
  referrer: null,
  ctaSource: "service-hero",
  utmSource: "google",
  utmMedium: "cpc",
  utmCampaign: "invisalign",
  utmTerm: null,
  utmContent: null,
  gclid: "test-click-id",
  gbraid: null,
  wbraid: null,
  consentToContact: true,
  consentVersion: "2026-07-15",
  leadStatus: "booked" as const,
  contactedAt: new Date("2026-07-15T16:00:00.000Z"),
  bookedAt: new Date("2026-07-15T17:00:00.000Z"),
  arrivedAt: null,
  lostReason: null,
  staffNotes: "Confirmed by phone.",
  googleAdsLeadId: null,
  campaignId: null,
  campaignName: null,
  ingestedVia: null,
  updatedBy: null,
  isTest: false,
  rawPayload: null,
  createdAt: new Date("2026-07-15T15:00:00.000Z"),
  updatedAt: new Date("2026-07-15T17:00:00.000Z"),
};

describe("admin contacts GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_USERNAME = "office-admin";
    process.env.ADMIN_PASSWORD = "test-password";
    mocks.listContacts.mockResolvedValue({ total: 1, items: [contact] });
    mocks.getLeadSourceSummary.mockResolvedValue([
      {
        source: "google",
        leads: 1,
        booked: 1,
        arrived: 0,
        bookingRate: 1,
        arrivalRate: 0,
      },
    ]);
    mocks.getCountsByStatus.mockResolvedValue({ new: 0, booked: 1 });
  });

  it("rechecks Basic Auth inside the route handler", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/admin/contacts"),
    );

    expect(response.status).toBe(401);
    expect(mocks.listContacts).not.toHaveBeenCalled();
  });

  it("returns lifecycle data and source results with private filters in the body", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/admin/contacts", {
        method: "POST",
        headers: {
          authorization: auth(),
          "content-type": "application/json",
        },
        body: JSON.stringify({
          status: "booked",
          source: "Google Ads",
          q: "Jamie",
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.listContacts).toHaveBeenCalledWith(
      expect.objectContaining({ status: "booked", source: "Google Ads", q: "Jamie" }),
    );
    expect(body.items[0]).toEqual(
      expect.objectContaining({
        id: "lead-1",
        leadStatus: "booked",
        bookedAt: "2026-07-15T17:00:00.000Z",
        staffNotes: "Confirmed by phone.",
      }),
    );
    expect(body.sourceSummary[0]).toEqual(
      expect.objectContaining({ source: "google", booked: 1 }),
    );
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("rejects private search terms in the URL", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/admin/contacts?q=Jamie", {
        headers: { authorization: auth() },
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual(
      expect.objectContaining({ error: "search_body_required" }),
    );
    expect(mocks.listContacts).not.toHaveBeenCalled();
  });

  it("rejects unknown lifecycle status filters", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/admin/contacts?status=invalid", {
        headers: { authorization: auth() },
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.listContacts).not.toHaveBeenCalled();
  });

  it("does not include rawPayload in list items", async () => {
    const contactWithPayload = {
      ...contact,
      rawPayload: { lead_id: "google-lead-001", user_column_data: [] },
    };
    mocks.listContacts.mockResolvedValue({ total: 1, items: [contactWithPayload] });

    const response = await GET(
      new NextRequest("http://localhost/api/admin/contacts", {
        headers: { authorization: auth() },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.items[0]).not.toHaveProperty("rawPayload");
  });
});
