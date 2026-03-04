import type { Metadata } from "next";
import ContactPage from "@/legacy-pages/contact";
import { buildRouteMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildRouteMetadata("/contact");

export default function Page() {
  return <ContactPage />;
}
