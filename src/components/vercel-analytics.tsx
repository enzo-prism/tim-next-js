"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { sanitizeAnalyticsUrl } from "@/lib/analytics";

const isAdminUrl = (rawUrl: string) => {
  try {
    const { pathname } = new URL(rawUrl);
    return pathname === "/admin" || pathname.startsWith("/admin/");
  } catch {
    return rawUrl.startsWith("/admin");
  }
};

/**
 * Vercel Web Analytics reports the full page URL by default, query string
 * included. Patient-facing URLs can carry an email address or a name, so the
 * URL is reduced to the same path-plus-campaign-parameters shape GA4 receives
 * before the event is allowed to leave the browser.
 */
const filterVercelAnalyticsEvent = (event: BeforeSendEvent) => {
  if (isAdminUrl(event.url)) {
    return null;
  }

  return { ...event, url: sanitizeAnalyticsUrl(event.url) };
};

export default function VercelAnalytics() {
  return <Analytics beforeSend={filterVercelAnalyticsEvent} />;
}
