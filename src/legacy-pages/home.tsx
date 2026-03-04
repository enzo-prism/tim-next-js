"use client";

import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import TestimonialCarousel from "@/components/testimonial-carousel";
import SocialMediaSection from "@/components/social-media";
import { ArrowRight, Heart, Microscope, Users, Star } from "lucide-react";
import { APPOINTMENT_FORM_URL, trackAppointmentCtaClick } from "@/lib/analytics";
import BrandIcon from "@/components/brand/BrandIcon";
import HeadingMark from "@/components/brand/HeadingMark";
import HeroBackdrop from "@/components/brand/HeroBackdrop";

// Animation variants for reusable patterns
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
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

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

const OFFICE_TOUR_VIDEO_SRC =
  "https://player.vimeo.com/video/1106179834?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&loop=1&muted=1&background=1&controls=0";

const featuredServices = [
  {
    title: "Family Dentistry",
    description: "Routine check-ups, cleanings, and preventive care for all ages.",
    href: "/services/family-dentistry",
    icon: "tooth" as const,
    iconBg: "bg-primary",
    panelAccent: "from-primary to-primary/60",
  },
  {
    title: "Children's Dentistry",
    description: "Gentle first visits and child-friendly care with toys and stickers.",
    href: "/services/children-dentistry",
    icon: "child" as const,
    iconBg: "bg-secondary",
    panelAccent: "from-secondary to-secondary/60",
  },
  {
    title: "Dental Hygiene",
    description: "Professional cleanings and coaching for stronger, healthier smiles.",
    href: "/services/dental-hygiene",
    icon: "sparkles" as const,
    iconBg: "bg-accent",
    panelAccent: "from-accent to-accent/60",
  },
  {
    title: "Invisalign",
    description: "Clear aligners for straighter teeth with free consultations.",
    href: "/services/invisalign",
    icon: "smile" as const,
    iconBg: "bg-primary",
    panelAccent: "from-primary to-secondary",
  },
];

const additionalServices = [
  {
    title: "Dental Exams",
    description: "Comprehensive checkups and early detection.",
    href: "/services/dental-exams",
  },
  {
    title: "Night Guards",
    description: "Custom protection for grinding and jaw tension.",
    href: "/services/night-guards",
  },
  {
    title: "Restorative Dentistry",
    description: "Repair damaged teeth and restore function.",
    href: "/services/restorative-dentistry",
  },
  {
    title: "Teeth Whitening",
    description: "Professional brightening for a confident smile.",
    href: "/services/teeth-whitening",
  },
  {
    title: "Dental Crowns",
    description: "Durable crowns to restore damaged teeth.",
    href: "/services/dental-crowns",
  },
  {
    title: "TMJ Treatment",
    description: "Relief for jaw pain and headaches.",
    href: "/tmj",
  },
  {
    title: "Baby's First Visit",
    description: "Gentle introductions for infants and toddlers.",
    href: "/services/childrens-dentistry/babys-first-visit",
  },
];

const patientResources = [
  {
    title: "Patient Info",
    description: "FAQs, insurance, and what to expect at your visit.",
    href: "/patient-info",
  },
  {
    title: "Brushing Guide",
    description: "Step-by-step brushing technique and age-based tips.",
    href: "/patient-info/brushing",
  },
  {
    title: "Flossing Fundamentals",
    description: "Daily flossing technique to support healthy gums.",
    href: "/patient-info/flossing",
  },
  {
    title: "Nutrition Tips",
    description: "Tooth-friendly food choices and habits that help prevent decay.",
    href: "/patient-info/nutrition",
  },
];

