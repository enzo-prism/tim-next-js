import type { CSSProperties, ReactNode } from "react";
import { Link } from "wouter";
import { AppointmentLink, PhoneLink } from "@/components/tracking/tracked-links";
import { Button } from "@/components/ui/button";
import { PageHero, type HeroTone } from "@/components/site/page-hero";
import { Section } from "@/components/site/section";
import { CtaBand } from "@/components/site/cta-band";
import { buildAppointmentUrl } from "@/lib/analytics";
import { patientGuidanceFacts, type PatientGuidanceSection } from "@/content/patient-guidance";
import { arrowChip, arrowChipNight, MoreGuides } from "@/components/guides/guide-shared";
import { NewPatientGuide, NewPatientHeroMedia } from "@/components/guides/new-patient-guide";
import { InsuranceGuide, InsuranceHeroMedia } from "@/components/guides/insurance-guide";
import { EmergencyCard, UrgentCallCard, UrgentCareGuide } from "@/components/guides/urgent-care-guide";

type PatientGuidancePageProps = {
  title: string;
  label: string;
  introduction: string;
  source: string;
  sections: readonly PatientGuidanceSection[];
  callFirst?: boolean;
  children?: ReactNode;
};

type Variant = "new" | "insurance" | "urgent" | "generic";

const variantBySource: Record<string, Variant> = {
  new_patients: "new",
  insurance_and_payment: "insurance",
  urgent_dental_care: "urgent",
};

const toneByVariant: Record<Variant, HeroTone> = {
  new: "lime",
  insurance: "periwinkle",
  urgent: "blush",
  generic: "cloud",
};

// A warmer opening for the urgent guide; the others use the route's intro.
const leadByVariant: Partial<Record<Variant, string>> = {
  urgent:
    "If a tooth hurts, something chipped, or you’re just worried, call our Los Gatos team. We’ll listen, check appointment availability, and help you take the next step.",
};

const officeNote = `${patientGuidanceFacts.hours}, Los Gatos time · 15251 National Ave, Suite 102, Los Gatos`;

/**
 * The three patient guides (/new-patients, /insurance-and-payment,
 * /urgent-dental-care). Each gets its own hero tone and body; the hero always
 * carries a visible call link before any other phone link on the page.
 */
export default function PatientGuidancePage({
  title,
  label,
  introduction,
  source,
  sections,
  callFirst = false,
  children,
}: PatientGuidancePageProps) {
  const variant = variantBySource[source] ?? "generic";
  const phone = patientGuidanceFacts.phone.display;
  const appointmentHref = buildAppointmentUrl({ source });
  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Patient Info", href: "/patient-info" }, { label }];

  const callButton = (primary: boolean) => (
    <Button asChild size="lg" variant={primary ? "default" : "outline"} className="h-14 px-7 text-base">
      <PhoneLink location={`${source}_hero`}>Call {phone}</PhoneLink>
    </Button>
  );
  const requestButton = (primary: boolean) => (
    <Button asChild size="lg" variant={primary ? "default" : "outline"} className={primary ? "group h-14 pl-7 pr-5 text-base" : "h-14 px-7 text-base"}>
      <AppointmentLink href={appointmentHref} source={source}>
        Request a visit
        {primary ? arrowChip : null}
      </AppointmentLink>
    </Button>
  );

  const heroActions =
    variant === "urgent" ? (
      <UrgentCallCard source={source} />
    ) : callFirst ? (
      <>
        {callButton(true)}
        {requestButton(false)}
      </>
    ) : (
      <>
        {requestButton(true)}
        {callButton(false)}
      </>
    );

  const heroMedia =
    variant === "new" ? <NewPatientHeroMedia /> : variant === "insurance" ? <InsuranceHeroMedia /> : variant === "urgent" ? <EmergencyCard /> : undefined;

  const heroMeta =
    variant === "urgent" ? (
      <p className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
        <span>
          <span className="font-semibold text-ink">Office hours:</span> {patientGuidanceFacts.hours}, Los Gatos time. Closed Fri–Sun.
        </span>
        <Link href="/contact" className="ff-link inline-flex min-h-11 items-center">
          Office details &amp; directions
        </Link>
      </p>
    ) : (
      <p>
        <span className="font-semibold text-ink">Office hours:</span> {patientGuidanceFacts.hours}, Los Gatos time.
      </p>
    );

  return (
    <div className="overflow-x-clip">
      <PageHero
        id="guide-heading"
        tone={toneByVariant[variant]}
        breadcrumbs={breadcrumbs}
        eyebrow={label}
        titleText={title}
        lead={<p>{leadByVariant[variant] ?? introduction}</p>}
        actions={heroActions}
        meta={heroMeta}
        media={heroMedia}
      />

      {variant === "new" ? <NewPatientGuide sections={sections} source={source} /> : null}
      {variant === "insurance" ? (
        <InsuranceGuide sections={sections} source={source}>
          {children}
        </InsuranceGuide>
      ) : null}
      {variant === "urgent" ? <UrgentCareGuide sections={sections} source={source} /> : null}
      {variant === "generic" ? (
        <>
          <GenericSections sections={sections} />
          {children ? (
            <Section width="narrow" className="pt-0 sm:pt-0 lg:pt-0">
              {children}
            </Section>
          ) : null}
          <Section labelledBy="guide-more-heading" className="py-14 sm:py-16 lg:py-20">
            <MoreGuides current="" headingId="guide-more-heading" />
          </Section>
        </>
      ) : null}

      <ClosingBand variant={variant} source={source} appointmentHref={appointmentHref} />
    </div>
  );
}

