"use client";

import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle, ScanLine } from "lucide-react";
import IteroScannerImage from "@/components/itero-scanner-image";
import { APPOINTMENT_FORM_URL, trackAppointmentCtaClick } from "@/lib/analytics";
import { iteroContent } from "@shared/marketing-pages";
import { buildFaqSchema, buildServiceSchema } from "@shared/structured-data";
import HeadingMark from "@/components/brand/HeadingMark";
import HeroBackdrop from "@/components/brand/HeroBackdrop";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";
import RelatedLinksSection from "@/components/navigation/RelatedLinksSection";
import type { RelatedLink } from "@/lib/internal-links";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function IteroDigitalScanner() {
  const handleAppointmentClick = () => {
    trackAppointmentCtaClick("itero");
  };

  const faqSchema = buildFaqSchema(iteroContent.faqs);
  const serviceSchema = buildServiceSchema(
    "Digital impressions with iTero scanner",
    iteroContent.hero.subtitle,
    "https://famfirstsmile.com/technology/itero-digital-scanner",
  );
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

  return (
    <div className="pt-16 pb-20 bg-white">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <motion.section
        className="relative overflow-hidden py-20 lg:py-32"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <HeroBackdrop variant="default" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                className="bg-secondary text-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                variants={scaleIn}
              >
                <ScanLine className="w-7 h-7" />
              </motion.div>
              <motion.h1
                className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6"
                variants={fadeInUp}
              >
                <span className="inline-flex items-center gap-3 flex-wrap">
                  <HeadingMark />
                  <span>{iteroContent.hero.title}</span>
                </span>
              </motion.h1>
              <motion.p className="text-xl text-gray-600" variants={fadeInUp}>
                {iteroContent.hero.subtitle}
              </motion.p>
              <motion.p className="text-gray-600 mt-6" variants={fadeInUp}>
                Explore our{" "}
                <Link href="/services/invisalign" className="text-primary font-semibold">
                  Invisalign clear aligners
                </Link>
                {" "}to see how digital scans support your treatment plan.
              </motion.p>
            </div>
            <motion.div variants={scaleIn}>
              <IteroScannerImage className="min-h-[260px]" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageBreadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Services", href: "/services" },
            { label: "iTero Digital Scanner" },
          ]}
        />

        <motion.section
          className="mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {iteroContent.whatIs.heading}
              </h2>
              <p className="text-gray-600 leading-relaxed">{iteroContent.whatIs.body}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {iteroContent.whyUse.heading}
              </h3>
              <ul className="space-y-3 text-gray-700">
                {iteroContent.whyUse.bullets.map((item) => (
                  <li key={item} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {iteroContent.whatToExpect.heading}
            </h2>
          </div>
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
          >
            {iteroContent.whatToExpect.steps.map((step, index) => (
              <motion.div
                key={step}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center"
                variants={scaleIn}
              >
                <div className="bg-secondary text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-bold">{index + 1}</span>
                </div>
                <p className="text-gray-700 font-medium">{step}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          className="mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">iTero Scanner FAQs</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Answers to common questions about digital impressions and iTero scans.
            </p>
          </div>
          <div className="space-y-6">
            {iteroContent.faqs.map((faq) => (
              <div key={faq.question} className="border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <RelatedLinksSection title="Related Services & Resources" links={relatedLinks} />

        <motion.section
          className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-8 lg:p-12 text-center text-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={scaleIn}
        >
          <motion.h2
            className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4"
            variants={fadeInUp}
          >
            Book Your Appointment
          </motion.h2>
          <motion.p
            className="text-lg sm:text-xl mb-8 text-white/95 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Schedule your visit to experience comfortable, precise digital impressions.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={fadeInUp}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href={APPOINTMENT_FORM_URL}
                className="w-full sm:w-auto inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-white px-8 py-4 text-lg font-semibold text-primary shadow-lg ring-offset-background transition-[transform,box-shadow] duration-200 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
                onClick={handleAppointmentClick}
              >
                Book Your Appointment
              </Link>
            </motion.div>
            <span className="text-white text-sm">or call (408) 358-8100</span>
          </motion.div>
        </motion.section>

        <p className="text-xs text-gray-500 text-center mt-8">
          {iteroContent.trademarkNote}
        </p>
      </div>
    </div>
  );
}
