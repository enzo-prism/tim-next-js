import { describe, expect, it } from "vitest";
import {
  buildContactLifecycleUpdate,
  normalizeLeadSource,
} from "@/server/storage";

const emptyLifecycle = {
  leadStatus: "new" as const,
  contactedAt: null,
  bookedAt: null,
  arrivedAt: null,
  lostReason: null,
  staffNotes: null,
};

describe("lead lifecycle storage rules", () => {
  it("records contact and booking milestones when a lead books", () => {
    const now = new Date("2026-07-15T18:00:00.000Z");

    expect(
      buildContactLifecycleUpdate(emptyLifecycle, { leadStatus: "booked" }, now),
    ).toEqual({
      ...emptyLifecycle,
      leadStatus: "booked",
      contactedAt: now,
      bookedAt: now,
    });
  });

  it("preserves prior milestones when the patient arrives", () => {
    const contactedAt = new Date("2026-07-14T18:00:00.000Z");
    const bookedAt = new Date("2026-07-14T19:00:00.000Z");
    const now = new Date("2026-07-15T18:00:00.000Z");

    const result = buildContactLifecycleUpdate(
      { ...emptyLifecycle, leadStatus: "booked", contactedAt, bookedAt },
      { leadStatus: "arrived", staffNotes: "Checked in." },
      now,
    );

    expect(result).toEqual({
      leadStatus: "arrived",
      contactedAt,
      bookedAt,
      arrivedAt: now,
      lostReason: null,
      staffNotes: "Checked in.",
    });
  });

  it("keeps a lost reason only while the lead is lost", () => {
    const now = new Date("2026-07-15T18:00:00.000Z");
    const lost = buildContactLifecycleUpdate(
      emptyLifecycle,
      { leadStatus: "lost", lostReason: "Out of network" },
      now,
    );
    expect(lost.lostReason).toBe("Out of network");

    const recovered = buildContactLifecycleUpdate(
      lost,
      { leadStatus: "contacted" },
      now,
    );
    expect(recovered.lostReason).toBeNull();
  });
});

describe("lead source attribution", () => {
  it("prioritizes explicit UTM source over click ids and referral", () => {
    expect(
      normalizeLeadSource({
        utmSource: " newsletter ",
        gclid: "click",
        referrer: "https://google.com",
      }),
    ).toBe("newsletter");
  });

  it("separates paid search, referral, and direct leads", () => {
    expect(normalizeLeadSource({ gclid: "click" })).toBe("Google Ads");
    expect(normalizeLeadSource({ referrer: "https://example.com" })).toBe("Referral");
    expect(normalizeLeadSource({})).toBe("Direct / unknown");
  });
});
