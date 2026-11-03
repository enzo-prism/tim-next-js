import { track as trackVercelEvent } from "@vercel/analytics";
import {
  ADS_CONSENT_DENIED,
  ANALYTICS_CONSENT_STORAGE_KEY,
  APPOINTMENT_FORM_URL,
  buildAppointmentUrl,
  GA_MEASUREMENT_ID,
  getGaDisableKey,
  GOOGLE_ADS_CONVERSION_EVENT,
  GOOGLE_ADS_TAG_ID,
  isGoogleAnalyticsProductionHostname,
} from "@/lib/tracking-config";

export { APPOINTMENT_FORM_URL, buildAppointmentUrl };

export type SiteEventName =
  | "cta_click"
  | "appointment_step_view"
  | "appointment_step_complete"
  | "appointment_form_abandon"
  | "form_start"
  | "form_submit_attempt"
  | "generate_lead"
  | "form_submit_fallback"
  | "form_submit_error"
  | "phone_click"
  | "map_click"
  | "pay_bill_click"
  | "review_link_click"
  | "social_click"
  | "service_learn_more_click"
  | (string & {});

type SiteEventValue = string | number | boolean | null;
export type SiteEventPayload = Record<string, unknown>;
export type SanitizedSiteEventPayload = Record<string, SiteEventValue>;

const ALLOWED_EVENT_KEYS = new Set([
  "abandonment_reason",
  "cta_type",
  "destination",
  "error_type",
  "form_step",
  "form_type",
  "lead_source",
  "location",
  "page_path",
  "provider",
  "service_id",
  "step_name",
  "value",
]);

const MAX_EVENT_VALUE_LENGTH = 120;
export { ANALYTICS_CONSENT_STORAGE_KEY, isGoogleAnalyticsProductionHostname };
export const ANALYTICS_CONSENT_EVENT = "ffsc:analytics-consent";
export const ANALYTICS_CONSENT_REOPEN_EVENT = "ffsc:analytics-consent-reopen";

const CONSENT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

type AnalyticsConsent = "granted" | "denied";

// Define the Google tag queue globally for typed client-side event calls.
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    [gaDisableKey: `ga-disable-${string}`]: boolean | undefined;
  }
}

let gtagInitialized = false;
let sessionOptedOut = false;

export const resetGtagInitialization = () => {
  gtagInitialized = false;
  sessionOptedOut = false;
};

export const isGtagInitialized = () => gtagInitialized;

const asConsent = (value: string | null | undefined): AnalyticsConsent | null =>
  value === "granted" || value === "denied" ? value : null;

const readConsentCookie = (): AnalyticsConsent | null => {
  if (typeof document === "undefined") return null;
  try {
    const parts = document.cookie.split(";");
    for (const part of parts) {
      const [rawKey, ...rest] = part.split("=");
      if (rawKey.trim() !== ANALYTICS_CONSENT_STORAGE_KEY) continue;
      return asConsent(rest.join("=").trim());
    }
  } catch {
    return null;
  }
  return null;
};

const writeConsentCookie = (consent: AnalyticsConsent) => {
  if (typeof document === "undefined") return;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ANALYTICS_CONSENT_STORAGE_KEY}=${consent}; Max-Age=${CONSENT_COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
};

const getStoredAnalyticsConsent = (): AnalyticsConsent | null => {
  if (typeof window === "undefined") return null;
  let fromStorage: AnalyticsConsent | null = null;
  try {
    fromStorage = asConsent(window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY));
  } catch {
    fromStorage = null;
  }
  const fromCookie = readConsentCookie();
  if (fromStorage === "denied" || fromCookie === "denied" || sessionOptedOut) return "denied";
  if (fromStorage === "granted" || fromCookie === "granted") return "granted";
  return null;
};

export const readAnalyticsConsent = () => getStoredAnalyticsConsent();

export const hasAnalyticsConsent = () => getStoredAnalyticsConsent() === "granted";

// Google Analytics runs unless the visitor declined. Consent Mode keeps
// EEA/UK/Swiss visitors cookieless until they allow it. Vercel Analytics
// stays opt-in and still requires "granted".
export const isGoogleAnalyticsAllowed = () => {
  if (sessionOptedOut) return false;
  return getStoredAnalyticsConsent() !== "denied";
};

const isCollectionHost = () =>
  typeof window !== "undefined" &&
  isGoogleAnalyticsProductionHostname(window.location.hostname);

const canCallExistingGtag = () => typeof window !== "undefined" && typeof window.gtag === "function";

const setGaDisabled = (disabled: boolean) => {
  if (typeof window === "undefined") return;
  window[getGaDisableKey()] = disabled;
};

