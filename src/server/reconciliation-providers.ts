import type { InsertContactRecord, ReconciliationProviderName } from "@/server/schema";
import {
  campaignIdFromResourceName,
  columnsFromLeadFormFields,
  googleAdsLeadIdFromResourceName,
  mapGoogleAdsColumnsToContact,
  namedColumnsFromLeadFormFields,
  type LeadFormFieldLike,
} from "@/server/google-ads-lead";
import {
  FORMSPREE_RECONCILIATION_SETUP,
  GOOGLE_ADS_RECONCILIATION_SETUP,
} from "@/server/lead-capture-setup";

export interface ReconciliationTimeWindow {
  since: Date;
  until: Date;
}

export type ExternalLeadRecord = {
  externalId: string;
  contact?: InsertContactRecord;
};

export interface IReconciliationProvider {
  readonly name: ReconciliationProviderName;
  fetchExternalLeadIds(
    window: ReconciliationTimeWindow,
    signal: AbortSignal,
  ): Promise<string[]>;
  fetchExternalLeads?(
    window: ReconciliationTimeWindow,
    signal: AbortSignal,
  ): Promise<ExternalLeadRecord[]>;
}

const FORMSPREE_HASH_PATTERN = /formspree\.io\/f\/([A-Za-z0-9]+)/i;
const DEFAULT_FORMSPREE_HASH = "mojngolr";
export const GOOGLE_ADS_API_VERSION = "v25";

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const asString = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const asLeadFormFields = (value: unknown): LeadFormFieldLike[] => {
  if (!Array.isArray(value)) return [];
  const fields: LeadFormFieldLike[] = [];
  for (const item of value) {
    const record = asRecord(item);
    if (record) fields.push(record);
  }
  return fields;
};

export const formspreeHashIdsFromEnv = (): string[] => {
  const urls = [
    process.env.FORMSPREE_CONTACT_ENDPOINT,
    process.env.FORMSPREE_APPOINTMENT_ENDPOINT,
    `https://formspree.io/f/${DEFAULT_FORMSPREE_HASH}`,
  ];
  const ids: string[] = [];
  for (const url of urls) {
    const match = url ? FORMSPREE_HASH_PATTERN.exec(url) : null;
    const hash = match?.[1];
    if (hash && !ids.includes(hash)) ids.push(hash);
  }
  return ids;
};

export const unwrapFormspreeSubmission = (
  submission: Record<string, unknown>,
): Record<string, unknown> => {
  const nested = asRecord(submission.data) ?? asRecord(submission.values);
  if (!nested) return submission;
  return { ...nested, ...submission };
};

export const mapFormspreeSubmission = (
  submission: Record<string, unknown>,
): ExternalLeadRecord | null => {
  const fields = unwrapFormspreeSubmission(submission);
  const submissionId =
    asString(fields.submissionId) ?? asString(fields.submission_id);
  if (!submissionId) return null;

  const requestType =
    fields.requestType === "appointment" || fields.request_type === "appointment"
      ? "appointment"
      : "contact";
  const firstName =
    asString(fields.firstName) || asString(fields.first_name) || "Unknown";
  const lastName = asString(fields.lastName) || asString(fields.last_name) || "Lead";
  const email = asString(fields.email);
  const phone = asString(fields.phone);
  if (!email && !phone) return null;

  const rawPayload = { ...submission };
  delete rawPayload._status;

  return {
    externalId: submissionId,
    contact: {
      submissionId,
      firstName,
      lastName,
      email,
      phone,
      service: asString(fields.service),
      message: asString(fields.message),
      requestType,
      preferredDate: asString(fields.preferredDate) ?? asString(fields.preferred_date),
      preferredTime: asString(fields.preferredTime) ?? asString(fields.preferred_time),
      landingPage: asString(fields.landingPage) ?? asString(fields.landing_page),
      referrer: asString(fields.referrer),
      ctaSource: asString(fields.ctaSource) ?? asString(fields.cta_source),
      utmSource: asString(fields.utmSource) ?? asString(fields.utm_source),
      utmMedium: asString(fields.utmMedium) ?? asString(fields.utm_medium),
      utmCampaign: asString(fields.utmCampaign) ?? asString(fields.utm_campaign),
      utmTerm: asString(fields.utmTerm) ?? asString(fields.utm_term),
      utmContent: asString(fields.utmContent) ?? asString(fields.utm_content),
      gclid: asString(fields.gclid),
      gbraid: asString(fields.gbraid),
      wbraid: asString(fields.wbraid),
      consentToContact: fields.consentToContact === true || fields.consent_to_contact === true,
      consentVersion: asString(fields.consentVersion) ?? asString(fields.consent_version),
      leadStatus: "new",
      ingestedVia: "reconciliation",
      isTest: false,
      rawPayload,
    },
  };
};

