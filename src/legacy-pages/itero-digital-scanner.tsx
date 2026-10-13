import type { CSSProperties } from "react";
import Image from "next/image";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import IteroScannerImage from "@/components/itero-scanner-image";
import { buildAppointmentUrl } from "@/lib/analytics";
import { AppointmentLink } from "@/components/tracking/tracked-links";
import { FinalCtaPhoneLink } from "@/components/service-growth/final-cta-phone-link";
import { iteroContent } from "@shared/marketing-pages";
import { practiceHoursSummary } from "@/content/practice-hours";
import illustrationDigitalScan from "@assets/brand/illustration-digital-scan.webp";
import RelatedLinksSection from "@/components/navigation/RelatedLinksSection";
import PatientInfoFaqList from "@/components/patient-info/patient-info-faq-list";
import { Pinwheel, ToothPerson } from "@/components/brand/pinwheel";
import { PageHero } from "@/components/site/page-hero";
import { Section, SectionHeader } from "@/components/site/section";
import { StepTimeline } from "@/components/site/step-timeline";
import { CtaBand } from "@/components/site/cta-band";
import { PuttyVsScan } from "@/components/features/putty-vs-scan";
import { ArrowChip, Sticker, typeset } from "@/components/features/feature-bits";
import type { RelatedLink } from "@/lib/internal-links";

const relatedLinks: RelatedLink[] = [
  {
    href: "/services/invisalign",
    title: "Invisalign Clear Aligners",
    description: "See how iTero scans support Invisalign planning and smile previews.",
  },
  {
    href: "/services",
    title: "All Dental Services",
    description: "Explore preventive, restorative, and family care options.",
  },
  {
    href: "/patient-info",
    title: "Patient Information",
    description: "FAQs, what to expect, and helpful resources for your visit.",
  },
  {
    href: "/contact",
    title: "Contact & Scheduling",
    description: "Book an appointment, ask a question, or get directions.",
  },
];

const faqItems = iteroContent.faqs.map((faq, index) => ({
  id: `itero-faq-${index + 1}`,
  question: faq.question,
  answer: typeset(faq.answer),
}));

const steps = iteroContent.whatToExpect.steps.map((step) => ({ title: step }));

