import Image from "next/image";
import { Link } from "wouter";
import HeroBackdrop from "@/components/brand/HeroBackdrop";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";
import RelatedLinksSection from "@/components/navigation/RelatedLinksSection";
import VideoFacade from "@/components/video-facade";
import patientExperiencePoster from "@assets/video-posters/patient-experience-1106163189.jpg";
import officeTourPoster from "@assets/video-posters/office-tour-1112347739.jpg";
import facilityTourPoster from "@assets/video-posters/facility-tour-1106179818.jpg";
import type { RelatedLink } from "@/lib/internal-links";

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
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              About Family First Smile Care
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Founded on the principles of compassionate care and family-centered dentistry
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <PageBreadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
        
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Our Story
            </h2>
            <p className="text-gray-600 mb-6">
              Family First Smile Care was founded by Dr. Tim J. Chuang with a simple mission: to provide exceptional dental care in a warm, welcoming environment that puts families first. As a locally owned practice in Los Gatos, we understand the unique needs of our community and are committed to building lasting relationships with our patients.
            </p>
            <p className="text-gray-600 mb-6">
              Our practice is built on the foundation of trust, compassion, and excellence. We believe that dental care should be a positive experience for every member of your family, from toddlers taking their first steps into oral health to seniors maintaining their beautiful smiles.
            </p>
            <p className="text-gray-600 mb-6">
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
            </p>
          </div>
          <div>
            <div className="rounded-xl shadow-sm w-full h-96 relative overflow-hidden bg-white">
              <div className="absolute inset-2 rounded-xl overflow-hidden">
                <VideoFacade
                  videoSrc="https://player.vimeo.com/video/1106163189?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&loop=1&muted=1&background=1"
                  title="Family First Smile Care Patient Experience"
                  poster={patientExperiencePoster}
                  posterAlt="Colorful family tooth characters from the Family First Smile Care animation"
                  posterSizes="(max-width: 1024px) 100vw, 50vw"
                  playLabel="Play patient experience"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-8 lg:p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Our Mission & Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <h3 className="text-xl font-semibold mb-3">Compassion</h3>
              <p className="text-gray-600">We treat every patient with empathy, understanding, and respect, ensuring a comfortable experience for all.</p>
            </div>
            <div className="text-center group">
              <h3 className="text-xl font-semibold mb-3">Personalization</h3>
              <p className="text-gray-600">Every treatment plan is tailored to your unique needs, goals, and comfort level.</p>
            </div>
            <div className="text-center group">
              <h3 className="text-xl font-semibold mb-3">Prevention</h3>
              <p className="text-gray-600">We focus on preventive care and education to help you maintain optimal oral health for life.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Office Tour
          </h2>
          
          {/* Featured Office Videos */}
          <div className="mb-12 bg-muted/40 rounded-xl p-8">
            <div className="max-w-6xl mx-auto">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
                Visit Our Office
              </h3>
              <p className="text-gray-600 text-center mb-8">
                Take a virtual tour of our welcoming Los Gatos location
              </p>
              
              {/* Video Grid - Optimized for 9:16 aspect ratio */}
              <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                {/* First Vimeo Video */}
                <div className="relative rounded-xl overflow-hidden shadow-sm bg-black">
                  <div className="relative" style={{ paddingBottom: '177.78%' }}> {/* 9:16 aspect ratio */}
                    <VideoFacade
                      videoSrc="https://player.vimeo.com/video/1112347739?title=0&byline=0&portrait=0&badge=0&autoplay=1"
                      title="Family First Smile Care Office Tour"
                      poster={officeTourPoster}
                      posterAlt="Waiting room with comfortable seating from the Family First Smile Care office tour"
                      posterSizes="(max-width: 768px) 100vw, 50vw"
                      playLabel="Play office tour"
                    />
                  </div>
                </div>

                {/* Second Vimeo Video */}
                <div className="relative rounded-xl overflow-hidden shadow-sm bg-black">
                  <div className="relative" style={{ paddingBottom: '177.78%' }}> {/* 9:16 aspect ratio */}
                    <VideoFacade
                      videoSrc="https://player.vimeo.com/video/1106179818?title=0&byline=0&portrait=0&badge=0&autoplay=1"
                      title="Family First Smile Care Facility Tour"
                      poster={facilityTourPoster}
                      posterAlt="Window-side treatment room from the Family First Smile Care facility tour"
                      posterSizes="(max-width: 768px) 100vw, 50vw"
                      playLabel="Play facility tour"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="relative group">
              <Image
                src={officePhoto11}
                alt="Family First Smile Care welcoming front entrance with practice branding"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="rounded-xl w-full h-64 object-cover group- transition-transform duration-300"
              />
            </div>
            <div className="relative group">
              <Image
                src={officePhoto12}
                alt="Family First Smile Care professional office exterior showing Suite 102"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="rounded-xl w-full h-64 object-cover group- transition-transform duration-300"
              />
            </div>
            <div className="relative group">
              <Image
                src={officePhoto1}
                alt="Modern dental office reception area with comfortable seating"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="rounded-xl w-full h-64 object-cover group- transition-transform duration-300"
              />
            </div>
          </div>
          
          {/* Additional Office Photos Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="relative group">
              <Image
                src={officePhoto2}
                alt="Modern dental treatment room with state-of-the-art equipment"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="rounded-lg w-full h-48 object-cover group- transition-transform duration-300"
              />
            </div>
            <div className="relative group">
              <Image
                src={officePhoto3}
                alt="Advanced dental technology and equipment"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="rounded-lg w-full h-48 object-cover group- transition-transform duration-300"
              />
            </div>
            <div className="relative group">
              <Image
                src={officePhoto4}
                alt="Professional dental consultation space"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="rounded-lg w-full h-48 object-cover group- transition-transform duration-300"
              />
            </div>
            <div className="relative group">
              <Image
                src={officePhoto5}
                alt="Clean and organized dental office environment"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="rounded-lg w-full h-48 object-cover group- transition-transform duration-300"
              />
            </div>
          </div>
          
          {/* Extended Office Gallery */}
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3 mt-6">
            <div className="relative group">
              <Image
                src={officePhoto6}
                alt="Dental office equipment and workspace"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="rounded-lg w-full h-32 object-cover group- transition-transform duration-300"
              />
            </div>
            <div className="relative group">
              <Image
                src={officePhoto7}
                alt="Professional dental workspace setup"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="rounded-lg w-full h-32 object-cover group- transition-transform duration-300"
              />
            </div>
            <div className="relative group">
              <Image
                src={officePhoto8}
                alt="Modern dental facility interior"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="rounded-lg w-full h-32 object-cover group- transition-transform duration-300"
              />
            </div>
            <div className="relative group">
              <Image
                src={officePhoto9}
                alt="Additional office space and amenities"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="rounded-lg w-full h-32 object-cover group- transition-transform duration-300"
              />
            </div>
            <div className="relative group">
              <Image
                src={officePhoto10}
                alt="Complete view of dental practice facilities"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="rounded-lg w-full h-32 object-cover group- transition-transform duration-300"
              />
            </div>
          </div>
        </div>

        <RelatedLinksSection title="Keep Exploring" links={relatedLinks} />
      </div>
    </div>
  );
}
