"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Script from "next/script";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GA_MEASUREMENT_ID } from "@/lib/tracking-config";
import {
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
          className="fixed inset-x-4 bottom-20 z-[80] rounded-xl border border-border bg-card p-4 text-sm text-foreground shadow-sm sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-md"
        >
          <p className="font-semibold">Your privacy choices</p>
          <p className="mt-1 leading-relaxed text-muted-foreground">
            May we use analytics and ad measurement? This can record pages, service interests, and
            appointment actions, but never the details you type into a form.{" "}
            <Link href="/privacy-policy" className="font-semibold text-primary underline">
              Privacy policy
            </Link>
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => chooseConsent("granted")}
              className="min-h-11 rounded-lg bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Allow analytics
            </button>
            <button
              type="button"
              onClick={() => chooseConsent("denied")}
              className="min-h-11 rounded-lg border border-border bg-background px-4 font-semibold text-primary hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              No thanks
            </button>
          </div>
        </section>
      ) : null}
    </>
  );
}
