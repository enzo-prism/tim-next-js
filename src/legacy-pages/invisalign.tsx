import Image from "next/image";
import { Link } from "wouter";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { Button } from "@/components/ui/button";
import { ReviewsSection } from "@/components/review";
import { ServiceHeroConversion } from "@/components/service-growth/service-hero-conversion";
import { services } from "@/data/services";
import { serviceReviews } from "@/data/reviews";
import { buildAppointmentUrl } from "@/lib/analytics";
import { AppointmentLink } from "@/components/tracking/tracked-links";
import { FinalCtaPhoneLink } from "@/components/service-growth/final-cta-phone-link";
import { invisalignContent } from "@shared/marketing-pages";
import HeroBackdrop from "@/components/brand/HeroBackdrop";
import illustrationAligners from "@assets/brand/illustration-aligners.webp";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";
import RelatedLinksSection from "@/components/navigation/RelatedLinksSection";
import type { RelatedLink } from "@/lib/internal-links";

export default function Invisalign() {
  const service = services
    .flatMap((item) => [item, ...(item.subServices || [])])
    .find((item) => item.id === "invisalign");

  const reviewData = serviceReviews.find((review) => review.serviceId === "invisalign");

  if (!service) {
    return (
      <div className="pt-16 pb-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Service Not Found</h1>
          <p className="text-gray-600 mb-8">The service you're looking for doesn't exist.</p>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/services">
              <MinimalGlyph name="arrow-left" className="h-4 w-4 mr-2" />
              Back to Services
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const processSteps = service.process ?? [];
  const benefits = service.benefits ?? [];
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

  return (
    <div className="pt-16 pb-20 bg-white">
      <section className="relative overflow-hidden py-16 lg:py-24">
        <HeroBackdrop variant="warm" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
                <span className="inline-flex items-center gap-3 flex-wrap justify-center lg:justify-start">
                  
                  <span>{invisalignContent.hero.title}</span>
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto lg:mx-0">
                {invisalignContent.hero.subtitle}
              </p>
              <div>
                <ServiceHeroConversion
                  className="mt-8"
                  serviceId="invisalign"
                  serviceName="Invisalign"
                  source="invisalign_hero"
                  review={reviewData?.reviews[0]}
                />
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <Image
                src={illustrationAligners}
                alt="Clear aligner trays illustration"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="w-full max-w-xl rounded-xl bg-white/60 p-6 shadow-sm h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <PageBreadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Services", href: "/services" },
            { label: "Invisalign" },
          ]}
        />
      </div>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {invisalignContent.iteroSection.heading}
              </h2>
              {invisalignContent.iteroSection.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-gray-600 mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
              <p className="text-gray-600 mt-6">
                Learn more about our{" "}
                <Link href="/technology/itero-digital-scanner" className="text-primary font-semibold">
                  iTero digital scanner
                </Link>
                {" "}and how it supports Invisalign planning.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-8 shadow-sm">
              <ul className="space-y-3 text-gray-700">
                {invisalignContent.iteroSection.bullets.map((item) => (
                  <li key={item} className="flex items-start">
                    <MinimalGlyph name="check-circle" className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 mt-4">
                {invisalignContent.iteroSection.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {reviewData && reviewData.reviews.length > 0 && (
          <div className="mb-12">
            <ReviewsSection
              reviews={reviewData.reviews}
              title="Invisalign Patient Reviews"
              showCTA={true}
            />
          </div>
        )}

        <div className="mb-12">
          <Button asChild variant="ghost" className="text-primary hover:bg-primary/5">
            <Link href="/services">
              <MinimalGlyph name="arrow-left" className="h-4 w-4 mr-2" />
              Back to All Services
            </Link>
          </Button>
        </div>

        <div className="mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">About Invisalign</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {service.longDescription}
              </p>
            </div>
            <div className="bg-muted/40 rounded-xl p-8">
              <div className="bg-primary text-white w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6">
                <MinimalGlyph name="check-circle" className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                What's Included
              </h3>
              <ul className="space-y-3 text-gray-600">
                {service.details.map((detail) => (
                  <li key={detail} className="flex items-center">
                    <MinimalGlyph name="check-circle" className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {invisalignContent.whatCanHelp.heading}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {invisalignContent.whatCanHelp.bullets.map((item) => (
              <div
                key={item}
                className="bg-white border border-gray-200 rounded-xl p-6"
              >
                <p className="text-gray-700 font-medium">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Benefits of Invisalign
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover how Invisalign clear aligners can improve your smile and confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow duration-300"
              >
                <div className="bg-primary text-white w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <MinimalGlyph name="check-circle" className="h-6 w-6" />
                </div>
                <p className="text-gray-700 font-medium">{benefit}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Process</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Here's what you can expect during Invisalign treatment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processSteps.map((step, index) => (
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
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Invisalign &amp; iTero FAQs</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Quick answers to common questions about Invisalign and iTero digital scans.
            </p>
          </div>
          <div className="space-y-6">
            {invisalignContent.faqs.map((faq) => (
              <div key={faq.question} className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <RelatedLinksSection title="Related Services & Resources" links={relatedLinks} />

        <div className="bg-primary rounded-xl p-8 lg:p-12 text-center text-white">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg sm:text-xl mb-8 text-white/95 max-w-2xl mx-auto">
            Schedule your Invisalign consultation and take the first step toward a healthier, confident smile.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div>
              <AppointmentLink
                href={buildAppointmentUrl({ serviceId: "invisalign", source: "invisalign_page" })}
                className="w-full sm:w-auto inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-white px-8 py-4 text-lg font-semibold text-primary shadow-sm ring-offset-background transition-[transform,box-shadow] duration-200 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
                source="invisalign"
                ctaType="consultation"
                serviceId="invisalign"
              >
                Book Your Appointment
              </AppointmentLink>
            </div>
            <FinalCtaPhoneLink location="invisalign_page_final" serviceId="invisalign">
              Call (408) 358-8100
            </FinalCtaPhoneLink>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center mt-8">
          {invisalignContent.trademarkNote}
        </p>
      </div>
    </div>
  );
}
