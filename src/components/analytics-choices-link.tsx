"use client";

import { reopenAnalyticsConsent } from "@/lib/analytics";

export default function AnalyticsChoicesLink({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={reopenAnalyticsConsent}>
      Analytics choices
    </button>
  );
}
