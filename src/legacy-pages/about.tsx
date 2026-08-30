"use client";

import Image from "next/image";
import { Link } from "wouter";
import { motion } from "framer-motion";
import HeroBackdrop from "@/components/brand/HeroBackdrop";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";
import RelatedLinksSection from "@/components/navigation/RelatedLinksSection";
import VideoFacade from "@/components/video-facade";
import type { RelatedLink } from "@/lib/internal-links";

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

const photoGalleryVariant = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  }
};

// Import office photos
import officePhoto1 from "@assets/Office Photo 1_1753972057110.jpeg";
import officePhoto2 from "@assets/Office photo 2_1753972057109.jpeg";
import officePhoto3 from "@assets/Office Photo 3_1753972057109.jpeg";
import officePhoto4 from "@assets/Office Photo 4_1753972057109.jpeg";
import officePhoto5 from "@assets/Office Photo 5_1753972057109.jpeg";
import officePhoto6 from "@assets/Office Photo 6_1753972057109.jpeg";
import officePhoto7 from "@assets/Office Photo 7_1753972057109.jpeg";
import officePhoto8 from "@assets/Office Photo 8_1753972057109.jpeg";
import officePhoto9 from "@assets/Office Photo 9_1753972057108.jpeg";
import officePhoto10 from "@assets/Office Photo 10_1753972057108.jpeg";
import officePhoto11 from "@assets/Office Photo 11_1753972057108.jpg";
import officePhoto12 from "@assets/Office Photo 12_1753972057108.jpg";