export default function Home() {
  const handleAppointmentClick = () => {
    trackAppointmentCtaClick("home_hero");
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-14 sm:py-20 lg:py-24">
        <HeroBackdrop variant="default" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:gap-14">
            <motion.div
              initial={false}
              animate="visible"
              variants={slideInLeft}
              className="max-w-2xl"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-800 mb-5 sm:mb-6 leading-tight text-balance">
                <motion.span
                  initial={false}
                  animate="visible"
                  variants={fadeInUp}
                  style={{ display: 'block' }}
                >
                  Gentle, Compassionate Dental Care for the Whole Family
                </motion.span>
              </h1>
              <motion.p 
                className="text-xl text-gray-600 mb-8"
                variants={fadeInUp}
              >
                We provide exceptional dental care in a warm environment to foster healthy smiles for life.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                variants={fadeInUp}
              >
                <Button
                  asChild
                  className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 text-base sm:text-lg font-semibold px-6 sm:px-8 py-3 hover:scale-105 transition duration-200 motion-reduce:hover:scale-100 motion-reduce:transition-none"
                >
                  <Link href={APPOINTMENT_FORM_URL} onClick={handleAppointmentClick}>
                    Schedule Appointment
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground text-base sm:text-lg font-semibold px-6 sm:px-8 py-3 hover:scale-105 transition duration-200 motion-reduce:hover:scale-100 motion-reduce:transition-none"
                >
                  <Link href="/team">Meet the Team</Link>
                </Button>
              </motion.div>
            </motion.div>
            <motion.div 
              className="relative mx-auto w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[390px]"
              initial={false}
              animate="visible"
              variants={slideInRight}
            >
              <motion.p
                className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary/75"
                variants={fadeInUp}
              >
                Virtual Office Tour
              </motion.p>
              <motion.div 
                className="relative"
                variants={scaleIn}
              >
                <div
                  className="absolute -inset-2 rounded-[2rem] bg-gradient-to-b from-white/80 via-white/30 to-primary/15 blur-md"
                  aria-hidden="true"
                />
                <div className="relative rounded-[1.8rem] border border-white/70 bg-white/80 p-2 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.42)] backdrop-blur-sm">
                  <div className="relative aspect-[9/16] overflow-hidden rounded-[1.35rem] bg-slate-900">
                    <iframe
                      src={OFFICE_TOUR_VIDEO_SRC}
                      className="absolute inset-0 h-full w-full"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                      title="Family First Smile Care Office Tour"
                    />
                  </div>
                </div>
              </motion.div>
              <motion.div 
                className="mt-4 inline-flex items-center gap-3 rounded-xl bg-white/95 px-4 py-3 shadow-lg ring-1 ring-slate-200 sm:absolute sm:-bottom-6 sm:-left-10 sm:mt-0"
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <span className="text-accent text-lg leading-none">⭐</span>
                <div>
                  <p className="font-semibold leading-tight">5.0 Rating</p>
                  <p className="text-sm text-gray-600 leading-tight">From 60+ families</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-blue-50/40 py-16 sm:py-20">
        <div
          className="pointer-events-none absolute -left-28 top-8 h-64 w-64 rounded-full bg-secondary/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-24 bottom-8 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12 sm:mb-14"
            initial={false}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <motion.div
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary/80"
              variants={fadeInUp}
            >
              <Star className="h-3.5 w-3.5" />
              Verified Reviews
            </motion.div>
            <motion.h2
              className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4"
              variants={fadeInUp}
            >
              <span className="inline-flex items-center justify-center gap-3">
                <HeadingMark />
                <span>What Our Patients Say</span>
              </span>
            </motion.h2>
            <motion.p 
              className="mx-auto max-w-3xl text-lg text-gray-600 sm:text-xl"
              variants={fadeInUp}
            >
              Real stories from families who trust us with their smiles
            </motion.p>
            <motion.div className="mt-6 flex flex-wrap items-center justify-center gap-3" variants={fadeInUp}>
              <div className="rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                5.0 average rating
              </div>
              <div className="rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                60+ local families
              </div>
              <div className="rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                Rotating featured stories
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={false}
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={scaleIn}
          >
            <TestimonialCarousel />
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={false}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <motion.h2
              className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4"
              variants={fadeInUp}
            >
              <span className="inline-flex items-center justify-center gap-3">
                <HeadingMark />
                <span>Why Choose Family First Smile Care?</span>
              </span>
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              We're committed to providing exceptional dental care that puts your family's comfort and health first.
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial={false}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div 
              className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-lg transition-shadow duration-300 group"
              variants={scaleIn}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <motion.div 
                className="bg-primary text-white feature-icon mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                whileHover={{ rotate: 5 }}
              >
                <Heart />
              </motion.div>
              <h3 className="text-xl font-semibold mb-3">Compassionate Care</h3>
              <p className="text-gray-600">Gentle, patient-centered approach that puts your comfort first, especially for children and anxious patients.</p>
            </motion.div>
            
            <motion.div 
              className="text-center p-6 rounded-xl bg-gradient-to-br from-secondary/5 to-secondary/10 hover:shadow-lg transition-shadow duration-300 group"
              variants={scaleIn}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <motion.div 
                className="bg-secondary text-white feature-icon mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                whileHover={{ rotate: 5 }}
              >
                <Microscope />
              </motion.div>
              <h3 className="text-xl font-semibold mb-3">Advanced Technology</h3>
              <p className="text-gray-600">State-of-the-art equipment including digital X-rays and CBCT scanners for precise, efficient treatment.</p>
            </motion.div>
            
            <motion.div 
              className="text-center p-6 rounded-xl bg-gradient-to-br from-accent/5 to-accent/10 hover:shadow-lg transition-shadow duration-300 group"
              variants={scaleIn}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <motion.div 
                className="bg-accent text-white feature-icon mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                whileHover={{ rotate: 5 }}
              >
                <Users />
              </motion.div>
              <h3 className="text-xl font-semibold mb-3">Family-Focused</h3>
              <p className="text-gray-600">Comprehensive care for all ages, from your child's first visit to adult preventive and cosmetic dentistry.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Social Media Section */}
      <SocialMediaSection />

      {/* Featured Services Section */}
      <section className="bg-gradient-to-b from-white to-blue-50/40 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12 sm:mb-14"
            initial={false}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <motion.h2
              className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4"
              variants={fadeInUp}
            >
              <span className="inline-flex items-center justify-center gap-3">
                <HeadingMark />
                <span>Our Featured Services</span>
              </span>
            </motion.h2>
            <motion.p 
              className="mx-auto max-w-3xl text-lg text-gray-600 sm:text-xl"
              variants={fadeInUp}
            >
              Comprehensive dental care tailored to your family's unique needs
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
            initial={false}
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            {featuredServices.map((service) => (
              <motion.div
                key={service.href}
                className="group"
                variants={scaleIn}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
              >
                <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-[box-shadow,border-color] duration-300 group-hover:border-primary/30 group-hover:shadow-xl">
                  <div
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${service.panelAccent}`}
                    aria-hidden="true"
                  />
                  <motion.div className="mb-5" whileHover={{ scale: 1.04, rotate: 3 }}>
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${service.iconBg} shadow-md`}>
                      <BrandIcon name={service.icon} className="h-9 w-9" />
                    </div>
                  </motion.div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-800">{service.title}</h3>
                  <p className="mb-6 text-base leading-relaxed text-gray-600">{service.description}</p>
                  <Button
                    asChild
                    variant="link"
                    className="mt-auto w-fit p-0 text-primary transition-colors duration-200 group-hover:text-primary/80"
                  >
                    <Link href={service.href}>
                      Learn More
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Explore More Services */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={false}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <motion.h2 
              className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4"
              variants={fadeInUp}
            >
              Explore More Services
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-600 max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              Specialized care options to support every stage of your smile.
            </motion.p>
          </motion.div>
          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            initial={false}
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            {additionalServices.map((service) => (
              <motion.div
                key={service.href}
                variants={scaleIn}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Link
                  href={service.href}
                  className="block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div className="h-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-lg transition-shadow duration-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{service.title}</h3>
                    <p className="text-sm text-gray-600">{service.description}</p>
                    <span className="mt-4 inline-flex text-sm font-semibold text-primary">Learn more</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Patient Resources */}
      <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={false}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <motion.h2
              className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4"
              variants={fadeInUp}
            >
              Patient Resources
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              Helpful guides and FAQs to make your visit smooth and stress-free.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
            initial={false}
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            {patientResources.map((resource) => (
              <motion.div
                key={resource.href}
                variants={scaleIn}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Link
                  href={resource.href}
                  className="block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div className="h-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-lg transition-shadow duration-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{resource.title}</h3>
                    <p className="text-sm text-gray-600">{resource.description}</p>
                    <span className="mt-4 inline-flex text-sm font-semibold text-primary">Read more</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Office Tour Video Section */}
      <motion.section 
        className="py-16 sm:py-20 bg-gradient-to-br from-primary/5 to-secondary/5"
        initial={false}
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={slideInLeft}
            >
              <motion.h2 
                className="text-3xl lg:text-4xl font-bold text-gray-800 mb-6"
                variants={fadeInUp}
              >
                Take a Virtual Tour of Our Office
              </motion.h2>
              <motion.p 
                className="text-xl text-gray-600 mb-8"
                variants={fadeInUp}
              >
                Step inside our welcoming Los Gatos location and see why families choose us for their dental care. From our comfortable waiting area to our state-of-the-art treatment rooms.
              </motion.p>
              <motion.div variants={scaleIn}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    asChild
                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-semibold px-8 py-3 transition-colors duration-200"
                  >
                    <Link href="/about">Learn More About Our Office</Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div 
              className="flex justify-center"
              variants={slideInRight}
            >
              <motion.div 
                className="relative max-w-sm mx-auto rounded-xl overflow-hidden shadow-lg"
                variants={scaleIn}
                whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
              >
                <iframe
                  className="w-full h-96 sm:h-[28rem] md:h-[32rem]"
                  src={OFFICE_TOUR_VIDEO_SRC}
                  title="Family First Smile Care Virtual Office Tour"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                  loading="lazy"
                  style={{ 
                    border: 'none', 
                    outline: 'none',
                    objectFit: 'cover'
                  }}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Google Review CTA Section */}
      <motion.section 
        className="py-16 bg-gradient-to-br from-orange-50 to-orange-100"
        initial={false}
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="flex justify-center mb-4"
            variants={scaleIn}
          >
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={false}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  viewport={{ once: true }}
                >
                  <Star className="w-8 h-8 text-orange-400 fill-current" />
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.h2 
            className="text-3xl font-bold text-gray-800 mb-4"
            variants={fadeInUp}
          >
            Love Your Experience?
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 mb-8"
            variants={fadeInUp}
          >
            Help other families find us by sharing your experience on Google. Your review means the world to us!
          </motion.p>
          <motion.div variants={scaleIn} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button asChild className="bg-orange-700 text-white hover:bg-orange-800 text-lg font-semibold px-8 py-3">
              <a href="https://g.page/r/Cej0Xl18KcCyEAE/review" target="_blank" rel="noopener noreferrer">
                <Star className="h-5 w-5 mr-2" />
                Leave a Google Review
              </a>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Call to Action Section */}
      <motion.section 
        className="py-20 gradient-primary text-white"
        initial={false}
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl lg:text-4xl font-bold mb-4"
            variants={fadeInUp}
          >
            Ready for Your Best Smile?
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 text-white/95"
            variants={fadeInUp}
          >
            Schedule your free Invisalign consultation today and take the first step towards a healthier, more confident smile.
          </motion.p>
          <motion.div variants={scaleIn}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild className="bg-white text-primary hover:bg-gray-100 text-lg font-semibold px-8 py-3">
                <Link href="/contact">Schedule Free Consultation</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
