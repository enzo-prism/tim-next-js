"use client";

import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ExternalLink,
  MessageSquareQuote,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroBackdrop from "@/components/brand/HeroBackdrop";
import HeadingMark from "@/components/brand/HeadingMark";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";
import RelatedLinksSection from "@/components/navigation/RelatedLinksSection";
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  practiceInfo,
} from "@/content/structured-data";
import {
  featuredReview,
  testimonialSections,
  testimonialsPageRelatedLinks,
  testimonialsPageSummary,
  testimonialThemes,
} from "@/content/testimonials";
import { APPOINTMENT_FORM_URL, trackAppointmentCtaClick } from "@/lib/analytics";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function TestimonialsPage() {
  const pageUrl = `${practiceInfo.url}/testimonials`;
  const pageTitle = "Patient Testimonials & Google Reviews";
  const pageDescription =
    "Read what patients say about Family First Smile Care in Los Gatos, from gentle cleanings and thorough exams to family dentistry, Invisalign, and TMJ care.";

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", item: practiceInfo.url },
    { name: pageTitle, item: pageUrl },
  ]);
  const collectionPageSchema = buildCollectionPageSchema({
    name: pageTitle,
    description: pageDescription,
    url: pageUrl,
  });

  const handleAppointmentClick = () => {
    trackAppointmentCtaClick("testimonials_page");
  };

  return (
    <div className="bg-white pt-16 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
        <HeroBackdrop variant="default" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageBreadcrumbs items={[{ label: "Home", href: "/" }, { label: "Testimonials" }]} />

          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
            <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified patient feedback
              </div>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight text-gray-800 sm:text-5xl">
                <span className="inline-flex flex-wrap items-center gap-3">
                  <HeadingMark />
                  <span>{pageTitle}</span>
                </span>
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600 sm:text-xl">
                Hear from Los Gatos patients and families who chose Family First Smile Care
                for gentle preventive visits, child-friendly dentistry, Invisalign, TMJ
                support, and clear treatment planning.
              </p>
              <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600">
                This page is designed to help prospective patients understand the experience
                of visiting our office through selected excerpts from publicly posted Google
                reviews, alongside direct links to the services those reviews mention most.
              </p>

              <motion.div
                className="mt-8 grid gap-4 sm:grid-cols-3"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm"
                  variants={scaleIn}
                >
                  <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Average rating
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-4xl font-bold text-slate-900">
                      {testimonialsPageSummary.averageRating}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className="h-4 w-4 fill-current" aria-hidden="true" />
                      ))}
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm"
                  variants={scaleIn}
                >
                  <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Review volume
                  </div>
                  <div className="mt-3 text-2xl font-bold text-slate-900">
                    {testimonialsPageSummary.reviewCountLabel}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Strong social proof from local patients and families.
                  </p>
                </motion.div>

                <motion.div
                  className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm"
                  variants={scaleIn}
                >
                  <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Source
                  </div>
                  <div className="mt-3 text-2xl font-bold text-slate-900">
                    {testimonialsPageSummary.sourceLabel}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {testimonialsPageSummary.editorialNote}
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.aside
              className="rounded-[2rem] border border-slate-200/90 bg-white/95 p-6 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.8)]"
              initial="hidden"
              animate="visible"
              variants={scaleIn}
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
                <MessageSquareQuote className="h-4 w-4" />
                Featured Google review
              </div>
              <blockquote className="mt-5 text-lg leading-8 text-slate-700">
                "{featuredReview.quote}"
              </blockquote>
              <div className="mt-6 border-t border-slate-200 pt-4">
                <div className="font-semibold text-slate-900">{featuredReview.name}</div>
                <div className="mt-1 text-sm text-slate-600">{featuredReview.patientLabel}</div>
              </div>
              <Button
                asChild
                variant="outline"
                className="mt-6 w-full border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <a
                  href={testimonialsPageSummary.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Google profile
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </motion.aside>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {testimonialThemes.map((theme) => (
              <motion.article
                key={theme.title}
                className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5"
                variants={scaleIn}
              >
                <h2 className="text-lg font-semibold text-slate-900">{theme.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{theme.description}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {testimonialSections.map((section) => (
        <section key={section.id} className="py-10 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <div className="text-sm font-semibold uppercase tracking-[0.16em] text-primary/80">
                {section.eyebrow}
              </div>
              <h2 className="mt-3 max-w-3xl text-3xl font-bold text-gray-800 sm:text-4xl">
                {section.title}
              </h2>
              <p className="mt-4 max-w-4xl text-lg leading-8 text-gray-600">
                {section.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="mt-8 grid gap-5 lg:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              {section.reviews.map((review) => (
                <motion.article
                  key={`${section.id}-${review.name}`}
                  className="h-full rounded-[1.75rem] border border-slate-200/90 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.8)]"
                  variants={scaleIn}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                      <MessageSquareQuote className="h-3.5 w-3.5" />
                      Google Review
                    </div>
                    <div className="flex items-center gap-1 text-amber-500" aria-label="5 star review">
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <Star key={index} className="h-4 w-4 fill-current" aria-hidden="true" />
                      ))}
                    </div>
                  </div>

                  <blockquote className="mt-5 text-base leading-7 text-slate-700">
                    "{review.quote}"
                  </blockquote>

                  <div className="mt-6 border-t border-slate-200 pt-4">
                    <p className="font-semibold text-slate-900">{review.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{review.patientLabel}</p>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>
      ))}

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="rounded-[2rem] border border-primary/10 bg-gradient-to-br from-primary/5 via-white to-secondary/10 p-8 sm:p-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <div className="max-w-4xl">
              <h2 className="text-3xl font-bold text-gray-800">Ready to see what your visit could feel like?</h2>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                If you are looking for a Los Gatos dentist who explains options clearly,
                moves at your pace, and provides family-friendly care with modern dental
                technology, we would love to help.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link href={APPOINTMENT_FORM_URL} onClick={handleAppointmentClick}>
                  Book an appointment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <a
                  href={testimonialsPageSummary.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read more reviews on Google
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </motion.div>

          <RelatedLinksSection
            title="Explore More Patient Resources"
            links={testimonialsPageRelatedLinks}
          />
        </div>
      </section>
    </div>
  );
}