export default function About() {
  const relatedLinks: RelatedLink[] = [
    {
      href: "/team",
      title: "Meet Our Team",
      description: "Get to know Dr. Chuang and the caring team behind your visit.",
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
      description: "Ask a question, request an appointment, or get directions to our office.",
    },
    {
      href: "/technology/itero-digital-scanner",
      title: "iTero Digital Scanner",
      description: "Comfortable 3D digital scans used in Invisalign planning and smile previews.",
    },
    {
      href: "/tmj",
      title: "TMJ Treatment",
      description: "Relief for jaw pain and dysfunction with personalized care.",
    },
  ];

  return (
    <div className="pt-16 pb-20 bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <HeroBackdrop variant="default" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={false}
            animate="visible"
            variants={staggerContainer}
          >
            <motion.h1 
              className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6"
              variants={fadeInUp}
            >
              About Family First Smile Care
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              Founded on the principles of compassionate care and family-centered dentistry
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <PageBreadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
        
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={false}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={slideInLeft}
          >
            <motion.h2 
              className="text-3xl font-bold text-gray-800 mb-6"
              variants={fadeInUp}
            >
              Our Story
            </motion.h2>
            <motion.p 
              className="text-gray-600 mb-6"
              variants={fadeInUp}
            >
              Family First Smile Care was founded by Dr. Tim J. Chuang with a simple mission: to provide exceptional dental care in a warm, welcoming environment that puts families first. As a locally owned practice in Los Gatos, we understand the unique needs of our community and are committed to building lasting relationships with our patients.
            </motion.p>
            <motion.p 
              className="text-gray-600 mb-6"
              variants={fadeInUp}
            >
              Our practice is built on the foundation of trust, compassion, and excellence. We believe that dental care should be a positive experience for every member of your family, from toddlers taking their first steps into oral health to seniors maintaining their beautiful smiles.
            </motion.p>
            <motion.p
              className="text-gray-600 mb-6"
              variants={fadeInUp}
            >
              Meet our{" "}
              <Link
                href="/team"
                className="text-primary font-semibold hover:text-primary transition-colors"
              >
                team
              </Link>
              , explore our{" "}
              <Link
                href="/services"
                className="text-primary font-semibold hover:text-primary transition-colors"
              >
                services
              </Link>
              , or{" "}
              <Link
                href="/book-appointment?source=about_story"
                className="text-primary font-semibold hover:text-primary transition-colors"
              >
                request a visit
              </Link>
              {" "}online.
            </motion.p>
          </motion.div>
          <motion.div
            initial={false}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={slideInRight}
          >
            <motion.div 
              className="rounded-xl shadow-sm w-full h-96 relative overflow-hidden bg-white"
              variants={scaleIn}
              whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
            >
              <div className="absolute inset-2 rounded-xl overflow-hidden">
                <VideoFacade
                  videoSrc="https://player.vimeo.com/video/1106163189?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&loop=1&muted=1&background=1"
                  title="Family First Smile Care Patient Experience"
                  poster={officePhoto5}
                  posterAlt="Patients welcomed at the Family First Smile Care front desk"
                  posterSizes="(max-width: 1024px) 100vw, 50vw"
                  playLabel="Play patient experience"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        <motion.div 
          className="bg-gray-50 rounded-xl p-8 lg:p-12"
          initial={false}
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={scaleIn}
        >
          <motion.h2 
            className="text-3xl font-bold text-gray-800 mb-8 text-center"
            variants={fadeInUp}
          >
            Our Mission & Values
          </motion.h2>
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
          >
            <motion.div 
              className="text-center group"
              variants={scaleIn}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <h3 className="text-xl font-semibold mb-3">Compassion</h3>
              <p className="text-gray-600">We treat every patient with empathy, understanding, and respect, ensuring a comfortable experience for all.</p>
            </motion.div>
            <motion.div 
              className="text-center group"
              variants={scaleIn}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <h3 className="text-xl font-semibold mb-3">Personalization</h3>
              <p className="text-gray-600">Every treatment plan is tailored to your unique needs, goals, and comfort level.</p>
            </motion.div>
            <motion.div 
              className="text-center group"
              variants={scaleIn}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <h3 className="text-xl font-semibold mb-3">Prevention</h3>
              <p className="text-gray-600">We focus on preventive care and education to help you maintain optimal oral health for life.</p>
            </motion.div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="mt-20"
          initial={false}
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <motion.h2 
            className="text-3xl font-bold text-gray-800 mb-8 text-center"
            variants={fadeInUp}
          >
            Office Tour
          </motion.h2>
          
          {/* Featured Office Videos */}
          <motion.div 
            className="mb-12 bg-muted/40 rounded-xl p-8"
            variants={scaleIn}
          >
            <div className="max-w-6xl mx-auto">
              <motion.h3 
                className="text-2xl font-semibold text-gray-800 mb-4 text-center"
                variants={fadeInUp}
              >
                Visit Our Office
              </motion.h3>
              <motion.p 
                className="text-gray-600 text-center mb-8"
                variants={fadeInUp}
              >
                Take a virtual tour of our welcoming Los Gatos location
              </motion.p>
              
              {/* Video Grid - Optimized for 9:16 aspect ratio */}
              <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                {/* First Vimeo Video */}
                <motion.div 
                  className="relative rounded-xl overflow-hidden shadow-sm bg-black"
                  variants={scaleIn}
                  whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
                >
                  <div className="relative" style={{ paddingBottom: '177.78%' }}> {/* 9:16 aspect ratio */}
                    <VideoFacade
                      videoSrc="https://player.vimeo.com/video/1112347739?title=0&byline=0&portrait=0&badge=0&autoplay=1"
                      title="Family First Smile Care Office Tour"
                      poster={officePhoto1}
                      posterAlt="Family First Smile Care office tour preview"
                      posterSizes="(max-width: 768px) 100vw, 50vw"
                      playLabel="Play office tour"
                    />
                  </div>
                </motion.div>

                {/* Second Vimeo Video */}
                <motion.div 
                  className="relative rounded-xl overflow-hidden shadow-sm bg-black"
                  variants={scaleIn}
                  whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
                >
                  <div className="relative" style={{ paddingBottom: '177.78%' }}> {/* 9:16 aspect ratio */}
                    <VideoFacade
                      videoSrc="https://player.vimeo.com/video/1106179818?title=0&byline=0&portrait=0&badge=0&autoplay=1"
                      title="Family First Smile Care Facility Tour"
                      poster={officePhoto2}
                      posterAlt="Family First Smile Care facility tour preview"
                      posterSizes="(max-width: 768px) 100vw, 50vw"
                      playLabel="Play facility tour"
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={false}
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            <motion.div 
              className="relative group"
              variants={photoGalleryVariant}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Image
                src={officePhoto11}
                alt="Family First Smile Care welcoming front entrance with practice branding"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="rounded-xl w-full h-64 object-cover group- transition-transform duration-300"
              />
            </motion.div>
            <motion.div 
              className="relative group"
              variants={photoGalleryVariant}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Image
                src={officePhoto12}
                alt="Family First Smile Care professional office exterior showing Suite 102"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="rounded-xl w-full h-64 object-cover group- transition-transform duration-300"
              />
            </motion.div>
            <motion.div 
              className="relative group"
              variants={photoGalleryVariant}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Image
                src={officePhoto1}
                alt="Modern dental office reception area with comfortable seating"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="rounded-xl w-full h-64 object-cover group- transition-transform duration-300"
              />
            </motion.div>
          </motion.div>
          
          {/* Additional Office Photos Grid */}
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8"
            initial={false}
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            <motion.div 
              className="relative group"
              variants={photoGalleryVariant}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
            >
              <Image
                src={officePhoto2}
                alt="Modern dental treatment room with state-of-the-art equipment"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="rounded-lg w-full h-48 object-cover group- transition-transform duration-300"
              />
            </motion.div>
            <motion.div 
              className="relative group"
              variants={photoGalleryVariant}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
            >
              <Image
                src={officePhoto3}
                alt="Advanced dental technology and equipment"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="rounded-lg w-full h-48 object-cover group- transition-transform duration-300"
              />
            </motion.div>
            <motion.div 
              className="relative group"
              variants={photoGalleryVariant}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
            >
              <Image
                src={officePhoto4}
                alt="Professional dental consultation space"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="rounded-lg w-full h-48 object-cover group- transition-transform duration-300"
              />
            </motion.div>
            <motion.div 
              className="relative group"
              variants={photoGalleryVariant}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
            >
              <Image
                src={officePhoto5}
                alt="Clean and organized dental office environment"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="rounded-lg w-full h-48 object-cover group- transition-transform duration-300"
              />
            </motion.div>
          </motion.div>
          
          {/* Extended Office Gallery */}
          <motion.div 
            className="grid md:grid-cols-3 lg:grid-cols-5 gap-3 mt-6"
            initial={false}
            whileInView="visible"
            viewport={{ once: true, margin: "-30px" }}
            variants={staggerContainer}
          >
            <motion.div 
              className="relative group"
              variants={photoGalleryVariant}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <Image
                src={officePhoto6}
                alt="Dental office equipment and workspace"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="rounded-lg w-full h-32 object-cover group- transition-transform duration-300"
              />
            </motion.div>
            <motion.div 
              className="relative group"
              variants={photoGalleryVariant}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <Image
                src={officePhoto7}
                alt="Professional dental workspace setup"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="rounded-lg w-full h-32 object-cover group- transition-transform duration-300"
              />
            </motion.div>
            <motion.div 
              className="relative group"
              variants={photoGalleryVariant}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <Image
                src={officePhoto8}
                alt="Modern dental facility interior"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="rounded-lg w-full h-32 object-cover group- transition-transform duration-300"
              />
            </motion.div>
            <motion.div 
              className="relative group"
              variants={photoGalleryVariant}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <Image
                src={officePhoto9}
                alt="Additional office space and amenities"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="rounded-lg w-full h-32 object-cover group- transition-transform duration-300"
              />
            </motion.div>
            <motion.div 
              className="relative group"
              variants={photoGalleryVariant}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <Image
                src={officePhoto10}
                alt="Complete view of dental practice facilities"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="rounded-lg w-full h-32 object-cover group- transition-transform duration-300"
              />
            </motion.div>
          </motion.div>
        </motion.div>

        <RelatedLinksSection title="Keep Exploring" links={relatedLinks} />
      </div>
    </div>
  );
}
