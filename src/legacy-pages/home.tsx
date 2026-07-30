"use client";

import Image from "next/image";
import { Link } from "wouter";
import { LazyMotion, m } from "framer-motion";
import { Button } from "@/components/ui/button";
import TestimonialCarousel from "@/components/testimonial-carousel";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import {
  buildAppointmentUrl,
  trackAppointmentCtaClick,
  trackPhoneClick,
} from "@/lib/analytics";
import HeroBackdrop from "@/components/brand/HeroBackdrop";
import VideoFacade from "@/components/video-facade";
import officeTourPoster from "@assets/Office Photo 1_1753972057110.jpeg";
import drChuangPhoto from "@assets/Dr. Chuang_1753977515693.jpg";
import { testimonialsPageSummary } from "@/content/testimonials";

// Animation variants for reusable patterns
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

const OFFICE_TOUR_VIDEO_SRC =
  "https://player.vimeo.com/video/1106179834?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&loop=1&muted=1&background=1&controls=0";

const loadMotionFeatures = () => import("@/lib/motion-features").then((module) => module.default);

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
  const handleAppointmentClick = () => {
    trackAppointmentCtaClick("home_hero");
  };

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <div className="pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-14 sm:py-20 lg:py-24">
        <HeroBackdrop variant="default" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:gap-14">
            <m.div
              initial={false}
              animate="visible"
              variants={slideInLeft}
              className="max-w-2xl"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-800 mb-5 sm:mb-6 leading-tight text-balance">
                <m.span
                  initial={false}
                  animate="visible"
                  variants={fadeInUp}
                  style={{ display: 'block' }}
                >
                  A Gentle Family Dentist in Los Gatos
                </m.span>
              </h1>
              <m.p
                className="text-xl text-gray-600 mb-4"
                variants={fadeInUp}
              >
                Calm, clear dental care for children and adults, with one Los Gatos team your family can grow with.
              </m.p>
              <m.p className="mb-8 text-sm font-semibold text-primary" variants={fadeInUp}>
                Led by{" "}
                <Link href="/team" className="underline decoration-primary/35 underline-offset-4 hover:decoration-primary">
                  Dr. Tim J. Chuang, DDS
                </Link>
                , a Bay Area native focused on gentle, family-centered care.
              </m.p>
              <m.div
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                variants={fadeInUp}
              >
                <Button
                  asChild
                  className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 text-base sm:text-lg font-semibold px-6 sm:px-8 py-3 transition duration-200 motion-reduce:hover:scale-100 motion-reduce:transition-none"
                >
                  <Link href={buildAppointmentUrl({ source: "home_hero" })} onClick={handleAppointmentClick}>
                    Request an Appointment
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground text-base sm:text-lg font-semibold px-6 sm:px-8 py-3 transition duration-200 motion-reduce:hover:scale-100 motion-reduce:transition-none"
                >
                  <a href="tel:+14083588100" onClick={() => trackPhoneClick("home_hero")}>
                    Call (408) 358-8100
                  </a>
                </Button>
              </m.div>
            </m.div>
            <m.div
              className="relative mx-auto w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[390px]"
              initial={false}
              animate="visible"
              variants={slideInRight}
            >
              <m.p
                className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary"
                variants={fadeInUp}
              >
                Virtual Office Tour
              </m.p>
              <m.div
                className="relative"
                variants={scaleIn}
              >
                <div className="relative rounded-xl border border-border bg-card p-2 shadow-sm">
                  <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-slate-900">
                    <VideoFacade
                      videoSrc={OFFICE_TOUR_VIDEO_SRC}
                      title="Family First Smile Care Office Tour"
                      poster={officeTourPoster}
                      posterAlt="Inside the Family First Smile Care office in Los Gatos"
                      posterSizes="(max-width: 640px) 320px, 390px"
                      posterPriority
                      posterFetchPriority="high"
                      playLabel="Play office tour"
                    />
                  </div>
                </div>
              </m.div>
              <m.div
                className="mt-4 inline-flex items-center gap-3 rounded-xl bg-white/95 px-4 py-3 shadow-sm ring-1 ring-slate-200 sm:absolute sm:-bottom-6 sm:-left-10 sm:mt-0"
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <div>
                  <p className="font-semibold leading-tight">{testimonialsPageSummary.averageRating} on Google</p>
                  <p className="text-sm text-gray-600 leading-tight">{testimonialsPageSummary.reviewCountLabel}</p>
                </div>
              </m.div>
            </m.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative overflow-hidden bg-background py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <m.div
            className="text-center mb-12 sm:mb-14"
            initial={false}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <m.div
              className="mb-3 inline-flex items-center rounded-lg border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary"
              variants={fadeInUp}
            >
              Patient Reviews
            </m.div>
            <m.h2
              className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4"
              variants={fadeInUp}
            >
              <span className="inline-flex items-center justify-center gap-3">

                <span>What Our Patients Say</span>
              </span>
            </m.h2>
            <m.p
              className="mx-auto max-w-3xl text-lg text-gray-600 sm:text-xl"
              variants={fadeInUp}
            >
              Public reviews from patients who chose our Los Gatos dental team
            </m.p>
            <m.div className="mt-6 flex flex-wrap items-center justify-center gap-3" variants={fadeInUp}>
              <div className="rounded-lg border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                {testimonialsPageSummary.averageRating} average rating
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                {testimonialsPageSummary.reviewCountLabel}
              </div>
            </m.div>
            <m.p className="mt-3 text-xs text-slate-500" variants={fadeInUp}>
              {testimonialsPageSummary.verifiedAtLabel}
            </m.p>
          </m.div>

          <m.div
            initial={false}
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={scaleIn}
          >
            <TestimonialCarousel />
          </m.div>

          <m.div
            className="mt-8 flex justify-center"
            initial={false}
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
          >
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
          </m.div>
        </div>
      </section>

      {/* Doctor trust section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <m.div
            className="grid items-center gap-8 rounded-xl border border-border bg-card p-6 sm:p-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10"
            initial={false}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <Image
              src={drChuangPhoto}
              alt="Dr. Tim J. Chuang, DDS"
              sizes="(max-width: 1024px) 240px, 240px"
              className="mx-auto aspect-[4/5] w-full max-w-60 rounded-xl object-cover"
            />
            <m.div variants={fadeInUp}>
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
            </m.div>
          </m.div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="bg-background py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <m.div
            className="text-center mb-12 sm:mb-14"
            initial={false}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <m.h2
              className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4"
              variants={fadeInUp}
            >
              <span className="inline-flex items-center justify-center gap-3">

                <span>Our Featured Services</span>
              </span>
            </m.h2>
            <m.p
              className="mx-auto max-w-3xl text-lg text-gray-600 sm:text-xl"
              variants={fadeInUp}
            >
              Comprehensive dental care tailored to your family's unique needs
            </m.p>
          </m.div>

          <m.div
            className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
            initial={false}
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            {featuredServices.map((service) => (
              <m.div
                key={service.href}
                className="group"
                variants={scaleIn}
              >
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
              </m.div>
            ))}
          </m.div>
          <m.div
            className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row"
            initial={false}
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
          >
            <Button asChild className="sm:w-auto">
              <Link href="/services">Explore all dental services</Link>
            </Button>
            <Button asChild variant="outline" className="border-primary/40 text-primary sm:w-auto">
              <Link href="/patient-info">Patient information and FAQs</Link>
            </Button>
          </m.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <m.section
        className="py-20 gradient-primary text-white"
        initial={false}
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <m.h2
            className="text-3xl lg:text-4xl font-bold mb-4"
            variants={fadeInUp}
          >
            Ready to Meet Your Los Gatos Dental Team?
          </m.h2>
          <m.p
            className="text-xl mb-8 text-white/95"
            variants={fadeInUp}
          >
            Tell us what you need and when you prefer to visit. Our team will contact you to confirm the next step.
          </m.p>
          <m.div variants={scaleIn}>
            <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild className="bg-white text-primary hover:bg-gray-100 text-lg font-semibold px-8 py-3">
                <Link href={buildAppointmentUrl({ source: "home_final_cta" })} onClick={() => trackAppointmentCtaClick("home_final_cta")}>
                  Request an Appointment
                </Link>
              </Button>
            </m.div>
          </m.div>
        </div>
      </m.section>
      </div>
    </LazyMotion>
  );
}
