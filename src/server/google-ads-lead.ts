import type { IngestedVia, InsertContactRecord } from "@/server/schema";

export const GOOGLE_ADS_COLUMN_IDS = {
  FULL_NAME: "FULL_NAME",
  FIRST_NAME: "FIRST_NAME",
  LAST_NAME: "LAST_NAME",
  EMAIL: "EMAIL",
  PHONE_NUMBER: "PHONE_NUMBER",
  CITY: "CITY",
  POSTAL_CODE: "POSTAL_CODE",
  COUNTRY: "COUNTRY",
  STATE: "STATE",
  STREET_ADDRESS: "STREET_ADDRESS",
  COMMENT: "COMMENT",
  SERVICE: "SERVICE",
  PREFERRED_CONTACT_METHOD: "PREFERRED_CONTACT_METHOD",
  PREFERRED_CONTACT_TIME: "PREFERRED_CONTACT_TIME",
  CAMPAIGN_NAME: "CAMPAIGN_NAME",
} as const;

const PREFERRED_TIMES = new Set(["morning", "afternoon", "flexible"]);

export const parseGoogleAdsColumnData = (
  columns: Array<{ column_id?: string; string_value?: string | null }>,
): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const col of columns) {
    if (col.column_id && col.string_value) {
      result[col.column_id] = col.string_value;
    }
  }
  return result;
};

export const columnsFromLeadFormFields = (
  fields: Array<{ field_type?: string; field_value?: string | null }>,
): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const field of fields) {
    if (field.field_type && field.field_value) {
      result[field.field_type] = field.field_value;
    }
  }
  return result;
};

export const parseGoogleAdsName = (
  columns: Record<string, string>,
  email?: string,
): { firstName: string; lastName: string } => {
  const fullName = columns[GOOGLE_ADS_COLUMN_IDS.FULL_NAME]?.trim();
  if (fullName) {
    const parts = fullName.split(/\s+/);
    if (parts.length >= 2) {
      return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
    }
    return { firstName: fullName, lastName: "Lead" };
  }

  const firstName = columns[GOOGLE_ADS_COLUMN_IDS.FIRST_NAME]?.trim();
  const lastName = columns[GOOGLE_ADS_COLUMN_IDS.LAST_NAME]?.trim();
  if (firstName || lastName) {
    return {
      firstName: firstName || "Unknown",
      lastName: lastName || "Lead",
    };
  }

  if (email) {
    const localPart = email.split("@")[0]?.trim();
    if (localPart) {
      const parts = localPart.split(/[._-]/).filter(Boolean);
      if (parts.length >= 2) {
        return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
      }
      return { firstName: localPart, lastName: "Lead" };
    }
  }

  return { firstName: "Unknown", lastName: "Lead" };
};

const preferredTimeFromColumns = (columns: Record<string, string>): string | null => {
  const raw = columns[GOOGLE_ADS_COLUMN_IDS.PREFERRED_CONTACT_TIME]?.trim().toLowerCase();
  if (raw && PREFERRED_TIMES.has(raw)) return raw;
  return null;
};

export const mapGoogleAdsColumnsToContact = (args: {
  leadId: string;
  campaignId?: string | null;
  gclid?: string | null;
  isTest?: boolean;
  ingestedVia: IngestedVia;
  columns: Record<string, string>;
  rawPayload: Record<string, unknown>;
}): InsertContactRecord => {
  const email = args.columns[GOOGLE_ADS_COLUMN_IDS.EMAIL]?.trim() || null;
  const phone = args.columns[GOOGLE_ADS_COLUMN_IDS.PHONE_NUMBER]?.trim() || null;
  const { firstName, lastName } = parseGoogleAdsName(args.columns, email ?? undefined);
  const campaignName = args.columns[GOOGLE_ADS_COLUMN_IDS.CAMPAIGN_NAME]?.trim() || null;

  return {
    firstName,
    lastName,
    email,
    phone,
    service: args.columns[GOOGLE_ADS_COLUMN_IDS.SERVICE]?.trim() || null,
    message: args.columns[GOOGLE_ADS_COLUMN_IDS.COMMENT]?.trim() || null,
    requestType: "google_ads_lead",
    preferredTime: preferredTimeFromColumns(args.columns),
    googleAdsLeadId: args.leadId,
    campaignId: args.campaignId ?? null,
    campaignName,
    ingestedVia: args.ingestedVia,
    gclid: args.gclid || null,
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: campaignName,
    consentToContact: true,
    leadStatus: "new",
    isTest: args.isTest ?? false,
    rawPayload: args.rawPayload,
  };
};

export const googleAdsLeadIdFromResourceName = (resourceName: string): string | null => {
  const trimmed = resourceName.trim();
  if (!trimmed) return null;
  const parts = trimmed.split("/");
  const id = parts[parts.length - 1]?.trim();
  return id || null;
};

export const campaignIdFromResourceName = (resourceName: string | null | undefined): string | null => {
  if (!resourceName) return null;
  const match = /campaigns\/(\d+)/.exec(resourceName);
  return match?.[1] ?? null;
};
