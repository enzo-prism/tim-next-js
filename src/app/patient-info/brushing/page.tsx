import type { Metadata } from "next";
import PatientInfoBrushingPage from "@/legacy-pages/patient-info-brushing";
import { buildRouteMetadata } from "@/lib/metadata";
import JsonLd from "@/components/seo/json-ld";
import { buildRouteBreadcrumbSchema } from "@/content/breadcrumbs";

export const metadata: Metadata = buildRouteMetadata("/patient-info/brushing");

export default function Page() {
  return (
    <>
      <JsonLd data={buildRouteBreadcrumbSchema("/patient-info/brushing")} />
      <PatientInfoBrushingPage />
    </>
  );
}