export default function IteroDigitalScanner() {
  const [comfort, detail, retakes, visuals] = iteroContent.whyUse.bullets;

  return (
    <div className="overflow-x-clip">
      {/* ------------------------------------------------------------ Hero */}
      <PageHero
        id="itero-heading"
        tone="periwinkle"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: "iTero Digital Scanner" },
        ]}
        eyebrow="Dental technology"
        titleText={iteroContent.hero.title}
        lead={iteroContent.hero.subtitle}
        actions={
          <>
            <Button asChild size="lg" className="group h-14 pl-7 pr-5 text-base">
              <AppointmentLink
                href={buildAppointmentUrl({ serviceId: "invisalign", source: "itero_page" })}
                source="itero"
                ctaType="appointment"
                serviceId="itero-digital-scanner"
              >
                Request an Appointment
                <ArrowChip />
              </AppointmentLink>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-7 text-base">
              <Link href="/services/invisalign">Explore Invisalign</Link>
            </Button>
          </>
        }
        media={
          <div className="relative mx-auto w-full max-w-[34rem] py-3">
            <IteroScannerImage scan priority className="relative aspect-[5/4] rounded-3xl shadow-float ring-8 ring-white" />
            <div aria-hidden="true" className="absolute -right-2 -top-3 z-[2] size-20 sm:-right-7 sm:-top-6 sm:size-24">
              <Pinwheel gather="load" delay={1450} className="size-full" />
            </div>
            <Sticker dot="bg-lime" className="-left-1 top-[14%] sm:-left-6" delay={1500}>
              No messy putty
            </Sticker>
            <Sticker dot="bg-periwinkle" className="-right-1 bottom-[12%] sm:-right-6" delay={1650}>
              Usually a few minutes
            </Sticker>
          </div>
        }
      />

      {/* ------------------------------------------------- What + compare */}
      <Section labelledBy="itero-what-heading">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16">
          <div className="min-w-0">
            <SectionHeader id="itero-what-heading" eyebrow="The basics" title={iteroContent.whatIs.heading} lead={iteroContent.whatIs.body} />
            <p className="ff-reveal mt-6 text-base leading-relaxed text-ink-soft">
              Here’s how it compares with the putty-filled trays many of us remember.
            </p>
          </div>
          <PuttyVsScan className="min-w-0" />
        </div>
      </Section>

      {/* ------------------------------------------------------------ Bento */}
      <Section tone="cream" labelledBy="itero-why-heading">
        <SectionHeader id="itero-why-heading" eyebrow="Why it matters" title={iteroContent.whyUse.heading} />
        <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[auto_auto] lg:gap-5">
          {comfort ? (
            <li className="ff-reveal relative flex min-h-56 flex-col justify-between overflow-clip rounded-3xl bg-periwinkle-wash p-7 md:col-span-2 sm:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-cobalt-deep">01 · Comfort</p>
              <p className="relative mt-10 max-w-md pr-16 font-display text-2xl font-semibold leading-snug text-ink sm:pr-0 sm:text-[2rem]">{comfort}</p>
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-5 right-4 flex h-20 items-end gap-1.5 sm:right-10 sm:h-36 sm:gap-2">
                <ToothPerson color="var(--ff-periwinkle)" className="h-full w-auto -rotate-[6deg]" />
                <ToothPerson color="var(--ff-lime)" className="h-[70%] w-auto rotate-[8deg]" />
              </div>
            </li>
          ) : null}
          {detail ? (
            <li
              className="ff-reveal relative flex min-h-80 flex-col overflow-clip rounded-3xl bg-night p-7 text-white md:row-span-2 sm:p-9"
              style={{ "--i": 1 } as CSSProperties}
            >
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-periwinkle">02 · Detail</p>
              <p className="relative z-[1] mt-6 font-display text-2xl font-semibold leading-snug text-white sm:text-[1.75rem]">{detail}</p>
              <div className="relative -mx-7 -mb-7 mt-8 flex-1 sm:-mx-9 sm:-mb-9">
                <div className="relative h-full min-h-56 overflow-clip">
                  <Image
                    src={illustrationDigitalScan}
                    alt=""
                    fill
                    quality={65}
                    sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1023px) 45vw, 400px"
                    className="ff-parallax scale-[1.25] object-cover object-[76%_55%]"
                    style={{ "--ff-parallax": "-6%" } as CSSProperties}
                  />
                </div>
              </div>
            </li>
          ) : null}
          {retakes ? (
            <li className="ff-reveal relative flex min-h-44 flex-col justify-between rounded-3xl bg-lime-wash p-7 sm:min-h-56 sm:p-8" style={{ "--i": 2 } as CSSProperties}>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">03 · Fewer redos</p>
              <p className="mt-8 font-display text-xl font-semibold leading-snug text-ink sm:text-2xl">{retakes}</p>
            </li>
          ) : null}
          {visuals ? (
            <li className="ff-reveal relative flex min-h-44 flex-col justify-between rounded-3xl bg-blush-wash p-7 sm:min-h-56 sm:p-8" style={{ "--i": 3 } as CSSProperties}>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">04 · Clarity</p>
              <p className="mt-8 font-display text-xl font-semibold leading-snug text-ink sm:text-2xl">{visuals}</p>
            </li>
          ) : null}
        </ul>
      </Section>

      {/* ------------------------------------------------------- Timeline */}
      <Section labelledBy="itero-expect-heading">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
          <SectionHeader
            id="itero-expect-heading"
            eyebrow="Your scan visit"
            title={
              <>
                What to expect at your <em className="ff-italic font-normal">scan appointment</em>
              </>
            }
          />
          <p className="ff-reveal ff-lead max-w-xl lg:justify-self-end">
            No pressure to decide on the spot. You’ll see your scan, ask questions, and choose your next step.
          </p>
        </div>
        <div className="mt-14">
          <StepTimeline steps={steps} />
        </div>
      </Section>

      {/* ------------------------------------------------------------- FAQs */}
      <Section tone="periwinkle" labelledBy="itero-faq-heading">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeader
              id="itero-faq-heading"
              eyebrow="Good questions"
              title="iTero scanner FAQs"
              lead="Answers to common questions about digital impressions and iTero scans."
            />
          </div>
          <div className="ff-reveal">
            <PatientInfoFaqList faqs={faqItems} />
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------- Related */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:[&>section>.grid]:grid-cols-4">
        <RelatedLinksSection title="Related services & resources" links={relatedLinks} />
        <p className="mt-12 text-center text-xs text-ink-soft">{iteroContent.trademarkNote}</p>
      </div>

      {/* ---------------------------------------------------------- Closing */}
      <CtaBand
        id="itero-cta-heading"
        title={
          <>
            See your smile in 3D, <em className="ff-italic font-normal text-lime">no putty required</em>
          </>
        }
        body="Schedule your visit to experience comfortable, precise digital impressions."
        actions={
          <>
            <Button asChild size="lg" variant="night" className="group h-14 pl-7 pr-5 text-base">
              <AppointmentLink
                href={buildAppointmentUrl({ serviceId: "invisalign", source: "itero_page" })}
                source="itero"
                ctaType="appointment"
                serviceId="itero-digital-scanner"
              >
                Book Your Appointment
                <ArrowChip tone="night" />
              </AppointmentLink>
            </Button>
            <FinalCtaPhoneLink location="itero_page_final" serviceId="itero-digital-scanner">
              or call (408) 358-8100
            </FinalCtaPhoneLink>
          </>
        }
        note={<>{practiceHoursSummary} · 15251 National Ave, Suite 102, Los Gatos</>}
      />
    </div>
  );
}
