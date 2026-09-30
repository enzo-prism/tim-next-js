import { describe, expect, it, vi } from "vitest";
import { callOutcomeSchema, leadOutcomeSchema, outcomeAuthorizationStatus, recordLeadOutcome, reportRangeSchema, safeLandingPage, summarizeOutcomeRows } from "@/server/outcome-reporting";
import type { IStorage } from "@/server/storage";

const lead = { leadId: "11111111-1111-4111-8111-111111111111", status: "arrived", expectedUpdatedAt: "2026-09-30T16:00:00.000Z" };
const call = { provider: "office", callId: "opaque_123", occurredAt: "2026-09-30T16:00:00Z", sourceObservedAt: "2026-09-30T16:05:00Z", status: "booked" };
describe("outcome contract", () => {
  it("fails closed without a dedicated strong secret and compares bearer credentials", () => {
    const secret = "x".repeat(32);
    expect(outcomeAuthorizationStatus(`Bearer ${secret}`, undefined)).toBe(503);
    expect(outcomeAuthorizationStatus(`Bearer ${secret}`, "short")).toBe(503);
    expect(outcomeAuthorizationStatus(`Bearer ${secret}`, secret)).toBe(200);
    expect(outcomeAuthorizationStatus(`Bearer ${"y".repeat(32)}`, secret)).toBe(401);
    expect(outcomeAuthorizationStatus(null, secret)).toBe(401);
  });
  it("requires lifecycle concurrency token, known status and structured lost reason", () => {
    expect(leadOutcomeSchema.safeParse(lead).success).toBe(true);
    expect(leadOutcomeSchema.safeParse({ ...lead, status: "patient" }).success).toBe(false);
    expect(leadOutcomeSchema.safeParse({ ...lead, expectedUpdatedAt: undefined }).success).toBe(false);
    expect(leadOutcomeSchema.safeParse({ ...lead, status: "lost" }).success).toBe(false);
    expect(leadOutcomeSchema.safeParse({ ...lead, status: "lost", lostReason: "unreachable" }).success).toBe(true);
  });
  it("rejects call contact details and impossible timestamps", () => {
    expect(callOutcomeSchema.safeParse(call).success).toBe(true);
    for (const key of ["name", "phone", "email", "notes", "body", "transcript"]) expect(callOutcomeSchema.safeParse({ ...call, [key]: "private" }).success).toBe(false);
    expect(callOutcomeSchema.safeParse({ ...call, sourceObservedAt: "2026-09-29T16:00:00Z" }).success).toBe(false);
    expect(callOutcomeSchema.safeParse({ ...call, campaign: "person@example.com" }).success).toBe(false);
  });
  it("validates inclusive cohort dates and a maximum of 365 days", () => {
    expect(reportRangeSchema.safeParse({ start: "2026-01-01", end: "2026-12-31" }).success).toBe(true);
    for (const range of [{ start: "2026-01-01", end: "2027-01-01" }, { start: "2026-02-30", end: "2026-03-01" }, { start: "2026-03-02", end: "2026-03-01" }, { start: "2026-00-00", end: "2026-03-01" }]) expect(reportRangeSchema.safeParse(range).success).toBe(false);
  });
  it("returns only status/timestamp after update and delegates concurrency enforcement", async () => {
    const updateContactLifecycle = vi.fn().mockResolvedValue({ status: "updated", contact: { leadStatus: "arrived", updatedAt: new Date(lead.expectedUpdatedAt), firstName: "Private", email: "private@example.com" } });
    const result = await recordLeadOutcome({ updateContactLifecycle } as unknown as IStorage, leadOutcomeSchema.parse(lead));
    expect(result).toEqual({ status: "updated", leadStatus: "arrived", updatedAt: lead.expectedUpdatedAt });
    expect(updateContactLifecycle).toHaveBeenCalledWith(lead.leadId, { leadStatus: "arrived", expectedUpdatedAt: new Date(lead.expectedUpdatedAt), lostReason: undefined });
    updateContactLifecycle.mockResolvedValue({ status: "conflict" });
    expect(await recordLeadOutcome({ updateContactLifecycle } as unknown as IStorage, leadOutcomeSchema.parse(lead))).toEqual({ status: "conflict" });
  });
  it("distinguishes Google organic, unspecified Google and paid source evidence", () => {
    const row = { source: "google", landing_page: "/", campaign: null, total: 1, booked: 0, arrived: 0, updated: 0, new: 1, contacted: 0, current_booked: 0, current_arrived: 0, no_show: 0, lost: 0 };
    expect(summarizeOutcomeRows([{ ...row, medium: "organic" }]).byAttribution[0].source).toBe("Google organic");
    expect(summarizeOutcomeRows([row]).byAttribution[0].source).toBe("Google (unspecified)");
    expect(summarizeOutcomeRows([{ ...row, medium: "cpc" }]).byAttribution[0].source).toBe("Google Ads");
    expect(summarizeOutcomeRows([{ ...row, has_google_click_id: true }]).byAttribution[0].source).toBe("Google Ads");
  });
  it("strips attribution URL secrets and arbitrary text from report dimensions", () => {
    expect(safeLandingPage("https://www.famfirstsmile.com/contact?email=private@example.com")).toBe("/contact");
    expect(safeLandingPage("/patients/private-name")).toBe("other-page");
    const row = { source: "private@example.com", landing_page: "/contact?phone=5551234567", campaign: "Patient Private Name", total: 2, booked: 1, arrived: 1, updated: 1, new: 1, contacted: 0, current_booked: 0, current_arrived: 1, no_show: 0, lost: 0 };
    const result = summarizeOutcomeRows([row, row]);
    expect(result.totals).toMatchObject({ total: 4, everBooked: 2, everArrived: 2 });
    expect(result.outcomeCompleteness).toBe(0.5);
    expect(result.byAttribution).toHaveLength(1);
    expect(JSON.stringify(result)).not.toMatch(/Private|private@example|555123/);
    expect(summarizeOutcomeRows([]).outcomeCompleteness).toBeNull();
  });
});
