import type { Metadata } from "next";
import ServicesPage from "@/legacy-pages/services";
import { buildRouteMetadata } from "@/lib/metadata";
import JsonLd from "@/components/seo/json-ld";
import { buildRouteBreadcrumbSchema } from "@/content/breadcrumbs";

export const metadata: Metadata = buildRouteMetadata("/services");

export default function Page() {
  return (
    <>
      <JsonLd data={buildRouteBreadcrumbSchema("/services")} />
      <ServicesPage />
    </>
  );
}
