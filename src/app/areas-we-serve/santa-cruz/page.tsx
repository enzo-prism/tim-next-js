import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PracticeAddressLink from "@/components/location/PracticeAddressLink";
import RelatedLinksSection from "@/components/navigation/RelatedLinksSection";
import PatientInfoFaqList from "@/components/patient-info/patient-info-faq-list";
import { Button } from "@/components/ui/button";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { AppointmentLink, PhoneLink, TrackedExternalLink } from "@/components/tracking/tracked-links";
import { PageHero } from "@/components/site/page-hero";
import { Section, SectionHeader } from "@/components/site/section";
import { CtaBand } from "@/components/site/cta-band";
import { ReviewCard } from "@/components/site/review-rows";
import { Stars } from "@/components/site/stars";
import { SantaCruzRoute } from "@/components/guides/santa-cruz-route";
import { arrowChip, arrowChipNight } from "@/components/guides/guide-shared";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  practiceInfo,
} from "@/content/structured-data";
import {
  testimonialsPageSummary,
  testimonialSections,
  type TestimonialExcerpt,
} from "@/content/testimonials";
import { practiceHoursSummary } from "@/content/practice-hours";
import { buildRouteMetadata } from "@/lib/metadata";
import { buildAppointmentUrl } from "@/lib/analytics";
import type { RelatedLink } from "@/lib/internal-links";
import storefrontPhoto from "@assets/Office Photo 11_1753972057108.jpg";

export const metadata: Metadata = buildRouteMetadata("/areas-we-serve/santa-cruz");

const faqs = [
  {
    question: "Is your dental office located in Santa Cruz?",
    answer:
      "No. Family First Smile Care is physically located in Los Gatos at 15251 National Ave, Suite 102. This page is for Santa Cruz patients who are considering the trip over Highway 17 for gentle family dentistry.",
  },
  {
    question: "Do you accept insurance if I live in Santa Cruz?",
    answer:
      "Insurance participation and benefits depend on the specific plan. Call our office before your visit and we can help you understand what information to confirm with your insurer.",
  },
  {
    question: "Is it worth driving from Santa Cruz to Los Gatos for a family dentist?",
    answer:
      "For many families, yes. Patients who want gentle care, family dentistry, and clear explanations are often happy to make the trip to our Los Gatos office, especially because we are just off Highway 17.",
  },
  {
    question: "Do you see children and adults?",
    answer:
      "Yes. Family First Smile Care provides care for children, teens, adults, and grandparents, from first visits and preventive cleanings to Invisalign, night guards, and restorative care.",
  },
  {
    question: "How do I verify my PPO benefits before booking?",
    answer:
      "Call our office before booking. We can review the plan information you provide and help you identify questions to confirm with your insurer. Coverage is always determined by the plan.",
  },
] as const;

const reasons = [
  "Gentle family dentistry for children, parents, and grandparents",
  "Help with plan-specific insurance questions before the visit",
  "Clear treatment recommendations without a rushed experience",
  "Modern technology that supports precise, comfortable care",
] as const;

const relatedLinks: RelatedLink[] = [
  {
    href: "/services/family-dentistry",
    title: "Family Dentistry",
    description: "See how we care for children, parents, and grandparents under one roof.",
  },
  {
    href: "/patient-info",
    title: "Patient Information",
    description: "Review insurance details, FAQs, and what to expect before your first visit.",
  },
  {
    href: "/testimonials",
    title: "Patient Reviews",
    description: "Read what families say about gentle care, clear explanations, and kid-friendly visits.",
  },
  {
    href: "/contact",
    title: "Contact & Directions",
    description: "Ask a question, verify benefits, or get directions to our Los Gatos office.",
  },
  {
    href: "/about",
    title: "About Our Office",
    description: "Get to know the practice and take a closer look at our office environment.",
  },
  {
    href: "/book-appointment",
    title: "Book an Appointment",
    description: "Request a visit when you are ready to make the trip from Santa Cruz.",
  },
];

const tripStops = [
  {
    title: "Just off Highway 17",
    body: "Easy over-the-hill access without weaving through local streets after you exit.",
    dot: "bg-blush",
  },
  {
    title: "Los Gatos address",
    body: "Visits happen at 15251 National Ave, Suite 102, not at a Santa Cruz office.",
    dot: "bg-lime",
  },
  {
    title: "Calm check-in",
    body: "Friendly staff and organized visits help the drive feel worthwhile from the start.",
    dot: "bg-periwinkle",
  },
];

