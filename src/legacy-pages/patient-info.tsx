import type { CSSProperties, ReactNode } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import PatientInfoFaqList from "@/components/patient-info/patient-info-faq-list";
import { AppointmentLink, PhoneLink } from "@/components/tracking/tracked-links";
import { PageHero } from "@/components/site/page-hero";
import { Eyebrow, Section, SectionHeader } from "@/components/site/section";
import { StepTimeline } from "@/components/site/step-timeline";
import { CtaBand } from "@/components/site/cta-band";
import { ToothPerson } from "@/components/brand/pinwheel";
import { Squiggle } from "@/components/brand/squiggle";
import { BrushingArt, FlossingArt, NutritionArt } from "@/components/guides/guide-art";
import { arrowChip, arrowChipNight } from "@/components/guides/guide-shared";
import { patientGuidanceFacts } from "@/content/patient-guidance";
import { buildAppointmentUrl } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const SOURCE = "patient_info";

const nextSteps = [
  {
    href: "/new-patients",
    title: "I'm new to the practice",
    description: "Prepare for your first visit, know what to ask, and plan your arrival.",
    tone: "bg-lime-wash",
    color: "var(--ff-lime)",
  },
  {
    href: "/insurance-and-payment",
    title: "I have cost or insurance questions",
    description: "Bring the right questions to the office and your insurer before your visit.",
    tone: "bg-periwinkle-wash",
    color: "var(--ff-periwinkle)",
  },
  {
    href: "/urgent-dental-care",
    title: "I need prompt dental attention",
    description: "Call about a time-sensitive concern and review regular office hours.",
    tone: "bg-blush-wash",
    color: "var(--ff-blush)",
  },
];

const guides: { href: string; title: string; description: string; cta: string; tone: string; art: ReactNode; badge?: string }[] = [
  {
    href: "/patient-info/brushing",
    title: "How to Brush Properly",
    description: "Learn the correct brushing technique to effectively remove plaque and maintain healthy teeth and gums.",
    cta: "Read the brushing guide",
    tone: "bg-cloud-wash",
    art: <BrushingArt />,
    badge: "Includes a 2-minute brush-along timer",
  },
  {
    href: "/patient-info/flossing",
    title: "Flossing Fundamentals",
    description: "Discover why flossing is essential and learn the proper technique for optimal gum health.",
    cta: "Read the flossing guide",
    tone: "bg-blush-wash",
    art: <FlossingArt />,
  },
  {
    href: "/patient-info/nutrition",
    title: "Nutrition for Healthy Teeth",
    description: "Understand how your diet affects your oral health and which foods promote strong teeth.",
    cta: "Read the nutrition guide",
    tone: "bg-lime-wash",
    art: <NutritionArt />,
  },
];

const popularServices = [
  { title: "Dental Exams", description: "Comprehensive checkups and early detection.", href: "/services/dental-exams" },
  { title: "Dental Hygiene", description: "Professional cleanings and gum health care.", href: "/services/dental-hygiene" },
  { title: "Children's Dentistry", description: "Gentle care for kids of all ages.", href: "/services/children-dentistry" },
  { title: "Baby's First Visit", description: "First visits for infants and toddlers.", href: "/services/childrens-dentistry/babys-first-visit" },
  { title: "Night Guards", description: "Protection for grinding and jaw tension.", href: "/services/night-guards" },
  { title: "TMJ Treatment", description: "Care for jaw pain and dysfunction.", href: "/tmj" },
];

const serviceDots = ["bg-periwinkle", "bg-blush", "bg-lime", "bg-cloud", "bg-periwinkle", "bg-blush"];

