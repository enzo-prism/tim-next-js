import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import HeroBackdrop from "@/components/brand/HeroBackdrop";
import PracticeAddressLink from "@/components/location/PracticeAddressLink";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";
import RelatedLinksSection from "@/components/navigation/RelatedLinksSection";
import { Button } from "@/components/ui/button";
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
import { buildRouteMetadata } from "@/lib/metadata";
import { buildAppointmentUrl } from "@/lib/analytics";
import type { RelatedLink } from "@/lib/internal-links";

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

const pageUrl = `${practiceInfo.url}/areas-we-serve/santa-cruz`;
const santaCruzHeroIllustration =
  "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1774033002/SC_wkb13o.webp";
const highway17AccessIllustration =
  "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1774033154/17_bmtriu.webp";

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
    <div className="bg-white pt-16 pb-20">
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

      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
        <HeroBackdrop variant="default" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageBreadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Santa Cruz Families" }]}
          />

          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Los Gatos office serving Santa Cruz patients
              </div>
              <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
                <span className="inline-flex flex-wrap items-center gap-3">
                  
                  <span>Los Gatos family dentist serving Santa Cruz patients over Highway 17.</span>
                </span>
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">
                Family First Smile Care is physically located in Los Gatos, not Santa Cruz. We
                welcome Santa Cruz patients who want gentle, family-focused dentistry and clear
                answers before a visit. Our office is just off Highway 17, so the trip is
                straightforward for patients who prefer a practice that feels calm, clear, and easy
                to trust.
              </p>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                Whether you are looking for a child-friendly first visit, a new long-term dental
                home, or a team that explains options without rushing, many patients are happy to
                come over the hill to our Los Gatos office.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href={buildAppointmentUrl({ source: "santa_cruz_hero" })}>
                    Request an appointment
                    <MinimalGlyph name="arrow-right" className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground">
                  <Link href="/contact">Ask an insurance question</Link>
                </Button>
              </div>
            </div>

            <aside className="rounded-xl border border-slate-200 bg-white/95 p-6 shadow-sm">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Why families make the trip
              </div>
              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <p className="text-sm leading-6 text-slate-700">
                    Office address: 15251 National Ave, Suite 102, Los Gatos, CA.
                  </p>
                </div>
                {reasons.map((reason) => (
                  <div key={reason} className="flex items-start gap-3">
                    <MinimalGlyph name="check-circle" className="mt-0.5 h-5 w-5 text-primary" />
                    <p className="text-sm leading-6 text-slate-700">{reason}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>

          <figure className="mt-10 overflow-hidden rounded-xl border border-white/70 bg-white/80 shadow-sm ">
            <div className="relative aspect-[16/9]">
              <Image
                src={santaCruzHeroIllustration}
                alt="Family-friendly dental office illustration with Santa Cruz coastal scenery and Highway 17 visible in the background."
                fill
                priority
                sizes="(min-width: 1280px) 1200px, (min-width: 768px) 92vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-950/10 to-transparent" />

              <div className="absolute left-4 top-4 rounded-lg border border-white/30 bg-white/20 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/95 backdrop- sm:left-6 sm:top-6">
                Easy Highway 17 access
              </div>

            </div>
          </figure>
        </div>
      </section>

      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="grid xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
              <article className="p-6 sm:p-8 xl:p-10">
                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Travel convenience matters
                </p>
                <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight text-slate-900 sm:text-[2.35rem] sm:leading-[1.08]">
                  Simple access from Highway 17 to our Los Gatos office
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                  Our dental office is in Los Gatos, just off Highway 17, which makes the drive
                  easier for many Santa Cruz patients. We offer a welcoming office and a team that
                  helps visits feel organized from the moment you arrive.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      Just off Highway 17
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Easy over-the-hill access without weaving through local streets after you exit.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      Los Gatos address
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Visits happen at 15251 National Ave, Suite 102, not at a Santa Cruz office.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <MinimalGlyph name="check-circle" className="h-4 w-4 text-primary" />
                      Calm check-in
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Friendly staff and organized visits help the drive feel worthwhile from the start.
                    </p>
                  </div>
                </div>
              </article>

              <div className="border-t border-slate-200 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_45%),linear-gradient(180deg,rgba(248,250,252,0.98),rgba(239,246,255,0.92))] p-4 sm:p-6 xl:border-t-0 xl:border-l xl:p-8">
                <div className="rounded-lg border border-primary/15 bg-white/75 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary w-fit">
                  Santa Cruz to Los Gatos
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-white/80 bg-white/85 p-3 shadow-sm sm:p-4">
                  <Image
                    src={highway17AccessIllustration}
                    alt="Illustration of Highway 17 connecting Santa Cruz to a welcoming family dental office in Los Gatos."
                    width={2816}
                    height={1536}
                    sizes="(min-width: 1280px) 720px, (min-width: 768px) 92vw, 100vw"
                    className="h-auto w-full rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-slate-200 bg-slate-50/80 p-6">
              <h3 className="mt-5 text-xl font-bold text-slate-900">
                Insurance support before you visit
              </h3>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Insurance participation and benefits vary by plan. Call before booking and our team
                can review the information you provide and help you identify what to confirm with
                your insurer.
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-slate-50/80 p-6">
              <h3 className="mt-5 text-xl font-bold text-slate-900">Care for the whole family</h3>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Santa Cruz families often come to us for one office that can care for kids, adults,
                and nervous first-timers alike. Our practice emphasizes gentle visits,
                child-friendly care, clear communication, and long-term relationships.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-3xl font-bold text-slate-900">Why Santa Cruz families choose our Los Gatos office</h2>
              <div className="mt-6 space-y-5 text-base leading-8 text-slate-700">
                <p>
                  Many patients are not just looking for the closest office. They are looking for a
                  family dentist who feels thorough, calm, and easy to trust. That is especially
                  true for parents booking visits for children, adults with dental anxiety, or
                  families trying to keep preventive care consistent.
                </p>
                <p>
                  Family First Smile Care is built around gentle care, clear explanations, and a
                  warm office experience. Patients often choose us because they want one office for
                  routine cleanings, children&apos;s dentistry, Invisalign consultations, night guards,
                  and restorative care without feeling like they need to start over somewhere else
                  every time a new need comes up.
                </p>
                <p>
                  For Santa Cruz families, that combination of family-focused care and easy Highway
                  17 access makes a Los Gatos visit feel practical as well as worthwhile. If you
                  have insurance questions before you book, call our team and we can help you
                  identify the details to confirm with your plan.
                </p>
              </div>
            </article>

            <aside className="rounded-xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Quick office details
              </div>
              <div className="mt-5 space-y-4 text-sm leading-6 text-slate-700">
                <div className="flex items-start gap-3">
                  <div>
                    <div className="font-semibold text-slate-900">Office address</div>
                    <PracticeAddressLink className="text-inherit hover:text-primary">
                      {practiceInfo.addressText}
                    </PracticeAddressLink>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div>
                    <div className="font-semibold text-slate-900">Access</div>
                    <p>Convenient for patients coming over Highway 17 from Santa Cruz to Los Gatos.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div>
                    <div className="font-semibold text-slate-900">Insurance help</div>
                    <p>Call ahead with your plan details and questions. Coverage is determined by your insurer.</p>
                  </div>
                </div>
              </div>
              <Button asChild className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <a
                  href={practiceInfo.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Maps
                </a>
              </Button>
            </aside>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
              <div>
                <div className="inline-flex rounded-lg border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Reviews and testimonials
                </div>
                <h2 className="mt-5 text-3xl font-bold text-slate-900">
                  Real reviews from families who chose care they could trust
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                  Many Santa Cruz patients are not looking for the nearest office. They want a
                  family dentist with gentle care, clear explanations, and a team that is worth the
                  drive. These excerpts come from publicly posted Google reviews and reflect the
                  same qualities Santa Cruz families often ask about before booking.
                </p>
              </div>

              <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Review snapshot
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-slate-900">
                    {testimonialsPageSummary.averageRating}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">out of 5</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {testimonialsPageSummary.reviewCountLabel} from {testimonialsPageSummary.sourceLabel.toLowerCase()}.
                </p>
                <p className="mt-2 text-xs text-slate-500">{testimonialsPageSummary.verifiedAtLabel}</p>
                <div className="mt-5 flex flex-col gap-3">
                  <Button asChild variant="outline" className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground">
                    <a
                      href={testimonialsPageSummary.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read Google reviews
                      <MinimalGlyph name="external-link" className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/testimonials">
                      View all testimonials
                      <MinimalGlyph name="arrow-right" className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </aside>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {santaCruzReviewHighlights.map((review) => (
                <article
                  key={`${review.name}-${review.patientLabel}`}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="text-sm font-semibold text-slate-600" aria-label={`${review.rating} star review`}>
                    {review.rating}.0 rating
                  </div>
                  <blockquote className="mt-4 text-base leading-7 text-slate-700">
                    "{review.quote}"
                  </blockquote>
                  <div className="mt-5 border-t border-slate-200 pt-4">
                    <div className="font-semibold text-slate-900">{review.name}</div>
                    <div className="mt-1 text-sm text-slate-500">{review.patientLabel}</div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-6 sm:p-8">
            <h2 className="text-3xl font-bold text-slate-900">Frequently asked by Santa Cruz patients</h2>
            <div className="mt-6 space-y-4">
              {faqs.map((item) => (
                <details key={item.question} className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                  <summary className="cursor-pointer list-none font-semibold text-slate-900">
                    {item.question}
                  </summary>
                  <p className="mt-3 text-base leading-7 text-slate-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl bg-primary px-8 py-10 text-white shadow-sm sm:px-10">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
                  Ready to plan the visit?
                </div>
                <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
                  Talk with our team before you make the trip from Santa Cruz.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/85">
                  If you have insurance questions, want to ask about family appointments, or make sure the
                  office is the right fit, we are happy to help you plan the next step.
                </p>
              </div>

              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link href="/contact">
                  Contact our office
                  <MinimalGlyph name="arrow-right" className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <RelatedLinksSection title="Helpful next steps" links={relatedLinks} />
        </div>
      </section>
    </div>
  );
}
