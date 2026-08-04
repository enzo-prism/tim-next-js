import { describe, expect, it } from "vitest";
import { computeRunKey } from "@/server/reconciliation-service";
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
