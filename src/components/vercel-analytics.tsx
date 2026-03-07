"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

const filterVercelAnalyticsEvent = (event: BeforeSendEvent) => {
  if (event.url.includes("/admin")) {
    return null;
  }

  return event;
};

export default function VercelAnalytics() {
  return <Analytics beforeSend={filterVercelAnalyticsEvent} />;
}