const sanitizePath = (path: string) => {
  const [pathWithoutHash] = path.split("#");
  const [pathWithoutQuery] = pathWithoutHash.split("?");
  return pathWithoutQuery || "/";
};

/**
 * GA4 derives session source/medium and campaign from `page_location`. Sending
 * a query-stripped URL therefore reports paid and campaign traffic as direct.
 * These keys are campaign identifiers rather than patient data, so they are the
 * only ones carried through; everything else a URL might hold is still dropped.
 */
const CAMPAIGN_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "gclid",
  "gbraid",
  "wbraid",
  "dclid",
  "msclkid",
] as const;

const MAX_CAMPAIGN_VALUE_LENGTH = 200;

/** Reduce a query string to campaign parameters only. Pure, so it can be
 *  applied to any analytics URL regardless of provider. */
export const sanitizeCampaignSearch = (search: string) => {
  const current = new URLSearchParams(search);
  const preserved = new URLSearchParams();
  for (const key of CAMPAIGN_PARAM_KEYS) {
    const value = current.get(key)?.trim();
    if (value) preserved.set(key, value.slice(0, MAX_CAMPAIGN_VALUE_LENGTH));
  }

  const query = preserved.toString();
  return query ? `?${query}` : "";
};

/**
 * Apply the same URL policy every analytics provider must follow: keep the
 * path and campaign parameters, drop the hash and every other query
 * parameter. A patient-facing URL can carry an email or a name, so no
 * provider may receive one verbatim.
 */
export const sanitizeAnalyticsUrl = (rawUrl: string) => {
  try {
    const url = new URL(rawUrl);
    return `${url.origin}${sanitizePath(url.pathname)}${sanitizeCampaignSearch(url.search)}`;
  } catch {
    return sanitizePath(rawUrl);
  }
};

const buildCampaignQuery = () => {
  if (typeof window === "undefined") return "";
  return sanitizeCampaignSearch(window.location.search);
};

const getCurrentPagePath = () => {
  if (typeof window === "undefined") return "/";
  return sanitizePath(window.location.pathname || "/");
};

const isAdminPath = () => {
  if (typeof window === "undefined") return false;
  const pagePath = getCurrentPagePath();
  return pagePath === "/admin" || pagePath.startsWith("/admin/");
};

const sanitizeEventValue = (value: unknown): SiteEventValue | undefined => {
  if (value === null) return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, MAX_EVENT_VALUE_LENGTH);
};

export const sanitizeSiteEventPayload = (
  payload: SiteEventPayload = {},
): SanitizedSiteEventPayload => {
  const sanitized: SanitizedSiteEventPayload = {
    page_path: getCurrentPagePath(),
  };

  for (const [key, value] of Object.entries(payload)) {
    if (!ALLOWED_EVENT_KEYS.has(key)) continue;
    // Intake symptom choices belong in the private request, not analytics.
    if (key === "service_id" && typeof value === "string" && value.trim() === "tooth-pain") continue;

    const shouldSanitizePath =
      (key === "page_path" || key === "destination") &&
      typeof value === "string" &&
      value.startsWith("/");
    const sanitizedValue = shouldSanitizePath
      ? sanitizeEventValue(sanitizePath(value))
      : sanitizeEventValue(value);

    if (sanitizedValue !== undefined) {
      sanitized[key] = sanitizedValue;
    }
  }

  return sanitized;
};

const ensureGtag = () => {
  if (typeof window === "undefined") {
    return false;
  }

  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    // Push the Arguments object, not a rest-parameter array. gtag.js replays
    // the queue and expects the same shape as the official snippet.
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params -- gtag.js queue replay
      window.dataLayer.push(arguments);
    };
  }

  return true;
};

const analyticsConsentUpdate = (analyticsStorage: AnalyticsConsent) => ({
  analytics_storage: analyticsStorage,
  ...ADS_CONSENT_DENIED,
});

export const disableGoogleAnalytics = () => {
  if (typeof window === "undefined") return;
  sessionOptedOut = true;
  setGaDisabled(true);
  if (isCollectionHost()) {
    if (!ensureGtag()) return;
    window.gtag("consent", "update", analyticsConsentUpdate("denied"));
    return;
  }
  if (canCallExistingGtag()) {
    window.gtag("consent", "update", analyticsConsentUpdate("denied"));
  }
};

