import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({ read: vi.fn(), alert: vi.fn() }));
vi.mock("@/server/lead-delivery-health", () => ({ readLeadDeliveryHealth: mocks.read, sendLeadDeliveryHealthAlert: mocks.alert }));
import { GET } from "@/app/api/admin/lead-health/route";
const request = (secret = "cron-test") => new NextRequest("https://www.famfirstsmile.com/api/admin/lead-health", {
  headers: { authorization: `Bearer ${secret}` },
});
describe("cron-protected lead delivery health", () => {
  beforeEach(() => {
    vi.clearAllMocks(); vi.stubEnv("CRON_SECRET", "cron-test");
    mocks.read.mockResolvedValue({ ok: true, issues: [], metrics: null });
    mocks.alert.mockResolvedValue("disabled");
  });
  afterEach(() => { vi.unstubAllEnvs(); });
  it("blocks unauthorized probes before accessing operational data or sending alerts", async () => {
    expect((await GET(request("wrong"))).status).toBe(401);
    expect(mocks.read).not.toHaveBeenCalled(); expect(mocks.alert).not.toHaveBeenCalled();
  });
  it("returns non-cached health status for a healthy worker", async () => {
    const response = await GET(request());
    expect(response.status).toBe(200); expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
  it("reports degraded signals with failure status", async () => {
    mocks.read.mockResolvedValue({ ok: false, issues: [{ code: "notification_worker_missed" }], metrics: null });
    const response = await GET(request()); expect(response.status).toBe(503);
    expect((await response.json()).issues[0].code).toBe("notification_worker_missed");
  });
  it("reports a health alert delivery failure for external monitoring", async () => {
    mocks.alert.mockResolvedValue("failed"); expect((await GET(request())).status).toBe(503);
  });
});