const pageUrl = `${practiceInfo.url}/areas-we-serve/santa-cruz`;

const santaCruzReviewHighlights = [
  testimonialSections.find((section) => section.id === "family-dentistry")?.reviews[0],
  testimonialSections.find((section) => section.id === "gentle-care")?.reviews[0],
  testimonialSections.find((section) => section.id === "new-patients")?.reviews[0],
].filter((review): review is TestimonialExcerpt => Boolean(review));

export default function SantaCruzServiceAreaPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", item: practiceInfo.url },
    { name: "Santa Cruz Families", item: pageUrl },
  ]);
  const faqSchema = buildFaqSchema(faqs);

  return (
    <div className="overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
        }}
      />

      {/* ------------------------------------------------ Hero */}
      <PageHero
        id="santa-cruz-heading"
        tone="periwinkle"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Santa Cruz Families" }]}
        eyebrow="Los Gatos office serving Santa Cruz patients"
        titleText="Los Gatos family dentist serving Santa Cruz patients over Highway 17."
        lead={
          <>
            <p>
              Family First Smile Care is physically located in Los Gatos, not Santa Cruz. We welcome Santa Cruz patients who want gentle,
              family-focused dentistry and clear answers before a visit.
            </p>
            <p className="mt-4 text-base sm:text-lg">
              Whether you are looking for a child-friendly first visit, a new long-term dental home, or a team that explains options
              without rushing, many patients are happy to come over the hill to our Los Gatos office.
            </p>
          </>
        }
        actions={
          <>
            <Button asChild size="lg" className="group h-14 pl-7 pr-5 text-base">
              <AppointmentLink href={buildAppointmentUrl({ source: "santa_cruz_hero" })} source="santa_cruz_hero">
                Request an appointment
                {arrowChip}
              </AppointmentLink>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-7 text-base">
              <Link href="/contact">Ask an insurance question</Link>
            </Button>
          </>
        }
        media={
          <figure className="relative mx-auto w-full max-w-[22rem] sm:max-w-[25rem] lg:mr-0">
            <div className="ff-arch relative aspect-[4/5] bg-white ring-8 ring-white">
              <Image
                src={storefrontPhoto}
                alt="The Family First Smile Care storefront in Los Gatos, with the logo and Tim J. Chuang, DDS on the glass"
                fill
                priority
                sizes="(max-width: 1023px) 80vw, 400px"
                quality={72}
                className="object-cover object-[45%_50%]"
              />
            </div>
            <span className="ff-chip ff-intro-pop absolute -left-3 top-[18%] sm:-left-8" style={{ "--d": 820 } as CSSProperties}>
              <span aria-hidden="true" className="size-2.5 rounded-full bg-lime ring-2 ring-ink/10" />
              Easy Highway 17 access
            </span>
            <figcaption
              className="ff-intro relative z-[1] mx-auto -mt-10 w-[90%] rounded-2xl bg-white px-5 py-4 shadow-float ring-1 ring-border"
              style={{ "--d": 700 } as CSSProperties}
            >
              <span className="block text-[0.7rem] font-bold uppercase tracking-[0.14em] text-cobalt-deep">Where you’ll visit</span>
              <span className="mt-1 block text-base font-semibold leading-snug text-ink">
                Office address: 15251 National Ave, Suite 102, Los Gatos, CA.
              </span>
            </figcaption>
          </figure>
        }
      />

      {/* ------------------------------------------------ The drive (signature) */}
      <Section labelledBy="santa-cruz-drive-heading">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <div>
            <SectionHeader
              id="santa-cruz-drive-heading"
              eyebrow="Travel convenience matters"
              title="Simple access from Highway 17 to our Los Gatos office"
              lead="Our dental office is in Los Gatos, just off Highway 17, which makes the drive easier for many Santa Cruz patients. We offer a welcoming office and a team that helps visits feel organized from the moment you arrive."
            />
            <ol className="mt-10 space-y-5">
              {tripStops.map((stop, index) => (
                <li key={stop.title} className="ff-reveal flex gap-4" style={{ "--i": index } as CSSProperties}>
                  <span aria-hidden="true" className={`mt-1 grid size-9 shrink-0 place-items-center rounded-full font-display text-base font-semibold text-ink ring-4 ring-white ${stop.dot}`}>
                    {index + 1}
                  </span>
                  <span>
                    <span className="block text-lg font-bold text-ink">{stop.title}</span>
                    <span className="mt-1 block text-base leading-relaxed text-ink-soft">{stop.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="ff-reveal-scale rounded-3xl bg-periwinkle-wash p-3 ring-1 ring-ink/5 sm:p-5">
            <SantaCruzRoute className="overflow-clip rounded-2xl" />
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------ Why families choose us */}
      <Section tone="cream" labelledBy="santa-cruz-why-heading">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div>
            <SectionHeader id="santa-cruz-why-heading" eyebrow="Worth the drive" title="Why Santa Cruz families choose our Los Gatos office" />
            <div className="ff-reveal mt-8 max-w-2xl space-y-5 text-lg leading-relaxed text-ink-soft">
              <p>
                Many patients are not just looking for the closest office. They are looking for a family dentist who feels thorough,
                calm, and easy to trust. That is especially true for parents booking visits for children, adults with dental anxiety, or
                families trying to keep preventive care consistent.
              </p>
              <p>
                Family First Smile Care is built around gentle care, clear explanations, and a warm office experience. Patients often
                choose us because they want one office for routine cleanings, children&apos;s dentistry, Invisalign consultations, night
                guards, and restorative care without feeling like they need to start over somewhere else every time a new need comes up.
              </p>
              <p>
                For Santa Cruz families, that combination of family-focused care and easy Highway 17 access makes a Los Gatos visit feel
                practical as well as worthwhile. If you have insurance questions before you book, call our team and we can help you
                identify the details to confirm with your plan.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <article className="ff-reveal rounded-3xl bg-white p-6 ring-1 ring-ink/5 sm:p-7">
                <h3 className="font-display text-xl font-semibold text-ink">Insurance support before you visit</h3>
                <p className="mt-3 text-base leading-relaxed text-ink-soft">
                  Insurance participation and benefits vary by plan. Call before booking and our team can review the information you
                  provide and help you identify what to confirm with your insurer.
                </p>
              </article>
              <article className="ff-reveal rounded-3xl bg-white p-6 ring-1 ring-ink/5 sm:p-7" style={{ "--i": 1 } as CSSProperties}>
                <h3 className="font-display text-xl font-semibold text-ink">Care for the whole family</h3>
                <p className="mt-3 text-base leading-relaxed text-ink-soft">
                  Santa Cruz families often come to us for one office that can care for kids, adults, and nervous first-timers alike. Our
                  practice emphasizes gentle visits, child-friendly care, clear communication, and long-term relationships.
                </p>
              </article>
            </div>
          </div>

          <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <aside aria-labelledby="santa-cruz-reasons-heading" className="ff-reveal rounded-3xl bg-lime-wash p-7 sm:p-8">
              <h2 id="santa-cruz-reasons-heading" className="ff-h3">
                Why families make the trip
              </h2>
              <ul className="mt-6 space-y-4">
                {reasons.map((reason) => (
                  <li key={reason} className="flex gap-3 text-base leading-relaxed text-ink">
                    <span aria-hidden="true" className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-white text-xs text-cobalt ring-1 ring-ink/10">
                      <MinimalGlyph name="check" />
                    </span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </aside>
            <aside aria-labelledby="santa-cruz-details-heading" className="ff-reveal rounded-3xl bg-white p-7 ring-1 ring-ink/5 sm:p-8" style={{ "--i": 1 } as CSSProperties}>
              <h2 id="santa-cruz-details-heading" className="text-xs font-bold uppercase tracking-[0.14em] text-cobalt-deep">
                Quick office details
              </h2>
              <dl className="mt-5 space-y-4 text-base leading-relaxed">
                <div>
                  <dt className="font-bold text-ink">Office address</dt>
                  <dd className="text-ink-soft">
                    <PracticeAddressLink className="text-inherit hover:text-cobalt">
                      {practiceInfo.addressText}
                    </PracticeAddressLink>
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-ink">Access</dt>
                  <dd className="text-ink-soft">Convenient for patients coming over Highway 17 from Santa Cruz to Los Gatos.</dd>
                </div>
                <div>
                  <dt className="font-bold text-ink">Insurance help</dt>
                  <dd className="text-ink-soft">Call ahead with your plan details and questions. Coverage is determined by your insurer.</dd>
                </div>
              </dl>
              <Button asChild size="lg" className="mt-7 w-full">
                <TrackedExternalLink
                  href={practiceInfo.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  kind="map"
                  location="santa_cruz_office_details"
                >
                  Open in Google Maps
                  <span className="sr-only"> (opens in a new tab)</span>
                </TrackedExternalLink>
              </Button>
            </aside>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------ Reviews */}
      <Section tone="periwinkle" labelledBy="santa-cruz-reviews-heading">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.75fr)] lg:gap-14">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeader
              id="santa-cruz-reviews-heading"
              eyebrow="Reviews and testimonials"
              title="Real reviews from families who chose care they could trust"
              lead="These excerpts come from publicly posted Google reviews and reflect the same qualities Santa Cruz families often ask about before booking."
            />
            <div className="ff-reveal mt-8 rounded-3xl bg-white p-6 ring-1 ring-border">
              <p className="font-display text-6xl font-semibold leading-none text-ink">
                {testimonialsPageSummary.averageRating}
                <span className="ml-2 font-sans text-sm font-semibold text-ink-soft">out of 5</span>
              </p>
              <Stars className="mt-3 text-xl" />
              <p className="mt-2 text-sm font-semibold text-ink-soft">{testimonialsPageSummary.reviewCountLabel}</p>
              <p className="mt-1 text-xs text-ink-soft">{testimonialsPageSummary.verifiedAtLabel}</p>
            </div>
            <div className="ff-reveal mt-6 flex flex-col items-start gap-3">
              <Button asChild>
                <Link href="/testimonials">View all testimonials</Link>
              </Button>
              <TrackedExternalLink
                href={testimonialsPageSummary.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                kind="review"
                provider="google"
                location="santa_cruz_reviews"
                className="ff-link inline-flex min-h-11 items-center text-sm"
              >
                Read Google reviews<span className="sr-only"> (opens in a new tab)</span>
              </TrackedExternalLink>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {santaCruzReviewHighlights.map((review, index) => (
              <div
                key={`${review.name}-${review.patientLabel}`}
                className={`ff-straighten ${index === 0 ? "md:col-span-2" : ""}`}
                style={{ "--i": index, "--ff-tilt": index % 2 ? "3deg" : "-3deg" } as CSSProperties}
              >
                <ReviewCard
                  review={{ name: review.name, quote: review.quote, label: review.patientLabel }}
                  index={index}
                  size={index === 0 ? "lg" : "md"}
                />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------ FAQ */}
      <Section labelledBy="santa-cruz-faq-heading">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeader id="santa-cruz-faq-heading" eyebrow="Good questions" title="Frequently asked by Santa Cruz patients" />
          </div>
          <div className="ff-reveal">
            <PatientInfoFaqList faqs={faqs.map((item, index) => ({ id: `santa-cruz-faq-${index}`, ...item }))} />
          </div>
        </div>
        <RelatedLinksSection title="Helpful next steps" links={relatedLinks} />
      </Section>

      <CtaBand
        id="santa-cruz-cta-heading"
        eyebrow="Ready to plan the visit?"
        title={
          <>
            Talk with our team before you make the trip from <em className="ff-italic font-normal text-lime">Santa Cruz.</em>
          </>
        }
        body="If you have insurance questions, want to ask about family appointments, or make sure the office is the right fit, we are happy to help you plan the next step."
        actions={
          <>
            <Button asChild size="lg" variant="night" className="group h-14 pl-7 pr-5 text-base">
              <Link href="/contact">
                Contact our office
                {arrowChipNight}
              </Link>
            </Button>
            <Button asChild size="lg" variant="night-outline" className="h-14 px-7 text-base">
              <PhoneLink location="santa_cruz_final_cta">Call (408) 358-8100</PhoneLink>
            </Button>
          </>
        }
        note={<>{practiceHoursSummary}, Los Gatos time · Just off Highway 17</>}
      />
    </div>
  );
}
