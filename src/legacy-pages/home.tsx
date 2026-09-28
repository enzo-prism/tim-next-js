import Image from "next/image";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import TestimonialCarousel from "@/components/testimonial-carousel";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { buildAppointmentUrl } from "@/lib/analytics";
import { AppointmentLink, PhoneLink } from "@/components/tracking/tracked-links";
import HeroBackdrop from "@/components/brand/HeroBackdrop";
import VideoFacade from "@/components/video-facade";
import officeTourPoster from "@assets/Office Photo 1_1753972057110.jpeg";
import drChuangPhoto from "@assets/Dr. Chuang_1753977515693.jpg";
import { testimonialsPageSummary } from "@/content/testimonials";

const OFFICE_TOUR_VIDEO_SRC =
  "https://player.vimeo.com/video/1106179834?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&loop=1&muted=1&background=1&controls=0";

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
      {/* Hero Section */}
      <section className="relative overflow-hidden py-14 sm:py-20 lg:py-24">
        <HeroBackdrop variant="default" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:gap-14">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-800 mb-5 sm:mb-6 leading-tight text-balance">
                <span style={{ display: 'block' }}>
                  A Gentle Family Dentist in Los Gatos
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                Calm, clear dental care for children and adults, with one Los Gatos team your family can grow with.
              </p>
              <p className="mb-8 text-sm font-semibold text-primary">
                Led by{" "}
                <Link href="/team" className="underline decoration-primary/35 underline-offset-4 hover:decoration-primary">
                  Dr. Tim J. Chuang, DDS
                </Link>
                , a Bay Area native focused on gentle, family-centered care.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  asChild
                  className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 text-base sm:text-lg font-semibold px-6 sm:px-8 py-3 transition duration-200 motion-reduce:hover:scale-100 motion-reduce:transition-none"
                >
                  <AppointmentLink href={buildAppointmentUrl({ source: "home_hero" })} source="home_hero">
                    Request an Appointment
                  </AppointmentLink>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground text-base sm:text-lg font-semibold px-6 sm:px-8 py-3 transition duration-200 motion-reduce:hover:scale-100 motion-reduce:transition-none"
                >
                  <PhoneLink location="home_hero">Call (408) 358-8100</PhoneLink>
                </Button>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[390px]">
              <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Virtual Office Tour
              </p>
              <div className="relative">
                <div className="relative rounded-xl border border-border bg-card p-2 shadow-sm">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-900 sm:aspect-[9/16]">
                    <VideoFacade
                      videoSrc={OFFICE_TOUR_VIDEO_SRC}
                      title="Family First Smile Care Office Tour"
                      poster={officeTourPoster}
                      posterAlt="Inside the Family First Smile Care office in Los Gatos"
                      posterSizes="(max-width: 639px) calc(100vw - 5.5rem), (max-width: 1023px) 360px, 390px"
                      posterQuality={65}
                      posterPriority
                      posterFetchPriority="high"
                      playLabel="Play office tour"
                    />
                  </div>
                </div>
              </div>
              <div
                className="mt-4 inline-flex items-center gap-3 rounded-xl bg-white/95 px-4 py-3 shadow-sm ring-1 ring-slate-200 sm:absolute sm:-bottom-6 sm:-left-10 sm:mt-0"
              >
                <div>
                  <p className="font-semibold leading-tight">{testimonialsPageSummary.averageRating} on Google</p>
                  <p className="text-sm text-gray-600 leading-tight">{testimonialsPageSummary.reviewCountLabel}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative overflow-hidden bg-background py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-14">
            <div
              className="mb-3 inline-flex items-center rounded-lg border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary"
            >
              Patient Reviews
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              <span className="inline-flex items-center justify-center gap-3">

                <span>What Our Patients Say</span>
              </span>
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600 sm:text-xl">
              Public reviews from patients who chose our Los Gatos dental team
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <div className="rounded-lg border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                {testimonialsPageSummary.averageRating} average rating
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                {testimonialsPageSummary.reviewCountLabel}
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {testimonialsPageSummary.verifiedAtLabel}
            </p>
          </div>

          <div>
            <TestimonialCarousel />
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              asChild
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Link href="/testimonials">
                Read more patient reviews
                <MinimalGlyph name="arrow-right" className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Doctor trust section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="grid items-center gap-8 rounded-xl border border-border bg-card p-6 sm:p-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10"
          >
            <Image
              src={drChuangPhoto}
              alt="Dr. Tim J. Chuang, DDS"
              sizes="(max-width: 1024px) 240px, 240px"
              className="mx-auto aspect-[4/5] w-full max-w-60 rounded-xl object-cover"
            />
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Meet your dentist
              </p>
              <h2 className="text-3xl font-bold text-gray-800 lg:text-4xl">
                Dr. Tim J. Chuang
              </h2>
              <p className="mt-2 text-lg font-semibold text-primary">
                Lead dentist and practice owner
              </p>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
                Dr. Chuang is a Bay Area native and University of the Pacific School of Dentistry
                graduate. His approach centers on clear explanations, gentle treatment, and care
                that works for children, adults, and anxious patients.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm text-gray-700">
                <span className="rounded-lg border border-border bg-muted/40 px-3 py-2">
                  5+ years in practice
                </span>
                <span className="rounded-lg border border-border bg-muted/40 px-3 py-2">
                  General dentistry residency
                </span>
                <span className="rounded-lg border border-border bg-muted/40 px-3 py-2">
                  Family-centered care
                </span>
              </div>
              <Button asChild variant="outline" className="mt-6 border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground">
                <Link href="/team">Meet Dr. Chuang and the team</Link>
              </Button>
            </div>
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
