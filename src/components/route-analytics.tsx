"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  ANALYTICS_CONSENT_EVENT,
  hasAnalyticsConsent,
  initGA,
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
      if (!hasAnalyticsConsent()) return;
      if (!pathname || pathname.startsWith("/admin")) return;
      initGA();
      trackPageView(pathname);
    };

    window.addEventListener(ANALYTICS_CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, onConsent);
  }, [pathname]);

  return null;
}
