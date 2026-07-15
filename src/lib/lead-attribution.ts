export type LeadAttribution = {
  landingPage?: string;
  referrer?: string;
  ctaSource?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
};

const STORAGE_KEY = "ffsc_lead_attribution_v1";
const MAX_VALUE_LENGTH = 300;

const cleanValue = (value: string | null, maxLength = MAX_VALUE_LENGTH) => {
  const cleaned = value?.trim().slice(0, maxLength);
  return cleaned || undefined;
};

const getReferrerHost = () => {
  if (!document.referrer) return undefined;
  try {
    const referrer = new URL(document.referrer);
    if (referrer.origin === window.location.origin) return undefined;
    return cleanValue(referrer.hostname, 200);
  } catch {
    return undefined;
  }
};

const readStoredAttribution = (): LeadAttribution => {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as LeadAttribution) : {};
  } catch {
    return {};
  }
};

export const captureLeadAttribution = (): LeadAttribution => {
  if (typeof window === "undefined") return {};

  const existing = readStoredAttribution();
  const params = new URLSearchParams(window.location.search);
  const captured: LeadAttribution = {
    landingPage: existing.landingPage || cleanValue(window.location.pathname, 300),
    referrer: existing.referrer || getReferrerHost(),
    ctaSource: existing.ctaSource || cleanValue(params.get("source"), 100),
    utmSource: existing.utmSource || cleanValue(params.get("utm_source"), 120),
    utmMedium: existing.utmMedium || cleanValue(params.get("utm_medium"), 120),
    utmCampaign: existing.utmCampaign || cleanValue(params.get("utm_campaign"), 180),
    utmTerm: existing.utmTerm || cleanValue(params.get("utm_term"), 180),
    utmContent: existing.utmContent || cleanValue(params.get("utm_content"), 180),
    gclid: existing.gclid || cleanValue(params.get("gclid"), 200),
    gbraid: existing.gbraid || cleanValue(params.get("gbraid"), 200),
    wbraid: existing.wbraid || cleanValue(params.get("wbraid"), 200),
  };

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(captured));
  } catch {
    // Attribution is useful but must never block the patient journey.
  }

  return captured;
};

export const createSubmissionId = () => window.crypto.randomUUID();
