import type { Metadata } from "next";
import PatientInfoFlossingPage from "@/legacy-pages/patient-info-flossing";
import { buildRouteMetadata } from "@/lib/metadata";
import JsonLd from "@/components/seo/json-ld";
import { buildRouteBreadcrumbSchema } from "@/content/breadcrumbs";

export const metadata: Metadata = buildRouteMetadata("/patient-info/flossing");

export default function Page() {
  return (
    <>
      <JsonLd data={buildRouteBreadcrumbSchema("/patient-info/flossing")} />
      <PatientInfoFlossingPage />
    </>
  );
}
