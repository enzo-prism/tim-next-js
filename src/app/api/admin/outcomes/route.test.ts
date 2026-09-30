import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ database: { enabled: true }, getContact: vi.fn(), updateContactLifecycle: vi.fn() }));
vi.mock("@/server/db", () => ({ get db() { return mocks.database.enabled ? {} : undefined; } }));
vi.mock("@/server/storage", () => ({ storage: { getContact: mocks.getContact, updateContactLifecycle: mocks.updateContactLifecycle } }));
import { GET, POST } from "./route";
import { GET as reportGet } from "./report/route";
import { POST as callsPost } from "./calls/route";
const secret = "test-secret".repeat(4);
const leadId = "11111111-1111-4111-8111-111111111111";
const updatedAt = new Date("2026-09-30T16:00:00Z");
const makeRequest = (body: unknown, authorization = `Bearer ${secret}`) => new Request("https://example.com/api/admin/outcomes", { method: "POST", headers: { authorization, "content-type": "application/json" }, body: JSON.stringify(body) });
beforeEach(() => { vi.stubEnv("LEAD_OUTCOMES_SECRET", secret); mocks.database.enabled = true; vi.resetAllMocks(); mocks.getContact.mockResolvedValue({ isTest: false, leadStatus: "new", updatedAt, firstName: "Private" }); });
afterEach(() => vi.unstubAllEnvs());
describe("protected outcome endpoints", () => {
  it("requires the dedicated secret for all handlers", async () => {
    vi.stubEnv("LEAD_OUTCOMES_SECRET", "");
    for (const handler of [POST, GET, callsPost, reportGet]) expect((await handler(makeRequest({}))).status).toBe(503);
    vi.stubEnv("LEAD_OUTCOMES_SECRET", secret);
    for (const handler of [POST, GET, callsPost, reportGet]) expect((await handler(makeRequest({}, "Bearer other"))).status).toBe(401);
  });
  it("does not fall back to in-memory storage", async () => {
    mocks.database.enabled = false;
    expect((await POST(makeRequest({ leadId, status: "booked", expectedUpdatedAt: updatedAt.toISOString() }))).status).toBe(503);
    expect(mocks.getContact).not.toHaveBeenCalled();
  });
  it("rejects unknown fields, malformed/oversized bodies and invalid statuses", async () => {
    for (const body of [{ leadId, status: "booked", expectedUpdatedAt: updatedAt.toISOString(), staffNotes: "Private" }, { leadId, status: "bad" }, { body: "x".repeat(9000) }]) expect((await POST(makeRequest(body))).status).toBe(400);
    expect(mocks.updateContactLifecycle).not.toHaveBeenCalled();
  });
  it("rejects test leads and returns only operational state on authenticated read", async () => {
    mocks.getContact.mockResolvedValueOnce({ isTest: true });
    expect((await POST(makeRequest({ leadId, status: "booked", expectedUpdatedAt: updatedAt.toISOString() }))).status).toBe(404);
    const response = await GET(new Request(`https://example.com/api/admin/outcomes?leadId=${leadId}`, { headers: { authorization: `Bearer ${secret}` } }));
    expect(await response.json()).toEqual({ ok: true, status: "new", updatedAt: updatedAt.toISOString() });
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
  it("surfaces optimistic conflicts and suppresses database exception details", async () => {
    mocks.updateContactLifecycle.mockResolvedValue({ status: "conflict" });
    expect((await POST(makeRequest({ leadId, status: "booked", expectedUpdatedAt: updatedAt.toISOString() }))).status).toBe(409);
    mocks.getContact.mockRejectedValue(new Error("private@example.com"));
    const response = await POST(makeRequest({ leadId, status: "booked", expectedUpdatedAt: updatedAt.toISOString() }));
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain("private@example.com");
  });
});
