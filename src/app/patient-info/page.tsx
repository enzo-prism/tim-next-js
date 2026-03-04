import type { Metadata } from "next";
import PatientInfoPage from "@/legacy-pages/patient-info";
import { buildRouteMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildRouteMetadata("/patient-info");

export default function Page() {
  return <PatientInfoPage />;
}
