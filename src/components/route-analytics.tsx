"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  ANALYTICS_CONSENT_EVENT,
  hasAnalyticsConsent,
  initGA,
  isGoogleAnalyticsAllowed,
  trackPageView,
} from "@/lib/analytics";
import { captureLeadAttribution } from "@/lib/lead-attribution";

export default function RouteAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    captureLeadAttribution();
    trackPageView(pathname);
  }, [pathname]);

  useEffect(() => {
    const onConsent = () => {
      if (!isGoogleAnalyticsAllowed()) return;
      if (!pathname || pathname.startsWith("/admin")) return;
      initGA();
      // Explicit Allow upgrades EEA/UK/CH from cookieless to a granted hit.
      if (hasAnalyticsConsent()) {
        trackPageView(pathname);
      }
    };

    window.addEventListener(ANALYTICS_CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, onConsent);
  }, [pathname]);

  return null;
}
