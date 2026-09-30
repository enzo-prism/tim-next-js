import type { Metadata } from "next";
import PatientGuidancePage from "@/components/patient-info/patient-guidance-page";
import { insuranceSections } from "@/content/patient-guidance";
import { buildRouteMetadata } from "@/lib/metadata";
import { patientGuidanceFacts } from "@/content/patient-guidance";
import { TrackedExternalLink } from "@/components/tracking/tracked-links";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = buildRouteMetadata("/insurance-and-payment");

export default function InsuranceAndPaymentPage() {
  return <PatientGuidancePage
    label="Insurance & payment"
    title="Plan your visit with fewer cost questions"
    introduction="Insurance benefits and payment details can vary. Use these questions to prepare a conversation with the office and your insurer before you visit."
    source="insurance_and_payment"
    sections={insuranceSections}
    callFirst
  >
    <section className="border-t border-border pt-7" aria-labelledby="pay-existing-bill-heading">
      <h2 id="pay-existing-bill-heading" className="text-2xl font-bold text-foreground">Already have a bill?</h2>
      <p className="mt-3 text-muted-foreground">Use our online payment link, or call the office with a question about your bill.</p>
      <Button asChild variant="outline" className="mt-5">
        <TrackedExternalLink kind="pay_bill" location="insurance_and_payment" href={patientGuidanceFacts.billPayUrl} target="_blank" rel="noopener noreferrer">Pay a bill online <span className="sr-only">(opens in a new tab)</span></TrackedExternalLink>
      </Button>
    </section>
  </PatientGuidancePage>;
}
