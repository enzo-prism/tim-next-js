import type { Metadata } from "next";
import PatientInfoBrushingPage from "@/legacy-pages/patient-info-brushing";
import { buildRouteMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildRouteMetadata("/patient-info/brushing");

export default function Page() {
  return <PatientInfoBrushingPage />;
}
