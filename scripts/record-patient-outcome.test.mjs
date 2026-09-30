import { describe, expect, it } from "vitest";
import { validatePayload, outcomeOrigin } from "./record-patient-outcome.mjs";
describe("outcome operator CLI", () => {
  it("validates a reviewable strict payload without caller details", () => {
    const payload = { provider: "office", callId: "opaque-1", status: "arrived", occurredAt: "2026-09-30T12:00:00Z", sourceObservedAt: "2026-09-30T13:00:00Z" };
    expect(validatePayload("call", payload)).toMatchObject({ source: "unknown" });
    expect(() => validatePayload("call", { ...payload, phone: "5551234567" })).toThrow();
    expect(() => validatePayload("lead", { leadId: "11111111-1111-4111-8111-111111111111", status: "lost", expectedUpdatedAt: payload.occurredAt })).toThrow();
  });
  it("pins bearer sends to an explicit origin and rejects insecure remote URLs and credentials", () => {
    expect(outcomeOrigin("https://www.famfirstsmile.com")).toBe("https://www.famfirstsmile.com");
    expect(outcomeOrigin("http://127.0.0.1:3000")).toBe("http://127.0.0.1:3000");
    for (const value of ["http://example.com", "https://user:secret@example.com", "https://example.com/path", "https://example.com?query=private"]) expect(() => outcomeOrigin(value)).toThrow();
  });
});
