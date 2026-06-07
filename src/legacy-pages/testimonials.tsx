"use client";

import { Link } from "wouter";
import { motion } from "framer-motion";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { Button } from "@/components/ui/button";
import HeroBackdrop from "@/components/brand/HeroBackdrop";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";
import RelatedLinksSection from "@/components/navigation/RelatedLinksSection";
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  practiceInfo,
} from "@/content/structured-data";
import {
  featuredReview,
  publicReviewFeedSections,
  testimonialSections,
  testimonialsReviewLibrarySummary,
  testimonialsPageRelatedLinks,
  testimonialsPageSummary,
  testimonialThemes,
} from "@/content/testimonials";
import {
  APPOINTMENT_FORM_URL,
  trackAppointmentCtaClick,
  trackReviewLinkClick,
} from "@/lib/analytics";

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
  const pageTitle = "Patient Testimonials, Google Reviews & Yelp Reviews";
  const pageDescription =
    "Read what patients say about Family First Smile Care in Los Gatos, from gentle cleanings and thorough exams to family dentistry, Invisalign, TMJ care, and recent Yelp feedback.";

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
              <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
                <MinimalGlyph name="shield-check" className="h-3.5 w-3.5" />
                Verified patient feedback
              </div>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight text-gray-800 sm:text-5xl">
                <span className="inline-flex flex-wrap items-center gap-3">
                  
                  <span>{pageTitle}</span>
                </span>
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600 sm:text-xl">
                Hear from Los Gatos patients and families who chose Family First Smile Care
                for gentle preventive visits, child-friendly dentistry, Invisalign, TMJ
                support, and clear treatment planning across both Google and Yelp.
              </p>
              <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600">
                This page is designed to help prospective patients understand the experience
                of visiting our office through selected excerpts from publicly posted reviews,
                alongside direct links to the services those reviews mention most.
              </p>

              <motion.div
                className="mt-8 grid gap-4 sm:grid-cols-3"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  className="rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm"
                  variants={scaleIn}
                >
                  <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Average rating
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-slate-900">
                      {testimonialsPageSummary.averageRating}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">out of 5</span>
                  </div>
                </motion.div>

                <motion.div
                  className="rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm"
                  variants={scaleIn}
                >
                  <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Review volume
                  </div>
                  <div className="mt-3 text-2xl font-bold text-slate-900">
                    {testimonialsReviewLibrarySummary.reviewCountLabel}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Verified public review coverage across the two platforms patients check most.
                  </p>
                </motion.div>

                <motion.div
                  className="rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm"
                  variants={scaleIn}
                >
                  <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Source
                  </div>
                  <div className="mt-3 text-2xl font-bold text-slate-900">
                    {testimonialsReviewLibrarySummary.sourceLabel}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {testimonialsReviewLibrarySummary.editorialNote}
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.aside
              className="rounded-xl border border-slate-200/90 bg-white/95 p-6 shadow-sm"
              initial="hidden"
              animate="visible"
              variants={scaleIn}
            >
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
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
                  onClick={() => trackReviewLinkClick("google", "testimonials_featured")}
                >
                  View Google profile
                  <MinimalGlyph name="external-link" className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="mt-3 w-full text-primary hover:bg-primary/5 hover:text-primary"
              >
                <a
                  href={publicReviewFeedSections[1].sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackReviewLinkClick("yelp", "testimonials_featured")}
                >
                  View Yelp profile
                  <MinimalGlyph name="external-link" className="ml-2 h-4 w-4" />
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
                className="rounded-xl border border-slate-200 bg-slate-50/80 p-5"
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
                    className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
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
                  className="h-full rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm"
                  variants={scaleIn}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="inline-flex rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                      Google Review
                    </div>
                    <div className="text-sm font-semibold text-slate-600" aria-label={`${review.rating} star review`}>
                      {review.rating}.0 rating
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

      {publicReviewFeedSections.map((section) => (
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
              <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="max-w-3xl text-3xl font-bold text-gray-800 sm:text-4xl">
                    {section.title}
                  </h2>
                  <p className="mt-4 max-w-4xl text-lg leading-8 text-gray-600">
                    {section.description}
                  </p>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <a
                    href={section.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackReviewLinkClick(
                        section.id === "yelp-reviews" ? "yelp" : "google",
                        "testimonials_review_section",
                      )
                    }
                  >
                    {section.sourceLabel}
                    <MinimalGlyph name="external-link" className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </motion.div>

            <motion.div
              className="mt-8 grid gap-5 lg:grid-cols-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              {section.reviews.map((review) => (
                <motion.article
                  key={`${section.id}-${review.name}-${review.dateLabel}`}
                  className="h-full rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm"
                  variants={scaleIn}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                      {section.id === "yelp-reviews" ? "Yelp Review" : "Google Review"}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold text-slate-600" aria-label={`${review.rating} star review`}>
                        {review.rating}.0 rating
                      </div>
                      <span className="text-sm font-medium text-slate-500">{review.dateLabel}</span>
                    </div>
                  </div>

                  <blockquote className="mt-5 text-base leading-7 text-slate-700">
                    "{review.quote}"
                  </blockquote>

                  <div className="mt-6 border-t border-slate-200 pt-4">
                    <p className="font-semibold text-slate-900">{review.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {section.id === "yelp-reviews" ? "Yelp reviewer" : "Google reviewer"}
                    </p>
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
            className="rounded-xl border border-primary/10 bg-muted/40 p-8 sm:p-10"
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
                  <MinimalGlyph name="arrow-right" className="ml-2 h-4 w-4" />
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
                  onClick={() => trackReviewLinkClick("google", "testimonials_bottom_cta")}
                >
                  Read more reviews on Google
                  <MinimalGlyph name="external-link" className="ml-2 h-4 w-4" />
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