function ClosingBand({ variant, source, appointmentHref }: { variant: Variant; source: string; appointmentHref: string }) {
  const phone = patientGuidanceFacts.phone.display;
  const call = (primary: boolean) => (
    <Button asChild size="lg" variant={primary ? "night" : "night-outline"} className="h-14 px-7 text-base">
      <PhoneLink location={`${source}_final_cta`}>Call {phone}</PhoneLink>
    </Button>
  );
  const request = (primary: boolean) => (
    <Button asChild size="lg" variant={primary ? "night" : "night-outline"} className={primary ? "group h-14 pl-7 pr-5 text-base" : "h-14 px-7 text-base"}>
      <AppointmentLink href={appointmentHref} source={source}>
        Request a visit
        {primary ? arrowChipNight : null}
      </AppointmentLink>
    </Button>
  );

  if (variant === "urgent") {
    return (
      <CtaBand
        id="guide-cta-heading"
        eyebrow="We’re here to help"
        title={
          <>
            Something hurts? <em className="ff-italic font-normal text-lime">Call us first.</em>
          </>
        }
        body="We’ll listen, check appointment availability, and help you take the next step."
        actions={
          <>
            {call(true)}
            {request(false)}
          </>
        }
        note={officeNote}
      />
    );
  }

  if (variant === "insurance") {
    return (
      <CtaBand
        id="guide-cta-heading"
        title={
          <>
            Questions about your plan? <em className="ff-italic font-normal text-lime">Let’s talk.</em>
          </>
        }
        body="Call with your plan name, or send a visit request and our team will reach out during office hours."
        actions={
          <>
            {call(true)}
            {request(false)}
          </>
        }
        note={
          <>
            {patientGuidanceFacts.appointmentExpectation}
            <br />
            {officeNote}
          </>
        }
      />
    );
  }

  return (
    <CtaBand
      id="guide-cta-heading"
      title={
        <>
          Let’s find a time for your <em className="ff-italic font-normal text-lime">first visit.</em>
        </>
      }
      body="Send a request or give us a call. We’ll help you plan the rest."
      actions={
        <>
          {request(true)}
          {call(false)}
        </>
      }
      note={officeNote}
    />
  );
}

function GenericSections({ sections }: { sections: readonly PatientGuidanceSection[] }) {
  return (
    <Section>
      <div className="grid gap-6 md:grid-cols-2">
        {sections.map((section, index) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-heading`}
            className="ff-reveal rounded-3xl border border-border bg-white p-7"
            style={{ "--i": index % 2 } as CSSProperties}
          >
            <h2 id={`${section.id}-heading`} className="ff-h3">
              {section.title}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-soft">{section.description}</p>
            <ul className="mt-5 space-y-3">
              {section.items.map((item) => (
                <li key={item} className="flex gap-3 text-base leading-relaxed text-ink">
                  <span aria-hidden="true" className="mt-2 size-2.5 shrink-0 rounded-full bg-periwinkle ring-2 ring-ink/10" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Section>
  );
}
