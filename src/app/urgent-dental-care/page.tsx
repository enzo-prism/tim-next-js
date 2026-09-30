import type { Metadata } from "next";
import PatientGuidancePage from "@/components/patient-info/patient-guidance-page";
import { urgentCareSections } from "@/content/patient-guidance";
import { buildRouteMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildRouteMetadata("/urgent-dental-care");

export default function UrgentDentalCarePage() {
  return <PatientGuidancePage
    label="Time-sensitive dental concerns"
    title="Need prompt dental attention? Call the office"
    introduction="For a dental concern that needs prompt attention, call (408) 358-8100 to discuss the next step with our Los Gatos team. Appointment availability must be confirmed by the office."
    source="urgent_dental_care"
    sections={urgentCareSections}
    callFirst
  />;
}
