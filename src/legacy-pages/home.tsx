import Image from "next/image";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { buildAppointmentUrl } from "@/lib/analytics";
import { AppointmentLink, PhoneLink, TrackedExternalLink } from "@/components/tracking/tracked-links";
import HeroBackdrop from "@/components/brand/HeroBackdrop";
import VideoFacade from "@/components/video-facade";
import officeTourPoster from "@assets/Office Photo 1_1753972057110.jpeg";
import drChuangPhoto from "@assets/Dr. Chuang_1753977515693.jpg";
import { featuredReview, testimonialSections, testimonialsPageSummary } from "@/content/testimonials";

const OFFICE_TOUR_VIDEO_SRC =
  "https://player.vimeo.com/video/1106179834?title=0&byline=0&portrait=0&badge=0&autoplay=1&loop=0&muted=0&background=0&controls=1";

const featuredServices = [
  {
    title: "Family Dentistry",
    description: "Routine check-ups, cleanings, and preventive care for all ages.",
    href: "/services/family-dentistry",
    icon: "family-dentistry" as const,
  },
  {
    title: "Children's Dentistry",
    description: "Gentle first visits and child-friendly care with toys and stickers.",
    href: "/services/children-dentistry",
    icon: "child" as const,
  },
  {
    title: "Dental Hygiene",
    description: "Professional cleanings and coaching for stronger, healthier smiles.",
    href: "/services/dental-hygiene",
    icon: "hygiene-sparkle" as const,
  },
  {
    title: "Invisalign",
    description: "Clear aligners with digital planning and a personalized consultation.",
    href: "/services/invisalign",
    icon: "smile-aligner" as const,
  },
];

