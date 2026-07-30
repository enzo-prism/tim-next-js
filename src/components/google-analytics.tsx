"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Script from "next/script";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GA_MEASUREMENT_ID } from "@/lib/tracking-config";
import {
  ANALYTICS_CONSENT_EVENT,
  ANALYTICS_CONSENT_STORAGE_KEY,
  initGA,
  setAnalyticsConsent,
  trackPageView,
} from "@/lib/analytics";

type ConsentState = "loading" | "prompt" | "granted" | "denied";

const VercelAnalytics = dynamic(() => import("@/components/vercel-analytics"), {
  ssr: false,
});

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<ConsentState>("loading");
  const trackCurrentPageOnReadyRef = useRef(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
      setConsent(stored === "granted" || stored === "denied" ? stored : "prompt");
    } catch {
      setConsent("prompt");
    }
  }, []);

  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;

  const chooseConsent = (nextConsent: "granted" | "denied") => {
    trackCurrentPageOnReadyRef.current = nextConsent === "granted";
    setAnalyticsConsent(nextConsent);
    setConsent(nextConsent);
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent(ANALYTICS_CONSENT_EVENT));
    }, 0);
  };

  return (
    <>
      {consent === "granted" ? (
        <>
          <Script
            id="google-analytics"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
            onReady={() => {
              initGA();
              if (trackCurrentPageOnReadyRef.current) {
                trackCurrentPageOnReadyRef.current = false;
                trackPageView(window.location.pathname);
              }
            }}
          />
          <VercelAnalytics />
        </>
      ) : null}

      {consent === "prompt" ? (
        <section
          aria-label="Analytics privacy choices"
          className="fixed inset-x-3 bottom-3 z-40 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-80 md:w-auto"
        >
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
            <p className="min-w-0 flex-1 text-xs leading-snug text-muted-foreground md:whitespace-nowrap">
              Analytics and ad measurement? We never record what you type.{" "}
              <Link
                href="/privacy-policy"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Privacy
              </Link>
            </p>
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                aria-label="Allow analytics"
                onClick={() => chooseConsent("granted")}
                className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              >
                Allow
              </button>
              <button
                type="button"
                onClick={() => chooseConsent("denied")}
                className="rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              >
                No thanks
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
