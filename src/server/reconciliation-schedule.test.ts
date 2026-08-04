import { describe, expect, it } from "vitest";
import { computeRunKey, computeTimeWindow } from "@/server/reconciliation-service";
import type { ReconciliationProviderName } from "@/server/schema";

describe("computeRunKey twice-daily scheduling", () => {
  const provider: ReconciliationProviderName = "google_ads";

  it("produces an am slot for hours 0-11 UTC", () => {
    const at0900 = new Date("2026-08-04T09:00:00Z");
    expect(computeRunKey(provider, at0900)).toBe(
      "reconciliation:google_ads:2026-08-04:am",
    );

    const at0000 = new Date("2026-08-04T00:00:00Z");
    expect(computeRunKey(provider, at0000)).toBe(
      "reconciliation:google_ads:2026-08-04:am",
    );

    const at1159 = new Date("2026-08-04T11:59:59Z");
    expect(computeRunKey(provider, at1159)).toBe(
      "reconciliation:google_ads:2026-08-04:am",
    );
  });

  it("produces a pm slot for hours 12-23 UTC", () => {
    const at2100 = new Date("2026-08-04T21:00:00Z");
    expect(computeRunKey(provider, at2100)).toBe(
      "reconciliation:google_ads:2026-08-04:pm",
    );

    const at1200 = new Date("2026-08-04T12:00:00Z");
    expect(computeRunKey(provider, at1200)).toBe(
      "reconciliation:google_ads:2026-08-04:pm",
    );

    const at2359 = new Date("2026-08-04T23:59:59Z");
    expect(computeRunKey(provider, at2359)).toBe(
      "reconciliation:google_ads:2026-08-04:pm",
    );
  });

  it("produces distinct keys for am and pm on the same date", () => {
    const am = computeRunKey(provider, new Date("2026-08-04T09:00:00Z"));
    const pm = computeRunKey(provider, new Date("2026-08-04T21:00:00Z"));
    expect(am).not.toBe(pm);
  });

  it("produces distinct keys for different providers in the same slot", () => {
    const ga = computeRunKey("google_ads", new Date("2026-08-04T09:00:00Z"));
    const fs = computeRunKey("formspree", new Date("2026-08-04T09:00:00Z"));
    expect(ga).not.toBe(fs);
  });

  it("is deterministic for the same input", () => {
    const now = new Date("2026-08-04T09:30:00Z");
    expect(computeRunKey(provider, now)).toBe(computeRunKey(provider, now));
  });
});

describe("computeTimeWindow anchors to preceding completed 12 hours", () => {
  it("am run at 09:00 reconciles [21:00 prev day, 09:00 today)", () => {
    const now = new Date("2026-08-04T09:00:00Z");
    const window = computeTimeWindow(now);
    expect(window.since.toISOString()).toBe("2026-08-03T21:00:00.000Z");
    expect(window.until.toISOString()).toBe("2026-08-04T09:00:00.000Z");
  });

  it("pm run at 21:00 reconciles [09:00 today, 21:00 today)", () => {
    const now = new Date("2026-08-04T21:00:00Z");
    const window = computeTimeWindow(now);
    expect(window.since.toISOString()).toBe("2026-08-04T09:00:00.000Z");
    expect(window.until.toISOString()).toBe("2026-08-04T21:00:00.000Z");
  });

  it("am run at 00:00 still uses [21:00 prev day, 09:00 today)", () => {
    const now = new Date("2026-08-04T00:00:00Z");
    const window = computeTimeWindow(now);
    expect(window.since.toISOString()).toBe("2026-08-03T21:00:00.000Z");
    expect(window.until.toISOString()).toBe("2026-08-04T09:00:00.000Z");
  });

  it("pm run at 23:59 still uses [09:00 today, 21:00 today)", () => {
    const now = new Date("2026-08-04T23:59:59Z");
    const window = computeTimeWindow(now);
    expect(window.since.toISOString()).toBe("2026-08-04T09:00:00.000Z");
    expect(window.until.toISOString()).toBe("2026-08-04T21:00:00.000Z");
  });
});

describe("consecutive-run coverage: no gaps or overlap", () => {
  it("am and pm windows on the same day are contiguous", () => {
    const amWindow = computeTimeWindow(new Date("2026-08-04T09:00:00Z"));
    const pmWindow = computeTimeWindow(new Date("2026-08-04T21:00:00Z"));

    expect(amWindow.until.toISOString()).toBe(pmWindow.since.toISOString());
  });

  it("pm window and next-day am window are contiguous", () => {
    const pmWindow = computeTimeWindow(new Date("2026-08-04T21:00:00Z"));
    const nextAmWindow = computeTimeWindow(new Date("2026-08-05T09:00:00Z"));

    expect(pmWindow.until.toISOString()).toBe(nextAmWindow.since.toISOString());
  });

  it("three consecutive runs cover exactly 36 hours with no gaps", () => {
    const amDay1 = computeTimeWindow(new Date("2026-08-04T09:00:00Z"));
    const pmDay1 = computeTimeWindow(new Date("2026-08-04T21:00:00Z"));
    const amDay2 = computeTimeWindow(new Date("2026-08-05T09:00:00Z"));

    const totalMs =
      (amDay1.until.getTime() - amDay1.since.getTime()) +
      (pmDay1.until.getTime() - pmDay1.since.getTime()) +
      (amDay2.until.getTime() - amDay2.since.getTime());

    expect(totalMs).toBe(36 * 60 * 60 * 1000);

    expect(amDay1.until.getTime()).toBe(pmDay1.since.getTime());
    expect(pmDay1.until.getTime()).toBe(amDay2.since.getTime());
  });

  it("half-open intervals: until of one run equals since of next (no overlap)", () => {
    const amWindow = computeTimeWindow(new Date("2026-08-04T09:00:00Z"));
    const pmWindow = computeTimeWindow(new Date("2026-08-04T21:00:00Z"));

    const leadAtBoundary = amWindow.until;
    expect(leadAtBoundary.getTime()).toBeGreaterThanOrEqual(amWindow.since.getTime());
    expect(leadAtBoundary.getTime()).toBeLessThan(amWindow.until.getTime() + 1);
    expect(leadAtBoundary.getTime()).toBeGreaterThanOrEqual(pmWindow.since.getTime());
  });
});

describe("vercel.json twice-daily schedule", () => {
  it("has a cron entry for reconciliation at 09:00 and 21:00 UTC", async () => {
    const { readFileSync } = await import("fs");
    const { join } = await import("path");
    const raw = readFileSync(join(process.cwd(), "vercel.json"), "utf-8");
    const config = JSON.parse(raw) as {
      crons: Array<{ path: string; schedule: string }>;
    };
    const entry = config.crons.find(
      (c) => c.path === "/api/admin/reconciliation/run",
    );
    expect(entry).toBeDefined();
    expect(entry!.schedule).toBe("0 9,21 * * *");
  });
});