const formatGaqlDateTime = (date: Date): string =>
  date.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, "+00:00");

const googleAdsCredentials = () => {
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN?.trim();
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, "").trim();
  const clientId = process.env.GOOGLE_ADS_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_ADS_OAUTH_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN?.trim();
  if (!developerToken || !customerId || !clientId || !clientSecret || !refreshToken) {
    return null;
  }
  return { developerToken, customerId, clientId, clientSecret, refreshToken };
};

const refreshGoogleAccessToken = async (
  creds: NonNullable<ReturnType<typeof googleAdsCredentials>>,
  signal: AbortSignal,
): Promise<string> => {
  const body = new URLSearchParams({
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    refresh_token: creds.refreshToken,
    grant_type: "refresh_token",
  });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    signal,
  });
  if (!response.ok) {
    throw new Error("provider_api_error");
  }
  const json = asRecord(await response.json());
  const accessToken = asString(json?.access_token);
  if (!accessToken) throw new Error("provider_api_error");
  return accessToken;
};

export const mapGoogleAdsSearchRow = (row: Record<string, unknown>): ExternalLeadRecord | null => {
  const lead = asRecord(row.leadFormSubmissionData) ?? asRecord(row.lead_form_submission_data);
  if (!lead) return null;

  const resourceName = asString(lead.resourceName) ?? asString(lead.resource_name) ?? "";
  const leadId =
    asString(lead.id) ?? googleAdsLeadIdFromResourceName(resourceName);
  if (!leadId) return null;

  const fields = asLeadFormFields(
    lead.leadFormSubmissionFields ?? lead.lead_form_submission_fields,
  );
  const customFields = asLeadFormFields(
    lead.customLeadFormSubmissionFields ?? lead.custom_lead_form_submission_fields,
  );

  const standardColumns = columnsFromLeadFormFields(fields);
  const customColumns = columnsFromLeadFormFields(customFields);
  const columns = { ...customColumns, ...standardColumns };
  const namedColumns = [
    ...namedColumnsFromLeadFormFields(fields),
    ...namedColumnsFromLeadFormFields(customFields),
  ];
  const email = columns.EMAIL?.trim() || null;
  const phone = columns.PHONE_NUMBER?.trim() || null;
  if (!email && !phone) {
    return { externalId: leadId };
  }

  const campaignResource =
    asString(lead.campaign) ??
    asString(asRecord(lead.campaign)?.resourceName) ??
    asString(asRecord(lead.campaign)?.resource_name);
  const gclid = asString(lead.gclid);

  return {
    externalId: leadId,
    contact: mapGoogleAdsColumnsToContact({
      leadId,
      campaignId: campaignIdFromResourceName(campaignResource),
      gclid,
      ingestedVia: "reconciliation",
      columns,
      namedColumns,
      rawPayload: {
        source: "google_ads_api",
        resourceName,
        submissionDateTime:
          asString(lead.submissionDateTime) ?? asString(lead.submission_date_time),
        leadFormSubmissionFields: fields,
        customLeadFormSubmissionFields: customFields,
      },
    }),
  };
};

export class GoogleAdsReconciliationProvider implements IReconciliationProvider {
  readonly name: ReconciliationProviderName = "google_ads";

  async fetchExternalLeadIds(
    window: ReconciliationTimeWindow,
    signal: AbortSignal,
  ): Promise<string[]> {
    return (await this.fetchExternalLeads(window, signal)).map((lead) => lead.externalId);
  }

