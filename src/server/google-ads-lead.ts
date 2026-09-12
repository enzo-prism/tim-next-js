import { leadServiceIds } from "@/content/form-schemas";
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

const IDENTITY_COLUMN_IDS = new Set<string>([
  GOOGLE_ADS_COLUMN_IDS.FULL_NAME,
  GOOGLE_ADS_COLUMN_IDS.FIRST_NAME,
  GOOGLE_ADS_COLUMN_IDS.LAST_NAME,
  GOOGLE_ADS_COLUMN_IDS.EMAIL,
  GOOGLE_ADS_COLUMN_IDS.PHONE_NUMBER,
  GOOGLE_ADS_COLUMN_IDS.COMMENT,
  GOOGLE_ADS_COLUMN_IDS.SERVICE,
  GOOGLE_ADS_COLUMN_IDS.CAMPAIGN_NAME,
]);

const SERVICE_ALIASES: Record<string, (typeof leadServiceIds)[number]> = {
  invisalign: "invisalign",
  "family dentistry": "family-dentistry",
  "general family dentistry": "family-dentistry",
  "general and family dentistry": "family-dentistry",
  "dental exams": "dental-exams",
  "dental exam": "dental-exams",
  "dental hygiene": "dental-hygiene",
  "teeth whitening": "teeth-whitening",
  "dental crowns": "dental-crowns",
  "night guards": "night-guards",
  "restorative dentistry": "restorative-dentistry",
  tmj: "tmj",
  "tmj treatment": "tmj",
  "childrens dentistry": "children-dentistry",
  "children's dentistry": "children-dentistry",
  "baby's first visit": "childrens-dentistry/babys-first-visit",
  "babys first visit": "childrens-dentistry/babys-first-visit",
};

const leadFormFieldText = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

export type LeadFormFieldLike = {
  field_type?: unknown;
  fieldType?: unknown;
  field_value?: unknown;
  fieldValue?: unknown;
  question_text?: unknown;
  questionText?: unknown;
};

export type NamedLeadFormColumn = {
  column_id?: string;
  column_name?: string;
  string_value?: string | null;
};

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
  fields: LeadFormFieldLike[],
): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const field of fields) {
    const type =
      leadFormFieldText(field.field_type) ??
      leadFormFieldText(field.fieldType) ??
      leadFormFieldText(field.question_text) ??
      leadFormFieldText(field.questionText);
    const value = leadFormFieldText(field.field_value) ?? leadFormFieldText(field.fieldValue);
    if (type && value) {
      result[type] = value;
    }
  }
  return result;
};

