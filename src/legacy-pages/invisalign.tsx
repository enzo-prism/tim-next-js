import type { CSSProperties } from "react";
import Image from "next/image";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { services } from "@/data/services";
import { googleBusinessProfileUrl } from "@/data/reviews";
import { testimonialSections } from "@/content/testimonials";
import { practiceHoursSummary } from "@/content/practice-hours";
import { buildAppointmentUrl } from "@/lib/analytics";
import { AppointmentLink, PhoneLink, TrackedExternalLink } from "@/components/tracking/tracked-links";
import { FinalCtaPhoneLink } from "@/components/service-growth/final-cta-phone-link";
import { invisalignContent } from "@shared/marketing-pages";
import illustrationDigitalScan from "@assets/brand/illustration-digital-scan.webp";
import RelatedLinksSection from "@/components/navigation/RelatedLinksSection";
import PatientInfoFaqList from "@/components/patient-info/patient-info-faq-list";
import { ToothPerson } from "@/components/brand/pinwheel";
import { Squiggle } from "@/components/brand/squiggle";
import { PageHero } from "@/components/site/page-hero";
import { Section, SectionHeader } from "@/components/site/section";
import { StepTimeline } from "@/components/site/step-timeline";
import { CtaBand } from "@/components/site/cta-band";
import { Stars } from "@/components/site/stars";
import { AlignerShowcase } from "@/components/features/aligner-showcase";
import { ToothDiagram, concernFor } from "@/components/features/tooth-diagrams";
import { ArrowChip, DrawnCheck, EyebrowHeading, brandDot, typeset } from "@/components/features/feature-bits";
import type { RelatedLink } from "@/lib/internal-links";

const relatedLinks: RelatedLink[] = [
  {
    href: "/technology/itero-digital-scanner",
    title: "iTero Digital Scanner",
    description: "Comfortable 3D digital scans that support Invisalign planning and smile previews.",
  },
  {
    href: "/services/restorative-dentistry",
    title: "Restorative Dentistry",
    description: "Repair and restore damaged teeth with durable, natural-looking solutions.",
  },
  {
    href: "/services/teeth-whitening",
    title: "Teeth Whitening",
    description: "Professional whitening options for a brighter, more confident smile.",
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
    description: "Book a consultation, ask a question, or get directions to our office.",
  },
];

const faqs = invisalignContent.faqs;
const faqItems = faqs.map((faq, index) => ({ id: `invisalign-faq-${index + 1}`, question: faq.question, answer: typeset(faq.answer) }));

// Built from the Invisalign and iTero content: scan, plan and preview, wear, keep.
const journey = [
  {
    title: "Scan",
    body: "A quick iTero 3D scan instead of messy impression putty. Most patients find it easier, and we can pause at any time.",
  },
  {
    title: "Plan & preview",
    body: "We plan your case from the scan and, in many cases, show you a simulation of potential changes. Previews are a planning tool, not a guarantee.",
  },
  {
    title: "Wear your trays",
    body: "Custom clear aligners, worn most of the day and night, with exact wear instructions and regular progress check-ups.",
  },
  {
    title: "Keep your new smile",
    body: "Retainers help maintain your results. We review retainer options and long-term care when treatment is complete.",
  },
];

const jinny = testimonialSections.flatMap((section) => section.reviews).find((review) => review.name === "Jinny");

/** Splits "Mild to moderate bite issues (your doctor will confirm …)" into a title and a note. */
function splitNote(text: string) {
  const match = text.match(/^(.*?)\s*\((.+)\)\s*$/);
  if (!match) return { title: text, note: null };
  const note = match[2].charAt(0).toUpperCase() + match[2].slice(1);
  return { title: match[1], note: `${note}.` };
}

/** Underlines "just 7 trays" inside Jinny's review when present. */
function JinnyQuote({ quote }: { quote: string }) {
  const phrase = "just 7 trays";
  const at = quote.indexOf(phrase);
  if (at < 0) return <>“{quote}”</>;
  return (
    <>
      “{quote.slice(0, at)}
      <Squiggle color="var(--ff-blush)">{phrase}</Squiggle>
      {quote.slice(at + phrase.length)}”
    </>
  );
}

