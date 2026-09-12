import { afterEach, describe, expect, it, vi } from "vitest";
import {
  FormspreeReconciliationProvider,
  GoogleAdsReconciliationProvider,
  mapFormspreeSubmission,
  mapGoogleAdsSearchRow,
} from "@/server/reconciliation-providers";

const window = {
  since: new Date("2026-08-03T21:00:00.000Z"),
  until: new Date("2026-08-04T09:00:00.000Z"),
};

describe("reconciliation provider mapping", () => {
  it("maps a Formspree website submission into an insertable lead", () => {
    const mapped = mapFormspreeSubmission({
      submissionId: "0d9f6471-7120-4b5a-a1af-e1f77b0dcacf",
      firstName: "Jamie",
      lastName: "Lee",
      email: "jamie@example.com",
      requestType: "appointment",
      _status: { delivered: true },
    });
    expect(mapped?.externalId).toBe("0d9f6471-7120-4b5a-a1af-e1f77b0dcacf");
    expect(mapped?.contact).toEqual(
      expect.objectContaining({
        ingestedVia: "reconciliation",
        requestType: "appointment",
        email: "jamie@example.com",
      }),
    );
    expect(mapped?.contact?.rawPayload).not.toHaveProperty("_status");
  });

  it("skips Formspree rows without a submission UUID", () => {
    expect(
      mapFormspreeSubmission({
        email: "jamie@example.com",
        firstName: "Jamie",
        lastName: "Lee",
      }),
    ).toBeNull();
  });

  it("maps a Google Ads search row into a google_ads_lead contact", () => {
    const mapped = mapGoogleAdsSearchRow({
      leadFormSubmissionData: {
        resourceName: "customers/3539046031/leadFormSubmissionData/lead-99",
        gclid: "gclid-1",
        campaign: "customers/3539046031/campaigns/23205053490",
        leadFormSubmissionFields: [
          { field_type: "FULL_NAME", field_value: "Jane Doe" },
          { field_type: "EMAIL", field_value: "jane@example.com" },
        ],
      },
    });
    expect(mapped?.externalId).toBe("lead-99");
    expect(mapped?.contact).toEqual(
      expect.objectContaining({
        googleAdsLeadId: "lead-99",
        campaignId: "23205053490",
        ingestedVia: "reconciliation",
        email: "jane@example.com",
      }),
    );
  });
});

describe("reconciliation providers fail closed", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.FORMSPREE_API_KEY;
    delete process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    delete process.env.GOOGLE_ADS_CUSTOMER_ID;
    delete process.env.GOOGLE_ADS_OAUTH_CLIENT_ID;
    delete process.env.GOOGLE_ADS_OAUTH_CLIENT_SECRET;
    delete process.env.GOOGLE_ADS_REFRESH_TOKEN;
  });

  it("throws provider_not_configured for Formspree without FORMSPREE_API_KEY", async () => {
    await expect(
      new FormspreeReconciliationProvider().fetchExternalLeads(window, new AbortController().signal),
    ).rejects.toThrow("provider_not_configured");
  });

  it("throws provider_not_configured for Google Ads without API credentials", async () => {
    await expect(
      new GoogleAdsReconciliationProvider().fetchExternalLeads(window, new AbortController().signal),
    ).rejects.toThrow("provider_not_configured");
  });

  it("fetches Formspree submissions when the API key is set", async () => {
    process.env.FORMSPREE_API_KEY = "fs-key";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          submissions: [
            {
              submissionId: "0d9f6471-7120-4b5a-a1af-e1f77b0dcacf",
              firstName: "Jamie",
              lastName: "Lee",
              email: "jamie@example.com",
              _date: "2026-08-04T01:00:00.000Z",
            },
          ],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const leads = await new FormspreeReconciliationProvider().fetchExternalLeads(
      window,
      new AbortController().signal,
    );
    expect(leads).toHaveLength(1);
    expect(leads[0].externalId).toBe("0d9f6471-7120-4b5a-a1af-e1f77b0dcacf");
    expect(fetchMock.mock.calls[0][0].toString()).toContain("/forms/mojngolr/submissions");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer fs-key");
  });
});