export const namedColumnsFromLeadFormFields = (
  fields: LeadFormFieldLike[],
): NamedLeadFormColumn[] => {
  const result: NamedLeadFormColumn[] = [];
  for (const field of fields) {
    const columnId =
      leadFormFieldText(field.field_type) ?? leadFormFieldText(field.fieldType);
    const question =
      leadFormFieldText(field.question_text) ?? leadFormFieldText(field.questionText);
    const value = leadFormFieldText(field.field_value) ?? leadFormFieldText(field.fieldValue);
    if (!value) continue;
    result.push({
      column_id: columnId ?? question ?? undefined,
      column_name: question ?? undefined,
      string_value: value,
    });
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

type ClockMeridian = {
  hour: number;
  isAm: boolean;
};

const isNoonClock = (clock: ClockMeridian): boolean => !clock.isAm && clock.hour === 12;

const parseClockMeridians = (value: string): ClockMeridian[] =>
  [...value.matchAll(/(0?[1-9]|1[0-2])(?::[0-5]\d)?\s*(a\.?m\.?|p\.?m\.?)\b/g)].map((match) => ({
    hour: Number(match[1]),
    isAm: match[2].startsWith("a"),
  }));

const preferredTimeFromClocks = (
  clocks: ClockMeridian[],
): "morning" | "afternoon" | "flexible" | null => {
  if (clocks.length === 0) return null;
  if (clocks.length === 1) {
    return clocks[0].isAm ? "morning" : "afternoon";
  }

  const start = clocks[0];
  const end = clocks[clocks.length - 1];
  if (start.isAm && (end.isAm || isNoonClock(end))) return "morning";
  if (!start.isAm && !end.isAm) return "afternoon";
  return "flexible";
};

const preferredTimeFromColumns = (columns: Record<string, string>): string | null => {
  const raw = columns[GOOGLE_ADS_COLUMN_IDS.PREFERRED_CONTACT_TIME]?.trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (PREFERRED_TIMES.has(lower)) return lower;

  const fromClocks = preferredTimeFromClocks(parseClockMeridians(lower));
  if (fromClocks) return fromClocks;

  if (/\bmorning\b|before\s*noon/.test(lower)) return "morning";
  if (/\bafternoon\b|\bevening\b|after\s*(?:12|noon|[3-6])\b/.test(lower)) return "afternoon";
  if (/\bflexible\b|any\s*time|anytime/.test(lower)) return "flexible";
  return null;
};

const normalizeServiceKey = (value: string): string =>
  value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const mapGoogleAdsService = (raw: string | null | undefined): string | null => {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  const slug = trimmed.toLowerCase();
  if ((leadServiceIds as readonly string[]).includes(slug)) return slug;

  const hyphenated = slug.replace(/\s+/g, "-");
  if ((leadServiceIds as readonly string[]).includes(hyphenated)) return hyphenated;

  return SERVICE_ALIASES[normalizeServiceKey(trimmed)] ?? trimmed;
};

const humanizeColumnId = (id: string): string =>
  id
    .replace(/^CUSTOM_QUESTION_\d+$/i, "Custom question")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const isQuestionLabel = (key: string): boolean =>
  key.includes(" ") || key.includes("?") || /[a-z]/.test(key);

export const extraAnswerLines = (
  columns: Record<string, string>,
  namedColumns?: NamedLeadFormColumn[],
): string[] => {
  const lines: string[] = [];
  const seen = new Set<string>();
  const seenIds = new Set<string>();

  const pushLine = (label: string, value: string) => {
    const trimmedLabel = label.trim();
    const trimmedValue = value.trim();
    if (!trimmedLabel || !trimmedValue) return;
    const dedupe = `${trimmedLabel.toLowerCase()}:${trimmedValue.toLowerCase()}`;
    if (seen.has(dedupe)) return;
    seen.add(dedupe);
    lines.push(`${trimmedLabel}: ${trimmedValue}`);
  };

  const shouldSkipId = (id: string, value: string): boolean => {
    if (IDENTITY_COLUMN_IDS.has(id)) return true;
    if (
      id === GOOGLE_ADS_COLUMN_IDS.PREFERRED_CONTACT_TIME &&
      PREFERRED_TIMES.has(value.trim().toLowerCase())
    ) {
      return true;
    }
    return false;
  };

  if (namedColumns) {
    for (const col of namedColumns) {
      const id = col.column_id?.trim();
      const value = col.string_value?.trim();
      if (!id || !value) continue;
      seenIds.add(id);
      if (shouldSkipId(id, value)) continue;
      pushLine(col.column_name?.trim() || humanizeColumnId(id), value);
    }
  }

  for (const [key, value] of Object.entries(columns)) {
    if (!value?.trim()) continue;
    if (seenIds.has(key)) continue;
    if (shouldSkipId(key, value)) continue;
    const label = isQuestionLabel(key) ? key : humanizeColumnId(key);
    pushLine(label, value);
  }

  return lines;
};

const composeLeadMessage = (
  columns: Record<string, string>,
  namedColumns?: NamedLeadFormColumn[],
): string | null => {
  const comment = columns[GOOGLE_ADS_COLUMN_IDS.COMMENT]?.trim() || "";
  const extras = extraAnswerLines(columns, namedColumns);
  const message = [comment, extras.join("\n")].filter(Boolean).join("\n\n");
  return message || null;
};

export const mapGoogleAdsColumnsToContact = (args: {
  leadId: string;
  campaignId?: string | null;
  gclid?: string | null;
  isTest?: boolean;
  ingestedVia: IngestedVia;
  columns: Record<string, string>;
  namedColumns?: NamedLeadFormColumn[];
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
    service: mapGoogleAdsService(args.columns[GOOGLE_ADS_COLUMN_IDS.SERVICE]),
    message: composeLeadMessage(args.columns, args.namedColumns),
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
    consentVersion: "google-lead-form",
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
