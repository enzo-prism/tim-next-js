import type { Metadata } from "next";
import { Raleway } from "next/font/google";
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

const raleway = Raleway({
  subsets: ["latin"],
  style: ["normal"],
  display: "swap",
  variable: "--font-raleway",
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
      className={raleway.variable}
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
