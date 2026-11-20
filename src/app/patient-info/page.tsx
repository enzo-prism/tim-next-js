import type { Metadata } from "next";
import PatientInfoPage from "@/legacy-pages/patient-info";
import JsonLd from "@/components/seo/json-ld";
import { buildRouteMetadata } from "@/lib/metadata";
import { buildFaqSchema } from "@/content/structured-data";
import { patientInfoFaqs } from "@/content/patient-info-faqs";
import { buildRouteBreadcrumbSchema } from "@/content/breadcrumbs";

export const metadata: Metadata = buildRouteMetadata("/patient-info");

export default function Page() {
  return (
    <>
      <JsonLd data={buildRouteBreadcrumbSchema("/patient-info")} />
      <JsonLd data={buildFaqSchema(patientInfoFaqs)} />
      <PatientInfoPage />
    </>
  );
}