/** Hero media: the three guides fanned out like a little library shelf. */
function LibraryFan() {
  const cards = [
    { art: <FlossingArt />, tone: "bg-blush-wash", tilt: "-rotate-[8deg] -translate-x-[52%] translate-y-6", d: 360 },
    { art: <NutritionArt />, tone: "bg-lime-wash", tilt: "rotate-[8deg] translate-x-[52%] translate-y-6", d: 480 },
    { art: <BrushingArt />, tone: "bg-white", tilt: "", d: 240 },
  ];
  return (
    <div aria-hidden="true" className="relative mx-auto grid h-64 w-full max-w-md place-items-center sm:h-80">
      {cards.map((card, index) => (
        <div key={index} className={cn("absolute w-[46%] sm:w-[50%]", card.tilt)}>
          <div className={cn("ff-intro-pop aspect-[4/5] rounded-3xl p-4 shadow-float ring-1 ring-ink/5", card.tone)} style={{ "--d": card.d } as CSSProperties}>
            <div className="grid size-full place-items-center">{card.art}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PatientInfo() {
  return (
    <div className="overflow-x-clip">
      <PageHero
        id="patient-info-heading"
        tone="cream"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Patient Info" }]}
        eyebrow="Patient library"
        titleText="Patient Information"
        lead={<p>Everything you need for a smooth, comfortable dental visit, from first-visit prep and insurance questions to brushing tips the kids will actually enjoy.</p>}
        actions={
          <>
            <Button asChild size="lg" className="group h-14 pl-7 pr-5 text-base">
              <Link href="/new-patients">
                Plan your first visit
                {arrowChip}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-7 text-base">
              <PhoneLink location="patient_info_hero">Call {patientGuidanceFacts.phone.display}</PhoneLink>
            </Button>
          </>
        }
        meta={
          <p>
            <span className="font-semibold text-ink">Office hours:</span> {patientGuidanceFacts.hours}, Los Gatos time.
          </p>
        }
        media={<LibraryFan />}
      />

      {/* ------------------------------------------------ Next steps */}
      <Section labelledBy="visit-guides-heading">
        <SectionHeader id="visit-guides-heading" eyebrow="Quick paths" title="Start with your next step" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {nextSteps.map((step, index) => (
            <Link
              key={step.href}
              href={step.href}
              className={cn(
                "ff-reveal ff-lift group relative flex min-h-52 flex-col justify-between overflow-clip rounded-3xl p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:p-7",
                step.tone,
              )}
              style={{ "--i": index } as CSSProperties}
            >
              <ToothPerson
                color={step.color}
                className="pointer-events-none absolute -bottom-6 -right-3 h-28 w-auto rotate-[-8deg] transition-[rotate,translate] duration-500 ease-[var(--ease-spring)] group-hover:-translate-y-2 group-hover:rotate-[4deg] motion-reduce:transition-none"
              />
              <span className="relative block pr-12">
                <span className="block font-display text-2xl font-semibold leading-tight text-ink">{step.title}</span>
                <span className="mt-3 block max-w-[17rem] text-base leading-relaxed text-ink-soft">{step.description}</span>
              </span>
              <span aria-hidden="true" className="ff-arrow relative mt-6 grid size-10 place-items-center rounded-full bg-white text-ink ring-1 ring-ink/5 transition-colors group-hover:bg-ink group-hover:text-white">
                <MinimalGlyph name="arrow-right" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------ Guide library */}
      <Section tone="cream" labelledBy="education-heading">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
          <SectionHeader
            id="education-heading"
            eyebrow="Oral health education"
            title={
              <>
                Little guides for <Squiggle>healthy</Squiggle> smiles
              </>
            }
          />
          <p className="ff-reveal ff-lead max-w-xl lg:justify-self-end">
            Simple, friendly how-tos for the whole family. Read them together, then try them at the sink tonight.
          </p>
        </div>
        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {guides.map((guide, index) => (
            <li key={guide.href} className="ff-reveal" style={{ "--i": index } as CSSProperties}>
              <Link
                href={guide.href}
                className="ff-lift group flex h-full flex-col overflow-clip rounded-3xl bg-white ring-1 ring-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <span className={cn("relative block px-8 pb-4 pt-8", guide.tone)}>
                  <span className="block transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-translate-y-1 group-hover:scale-[1.03] motion-reduce:transition-none">
                    {guide.art}
                  </span>
                  {guide.badge ? (
                    <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold text-ink shadow-float">{guide.badge}</span>
                  ) : null}
                </span>
                <span className="flex flex-1 flex-col p-6 sm:p-7">
                  <span className="block font-display text-2xl font-semibold leading-tight text-ink">{guide.title}</span>
                  <span className="mt-3 block flex-1 text-base leading-relaxed text-ink-soft">{guide.description}</span>
                  <span className="mt-6 inline-flex items-center gap-2 font-semibold text-cobalt">
                    {guide.cta}
                    <span aria-hidden="true" className="ff-arrow">
                      <MinimalGlyph name="arrow-right" />
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* ------------------------------------------------ What to expect */}
      <Section labelledBy="expect-heading">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
          <SectionHeader
            id="expect-heading"
            eyebrow="Your visit"
            title="What to Expect"
            lead="Your comfort and understanding are our priorities. Here’s what you can expect during your visit."
          />
          <div className="ff-reveal lg:justify-self-end">
            <Link href="/new-patients" className="ff-link inline-flex min-h-11 items-center">
              Read the full new-patient guide
            </Link>
          </div>
        </div>
        <div className="mt-14">
          <StepTimeline
            steps={[
              { title: "Warm Welcome", body: "Our friendly staff will greet you and help you get settled." },
              { title: "Thorough Examination", body: "Dr. Chuang will perform a comprehensive exam and explain findings." },
              { title: "Personalized Plan", body: "We’ll create a treatment plan tailored to your needs and budget." },
              { title: "Comfortable Care", body: "Enjoy amenities like blankets, water, and entertainment during treatment." },
            ]}
          />
        </div>
      </Section>

      {/* ------------------------------------------------ Insurance + Santa Cruz */}
      <Section tone="periwinkle" labelledBy="insurance-panel-heading">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <div className="ff-reveal rounded-3xl bg-white p-7 ring-1 ring-ink/5 sm:p-10">
            <Eyebrow>Insurance &amp; payment</Eyebrow>
            <h2 id="insurance-panel-heading" className="ff-h2 mt-4 max-w-xl">
              Questions about cost? <em className="ff-italic font-normal">Call first.</em>
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
              Insurance participation, benefits, and payment options can vary. Call our office before your visit so we can review the details you provide and explain the next step.
            </p>
            <dl className="mt-8 grid gap-6 border-t border-border pt-6 sm:grid-cols-2">
              <div>
                <dt className="font-bold text-ink">Insurance Questions</dt>
                <dd className="mt-1.5 text-base leading-relaxed text-ink-soft">
                  Have your plan name and member information ready when you call. Coverage and benefits are determined by your insurer and specific plan.
                </dd>
              </div>
              <div>
                <dt className="font-bold text-ink">Payment Questions</dt>
                <dd className="mt-1.5 text-base leading-relaxed text-ink-soft">Call the office to ask about current payment methods and options for your proposed care.</dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button asChild size="lg" className="h-13">
                <PhoneLink location="patient_info_insurance">Call {patientGuidanceFacts.phone.display}</PhoneLink>
              </Button>
              <Link href="/insurance-and-payment" className="ff-link inline-flex min-h-11 items-center sm:px-3">
                Questions to ask about insurance &amp; payment
              </Link>
            </div>
          </div>
          <div className="ff-reveal relative flex flex-col overflow-clip rounded-3xl bg-night p-7 text-white sm:p-9" style={{ "--i": 1 } as CSSProperties}>
            <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-periwinkle">Highway 17</span>
            <h3 className="ff-h3 mt-5 text-white">Coming from Santa Cruz?</h3>
            <p className="mt-3 text-base leading-relaxed text-white/75">
              Many Santa Cruz families are happy to come over Highway 17 for care here. If you have insurance questions, call ahead with your plan details before you make the trip.
            </p>
            <Link href="/areas-we-serve/santa-cruz" className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 rounded-sm font-semibold text-lime underline decoration-lime/40 underline-offset-4 hover:decoration-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              See Santa Cruz visit details
            </Link>
            <div aria-hidden="true" className="mt-auto flex items-end justify-end gap-2 pt-8">
              <ToothPerson color="var(--ff-periwinkle)" className="h-24 w-auto" />
              <ToothPerson color="var(--ff-blush)" className="h-20 w-auto" />
              <ToothPerson color="var(--ff-lime)" className="h-14 w-auto" />
            </div>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------ Popular appointments */}
      <Section labelledBy="popular-heading">
        <SectionHeader id="popular-heading" eyebrow="Services" title="Popular Appointments" lead="Quick links to the services patients ask for most." />
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {popularServices.map((service, index) => (
            <li key={service.href} className="ff-reveal" style={{ "--i": index % 3 } as CSSProperties}>
              <Link
                href={service.href}
                className="ff-lift group flex h-full items-center gap-4 rounded-2xl border border-border bg-white p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <span aria-hidden="true" className={cn("size-3.5 shrink-0 rounded-full ring-4 ring-paper", serviceDots[index])} />
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-ink">{service.title}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-ink-soft">{service.description}</span>
                </span>
                <span aria-hidden="true" className="ff-arrow grid size-9 shrink-0 place-items-center rounded-full bg-cream text-ink transition-colors group-hover:bg-ink group-hover:text-white">
                  <MinimalGlyph name="arrow-right" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* ------------------------------------------------ FAQ */}
      <Section tone="cream" labelledBy="faq-heading">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeader
              id="faq-heading"
              eyebrow="Good questions"
              title="Frequently Asked Questions"
              lead="Quick answers to what families ask us most. Still wondering about something? Give us a call."
            />
          </div>
          <div className="ff-reveal">
            <PatientInfoFaqList />
          </div>
        </div>
      </Section>

      <CtaBand
        id="patient-info-cta-heading"
        title={
          <>
            Ready when you are, <em className="ff-italic font-normal text-lime">whole family included.</em>
          </>
        }
        body="Send a visit request and our team will reach out during office hours to find a time that works."
        actions={
          <>
            <Button asChild size="lg" variant="night" className="group h-14 pl-7 pr-5 text-base">
              <AppointmentLink href={buildAppointmentUrl({ source: SOURCE })} source={SOURCE}>
                Request a visit
                {arrowChipNight}
              </AppointmentLink>
            </Button>
            <Button asChild size="lg" variant="night-outline" className="h-14 px-7 text-base">
              <PhoneLink location="patient_info_final_cta">Call {patientGuidanceFacts.phone.display}</PhoneLink>
            </Button>
          </>
        }
        note={<>{patientGuidanceFacts.hours}, Los Gatos time · 15251 National Ave, Suite 102, Los Gatos</>}
      />
    </div>
  );
}
