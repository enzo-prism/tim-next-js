import { track as trackVercelEvent } from "@vercel/analytics";
import {
  APPOINTMENT_FORM_URL,
  buildAppointmentUrl,
  GA_MEASUREMENT_ID,
  GOOGLE_ADS_CONVERSION_EVENT,
  GOOGLE_ADS_TAG_ID,
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
export const ANALYTICS_CONSENT_STORAGE_KEY = "ffsc_analytics_consent_v1";

type AnalyticsConsent = "granted" | "denied";

// Define the Google tag queue globally for typed client-side event calls.
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

let gtagInitialized = false;

const getStoredAnalyticsConsent = (): AnalyticsConsent | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
    return stored === "granted" || stored === "denied" ? stored : null;
  } catch {
    return null;
  }
};

export const hasAnalyticsConsent = () => getStoredAnalyticsConsent() === "granted";

const sanitizePath = (path: string) => {
  const [pathWithoutHash] = path.split("#");
  const [pathWithoutQuery] = pathWithoutHash.split("?");
  return pathWithoutQuery || "/";
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
    window.gtag = function gtag(...args: any[]) {
      window.dataLayer.push(args);
    };
  }

  return true;
};

const consentPayload = (consent: AnalyticsConsent) => ({
  analytics_storage: consent,
  ad_storage: consent,
  ad_user_data: consent,
  ad_personalization: consent,
});

export const setAnalyticsConsent = (consent: AnalyticsConsent) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, consent);
  } catch {
    // A blocked storage write should keep analytics off.
    if (consent === "granted") return;
  }

  if (!ensureGtag()) return;
  window.gtag("consent", "update", consentPayload(consent));
};

export const triggerGoogleAdsConversion = (
  url?: string,
  target: "_self" | "_blank" = "_self",
  transactionId?: string,
) => {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;

  if (!initGA()) return;
  if (!window.gtag) return;

  // The submission UUID doubles as the Ads transaction ID so a double submit
  // or a reloaded confirmation cannot be counted as two conversions.
  if (transactionId) {
    window.gtag("event", GOOGLE_ADS_CONVERSION_EVENT, { transaction_id: transactionId });
  } else {
    window.gtag("event", GOOGLE_ADS_CONVERSION_EVENT);
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
  if (!hasAnalyticsConsent()) return;

  const sanitizedPayload = sanitizeSiteEventPayload(payload);

  initGA();
  if (window.gtag) {
    window.gtag("event", eventName, {
      send_to: GA_MEASUREMENT_ID,
      ...sanitizedPayload,
    });
  }

  try {
    trackVercelEvent(eventName, sanitizedPayload);
  } catch {
    // Analytics should never block navigation, forms, or other user actions.
  }
};

// Initialize Google Analytics
export const initGA = () => {
  if (gtagInitialized) return true;
  if (!hasAnalyticsConsent()) return false;
  if (!ensureGtag()) return false;

  window.gtag("consent", "update", consentPayload("granted"));
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
  window.gtag("config", GOOGLE_ADS_TAG_ID);
  gtagInitialized = true;
  return true;
};

// Track page views - useful for single-page applications
export const trackPageView = (url: string) => {
  if (typeof window === "undefined") return;
  if (isAdminPath()) return;
  if (!hasAnalyticsConsent()) return;

  if (!initGA()) return;
  if (!window.gtag) return;

  const pagePath = sanitizePath(url || `${window.location.pathname}${window.location.search}`);
  window.gtag("event", "page_view", {
    send_to: GA_MEASUREMENT_ID,
    page_path: pagePath,
    page_location: `${window.location.origin}${pagePath}`,
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

export const trackPhoneClick = (location: string) => {
  trackSiteEvent("phone_click", {
    destination: "phone",
    location,
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
