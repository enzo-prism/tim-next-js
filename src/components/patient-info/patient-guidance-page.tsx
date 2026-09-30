import Link from "next/link";
import type { ReactNode } from "react";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";
import PracticeAddressLink from "@/components/location/PracticeAddressLink";
import { AppointmentLink, PhoneLink } from "@/components/tracking/tracked-links";
import { Button } from "@/components/ui/button";
import { buildAppointmentUrl } from "@/lib/analytics";
import { patientGuidanceFacts, type PatientGuidanceSection } from "@/content/patient-guidance";

type PatientGuidancePageProps = {
  title: string;
  label: string;
  introduction: string;
  source: string;
  sections: readonly PatientGuidanceSection[];
  callFirst?: boolean;
  children?: ReactNode;
};

export default function PatientGuidancePage({
  title,
  label,
  introduction,
  source,
  sections,
  callFirst = false,
  children,
}: PatientGuidancePageProps) {
  return (
    <div className="bg-background pb-20 pt-24 sm:pt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <PageBreadcrumbs items={[{ label: "Home", href: "/" }, { label: "Patient Info", href: "/patient-info" }, { label }]} />
        <header className="max-w-3xl pb-10 pt-4 sm:pb-12">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{label}</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-5xl">{title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{introduction}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant={callFirst ? "default" : "outline"}>
              <PhoneLink location={`${source}_hero`}>Call {patientGuidanceFacts.phone.display}</PhoneLink>
            </Button>
            {callFirst ? (
              <Button asChild size="lg" variant="outline"><Link href="/contact">Office details & directions</Link></Button>
            ) : (
              <Button asChild size="lg">
                <AppointmentLink href={buildAppointmentUrl({ source })} source={source}>Request a visit</AppointmentLink>
              </Button>
            )}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Office hours: {patientGuidanceFacts.hours}, Los Gatos time.</p>
        </header>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24 border-t border-border pt-7" aria-labelledby={`${section.id}-heading`}>
                <h2 id={`${section.id}-heading`} className="text-2xl font-bold text-foreground">{section.title}</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{section.description}</p>
                <ul className="mt-5 list-disc space-y-3 pl-5 text-foreground marker:text-primary">
                  {section.items.map((item) => <li key={item} className="pl-1 leading-relaxed">{item}</li>)}
                </ul>
              </section>
            ))}
            {children}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24" aria-label="Office details and patient guides">
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold text-foreground">Your Los Gatos office</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground"><PracticeAddressLink trackingLocation={`${source}_address`} /></p>
              <p className="mt-4 text-sm font-semibold text-foreground">{patientGuidanceFacts.hours}</p>
              <PhoneLink location={`${source}_sidebar`} className="mt-3 inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4">{patientGuidanceFacts.phone.display}</PhoneLink>
              <p className="mt-3 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">{patientGuidanceFacts.appointmentExpectation}</p>
            </section>
            <nav aria-label="Patient guides" className="rounded-xl border border-border bg-muted/40 p-6">
              <h2 className="text-lg font-bold text-foreground">Useful before your visit</h2>
              <ul className="mt-3 space-y-1">
                {[
                  ["/new-patients", "Your first visit"],
                  ["/insurance-and-payment", "Insurance & payment"],
                  ["/urgent-dental-care", "Time-sensitive dental concerns"],
                ].map(([href, text]) => <li key={href}><Link href={href} className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline-offset-4 hover:underline">{text}</Link></li>)}
              </ul>
            </nav>
          </aside>
        </div>
      </div>
    </div>
  );
}