  async fetchExternalLeads(
    window: ReconciliationTimeWindow,
    signal: AbortSignal,
  ): Promise<ExternalLeadRecord[]> {
    const creds = googleAdsCredentials();
    if (!creds) {
      console.error("reconciliation_provider_not_configured", {
        provider: "google_ads",
        setup: GOOGLE_ADS_RECONCILIATION_SETUP,
      });
      throw new Error("provider_not_configured");
    }

    const accessToken = await refreshGoogleAccessToken(creds, signal);
    const query = [
      "SELECT",
      "lead_form_submission_data.resource_name,",
      "lead_form_submission_data.gclid,",
      "lead_form_submission_data.campaign,",
      "lead_form_submission_data.submission_date_time,",
      "lead_form_submission_data.lead_form_submission_fields,",
      "lead_form_submission_data.custom_lead_form_submission_fields",
      "FROM lead_form_submission_data",
      `WHERE lead_form_submission_data.submission_date_time >= '${formatGaqlDateTime(window.since)}'`,
      `AND lead_form_submission_data.submission_date_time < '${formatGaqlDateTime(window.until)}'`,
    ].join(" ");

    const leads: ExternalLeadRecord[] = [];
    let pageToken: string | undefined;

    do {
      const response = await fetch(
        `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${creds.customerId}/googleAds:search`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "developer-token": creds.developerToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pageToken ? { query, pageToken } : { query }),
          signal,
        },
      );
      if (!response.ok) {
        throw new Error("provider_api_error");
      }
      const json = asRecord(await response.json());
      const results = Array.isArray(json?.results) ? json.results : [];
      for (const row of results) {
        const mapped = mapGoogleAdsSearchRow(asRecord(row) ?? {});
        if (mapped) leads.push(mapped);
      }
      pageToken = asString(json?.nextPageToken) ?? asString(json?.next_page_token) ?? undefined;
    } while (pageToken);

    return leads;
  }
}

export class FormspreeReconciliationProvider implements IReconciliationProvider {
  readonly name: ReconciliationProviderName = "formspree";

  async fetchExternalLeadIds(
    window: ReconciliationTimeWindow,
    signal: AbortSignal,
  ): Promise<string[]> {
    return (await this.fetchExternalLeads(window, signal)).map((lead) => lead.externalId);
  }

  async fetchExternalLeads(
    window: ReconciliationTimeWindow,
    signal: AbortSignal,
  ): Promise<ExternalLeadRecord[]> {
    const apiKey = process.env.FORMSPREE_API_KEY?.trim();
    if (!apiKey) {
      console.error("reconciliation_provider_not_configured", {
        provider: "formspree",
        setup: FORMSPREE_RECONCILIATION_SETUP,
      });
      throw new Error("provider_not_configured");
    }

    const leads: ExternalLeadRecord[] = [];
    const seen = new Set<string>();

    for (const hashId of formspreeHashIdsFromEnv()) {
      let offset = 0;
      const limit = 100;
      let pageCount = 0;

      while (pageCount < 20) {
        const url = new URL(`https://formspree.io/api/0/forms/${hashId}/submissions`);
        url.searchParams.set("since", window.since.toISOString());
        url.searchParams.set("limit", String(limit));
        url.searchParams.set("offset", String(offset));
        url.searchParams.set("order", "asc");
        url.searchParams.set("spam", "false");

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
          },
          signal,
        });
        if (!response.ok) {
          throw new Error("provider_api_error");
        }

        const json = asRecord(await response.json());
        const submissions = Array.isArray(json?.submissions) ? json.submissions : [];
        if (submissions.length === 0) break;

        for (const raw of submissions) {
          const submission = asRecord(raw);
          if (!submission) continue;
          const submittedAt = asString(submission._date) ?? asString(submission.submitted_at);
          if (submittedAt) {
            const time = Date.parse(submittedAt);
            if (!Number.isNaN(time) && (time < window.since.getTime() || time >= window.until.getTime())) {
              continue;
            }
          }
          const mapped = mapFormspreeSubmission(submission);
          if (!mapped || seen.has(mapped.externalId)) continue;
          seen.add(mapped.externalId);
          leads.push(mapped);
        }

        if (submissions.length < limit) break;
        offset += limit;
        pageCount += 1;
      }
    }

    return leads;
  }
}

export const getReconciliationProvider = (
  name: ReconciliationProviderName,
): IReconciliationProvider => {
  switch (name) {
    case "google_ads":
      return new GoogleAdsReconciliationProvider();
    case "formspree":
      return new FormspreeReconciliationProvider();
    default: {
      const _exhaustive: never = name;
      void _exhaustive;
      throw new Error("provider_not_configured");
    }
  }
};

export const ALL_RECONCILIATION_PROVIDERS: ReconciliationProviderName[] = [
  "google_ads",
  "formspree",
];
