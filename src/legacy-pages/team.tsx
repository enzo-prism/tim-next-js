import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import drChuangPhoto from "@assets/Dr. Chuang_1753977515693.jpg";
import HeroBackdrop from "@/components/brand/HeroBackdrop";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";
import RelatedLinksSection from "@/components/navigation/RelatedLinksSection";
import type { RelatedLink } from "@/lib/internal-links";

import officeManagerPhoto from "@assets/Office Manager_1753977345657.jpeg";
import trangAssistantPhoto from "@assets/Trang Assistant Headshot_1756845643362.jpg";

export default function Team() {
  const relatedLinks: RelatedLink[] = [
    {
      href: "/about",
      title: "About Our Office",
      description: "Learn what makes Family First Smile Care different.",
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
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <HeroBackdrop variant="default" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">Meet Our Team</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Get to know the dentist and support team who help you feel prepared, heard, and comfortable.</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <PageBreadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Our Team" },
          ]}
        />
        
        {/* Dr. Chuang Bio */}
        <div className="bg-muted/40 rounded-xl p-8 lg:p-12 mb-16">
          <div className="grid lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-1">
              <Image
                src={drChuangPhoto}
                alt="Dr. Tim J. Chuang professional headshot"
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="rounded-xl shadow-sm w-full max-w-md mx-auto h-auto"
              />
            </div>
            <div className="lg:col-span-2">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">Dr. Tim J. Chuang</h2>
              <p className="text-xl text-primary font-semibold mb-6">Lead Dentist & Practice Owner</p>
              
              <div className="space-y-4 text-gray-600 mb-8">
                <p>Dr. Chuang grew up in Cupertino and earned his undergraduate degree in Human Biology at the University of California, San Diego. He returned to the Bay Area to study dentistry, graduating from the University of the Pacific School of Dentistry in 2020.</p>
                <p>He completed a general dentistry residency on the Big Island of Hawaii. His approach to family care centers on listening to your concerns, explaining your options, and helping you feel comfortable with the next step.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <h3 className="font-semibold text-gray-800 mb-1">Education</h3>
                  <p className="text-sm text-gray-600">University of the Pacific School of Dentistry</p>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-800 mb-1">Training</h3>
                  <p className="text-sm text-gray-600">General dentistry residency</p>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-800 mb-1">Care Approach</h3>
                  <p className="text-sm text-gray-600">Gentle, Family-Centered Care</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Dr. Chuang's Approach</h3>
                <p className="text-gray-600">Expect clear explanations and a personalized discussion of your oral health goals. Bring your questions about treatment or any concerns about visiting the dentist.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Team Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Caring Team</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Support before, during, and after your appointment.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center transition-shadow duration-300">
            <div className="mb-4">
              <Image
                src={officeManagerPhoto}
                alt="Office Manager team member"
                width={128}
                height={128}
                sizes="128px"
                className="w-32 h-32 rounded-lg mx-auto object-cover shadow-md"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Office Manager</h3>
            <p className="text-gray-600">Have a question before you arrive? Our front-office team helps with scheduling and insurance questions so you can prepare for your visit.</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center transition-shadow duration-300">
            <div className="mb-4">
              <Image
                src={trangAssistantPhoto}
                alt="Dental Assistant team member"
                width={128}
                height={128}
                sizes="128px"
                className="w-32 h-32 rounded-lg mx-auto object-cover shadow-md"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Dental Assistant</h3>
            <p className="text-gray-600">Our dental assistant supports Dr. Chuang during your treatment and helps you settle in. Let the team know if you need a moment or have a question.</p>
          </div>
        </div>
        
        <RelatedLinksSection title="Explore More" links={relatedLinks} />

        <div className="bg-gray-50 rounded-xl p-8 mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Join Our Dental Family</h2>
          <p className="text-gray-600 mb-6">Experience the difference that compassionate, personalized dental care can make for you and your family.</p>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 py-3">
            <Link href="/book-appointment?source=team_final">Request an Appointment</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
