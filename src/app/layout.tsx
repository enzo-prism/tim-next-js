import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import AppProviders from "@/components/app-providers";
import RouteAnalytics from "@/components/route-analytics";
import VercelAnalytics from "@/components/vercel-analytics";
import { buildLocalBusinessSchema } from "@/content/structured-data";
import { buildRouteMetadata, metadataBase } from "@/lib/metadata";
import { GA_MEASUREMENT_ID } from "@/lib/tracking-config";

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
    <html lang="en">
      <body>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });`}
        </Script>

        <AppProviders>
          <RouteAnalytics />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-[60] rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-lg ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            Skip to content
          </a>

          <div className="min-h-screen flex flex-col">
            <Header />
            <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
              {children}
            </main>
            <Footer />
          </div>

          <script
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: JSON.stringify(buildLocalBusinessSchema()) }}
          />
        </AppProviders>
        <VercelAnalytics />
      </body>
    </html>
  );
}
