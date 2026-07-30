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
              Schedule your consultation today and discover how our comprehensive dental services can transform your smile and oral health.
            </p>
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                asChild
                className="w-full sm:w-auto inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-white px-8 py-4 text-lg font-semibold text-primary shadow-sm ring-offset-background transition-colors duration-200 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                <Link href={buildAppointmentUrl({ source: "services_hero" })} onClick={handleAppointmentClick}>
                  Book Your Appointment
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
