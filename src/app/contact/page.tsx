import type { Metadata } from "next";
import ContactPage from "@/legacy-pages/contact";
import QueryProvider from "@/components/query-provider";
import { buildRouteMetadata } from "@/lib/metadata";
import JsonLd from "@/components/seo/json-ld";
import { buildRouteBreadcrumbSchema } from "@/content/breadcrumbs";

export const metadata: Metadata = buildRouteMetadata("/contact");

export default function Page() {
  return (
    <QueryProvider>
      <JsonLd data={buildRouteBreadcrumbSchema("/contact")} />
      <ContactPage />
    </QueryProvider>
  );
}
