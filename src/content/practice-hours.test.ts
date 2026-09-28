import { describe, expect, it } from "vitest";
import { describePracticeStatus, getPracticeStatus } from "@/content/practice-hours";

// Instants are UTC; comments give Los Angeles wall-clock time.
const statusAt = (iso: string) => describePracticeStatus(getPracticeStatus(new Date(iso)));

describe("practice open-now status", () => {
  it("is open during Monday through Thursday hours", () => {
    expect(statusAt("2026-09-28T17:00:00Z")).toBe("Open now · until 5 PM"); // Mon 10:00 AM PDT
    expect(statusAt("2026-10-01T23:59:00Z")).toBe("Open now · until 5 PM"); // Thu 4:59 PM PDT
  });

  it("points to the same morning before opening", () => {
    expect(statusAt("2026-09-29T15:30:00Z")).toBe("Closed · opens 9 AM"); // Tue 8:30 AM PDT
  });

  it("points to the next open day after closing and over the long weekend", () => {
    expect(statusAt("2026-09-29T00:00:00Z")).toBe("Closed · opens Tue 9 AM"); // Mon 5:00 PM PDT
    expect(statusAt("2026-10-02T00:30:00Z")).toBe("Closed · opens Mon 9 AM"); // Thu 5:30 PM PDT
    expect(statusAt("2026-10-02T19:00:00Z")).toBe("Closed · opens Mon 9 AM"); // Fri noon PDT
    expect(statusAt("2026-10-05T06:59:00Z")).toBe("Closed · opens Mon 9 AM"); // Sun 11:59 PM PDT
  });

  it("uses Los Angeles time across daylight-saving changes", () => {
    expect(statusAt("2026-11-09T17:30:00Z")).toBe("Open now · until 5 PM"); // Mon 9:30 AM PST
    expect(statusAt("2026-11-09T16:30:00Z")).toBe("Closed · opens 9 AM"); // Mon 8:30 AM PST
  });
});