export default function Home() {
  return (
    <div className="pt-16">
      <section aria-labelledby="home-heading" className="relative overflow-hidden py-8 sm:py-12 lg:py-16">
        <HeroBackdrop variant="default" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
            <div className="max-w-2xl">
              <h1 id="home-heading" className="mb-4 text-3xl font-bold leading-tight text-foreground text-balance sm:text-4xl lg:text-5xl">
                A Gentle Family Dentist in Los Gatos
              </h1>
              <p className="mb-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Calm, clear dental care for children and adults, with one Los Gatos team your family can grow with.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-auto min-h-12 px-6 py-3 text-base font-semibold">
                  <AppointmentLink href={buildAppointmentUrl({ source: "home_hero" })} source="home_hero">
                    Request an Appointment
                  </AppointmentLink>
                </Button>
                <Button asChild variant="outline" className="h-auto min-h-12 border-primary/60 px-6 py-3 text-base font-semibold text-primary">
                  <PhoneLink location="home_hero">Call (408) 358-8100</PhoneLink>
                </Button>
              </div>
              <div data-home-review-proof="" className="mt-5 border-t border-border pt-4">
                <TrackedExternalLink
                  href={testimonialsPageSummary.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  kind="review"
                  provider="google"
                  location="home_hero_proof"
                  className="inline-flex flex-wrap gap-x-2 text-sm font-semibold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
                >
                  <span>{testimonialsPageSummary.averageRating} on Google</span>
                  <span aria-hidden="true">·</span>
                  <span>{testimonialsPageSummary.reviewCountLabel}</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </TrackedExternalLink>
                <p className="mt-1 text-xs text-muted-foreground">{testimonialsPageSummary.verifiedAtLabel}</p>
              </div>
            </div>
            <figure data-home-dentist="" className="order-first flex items-center gap-4 lg:order-last lg:block">
              <Image
                src={drChuangPhoto}
                alt="Dr. Tim J. Chuang, DDS"
                priority
                sizes="(max-width: 1023px) 96px, 340px"
                className="aspect-[4/5] w-24 shrink-0 rounded-xl object-cover lg:w-full"
              />
              <figcaption className="min-w-0 lg:mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">Meet your dentist</p>
                <Link href="/team" className="mt-1 inline-block text-lg font-bold text-foreground underline decoration-border underline-offset-4 hover:decoration-primary">
                  Dr. Tim J. Chuang, DDS
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">Practice owner · Bay Area native</p>
                <p className="mt-2 hidden text-sm leading-relaxed text-muted-foreground lg:block">
                  University of the Pacific School of Dentistry graduate with a general dentistry residency.
                </p>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section aria-labelledby="visit-next-steps-heading" className="border-y border-border bg-card py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="visit-next-steps-heading" className="mb-5 text-xl font-semibold text-foreground">Make your next step a little easier</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/new-patients" className="rounded-lg border border-border p-5 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <h3 className="font-semibold text-primary">Your first visit</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Know what to expect and how to prepare.</p>
            </Link>
            <Link href="/insurance-and-payment" className="rounded-lg border border-border p-5 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <h3 className="font-semibold text-primary">Insurance &amp; payment</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Find the next step for coverage and payment questions.</p>
            </Link>
            <Link href="/urgent-dental-care" className="rounded-lg border border-border p-5 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <h3 className="font-semibold text-primary">Something hurts?</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">See how to contact the office about urgent dental concerns.</p>
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="patient-reviews-heading" className="bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="patient-reviews-heading" className="text-3xl font-bold text-foreground">What Our Patients Say</h2>
          <p className="mt-3 text-base text-muted-foreground">Selected excerpts from public Google reviews.</p>
          <div data-home-static-reviews="" className="mt-7 grid gap-5 lg:grid-cols-3">
            {[featuredReview, ...testimonialSections.flatMap((section) => section.reviews).filter((review) => review.name === "Janey Lee" || review.name === "Jerry Jobe")].map((review) => (
              <figure key={review.name} className="flex flex-col rounded-xl border border-border bg-card p-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-primary">{review.patientLabel}</p>
                <blockquote className="flex-1 text-base leading-relaxed text-foreground">“{review.quote}”</blockquote>
                <figcaption className="mt-5 border-t border-border pt-4 text-sm font-semibold text-foreground">{review.name}</figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-5">
            <Button asChild variant="outline" className="border-primary/60 text-primary">
              <Link href="/testimonials">Read more patient reviews</Link>
            </Button>
            <TrackedExternalLink href={testimonialsPageSummary.sourceUrl} target="_blank" rel="noopener noreferrer" kind="review" provider="google" location="home_reviews" className="text-sm font-semibold text-primary underline underline-offset-4">
              Read reviews on Google<span className="sr-only"> (opens in a new tab)</span>
            </TrackedExternalLink>
          </div>
        </div>
      </section>

      <section aria-labelledby="office-tour-heading" className="bg-card py-12 sm:py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-7 px-4 sm:px-6 md:grid-cols-2 lg:gap-12 lg:px-8">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-primary">Take a look around</p>
            <h2 id="office-tour-heading" className="text-3xl font-bold text-foreground">A familiar place before your first visit</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">Preview our Los Gatos office at your own pace. Play the tour when you’re ready, or explore the office photos.</p>
            <Link href="/about" className="mt-5 inline-block text-sm font-semibold text-primary underline underline-offset-4">See our office and learn about our approach</Link>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-muted">
            <VideoFacade videoSrc={OFFICE_TOUR_VIDEO_SRC} title="Family First Smile Care Office Tour" poster={officeTourPoster} posterAlt="Inside the Family First Smile Care office in Los Gatos" posterSizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1280px) 50vw, 584px" posterQuality={65} playLabel="Play office tour" />
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="bg-background py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              <span className="inline-flex items-center justify-center gap-3">

                <span>Our Featured Services</span>
              </span>
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600 sm:text-xl">
              Comprehensive dental care tailored to your family's unique needs
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {featuredServices.map((service) => (
              <div key={service.href} className="group">
                <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-6 transition-colors duration-200 group-hover:border-primary/30">
                  <h3 className="mb-2 text-xl font-semibold text-gray-800">{service.title}</h3>
                  <p className="mb-6 text-base leading-relaxed text-gray-600">{service.description}</p>
                  <Button
                    asChild
                    variant="link"
                    className="mt-auto w-fit p-0 text-primary transition-colors duration-200 group-hover:text-primary"
                  >
                    <Link href={service.href}>
                      Learn More
                      <MinimalGlyph name="arrow-right" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
            <Button asChild className="sm:w-auto">
              <Link href="/services">Explore all dental services</Link>
            </Button>
            <Button asChild variant="outline" className="border-primary/40 text-primary sm:w-auto">
              <Link href="/patient-info">Patient information and FAQs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 gradient-primary text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Meet Your Los Gatos Dental Team?
          </h2>
          <p className="text-xl mb-8 text-white/95">
            Tell us what you need and when you prefer to visit. Our team will contact you to confirm the next step.
          </p>
          <div>
            <div>
              <Button asChild className="bg-white text-primary hover:bg-gray-100 text-lg font-semibold px-8 py-3">
                <AppointmentLink href={buildAppointmentUrl({ source: "home_final_cta" })} source="home_final_cta">
                  Request an Appointment
                </AppointmentLink>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
