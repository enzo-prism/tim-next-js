"use client";

import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "wouter";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { services } from "@/data/services";
import { ReviewsSection } from "@/components/review";
import { serviceReviews } from "@/data/reviews";
import { APPOINTMENT_FORM_URL, trackAppointmentCtaClick } from "@/lib/analytics";
import BrandIcon, { type BrandIconName } from "@/components/brand/BrandIcon";
import HeroBackdrop from "@/components/brand/HeroBackdrop";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";
import RelatedLinksSection from "@/components/navigation/RelatedLinksSection";
import { getRelatedLinksForService } from "@/lib/internal-links";
import { getServiceHref } from "@/lib/routes";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.5, ease: "easeOut" } 
  }
};

export default function ServiceDetail() {
  const params = useParams();
  const serviceId = params.serviceId;
  
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
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleAppointmentClick = () => {
    trackAppointmentCtaClick("service_detail");
  };

  const normalizeIconName = (iconName: string): BrandIconName => {
    if (
      iconName === "tooth" ||
      iconName === "child" ||
      iconName === "sparkles" ||
      iconName === "smile" ||
      iconName === "activity"
    ) {
      return iconName;
    }
    return "tooth";
  };

  const getIconColor = (iconName: string) => {
    const colorMap: { [key: string]: string } = {
      tooth: "bg-primary",
      child: "bg-secondary", 
      sparkles: "bg-accent",
      smile: "bg-primary",
      activity: "bg-secondary",
    };
    
    return colorMap[iconName] || "bg-primary";
  };

  const serviceUrl =
    `https://famfirstsmile.com${getServiceHref(service.id)}`;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: service.title,
    description: service.heroDescription || service.description,
    url: serviceUrl,
    provider: {
      "@type": "Dentist",
      name: "Family First Smile Care",
      url: "https://famfirstsmile.com/",
      telephone: "+1-408-358-8100",
      address: {
        "@type": "PostalAddress",
        streetAddress: "15251 National Ave, Suite 102",
        addressLocality: "Los Gatos",
        addressRegion: "CA",
        postalCode: "95032",
        addressCountry: "US",
      },
    },
    areaServed: {
      "@type": "City",
      name: "Los Gatos",
      address: {
        "@type": "PostalAddress",
        addressRegion: "CA",
        addressCountry: "US",
      },
    },
    medicalSpecialty: "Dentistry",
  };

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
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(serviceSchema)}
        </script>
      </Helmet>
      
      {/* Hero Section */}
      <motion.section 
        className="relative overflow-hidden py-20 lg:py-32"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <HeroBackdrop variant="default" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div 
              className={`${getIconColor(service.icon)} text-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}
              variants={scaleIn}
            >
              <BrandIcon name={normalizeIconName(service.icon)} className="h-12 w-12" />
            </motion.div>
            <motion.h1 
              className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6"
              variants={fadeInUp}
            >
              {service.title}
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              {service.heroDescription || service.description}
            </motion.p>
          </div>
        </div>
      </motion.section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <PageBreadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Services", href: "/services" },
            { label: service.title },
          ]}
        />

        {reviewData && reviewData.reviews.length > 0 && (
          <motion.div
            className="mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <ReviewsSection
              reviews={reviewData.reviews}
              title={`${service.title} Patient Reviews`}
              showCTA={true}
            />
          </motion.div>
        )}
        
        {/* Back Button */}
        <motion.div 
          className="mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <Button asChild variant="ghost" className="text-primary hover:bg-primary/5">
            <Link href="/services">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Services
            </Link>
          </Button>
        </motion.div>

        {/* Service Overview */}
        <motion.div 
          className="mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeInUp}>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">About {service.title}</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {service.longDescription || `Learn more about our comprehensive ${service.title.toLowerCase()} services designed to meet your oral health needs with the highest standards of care and professionalism.`}
              </p>
            </motion.div>
            <motion.div 
              className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8"
              variants={scaleIn}
            >
              <div className={`${getIconColor(service.icon)} text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6`}>
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">What's Included</h3>
              <ul className="space-y-3 text-gray-600">
                {service.details.map((detail: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>

        {/* Benefits Section */}
        {service.benefits && (
          <motion.div 
            className="mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <motion.div className="text-center mb-12" variants={fadeInUp}>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Benefits of {service.title}</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Discover how {service.title.toLowerCase()} can improve your oral health and overall well-being.
              </p>
            </motion.div>
            
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
            >
              {service.benefits.map((benefit: string, index: number) => (
                <motion.div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300"
                  variants={scaleIn}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <p className="text-gray-700 font-medium">{benefit}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Process Section */}
        {service.process && (
          <motion.div 
            className="mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <motion.div className="text-center mb-12" variants={fadeInUp}>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Process</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Here's what you can expect during your {service.title.toLowerCase()} treatment.
              </p>
            </motion.div>
            
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
            >
              {service.process.map((step: string, index: number) => (
                <motion.div
                  key={index}
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
          </motion.div>
        )}

        <RelatedLinksSection title="Related Services & Resources" links={relatedLinks} />

        {/* Call to Action */}
        <motion.div 
          className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-8 lg:p-12 text-center text-white mt-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={scaleIn}
        >
          <motion.h2 
            className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4"
            variants={fadeInUp}
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p 
            className="text-lg sm:text-xl mb-8 text-white/95 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Schedule your consultation today and take the first step towards better oral health with our {service.title.toLowerCase()} services.
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
        </motion.div>
      </div>
    </div>
  );
}
