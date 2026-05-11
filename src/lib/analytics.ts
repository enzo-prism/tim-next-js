import { track as trackVercelEvent } from "@vercel/analytics";
import {
  APPOINTMENT_FORM_URL,
  GA_MEASUREMENT_ID,
  GOOGLE_ADS_CONVERSION_EVENT,
  GOOGLE_ADS_TAG_ID,
  HOTJAR_ID,
  HOTJAR_SNIPPET_VERSION,
} from "@/lib/tracking-config";

export { APPOINTMENT_FORM_URL };

export type SiteEventName =
  | "cta_click"
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

type SiteEventValue = string | number | boolean;
export type SiteEventPayload = Record<string, unknown>;
export type SanitizedSiteEventPayload = Record<string, SiteEventValue>;

const ALLOWED_EVENT_KEYS = new Set([
  "cta_type",
  "destination",
  "error_type",
  "form_type",
  "lead_source",
  "location",
  "page_path",
  "provider",
  "service_id",
  "value",
]);

const MAX_EVENT_VALUE_LENGTH = 120;

// Define the gtag and hotjar functions globally
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    hj: (...args: any[]) => void;
    _hjSettings: {
      hjid: number;
      hjsv: number;
    };
  }
}

let gtagInitialized = false;
let hotjarInitialized = false;

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
  if (value === null) return undefined;
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

export const triggerGoogleAdsConversion = (url?: string, target: "_self" | "_blank" = "_self") => {
  if (typeof window === "undefined") return;

  initGA();
  if (!window.gtag) return;

  window.gtag("event", GOOGLE_ADS_CONVERSION_EVENT);

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
  if (gtagInitialized) return;
  if (!ensureGtag()) return;

  window.gtag("config", GOOGLE_ADS_TAG_ID);
  gtagInitialized = true;
};

// Initialize Hotjar
export const initHotjar = () => {
  if (typeof window === "undefined") return;
  if (hotjarInitialized) return;
  if (window.location.pathname.startsWith("/admin")) return;

  // Hotjar Tracking Code for Family First Smile Care
  const script = document.createElement('script');
  script.textContent = `
    (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:${HOTJAR_ID},hjsv:${HOTJAR_SNIPPET_VERSION}};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
  `;
  document.head.appendChild(script);
  hotjarInitialized = true;
};

// Track page views - useful for single-page applications
export const trackPageView = (url: string) => {
  if (typeof window === "undefined") return;
  if (isAdminPath()) return;

  initGA();
  if (!window.gtag) return;

  const pagePath = sanitizePath(url || `${window.location.pathname}${window.location.search}`);
  window.gtag("event", "page_view", {
    send_to: GA_MEASUREMENT_ID,
    page_path: pagePath,
    page_location: window.location.href,
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

export const trackAppointmentSubmitSuccess = (serviceId?: string) => {
  triggerGoogleAdsConversion();
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