const helpSpans = ["lg:col-span-7", "lg:col-span-5", "lg:col-span-5", "lg:col-span-7"];
const helpWashes = ["bg-blush-wash", "bg-periwinkle-wash", "bg-lime-wash", "bg-cloud-wash"];

export default function Invisalign() {
  const service = services
    .flatMap((item) => [item, ...(item.subServices || [])])
    .find((item) => item.id === "invisalign");

  const details = service?.details ?? [];
  const benefits = service?.benefits ?? [];

  return (
    <div className="overflow-x-clip">
      {/* ------------------------------------------------------------ Hero */}
      <PageHero
        id="invisalign-heading"
        tone="blush"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: "Invisalign" },
        ]}
        eyebrow="Clear aligners"
        titleText={invisalignContent.hero.title}
        lead={typeset(invisalignContent.hero.subtitle)}
        actions={
          <>
            <Button asChild size="lg" className="group h-14 pl-7 pr-5 text-base">
              <AppointmentLink
                href={buildAppointmentUrl({ serviceId: "invisalign", source: "invisalign_hero" })}
                source="invisalign_hero"
                ctaType="service_hero"
                serviceId="invisalign"
              >
                Request an Appointment
                <ArrowChip />
              </AppointmentLink>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-7 text-base">
              <PhoneLink location="invisalign_hero" serviceId="invisalign">
                Call (408) 358-8100
              </PhoneLink>
            </Button>
          </>
        }
        meta={
          jinny ? (
            <a
              href="#invisalign-review"
              className="group inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Stars className="text-base" />
              <span className="underline decoration-ink/20 underline-offset-4 transition-colors group-hover:decoration-cobalt">
                {jinny.rating} out of 5 · Invisalign review from {jinny.name}
              </span>
            </a>
          ) : null
        }
        media={<AlignerShowcase />}
      />

      {/* ----------------------------------------------------------- About */}
      <Section labelledBy="about-invisalign-heading">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-16">
          <div>
            <SectionHeader
              id="about-invisalign-heading"
              eyebrow="About Invisalign"
              title={
                <>
                  Clear, removable, and <em className="ff-italic font-normal">made for you</em>
                </>
              }
              lead={service?.longDescription}
            />
            {benefits.length ? (
              <ul aria-label="Benefits of Invisalign" className="ff-reveal mt-8 flex flex-wrap gap-2.5" style={{ "--i": 1 } as CSSProperties}>
                {benefits.map((benefit, index) => (
                  <li
                    key={benefit}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink ring-1 ring-border"
                  >
                    <span aria-hidden="true" className={`size-2.5 rounded-full ${brandDot[index % brandDot.length]}`} />
                    {benefit}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {details.length ? (
            <div className="ff-reveal-scale relative rounded-3xl bg-white p-7 ring-1 ring-border sm:p-9">
              <ToothPerson
                color="var(--ff-periwinkle)"
                className="pointer-events-none absolute -right-2 -top-10 h-20 w-auto rotate-[8deg] sm:-right-4 sm:h-24"
              />
              <h3 className="ff-h3">What’s included</h3>
              <ul className="mt-6 divide-y divide-border">
                {details.map((detail, index) => (
                  <li key={detail} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                    <DrawnCheck tone={index % 2 ? "blush" : "lime"} />
                    <span className="pt-1 text-[1.0625rem] leading-relaxed text-ink">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Section>

      {/* -------------------------------------------------------- Help with */}
      <Section tone="cream" labelledBy="invisalign-help-heading">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
          <SectionHeader
            id="invisalign-help-heading"
            eyebrow="Is it right for me?"
            title={
              <>
                What Invisalign <em className="ff-italic font-normal">can help with</em>
              </>
            }
          />
          <p className="ff-reveal ff-lead max-w-xl lg:justify-self-end">
            Many everyday alignment concerns are a good fit. Your exam and scan tell us whether Invisalign is the right choice for you.
          </p>
        </div>
        <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-5">
          {invisalignContent.whatCanHelp.bullets.map((item, index) => {
            const { title, note } = splitNote(item);
            return (
              <li
                key={item}
                className={`ff-reveal group flex flex-col overflow-clip rounded-3xl bg-white ring-1 ring-border ${helpSpans[index % helpSpans.length]}`}
                style={{ "--i": index % 2 } as CSSProperties}
              >
                <div className={`grid h-36 place-items-center sm:h-48 ${helpWashes[index % helpWashes.length]}`}>
                  <ToothDiagram concern={concernFor(item)} />
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">0{index + 1}</p>
                  <h3 className="ff-h3 mt-2">{title}</h3>
                  {note ? <p className="mt-2 text-sm leading-relaxed text-ink-soft">{note}</p> : null}
                </div>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* ---------------------------------------------------------- Journey */}
      <Section labelledBy="aligner-journey-heading">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
          <SectionHeader
            id="aligner-journey-heading"
            eyebrow="How it works"
            title={
              <>
                From first scan to a <Squiggle color="var(--ff-blush)">new smile</Squiggle>
              </>
            }
          />
          <p className="ff-reveal ff-lead max-w-xl lg:justify-self-end">
            Treatment time varies by complexity and goals. After your exam and scan, we’ll give you a personalized estimate.
          </p>
        </div>
        <div className="mt-14">
          <StepTimeline steps={journey} />
        </div>
      </Section>

      {/* ------------------------------------------------------------ iTero */}
      <Section tone="white" labelledBy="itero-invisalign-heading">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
          <div className="relative order-2 min-w-0 lg:order-1">
            <div className="ff-reveal-right relative aspect-[4/3] overflow-clip rounded-3xl bg-periwinkle-wash">
              <Image
                src={illustrationDigitalScan}
                alt="3D digital scan of a dental arch"
                fill
                quality={70}
                sizes="(max-width: 1023px) calc(100vw - 2rem), 580px"
                className="ff-parallax scale-[1.12] object-cover object-[80%_50%]"
                style={{ "--ff-parallax": "-4%" } as CSSProperties}
              />
            </div>
            <div
              className="ff-reveal-pop absolute -bottom-6 left-4 right-4 rounded-2xl bg-white p-4 shadow-float ring-1 ring-border sm:left-auto sm:right-6 sm:w-72 sm:p-5"
              style={{ "--i": 1 } as CSSProperties}
            >
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-cobalt">Results vary</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{invisalignContent.iteroSection.disclaimer}</p>
            </div>
          </div>
          <div className="order-1 min-w-0 lg:order-2">
            <SectionHeader id="itero-invisalign-heading" eyebrow="Digital scans" title={invisalignContent.iteroSection.heading} />
            <div className="ff-reveal mt-6 space-y-4 text-lg leading-relaxed text-ink-soft">
              {invisalignContent.iteroSection.paragraphs.map((paragraph) => (
                <p key={paragraph}>{typeset(paragraph)}</p>
              ))}
            </div>
            <ul className="mt-8 space-y-3">
              {invisalignContent.iteroSection.bullets.map((item, index) => (
                <li key={item} className="ff-reveal flex items-start gap-3.5" style={{ "--i": index } as CSSProperties}>
                  <DrawnCheck tone="periwinkle" className="size-7" />
                  <span className="pt-0.5 text-base leading-relaxed text-ink">{item}</span>
                </li>
              ))}
            </ul>
            <div className="ff-reveal mt-9">
              <Button asChild size="lg" variant="outline" className="group">
                <Link href="/technology/itero-digital-scanner">
                  How our iTero scanner works
                  <span aria-hidden="true" className="ff-arrow">
                    <MinimalGlyph name="arrow-right" />
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------------- Review */}
      {jinny ? (
        <Section id="invisalign-review" tone="blush" labelledBy="invisalign-review-heading" className="overflow-clip">
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 right-8 hidden h-60 items-end gap-2 lg:flex">
            <ToothPerson color="var(--ff-blush)" className="h-full w-auto" />
            <ToothPerson color="var(--ff-periwinkle)" className="h-[72%] w-auto" />
          </div>
          <figure className="relative max-w-4xl">
            <EyebrowHeading id="invisalign-review-heading" className="ff-reveal">
              An Invisalign patient’s story
            </EyebrowHeading>
            <div className="ff-reveal mt-6 flex items-center gap-3" style={{ "--i": 1 } as CSSProperties}>
              <Stars className="text-xl" />
              <span className="text-sm font-bold text-ink">{jinny.rating}.0 Google review</span>
            </div>
            <blockquote
              className="ff-reveal mt-6 font-display text-[1.55rem] font-medium leading-[1.3] text-ink sm:text-[2rem] lg:text-[2.5rem] lg:leading-[1.22]"
              style={{ "--i": 2 } as CSSProperties}
            >
              <JinnyQuote quote={typeset(jinny.quote)} />
            </blockquote>
            <figcaption className="ff-reveal mt-9 flex flex-wrap items-center gap-x-6 gap-y-4" style={{ "--i": 3 } as CSSProperties}>
              <span className="flex items-center gap-3">
                <span aria-hidden="true" className="grid size-11 place-items-center rounded-full bg-blush font-display text-lg font-semibold text-ink">
                  {jinny.name.charAt(0)}
                </span>
                <span>
                  <span className="block font-bold text-ink">{jinny.name}</span>
                  <span className="block text-sm text-ink-soft">{jinny.patientLabel}</span>
                </span>
              </span>
              <TrackedExternalLink
                href={googleBusinessProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                kind="review"
                provider="google"
                location="reviews_section"
                className="ff-link text-sm"
              >
                Read more reviews on Google<span className="sr-only"> (opens in a new tab)</span>
              </TrackedExternalLink>
            </figcaption>
          </figure>
        </Section>
      ) : null}

      {/* ------------------------------------------------------------- FAQs */}
      <Section tone="cream" labelledBy="invisalign-faq-heading">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeader
              id="invisalign-faq-heading"
              eyebrow="Good questions"
              title="Invisalign & iTero FAQs"
              lead="Quick answers to common questions about Invisalign and iTero digital scans."
            />
            <p className="ff-reveal mt-8 text-sm text-ink-soft">
              Something else on your mind?{" "}
              <Link href="/contact" className="ff-link">
                Send us a question
              </Link>
            </p>
          </div>
          <div className="ff-reveal">
            <PatientInfoFaqList faqs={faqItems} />
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------- Related */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <RelatedLinksSection title="Related services & resources" links={relatedLinks} />
        <p className="mt-12 text-center text-xs text-ink-soft">{invisalignContent.trademarkNote}</p>
      </div>

      {/* ---------------------------------------------------------- Closing */}
      <CtaBand
        id="invisalign-cta-heading"
        title={
          <>
            Curious what Invisalign <em className="ff-italic font-normal text-lime">could do for you?</em>
          </>
        }
        body="Start with an exam and a quick 3D scan. We’ll talk through your goals, your options, and how long treatment might take."
        actions={
          <>
            <Button asChild size="lg" variant="night" className="group h-14 pl-7 pr-5 text-base">
              <AppointmentLink
                href={buildAppointmentUrl({ serviceId: "invisalign", source: "invisalign_page" })}
                source="invisalign"
                ctaType="consultation"
                serviceId="invisalign"
              >
                Book Your Appointment
                <ArrowChip tone="night" />
              </AppointmentLink>
            </Button>
            <FinalCtaPhoneLink location="invisalign_page_final" serviceId="invisalign">
              Call (408) 358-8100
            </FinalCtaPhoneLink>
          </>
        }
        note={<>{practiceHoursSummary} · 15251 National Ave, Suite 102, Los Gatos</>}
      />
    </div>
  );
}
