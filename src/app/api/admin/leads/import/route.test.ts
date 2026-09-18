import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const IMPORT_SECRET = "test-import-secret-1234567890";

const mocks = vi.hoisted(() => ({
  selectRows: [] as Array<Record<string, unknown>>,
  insertedValues: [] as Array<Record<string, unknown>>,
}));

const chainable = () => {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.from = vi.fn(() => chain);
  chain.where = vi.fn(() => chain);
  chain.limit = vi.fn(async () => mocks.selectRows);
  return chain;
};

vi.mock("@/server/db", () => ({
  db: {
    select: vi.fn(() => chainable()),
    insert: vi.fn(() => ({
      values: vi.fn(async (values: Record<string, unknown>) => {
        mocks.insertedValues.push(values);
        return [];
      }),
    })),
  },
}));

vi.mock("@/server/schema", async (importOriginal) => {
  const original = (await importOriginal()) as Record<string, unknown>;
  return {
    ...original,
    contacts: {
      id: "id",
      email: "email",
      phone: "phone",
      createdAt: "createdAt",
      googleAdsLeadId: "googleAdsLeadId",
    },
  };
});

import { POST } from "@/app/api/admin/leads/import/route";

const buildRequest = (payload: unknown, authenticated = true) =>
  new NextRequest("http://localhost/api/admin/leads/import", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(authenticated ? { authorization: `Bearer ${IMPORT_SECRET}` } : {}),
    },
    body: JSON.stringify(payload),
  });

const validLead = {
  gmailMessageId: "msg-abc-123",
  internalDate: "1789761600000",
  fullName: "Test Lead",
  email: "testlead@example.com",
  phone: "+14085551212",
  campaignName: "Family First Smile Care",
  campaignId: "23205053490",
};

describe("leads import POST", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.selectRows = [];
    mocks.insertedValues = [];
    process.env.LEADS_IMPORT_SECRET = IMPORT_SECRET;
  });

  it("returns 503 when the import secret is not configured", async () => {
    delete process.env.LEADS_IMPORT_SECRET;
    const response = await POST(buildRequest({ leads: [validLead] }, false));
    expect(response.status).toBe(503);
  });

  it("returns 401 when not authenticated", async () => {
    const response = await POST(buildRequest({ leads: [validLead] }, false));
    expect(response.status).toBe(401);
  });

  it("returns 400 for an invalid payload", async () => {
    const response = await POST(buildRequest({ leads: [] }));
    expect(response.status).toBe(400);
  });

  it("inserts a new lead and reports inserted", async () => {
    const response = await POST(buildRequest({ leads: [validLead] }));
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.ok).toBe(true);
    expect(json.inserted).toBe(1);
    expect(json.results).toEqual([{ index: 0, status: "inserted" }]);
    expect(mocks.insertedValues).toHaveLength(1);
    expect(mocks.insertedValues[0].googleAdsLeadId).toBe("msg-abc-123");
    expect(mocks.insertedValues[0].ingestedVia).toBe("email-import");
  });

  it("skips a lead that already exists by gmail id", async () => {
    mocks.selectRows = [{ id: "existing" }];
    const response = await POST(buildRequest({ leads: [validLead] }));
    const json = await response.json();
    expect(json.inserted).toBe(0);
    expect(json.skippedExisting).toBe(1);
    expect(json.results).toEqual([{ index: 0, status: "exists" }]);
    expect(mocks.insertedValues).toHaveLength(0);
  });
});
