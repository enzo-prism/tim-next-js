import type { Metadata } from "next";
import PatientInfoFlossingPage from "@/legacy-pages/patient-info-flossing";
import { buildRouteMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildRouteMetadata("/patient-info/flossing");

export default function Page() {
  return <PatientInfoFlossingPage />;
}
