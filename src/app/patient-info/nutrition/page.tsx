import type { Metadata } from "next";
import PatientInfoNutritionPage from "@/legacy-pages/patient-info-nutrition";
import { buildRouteMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildRouteMetadata("/patient-info/nutrition");

export default function Page() {
  return <PatientInfoNutritionPage />;
}
