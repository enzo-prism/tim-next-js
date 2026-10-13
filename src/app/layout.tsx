import type { Metadata } from "next";
import { Figtree, Fraunces } from "next/font/google";
import "./globals.css";
import "@/components/seasonal/seasonal.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileActionBar from "@/components/layout/mobile-action-bar";
import ElevenLabsWidget from "@/components/elevenlabs-widget";
import RouteAnalytics from "@/components/route-analytics";
import GoogleAnalytics from "@/components/google-analytics";
import { buildLocalBusinessSchema } from "@/content/structured-data";
import { buildRouteMetadata, metadataBase } from "@/lib/metadata";
import { SeasonScript } from "@/components/seasonal/seasonal-art";
import { SeasonRuntime } from "@/components/seasonal/seasonal-client";

// Fraunces (soft axis) carries display type; Figtree carries reading and UI text.
// The italic is a separate, non-preloaded file: it only sets a few emphasized words.
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal"],
  axes: ["SOFT"],
  display: "swap",
  variable: "--font-fraunces",
});

const frauncesItalic = Fraunces({
  subsets: ["latin"],
  style: ["italic"],
  axes: ["SOFT"],
  display: "swap",
  preload: false,
  variable: "--font-fraunces-italic",
});

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  ...buildRouteMetadata("/"),
  metadataBase,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${frauncesItalic.variable} ${figtree.variable}`}
      // The season script may set data-ffsc-season before hydration.
      suppressHydrationWarning
    >
      <head>
        <SeasonScript />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-[60] rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          Skip to content
        </a>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500
});`,
          }}
        />
        <GoogleAnalytics />

        <RouteAnalytics />
        <div className="min-h-screen flex flex-col">
          <Header />
          <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
          <Footer />
        </div>
        <MobileActionBar />
        <SeasonRuntime />

        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildLocalBusinessSchema()) }}
        />
        <ElevenLabsWidget />
      </body>
    </html>
  );
}
