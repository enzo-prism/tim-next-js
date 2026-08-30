"use client";

import { Link } from "wouter";
import ServiceCard from "@/components/service-card";
import { services } from "@/data/services";
import { ReviewsSection } from "@/components/review";
import { generalReviews } from "@/data/reviews";
import { buildAppointmentUrl, trackAppointmentCtaClick } from "@/lib/analytics";
import HeroBackdrop from "@/components/brand/HeroBackdrop";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";
import { Button } from "@/components/ui/button";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";

const careStartingPoints = [
  {
    title: "I need a checkup",
    description: "Start with a complete exam and a clear care plan.",
    href: "/services/dental-exams",
  },
  {
    title: "I want a cleaning",
    description: "Explore preventive cleanings and gum-health care.",
    href: "/services/dental-hygiene",
  },
  {
    title: "I'm bringing my child",
    description: "See gentle dental care designed for growing smiles.",
    href: "/services/children-dentistry",
  },
  {
    title: "I need to repair a tooth",
    description: "Review fillings, crowns, and restorative options.",
    href: "/services/restorative-dentistry",
  },
  {
    title: "I have jaw pain",
    description: "Learn how the team evaluates TMJ and bite concerns.",
    href: "/tmj",
  },
  {
    title: "I want to improve my smile",
    description: "Explore clear aligners and cosmetic treatment options.",
    href: "/services/invisalign",
  },
] as const;

export default function Services() {
  const handleAppointmentClick = () => {
    trackAppointmentCtaClick("services_cta");
  };

  return (
    <div className="pt-16 pb-20 bg-background">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <HeroBackdrop variant="default" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight"
            >
              Our Comprehensive Services
            </h1>
            <p
              className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
              From routine cleanings to advanced treatments, we offer complete dental care for your entire family with state-of-the-art technology and compassionate care.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageBreadcrumbs items={[{ label: "Home", href: "/" }, { label: "Services" }]} />
      </div>

      <section aria-labelledby="care-starting-points" className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Find the right starting point</p>
            <h2 id="care-starting-points" className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">
              Start with what you need
            </h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              Choose the concern that sounds closest. You can also request a visit and our team will help you plan the right next step.
            </p>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {careStartingPoints.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group flex min-h-32 items-start justify-between gap-4 rounded-xl border border-border bg-muted/40 p-5 transition-colors hover:border-primary/40 hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                <span>
                  <span className="block font-semibold text-foreground group-hover:text-primary">{item.title}</span>
                  <span className="mt-2 block text-sm leading-6 text-muted-foreground">{item.description}</span>
                </span>
                <MinimalGlyph name="arrow-right" className="mt-1 h-4 w-4 shrink-0 text-primary" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20"
      >
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.id}
            >
              <ServiceCard 
                service={service} 
                featured={service.featured === true}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Featured Patient Reviews */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ReviewsSection 
          reviews={generalReviews.slice(0, 4)} 
          title="What Our Patients Say About Our Services"
          showCTA={true}
        />
      </div>

      {/* Call to Action Section */}
      <section
        className="relative py-16 lg:py-24 mx-4 sm:mx-6 lg:mx-8 mt-16"
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-primary rounded-xl p-8 lg:p-12 text-center text-white shadow-sm">
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4"
            >
              Ready to Start Your Dental Journey?
            </h2>
            <p
              className="text-lg sm:text-xl mb-8 text-white/95 max-w-2xl mx-auto"
            >
              Send a visit request and tell us what you need. Our team will contact you to confirm the next step.
            </p>
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                asChild
                className="w-full sm:w-auto inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-white px-8 py-4 text-lg font-semibold text-primary shadow-sm ring-offset-background transition-colors duration-200 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                <Link href={buildAppointmentUrl({ source: "services_hero" })} onClick={handleAppointmentClick}>
                  Request an Appointment
                </Link>
              </Button>
              <span className="text-white text-sm">or call (408) 358-8100</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
