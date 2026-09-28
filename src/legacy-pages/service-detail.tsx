import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { services } from "@/data/services";
import { ReviewsSection } from "@/components/review";
import { serviceReviews } from "@/data/reviews";
import { buildAppointmentUrl } from "@/lib/analytics";
import { AppointmentLink } from "@/components/tracking/tracked-links";
import { FinalCtaPhoneLink } from "@/components/service-growth/final-cta-phone-link";
import HeroBackdrop from "@/components/brand/HeroBackdrop";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";
import RelatedLinksSection from "@/components/navigation/RelatedLinksSection";
import { getRelatedLinksForService } from "@/lib/internal-links";

type ServiceDetailProps = {
  serviceId: string;
};

export default function ServiceDetail({ serviceId }: ServiceDetailProps) {
  // Find the service by ID (check both main services and sub-services)
  const service = services.find(s => s.id === serviceId) || 
    services.flatMap(s => s.subServices || []).find(s => s.id === serviceId);

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

  const findReviewData = () => {
    let reviewData = serviceReviews.find((sr) => sr.serviceId === service.id);

    if (!reviewData) {
      const parentMappings: { [key: string]: string } = {
        invisalign: "restorative-dentistry",
        "teeth-whitening": "restorative-dentistry",
        "dental-crowns": "restorative-dentistry",
      };

      const parentId = parentMappings[service.id];
      if (parentId) {
        reviewData = serviceReviews.find((sr) => sr.serviceId === parentId);
      }
    }

    return reviewData;
  };

  const reviewData = findReviewData();
  const relatedLinks = getRelatedLinksForService(service.id);

  return (
    <div className="pt-16 pb-20 bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <HeroBackdrop variant="default" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              {service.title} in Los Gatos
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {service.heroDescription || service.description}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <PageBreadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Services", href: "/services" },
            { label: service.title },
          ]}
        />

        {reviewData && reviewData.reviews.length > 0 && (
          <div className="mb-12">
            <ReviewsSection
              reviews={reviewData.reviews}
              title={`${service.title} Patient Reviews`}
              showCTA={true}
            />
          </div>
        )}
        
        {/* Back Button */}
        <div className="mb-12">
          <Button asChild variant="ghost" className="text-primary hover:bg-primary/5">
            <Link href="/services">
              <MinimalGlyph name="arrow-left" className="h-4 w-4 mr-2" />
              Back to All Services
            </Link>
          </Button>
        </div>

        {/* Service Overview */}
        <div className="mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">About {service.title}</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {service.longDescription || `Learn how our Los Gatos team approaches ${service.title.toLowerCase()} with clear explanations, thoughtful planning, and your comfort in mind.`}
              </p>
            </div>
            <div className="bg-muted/40 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">What's Included</h3>
              <ul className="space-y-3 text-gray-600">
                {service.details.map((detail: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <MinimalGlyph name="check-circle" className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        {service.benefits && (
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Benefits of {service.title}</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Discover how {service.title.toLowerCase()} can improve your oral health and overall well-being.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.benefits.map((benefit: string, index: number) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow duration-300"
                >
                  <p className="text-gray-700 font-medium">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Process Section */}
        {service.process && (
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Process</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Here's what you can expect during your {service.title.toLowerCase()} treatment.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.process.map((step: string, index: number) => (
                <div key={index} className="bg-muted/50 rounded-xl p-6 text-center">
                  <div className="bg-primary text-white w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="font-bold">{index + 1}</span>
                  </div>
                  <p className="text-gray-700 font-medium">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <RelatedLinksSection title="Related Services & Resources" links={relatedLinks} />

        {/* Call to Action */}
        <div className="bg-primary rounded-xl p-8 lg:p-12 text-center text-white mt-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg sm:text-xl mb-8 text-white/95 max-w-2xl mx-auto">
            Schedule your consultation today and take the first step towards better oral health with our {service.title.toLowerCase()} services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div>
              <AppointmentLink
                href={buildAppointmentUrl({ serviceId: service.id, source: "service_detail" })}
                className="w-full sm:w-auto inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-white px-8 py-4 text-lg font-semibold text-primary shadow-sm ring-offset-background transition-[transform,box-shadow] duration-200 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
                source="service_detail"
                ctaType="consultation"
                serviceId={service.id}
              >
                Book Your Appointment
              </AppointmentLink>
            </div>
            <FinalCtaPhoneLink location="service_detail_final" serviceId={service.id}>
              or call (408) 358-8100
            </FinalCtaPhoneLink>
          </div>
        </div>
      </div>
    </div>
  );
}