export const setAnalyticsConsent = (consent: AnalyticsConsent) => {
  if (typeof window === "undefined") return;
  sessionOptedOut = consent === "denied";
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, consent);
  } catch {
    // A blocked storage write should keep analytics off.
    if (consent === "granted") return;
  }

  try {
    writeConsentCookie(consent);
  } catch {
    // Cookie write is best-effort; localStorage is the other copy.
  }

  if (consent === "denied") {
    disableGoogleAnalytics();
    return;
  }

  setGaDisabled(false);
  if (isCollectionHost()) {
    if (!ensureGtag()) return;
    window.gtag("consent", "update", analyticsConsentUpdate("granted"));
    return;
  }
  if (canCallExistingGtag()) {
    window.gtag("consent", "update", analyticsConsentUpdate("granted"));
  }
};

export const reopenAnalyticsConsent = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ANALYTICS_CONSENT_REOPEN_EVENT));
};

const emitGtagEvent = (eventName: string, payload: Record<string, unknown>) => {
  if (!isGoogleAnalyticsAllowed()) return;
  if (isCollectionHost()) {
    initGA();
    if (!isGoogleAnalyticsAllowed()) return;
    window.gtag?.("event", eventName, payload);
    return;
  }
  if (canCallExistingGtag()) {
    window.gtag("event", eventName, payload);
  }
};

export const triggerGoogleAdsConversion = (
  url?: string,
  target: "_self" | "_blank" = "_self",
  transactionId?: string,
) => {
  if (typeof window === "undefined") return;
  if (!isGoogleAnalyticsAllowed()) return;

  if (isCollectionHost()) {
    if (!initGA()) return;
  } else if (!canCallExistingGtag()) {
    return;
  }
  if (!isGoogleAnalyticsAllowed() || !window.gtag) return;

  // Scope the conversion to the Ads destination when a valid tag exists.
  // Without send_to, gtag broadcasts it to every configured target and GA4
  // also records a stray ads_conversion_* event next to generate_lead.
  //
  // The submission UUID doubles as the Ads transaction ID so a double submit
  // or a reloaded confirmation cannot be counted as two conversions.
  if (GOOGLE_ADS_TAG_ID) {
    window.gtag("event", GOOGLE_ADS_CONVERSION_EVENT, {
      send_to: GOOGLE_ADS_TAG_ID,
      ...(transactionId ? { transaction_id: transactionId } : {}),
    });
  }

  if (!url) return;
  if (target === "_blank") {
    const newWindow = window.open(url, "_blank");
    if (newWindow) newWindow.opener = null;
    return;
  }
  window.location.assign(url);
};

export const trackSiteEvent = (eventName: SiteEventName, payload: SiteEventPayload = {}) => {
  if (typeof window === "undefined") return;
  if (isAdminPath()) return;
  if (!isGoogleAnalyticsAllowed()) return;

  const sanitizedPayload = sanitizeSiteEventPayload(payload);

  emitGtagEvent(eventName, {
    send_to: GA_MEASUREMENT_ID,
    ...sanitizedPayload,
  });

  if (!hasAnalyticsConsent()) return;

  try {
    trackVercelEvent(eventName, sanitizedPayload);
  } catch {
    // Analytics should never block navigation, forms, or other user actions.
  }
};

// Initialize Google Analytics
export const initGA = () => {
  if (!isCollectionHost()) return false;
  if (gtagInitialized) return true;
  if (!isGoogleAnalyticsAllowed()) return false;
  if (!ensureGtag()) return false;

  setGaDisabled(false);
  // Only upgrade analytics_storage after an explicit Allow. A default
  // "granted" update would override the EEA/UK/CH region default.
  if (hasAnalyticsConsent()) {
    window.gtag("consent", "update", analyticsConsentUpdate("granted"));
  }
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, {
    send_page_view: false,
  });
  if (GOOGLE_ADS_TAG_ID) {
    window.gtag("config", GOOGLE_ADS_TAG_ID);
  }
  gtagInitialized = true;
  return true;
};

// Track page views - useful for single-page applications
export const trackPageView = (url: string) => {
  if (typeof window === "undefined") return;
  if (isAdminPath()) return;
  if (!isGoogleAnalyticsAllowed()) return;

  const pagePath = sanitizePath(url || `${window.location.pathname}${window.location.search}`);
  emitGtagEvent("page_view", {
    send_to: GA_MEASUREMENT_ID,
    page_path: pagePath,
    page_location: `${window.location.origin}${pagePath}${buildCampaignQuery()}`,
    page_title: document.title
  });
};

// Track events
export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number
) => {
  trackSiteEvent(action, {
    cta_type: category,
    location: label,
    value,
  });
};

export const trackAppointmentCtaClick = (
  location = "unknown",
  details: {
    ctaType?: string;
    destination?: string;
    serviceId?: string;
  } = {},
) => {
  trackSiteEvent("cta_click", {
    cta_type: details.ctaType || "appointment",
    destination: details.destination || APPOINTMENT_FORM_URL,
    location,
    service_id: details.serviceId,
  });
};

