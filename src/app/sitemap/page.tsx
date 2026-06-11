import type { Metadata } from "next";
import SiteMapPage from "@/legacy-pages/sitemap";
import { buildRouteMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  ...buildRouteMetadata("/sitemap"),
  robots: {
    index: false,
    follow: true,
  },
};

export default function Page() {
  return <SiteMapPage />;
}
