import type { Metadata } from "next";
import AboutPage from "@/legacy-pages/about";
import { buildRouteMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildRouteMetadata("/about");

export default function Page() {
  return <AboutPage />;
}
