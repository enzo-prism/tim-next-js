import { afterEach, describe, expect, it, vi } from "vitest";
import {
  FormspreeReconciliationProvider,
  GOOGLE_ADS_API_VERSION,
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

  it("maps a camelCase Google Ads search JSON row into an insertable contact", () => {
    const mapped = mapGoogleAdsSearchRow({
      leadFormSubmissionData: {
        resourceName: "customers/3539046031/leadFormSubmissionData/lead-100",
        gclid: "gclid-2",
        campaign: "customers/3539046031/campaigns/23205053490",
        submissionDateTime: "2026-08-04 01:00:00+00:00",
        leadFormSubmissionFields: [
          { fieldType: "FULL_NAME", fieldValue: "Jane Doe" },
          { fieldType: "EMAIL", fieldValue: "jane@example.com" },
          { fieldType: "PHONE_NUMBER", fieldValue: "408-555-0100" },
        ],
        customLeadFormSubmissionFields: [
          { questionText: "SERVICE", fieldValue: "Invisalign" },
        ],
      },
    });
    expect(mapped?.externalId).toBe("lead-100");
    expect(mapped?.contact).toEqual(
      expect.objectContaining({
        googleAdsLeadId: "lead-100",
        campaignId: "23205053490",
        ingestedVia: "reconciliation",
        email: "jane@example.com",
        phone: "408-555-0100",
        service: "invisalign",
        firstName: "Jane",
        lastName: "Doe",
      }),
    );
    expect(mapped?.contact?.message).toBeNull();
  });

  it("unwraps nested Formspree data and snake_case aliases", () => {
    const mapped = mapFormspreeSubmission({
      _date: "2026-08-04T01:00:00.000Z",
      data: {
        submission_id: "0d9f6471-7120-4b5a-a1af-e1f77b0dcacf",
        first_name: "Jamie",
        last_name: "Lee",
        email: "jamie@example.com",
        request_type: "appointment",
        preferred_date: "2026-09-15",
      },
    });
    expect(mapped?.externalId).toBe("0d9f6471-7120-4b5a-a1af-e1f77b0dcacf");
    expect(mapped?.contact).toEqual(
      expect.objectContaining({
        firstName: "Jamie",
        lastName: "Lee",
        requestType: "appointment",
        preferredDate: "2026-09-15",
        ingestedVia: "reconciliation",
      }),
    );
  });

  it("keeps custom Google answers on the contact message and in rawPayload", () => {
    const mapped = mapGoogleAdsSearchRow({
      leadFormSubmissionData: {
        resourceName: "customers/3539046031/leadFormSubmissionData/lead-101",
        leadFormSubmissionFields: [
          { fieldType: "FULL_NAME", fieldValue: "Jane Doe" },
          { fieldType: "EMAIL", fieldValue: "jane@example.com" },
        ],
        customLeadFormSubmissionFields: [
          { questionText: "Do you have insurance?", fieldValue: "Yes" },
        ],
      },
    });
    expect(mapped?.contact?.message).toContain("Do you have insurance?: Yes");
    expect(mapped?.contact?.rawPayload).toEqual(
      expect.objectContaining({
        source: "google_ads_api",
        customLeadFormSubmissionFields: [
          { questionText: "Do you have insurance?", fieldValue: "Yes" },
        ],
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

  it("searches a current Google Ads API version and maps camelCase lead fields", async () => {
    process.env.GOOGLE_ADS_DEVELOPER_TOKEN = "dev-token";
    process.env.GOOGLE_ADS_CUSTOMER_ID = "3539046031";
    process.env.GOOGLE_ADS_OAUTH_CLIENT_ID = "client-id";
    process.env.GOOGLE_ADS_OAUTH_CLIENT_SECRET = "client-secret";
    process.env.GOOGLE_ADS_REFRESH_TOKEN = "refresh-token";

    const fetchMock = vi.fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: "ads-access" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            results: [
              {
                leadFormSubmissionData: {
                  resourceName: "customers/3539046031/leadFormSubmissionData/lead-100",
                  leadFormSubmissionFields: [
                    { fieldType: "FULL_NAME", fieldValue: "Jane Doe" },
                    { fieldType: "EMAIL", fieldValue: "jane@example.com" },
                  ],
                },
              },
            ],
          }),
          { status: 200 },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    const leads = await new GoogleAdsReconciliationProvider().fetchExternalLeads(
      window,
      new AbortController().signal,
    );

    expect(GOOGLE_ADS_API_VERSION).toBe("v25");
    expect(leads).toHaveLength(1);
    expect(leads[0].contact?.email).toBe("jane@example.com");
    expect(fetchMock.mock.calls[1][0]).toBe(
      "https://googleads.googleapis.com/v25/customers/3539046031/googleAds:search",
    );
    const searchBody = JSON.parse(String(fetchMock.mock.calls[1][1].body));
    expect(searchBody).not.toHaveProperty("pageSize");
    expect(searchBody.query).toContain("FROM lead_form_submission_data");
  });
});
