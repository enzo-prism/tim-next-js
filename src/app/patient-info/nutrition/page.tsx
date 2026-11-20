import type { Metadata } from "next";
import PatientInfoNutritionPage from "@/legacy-pages/patient-info-nutrition";
import { buildRouteMetadata } from "@/lib/metadata";
import JsonLd from "@/components/seo/json-ld";
import { buildRouteBreadcrumbSchema } from "@/content/breadcrumbs";

export const metadata: Metadata = buildRouteMetadata("/patient-info/nutrition");

export default function Page() {
  return (
    <>
      <JsonLd data={buildRouteBreadcrumbSchema("/patient-info/nutrition")} />
      <PatientInfoNutritionPage />
    </>
  );
}
