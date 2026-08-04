import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  db: {} as never,
  runReconciliation: vi.fn(),
}));

vi.mock("@/server/db", () => ({ db: mocks.db }));
vi.mock("@/server/reconciliation-service", () => ({
  reconciliationService: {
    runReconciliation: mocks.runReconciliation,
  },
}));

import { GET } from "@/app/api/admin/reconciliation/run/route";

const CRON_SECRET = "test-cron-secret";

const buildRequest = (authenticated = true) =>
  new NextRequest("http://localhost/api/admin/reconciliation/run", {
    method: "GET",
    headers: authenticated
      ? { authorization: `Bearer ${CRON_SECRET}` }
      : {},
  });

describe("reconciliation run GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = CRON_SECRET;
    process.env.RECONCILIATION_ENABLED = "true";
  });

  it("returns 503 when cron secret is not configured", async () => {
    delete process.env.CRON_SECRET;
    const response = await GET(buildRequest(true));
    expect(response.status).toBe(503);
    expect(mocks.runReconciliation).not.toHaveBeenCalled();
  });

  it("returns 401 when not authenticated", async () => {
    const response = await GET(buildRequest(false));
    expect(response.status).toBe(401);
    expect(mocks.runReconciliation).not.toHaveBeenCalled();
  });

  it("returns 401 with wrong cron secret", async () => {
    const request = new NextRequest("http://localhost/api/admin/reconciliation/run", {
      method: "GET",
      headers: { authorization: "Bearer wrong-secret" },
    });
    const response = await GET(request);
    expect(response.status).toBe(401);
    expect(mocks.runReconciliation).not.toHaveBeenCalled();
  });

  it("returns disabled response when RECONCILIATION_ENABLED is not true", async () => {
    process.env.RECONCILIATION_ENABLED = "false";
    const response = await GET(buildRequest(true));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.disabled).toBe(true);
    expect(body.results).toEqual([]);
    expect(mocks.runReconciliation).not.toHaveBeenCalled();
  });

  it("returns disabled response when RECONCILIATION_ENABLED is unset", async () => {
    delete process.env.RECONCILIATION_ENABLED;
    const response = await GET(buildRequest(true));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.disabled).toBe(true);
    expect(mocks.runReconciliation).not.toHaveBeenCalled();
  });

  it("runs reconciliation for all providers when enabled", async () => {
    mocks.runReconciliation.mockResolvedValue({
      status: "completed",
      runKey: "reconciliation:google_ads:2026-08-04:am",
      totalExternal: 5,
      totalStored: 5,
      missingInStored: 0,
      missingInExternal: 0,
    });

    const response = await GET(buildRequest(true));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.disabled).toBe(false);
    expect(body.results).toHaveLength(2);
    expect(mocks.runReconciliation).toHaveBeenCalledTimes(2);
  });

  it("handles partial provider failure without failing the whole request", async () => {
    mocks.runReconciliation
      .mockResolvedValueOnce({
        status: "failed",
        runKey: "reconciliation:google_ads:2026-08-04:am",
        errorCode: "provider_not_configured",
      })
      .mockResolvedValueOnce({
        status: "completed",
        runKey: "reconciliation:formspree:2026-08-04:am",
        totalExternal: 3,
        totalStored: 3,
        missingInStored: 0,
        missingInExternal: 0,
      });

    const response = await GET(buildRequest(true));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.results).toHaveLength(2);

    const failed = body.results.find(
      (r: { status: string }) => r.status === "failed",
    );
    const completed = body.results.find(
      (r: { status: string }) => r.status === "completed",
    );
    expect(failed).toBeDefined();
    expect(failed.errorCode).toBe("provider_not_configured");
    expect(completed).toBeDefined();
    expect(completed.totalExternal).toBe(3);
  });

  it("does not include patient fields in the response", async () => {
    mocks.runReconciliation.mockResolvedValue({
      status: "completed",
      runKey: "reconciliation:google_ads:2026-08-04:am",
      totalExternal: 1,
      totalStored: 1,
      missingInStored: 0,
      missingInExternal: 0,
    });

    const response = await GET(buildRequest(true));
    const body = await response.json();
    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain("firstName");
    expect(serialized).not.toContain("lastName");
    expect(serialized).not.toContain("email");
    expect(serialized).not.toContain("phone");
    expect(serialized).not.toContain("message");
  });

  it("returns only safe error codes on failure", async () => {
    mocks.runReconciliation.mockResolvedValue({
      status: "failed",
      runKey: "reconciliation:google_ads:2026-08-04:am",
      errorCode: "provider_not_configured",
    });

    const response = await GET(buildRequest(true));
    const body = await response.json();
    for (const result of body.results) {
      if (result.status === "failed") {
        expect(typeof result.errorCode).toBe("string");
        expect(result.errorCode).not.toContain("@");
        expect(result.errorCode).not.toContain("http");
      }
    }
  });
});
