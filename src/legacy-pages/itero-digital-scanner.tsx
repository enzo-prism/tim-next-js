import { Link } from "wouter";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import IteroScannerImage from "@/components/itero-scanner-image";
import { buildAppointmentUrl } from "@/lib/analytics";
import { AppointmentLink } from "@/components/tracking/tracked-links";
import { FinalCtaPhoneLink } from "@/components/service-growth/final-cta-phone-link";
import { iteroContent } from "@shared/marketing-pages";
import HeroBackdrop from "@/components/brand/HeroBackdrop";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";
import RelatedLinksSection from "@/components/navigation/RelatedLinksSection";
import type { RelatedLink } from "@/lib/internal-links";

export default function IteroDigitalScanner() {
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
      <section className="relative overflow-hidden py-20 lg:py-32">
        <HeroBackdrop variant="default" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
                <span className="inline-flex items-center gap-3 flex-wrap">
                  
                  <span>{iteroContent.hero.title}</span>
                </span>
              </h1>
              <p className="text-xl text-gray-600">
                {iteroContent.hero.subtitle}
              </p>
              <p className="text-gray-600 mt-6">
                Explore our{" "}
                <Link href="/services/invisalign" className="text-primary font-semibold">
                  Invisalign clear aligners
                </Link>
                {" "}to see how digital scans support your treatment plan.
              </p>
            </div>
            <div>
              <IteroScannerImage className="min-h-[260px]" />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageBreadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Services", href: "/services" },
            { label: "iTero Digital Scanner" },
          ]}
        />

        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {iteroContent.whatIs.heading}
              </h2>
              <p className="text-gray-600 leading-relaxed">{iteroContent.whatIs.body}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {iteroContent.whyUse.heading}
              </h3>
              <ul className="space-y-3 text-gray-700">
                {iteroContent.whyUse.bullets.map((item) => (
                  <li key={item} className="flex items-start">
                    <MinimalGlyph name="check-circle" className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {iteroContent.whatToExpect.heading}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {iteroContent.whatToExpect.steps.map((step, index) => (
              <div key={step} className="bg-muted/50 rounded-xl p-6 text-center">
                <div className="bg-primary text-white w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="font-bold">{index + 1}</span>
                </div>
                <p className="text-gray-700 font-medium">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">iTero Scanner FAQs</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Answers to common questions about digital impressions and iTero scans.
            </p>
          </div>
          <div className="space-y-6">
            {iteroContent.faqs.map((faq) => (
              <div key={faq.question} className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <RelatedLinksSection title="Related Services & Resources" links={relatedLinks} />

        <section className="bg-primary rounded-xl p-8 lg:p-12 text-center text-white">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Book Your Appointment
          </h2>
          <p className="text-lg sm:text-xl mb-8 text-white/95 max-w-2xl mx-auto">
            Schedule your visit to experience comfortable, precise digital impressions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div>
              <AppointmentLink
                href={buildAppointmentUrl({ serviceId: "invisalign", source: "itero_page" })}
                className="w-full sm:w-auto inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-white px-8 py-4 text-lg font-semibold text-primary shadow-sm ring-offset-background transition-[transform,box-shadow] duration-200 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
                source="itero"
                ctaType="appointment"
                serviceId="itero-digital-scanner"
              >
                Book Your Appointment
              </AppointmentLink>
            </div>
            <FinalCtaPhoneLink location="itero_page_final" serviceId="itero-digital-scanner">
              or call (408) 358-8100
            </FinalCtaPhoneLink>
          </div>
        </section>

        <p className="text-xs text-gray-500 text-center mt-8">
          {iteroContent.trademarkNote}
        </p>
      </div>
    </div>
  );
}