export const trackFormStart = (details: {
  formType: string;
  location?: string;
  serviceId?: string;
}) => {
  trackSiteEvent("form_start", {
    form_type: details.formType,
    location: details.location,
    service_id: details.serviceId,
  });
};

export type AppointmentBookingStep = 1 | 2;

const appointmentStepName = (step: AppointmentBookingStep) =>
  step === 1 ? "contact_details" : "appointment_preferences";

const trackAppointmentBookingStep = (
  eventName:
    | "appointment_step_view"
    | "appointment_step_complete"
    | "appointment_form_abandon",
  details: {
    step: AppointmentBookingStep;
    serviceId?: string;
    abandonmentReason?: "page_exit" | "route_change";
  },
) => {
  trackSiteEvent(eventName, {
    abandonment_reason: details.abandonmentReason,
    form_step: details.step,
    form_type: "appointment",
    location: "book_appointment_page",
    service_id: details.serviceId,
    step_name: appointmentStepName(details.step),
  });
};

export const trackAppointmentBookingStepView = (
  step: AppointmentBookingStep,
  serviceId?: string,
) => {
  trackAppointmentBookingStep("appointment_step_view", { step, serviceId });
};

export const trackAppointmentBookingStepComplete = (
  step: AppointmentBookingStep,
  serviceId?: string,
) => {
  trackAppointmentBookingStep("appointment_step_complete", { step, serviceId });
};

export const trackAppointmentBookingAbandonment = (
  step: AppointmentBookingStep,
  serviceId?: string,
  abandonmentReason: "page_exit" | "route_change" = "page_exit",
) => {
  trackAppointmentBookingStep("appointment_form_abandon", {
    step,
    serviceId,
    abandonmentReason,
  });
};

export const trackFormSubmitAttempt = (details: {
  formType: string;
  location?: string;
  serviceId?: string;
}) => {
  trackSiteEvent("form_submit_attempt", {
    form_type: details.formType,
    location: details.location,
    service_id: details.serviceId,
  });
};

export const trackGenerateLead = (details: {
  formType: string;
  leadSource: string;
  location?: string;
  serviceId?: string;
}) => {
  trackSiteEvent("generate_lead", {
    form_type: details.formType,
    lead_source: details.leadSource,
    location: details.location,
    service_id: details.serviceId,
  });
};

export const trackFormSubmitError = (details: {
  formType: string;
  errorType: string;
  location?: string;
  serviceId?: string;
}) => {
  trackSiteEvent("form_submit_error", {
    error_type: details.errorType,
    form_type: details.formType,
    location: details.location,
    service_id: details.serviceId,
  });
};

export const trackAppointmentSubmitSuccess = (
  serviceId?: string,
  transactionId?: string,
) => {
  triggerGoogleAdsConversion(undefined, "_self", transactionId);
  trackGenerateLead({
    formType: "appointment",
    leadSource: "appointment_form",
    location: "book_appointment_page",
    serviceId,
  });
};

export const trackAppointmentSubmitFallback = (serviceId?: string) => {
  trackSiteEvent("form_submit_fallback", {
    form_type: "appointment",
    location: "book_appointment_page",
    service_id: serviceId,
  });
};

export const trackContactSubmitSuccess = (serviceId?: string) => {
  trackGenerateLead({
    formType: "contact",
    leadSource: "contact_form",
    location: "contact_page",
    serviceId,
  });
};

export const trackPhoneClick = (location: string, serviceId?: string) => {
  trackSiteEvent("phone_click", {
    destination: "phone",
    location,
    service_id: serviceId,
  });
};

export const trackMapClick = (location: string) => {
  trackSiteEvent("map_click", {
    destination: "google_maps",
    location,
    provider: "google",
  });
};

export const trackPayBillClick = (location: string) => {
  trackSiteEvent("pay_bill_click", {
    destination: "swipesimple",
    location,
    provider: "swipesimple",
  });
};

export const trackReviewLinkClick = (provider: string, location: string) => {
  trackSiteEvent("review_link_click", {
    destination: "review_profile",
    location,
    provider,
  });
};

export const trackSocialClick = (provider: string, location: string) => {
  trackSiteEvent("social_click", {
    destination: "social_profile",
    location,
    provider,
  });
};

export const trackServiceLearnMoreClick = (serviceId: string, location: string) => {
  trackSiteEvent("service_learn_more_click", {
    destination: "service_page",
    location,
    service_id: serviceId,
  });
};
