import { describe, expect, it } from "vitest";
import {
  computeRunKey,
  computeTimeWindow,
  computeCanonicalBoundary,
} from "@/server/reconciliation-service";
import type { ReconciliationProviderName } from "@/server/schema";

describe("computeCanonicalBoundary", () => {
  it("at exactly 09:00 returns am boundary for today", () => {
    const b = computeCanonicalBoundary(new Date("2026-08-04T09:00:00Z"));
    expect(b.slot).toBe("am");
    expect(b.dateStr).toBe("2026-08-04");
    expect(b.boundary.toISOString()).toBe("2026-08-04T09:00:00.000Z");
  });

  it("at exactly 21:00 returns pm boundary for today", () => {
    const b = computeCanonicalBoundary(new Date("2026-08-04T21:00:00Z"));
    expect(b.slot).toBe("pm");
    expect(b.dateStr).toBe("2026-08-04");
    expect(b.boundary.toISOString()).toBe("2026-08-04T21:00:00.000Z");
  });

  it("delayed 09:00 cron at 14:00 still selects am boundary", () => {
    const b = computeCanonicalBoundary(new Date("2026-08-04T14:00:00Z"));
    expect(b.slot).toBe("am");
    expect(b.dateStr).toBe("2026-08-04");
    expect(b.boundary.toISOString()).toBe("2026-08-04T09:00:00.000Z");
  });

  it("delayed 21:00 cron at 23:59 still selects pm boundary", () => {
    const b = computeCanonicalBoundary(new Date("2026-08-04T23:59:59Z"));
    expect(b.slot).toBe("pm");
    expect(b.dateStr).toBe("2026-08-04");
    expect(b.boundary.toISOString()).toBe("2026-08-04T21:00:00.000Z");
  });

  it("delayed 21:00 cron at 02:00 next day still selects previous pm boundary", () => {
    const b = computeCanonicalBoundary(new Date("2026-08-05T02:00:00Z"));
    expect(b.slot).toBe("pm");
    expect(b.dateStr).toBe("2026-08-04");
    expect(b.boundary.toISOString()).toBe("2026-08-04T21:00:00.000Z");
  });

  it("delayed 09:00 cron past noon still selects am (not pm)", () => {
    const b = computeCanonicalBoundary(new Date("2026-08-04T12:30:00Z"));
    expect(b.slot).toBe("am");
    expect(b.boundary.toISOString()).toBe("2026-08-04T09:00:00.000Z");
  });

  it("before 09:00 selects previous day pm boundary", () => {
    const b = computeCanonicalBoundary(new Date("2026-08-04T05:00:00Z"));
    expect(b.slot).toBe("pm");
    expect(b.dateStr).toBe("2026-08-03");
    expect(b.boundary.toISOString()).toBe("2026-08-03T21:00:00.000Z");
  });
});

describe("computeRunKey uses canonical boundary", () => {
  const provider: ReconciliationProviderName = "google_ads";

  it("09:00 cron produces am key", () => {
    expect(computeRunKey(provider, new Date("2026-08-04T09:00:00Z"))).toBe(
      "reconciliation:google_ads:2026-08-04:am",
    );
  });

  it("21:00 cron produces pm key", () => {
    expect(computeRunKey(provider, new Date("2026-08-04T21:00:00Z"))).toBe(
      "reconciliation:google_ads:2026-08-04:pm",
    );
  });

  it("delayed 09:00 cron at 14:00 still produces am key", () => {
    expect(computeRunKey(provider, new Date("2026-08-04T14:00:00Z"))).toBe(
      "reconciliation:google_ads:2026-08-04:am",
    );
  });

  it("delayed 21:00 cron at 02:00 next day produces previous pm key", () => {
    expect(computeRunKey(provider, new Date("2026-08-05T02:00:00Z"))).toBe(
      "reconciliation:google_ads:2026-08-04:pm",
    );
  });

  it("produces distinct keys for different providers", () => {
    const ga = computeRunKey("google_ads", new Date("2026-08-04T09:00:00Z"));
    const fs = computeRunKey("formspree", new Date("2026-08-04T09:00:00Z"));
    expect(ga).not.toBe(fs);
  });
});

describe("computeTimeWindow completed source-time windows", () => {
  it("am run reconciles [21:00 prev, 09:00 today)", () => {
    const window = computeTimeWindow(new Date("2026-08-04T09:00:00Z"));
    expect(window.since.toISOString()).toBe("2026-08-03T21:00:00.000Z");
    expect(window.until.toISOString()).toBe("2026-08-04T09:00:00.000Z");
  });

  it("pm run reconciles [09:00, 21:00)", () => {
    const window = computeTimeWindow(new Date("2026-08-04T21:00:00Z"));
    expect(window.since.toISOString()).toBe("2026-08-04T09:00:00.000Z");
    expect(window.until.toISOString()).toBe("2026-08-04T21:00:00.000Z");
  });

  it("delayed am cron at 14:00 uses same window as exact 09:00", () => {
    const exact = computeTimeWindow(new Date("2026-08-04T09:00:00Z"));
    const delayed = computeTimeWindow(new Date("2026-08-04T14:00:00Z"));
    expect(exact.since.getTime()).toBe(delayed.since.getTime());
    expect(exact.until.getTime()).toBe(delayed.until.getTime());
  });

  it("delayed pm cron at 02:00 next day uses same window as exact 21:00", () => {
    const exact = computeTimeWindow(new Date("2026-08-04T21:00:00Z"));
    const delayed = computeTimeWindow(new Date("2026-08-05T02:00:00Z"));
    expect(exact.since.getTime()).toBe(delayed.since.getTime());
    expect(exact.until.getTime()).toBe(delayed.until.getTime());
  });
});

describe("consecutive-run coverage: no gaps or overlap", () => {
  it("am and pm windows on the same day are contiguous", () => {
    const amWindow = computeTimeWindow(new Date("2026-08-04T09:00:00Z"));
    const pmWindow = computeTimeWindow(new Date("2026-08-04T21:00:00Z"));
    expect(amWindow.until.getTime()).toBe(pmWindow.since.getTime());
  });

  it("pm window and next-day am window are contiguous", () => {
    const pmWindow = computeTimeWindow(new Date("2026-08-04T21:00:00Z"));
    const nextAmWindow = computeTimeWindow(new Date("2026-08-05T09:00:00Z"));
    expect(pmWindow.until.getTime()).toBe(nextAmWindow.since.getTime());
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
