import {
  APPOINTMENT_FORM_URL,
  GA_MEASUREMENT_ID,
  GOOGLE_ADS_CONVERSION_EVENT,
  GOOGLE_ADS_TAG_ID,
  HOTJAR_ID,
  HOTJAR_SNIPPET_VERSION,
} from "@/lib/tracking-config";

export { APPOINTMENT_FORM_URL };

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

  initGA();
  if (!window.gtag) return;

  const pagePath = url || `${window.location.pathname}${window.location.search}`;
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
  if (typeof window === "undefined") return;

  initGA();
  if (!window.gtag) return;
  
  window.gtag("event", action, {
    send_to: GA_MEASUREMENT_ID,
    event_category: category,
    event_label: label,
    value: value,
  });
};

export const trackAppointmentCtaClick = (label?: string) => {
  trackEvent("appointment_cta_click", "appointment", label);
};

export const trackAppointmentSubmitSuccess = () => {
  triggerGoogleAdsConversion();
  trackEvent("appointment_submit_success", "appointment");
};

export const trackAppointmentSubmitFallback = () => {
  trackEvent("appointment_submit_fallback", "appointment");
};
