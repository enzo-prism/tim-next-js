import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  updateContactLifecycle: vi.fn(),
}));

vi.mock("@/server/storage", () => ({
  storage: {
    updateContactLifecycle: mocks.updateContactLifecycle,
  },
}));

import { PATCH } from "@/app/api/admin/contacts/[id]/route";

const auth = () =>
  `Basic ${Buffer.from("office-admin:test-password").toString("base64")}`;

const expectedUpdatedAt = "2026-07-15T16:30:00.000Z";

const patch = (body: unknown, authenticated = true) =>
  PATCH(
    new NextRequest("http://localhost/api/admin/contacts/lead-1", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        ...(authenticated ? { authorization: auth() } : {}),
      },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id: "lead-1" }) },
  );

const updatedContact = {
  id: "lead-1",
  submissionId: null,
  firstName: "Jamie",
  lastName: "Lee",
  email: "jamie@example.com",
  phone: null,
  service: "family-dentistry",
  message: null,
  requestType: "contact",
  preferredDate: null,
  preferredTime: null,
  formspreeStatus: "delivered",
  landingPage: "/contact",
  referrer: null,
  ctaSource: null,
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  utmTerm: null,
  utmContent: null,
  gclid: null,
  gbraid: null,
  wbraid: null,
  consentToContact: true,
  consentVersion: "2026-07-15",
  leadStatus: "booked" as const,
  contactedAt: new Date("2026-07-15T16:00:00.000Z"),
  bookedAt: new Date("2026-07-15T17:00:00.000Z"),
  arrivedAt: null,
  lostReason: null,
  staffNotes: "Booked for Friday.",
  createdAt: new Date("2026-07-15T15:00:00.000Z"),
  updatedAt: new Date("2026-07-15T17:00:00.000Z"),
};

describe("admin contact lifecycle PATCH", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_USERNAME = "office-admin";
    process.env.ADMIN_PASSWORD = "test-password";
    mocks.updateContactLifecycle.mockResolvedValue({
      status: "updated",
      contact: updatedContact,
    });
  });

  it("rejects requests that bypass Basic Auth", async () => {
    const response = await patch({ leadStatus: "booked", expectedUpdatedAt }, false);

    expect(response.status).toBe(401);
    expect(mocks.updateContactLifecycle).not.toHaveBeenCalled();
  });

  it("requires a reason when a lead is marked lost", async () => {
    const response = await patch({
      leadStatus: "lost",
      lostReason: "",
      expectedUpdatedAt,
    });

    expect(response.status).toBe(400);
    expect(mocks.updateContactLifecycle).not.toHaveBeenCalled();
  });

  it("updates lifecycle state and private notes", async () => {
    const response = await patch({
      leadStatus: "booked",
      staffNotes: "Booked for Friday.",
      expectedUpdatedAt,
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.updateContactLifecycle).toHaveBeenCalledWith("lead-1", {
      leadStatus: "booked",
      staffNotes: "Booked for Friday.",
      expectedUpdatedAt: new Date(expectedUpdatedAt),
    });
    expect(body.item).toEqual(
      expect.objectContaining({
        leadStatus: "booked",
        bookedAt: "2026-07-15T17:00:00.000Z",
        staffNotes: "Booked for Friday.",
      }),
    );
  });

  it("returns not found for a missing lead", async () => {
    mocks.updateContactLifecycle.mockResolvedValue({ status: "not_found" });

    const response = await patch({ leadStatus: "contacted", expectedUpdatedAt });

    expect(response.status).toBe(404);
  });

  it("returns conflict when another staff member saved first", async () => {
    mocks.updateContactLifecycle.mockResolvedValue({ status: "conflict" });

    const response = await patch({ leadStatus: "contacted", expectedUpdatedAt });

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual(
      expect.objectContaining({ error: "update_conflict" }),
    );
  });

  it("enforces a lost reason against the final stored state", async () => {
    mocks.updateContactLifecycle.mockResolvedValue({
      status: "invalid_lost_reason",
    });

    const response = await patch({ lostReason: null, expectedUpdatedAt });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual(
      expect.objectContaining({ error: "invalid_update" }),
    );
  });
});
