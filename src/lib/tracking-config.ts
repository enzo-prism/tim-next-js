export const CANONICAL_GA_MEASUREMENT_ID = "G-L7MH47XYXL";

/** Vite-era measurement ID for retired GA4 property 500238593. Never send hits. */
export const RETIRED_GA_MEASUREMENT_IDS: readonly string[] = ["G-54ESSN4BF8"];

export const resolveGaMeasurementId = (raw?: string | null) => {
  const value = raw?.trim() ?? "";
  // Property 518867337 is the only live GA4 destination. Empty, whitespace,
  // retired (G-54ESSN4BF8 / 500238593), and any other G- ID are ignored.
  return value === CANONICAL_GA_MEASUREMENT_ID ? value : CANONICAL_GA_MEASUREMENT_ID;
};

export const GA_MEASUREMENT_ID = resolveGaMeasurementId(
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
);

export const ANALYTICS_CONSENT_STORAGE_KEY = "ffsc_analytics_consent_v1";
export const ANALYTICS_TEST_PARAM = "analytics_test";
export const ANALYTICS_TEST_STORAGE_KEY = "ffsc_analytics_test";

// EEA, UK, and Switzerland: Consent Mode keeps Analytics cookieless here
// until the visitor selects Allow. Everywhere else it is opt-out.
export const CONSENT_REQUIRED_REGIONS = [
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
  "IS",
  "LI",
  "NO",
  "GB",
  "CH",
] as const;

export const ADS_CONSENT_DENIED = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
} as const;

export const getGaDisableKey = (measurementId = GA_MEASUREMENT_ID) =>
  `ga-disable-${measurementId}` as const;

/**
 * Early Consent Mode v2 defaults: analytics granted globally, denied for
 * EEA/UK/CH, ads always denied. Returning visitors who chose No thanks get
 * `ga-disable-<id>` before gtag.js can send a hit.
 */
export const buildConsentBootstrapScript = (measurementId = GA_MEASUREMENT_ID) => {
  const disableKey = getGaDisableKey(measurementId);
  return `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  region: ${JSON.stringify(CONSENT_REQUIRED_REGIONS)}
});
gtag('consent', 'default', {
  analytics_storage: 'granted',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied'
});
try {
  if (localStorage.getItem(${JSON.stringify(ANALYTICS_CONSENT_STORAGE_KEY)}) === 'denied') {
    window[${JSON.stringify(disableKey)}] = true;
  }
} catch (e) {}`;
};

/**
 * Ads tagging is optional. Empty or whitespace env is unset.
 * The rejected Exquisite Dentistry Ads fallback is treated as unset
 * even if a host environment still has that value.
 */
export const resolveGoogleAdsTagId = (raw?: string | null) => {
  const value = raw?.trim() ?? "";
  if (!value) return undefined;
  if (value === `AW-${11373090310}`) return undefined;
  return value;
};

export const GOOGLE_ADS_TAG_ID = resolveGoogleAdsTagId(
  process.env.NEXT_PUBLIC_GOOGLE_ADS_TAG_ID,
);

export const GOOGLE_ADS_CONVERSION_EVENT =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_EVENT || "ads_conversion_Submit_lead_form_1";

export const APPOINTMENT_FORM_URL = "/book-appointment";

export const buildAppointmentUrl = (options: { serviceId?: string; source?: string } = {}) => {
  const params = new URLSearchParams();
  if (options.serviceId) params.set("service", options.serviceId);
  if (options.source) params.set("source", options.source);
  const query = params.toString();
  return query ? `${APPOINTMENT_FORM_URL}?${query}` : APPOINTMENT_FORM_URL;
};
