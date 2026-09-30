import type { Metadata } from "next";
import PatientGuidancePage from "@/components/patient-info/patient-guidance-page";
import { newPatientSections } from "@/content/patient-guidance";
import { buildRouteMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildRouteMetadata("/new-patients");

export default function NewPatientsPage() {
  return <PatientGuidancePage
    label="New patients"
    title="Feel prepared for your first visit"
    introduction="Whether you are finding a dentist for yourself or arranging care for your family, start with a clear next step. Send a visit request or call our Los Gatos team to talk through your questions."
    source="new_patients"
    sections={newPatientSections}
  />;
}
