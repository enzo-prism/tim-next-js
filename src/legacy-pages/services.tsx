"use client";

import { motion } from "framer-motion";
import { Link } from "wouter";
import ServiceCard from "@/components/service-card";
import { services } from "@/data/services";
import { ReviewsSection } from "@/components/review";
import { generalReviews } from "@/data/reviews";
import { APPOINTMENT_FORM_URL, trackAppointmentCtaClick } from "@/lib/analytics";
import HeadingMark from "@/components/brand/HeadingMark";
import HeroBackdrop from "@/components/brand/HeroBackdrop";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
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

export default function Services() {
  const handleAppointmentClick = () => {
    trackAppointmentCtaClick("services_cta");
  };

  return (
    <div className="pt-16 pb-20 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <HeroBackdrop variant="default" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight"
              variants={fadeInUp}
            >
              <span className="inline-flex items-center justify-center gap-3 flex-wrap">
                <HeadingMark />
                <span>
                  Our{" "}
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Comprehensive
                  </span>{" "}
                  Services
                </span>
              </span>
            </motion.h1>
            <motion.p 
              className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              From routine cleanings to advanced treatments, we offer complete dental care for your entire family with state-of-the-art technology and compassionate care.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageBreadcrumbs items={[{ label: "Home", href: "/" }, { label: "Services" }]} />
      </div>

      {/* Services Grid */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
      >
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-2">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              variants={scaleIn}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <ServiceCard 
                service={service} 
                featured={service.featured || (service.subServices && service.subServices.some(sub => sub.featured))}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Featured Patient Reviews */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ReviewsSection 
          reviews={generalReviews.slice(0, 4)} 
          title="What Our Patients Say About Our Services"
          showCTA={true}
        />
      </div>

      {/* Call to Action Section */}
      <motion.section 
        className="relative py-16 lg:py-24 mx-4 sm:mx-6 lg:mx-8 mt-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-8 lg:p-12 text-center text-white shadow-2xl">
            <motion.h2 
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4"
              variants={fadeInUp}
            >
              Ready to Start Your Dental Journey?
            </motion.h2>
            <motion.p 
              className="text-lg sm:text-xl mb-8 text-white/95 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Schedule your consultation today and discover how our comprehensive dental services can transform your smile and oral health.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              variants={fadeInUp}
            >
              <motion.div
                className="w-full sm:w-auto inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-white px-8 py-4 text-lg font-semibold text-primary shadow-lg ring-offset-background transition-[transform,box-shadow] duration-200 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href={APPOINTMENT_FORM_URL} onClick={handleAppointmentClick}>
                  Book Your Appointment
                </Link>
              </motion.div>
              <span className="text-white text-sm">or call (408) 358-8100</span>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
