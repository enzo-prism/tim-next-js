"use client";

import { useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Shield, Clock, ChevronDown, Stethoscope, Scissors, Apple } from "lucide-react";
import type { FAQItem } from "@/lib/types";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";

const faqs: FAQItem[] = [
  {
    id: "insurance",
    question: "Do you accept insurance?",
    answer: "Yes, we accept most major insurance plans including Delta Dental, Cigna, MetLife, Aetna, and Blue Cross Blue Shield. We also accept most PPO plans. Our team will help verify your benefits and maximize your coverage."
  },
  {
    id: "frequency",
    question: "How often should I visit the dentist?",
    answer: "We recommend visiting every six months for routine cleanings and check-ups. However, some patients may need more frequent visits based on their individual oral health needs. Dr. Chuang will recommend the best schedule for you."
  },
  {
    id: "children",
    question: "Do you see children?",
    answer: "Absolutely! We specialize in family dentistry and love working with children of all ages. We use gentle techniques and child-friendly approaches to make dental visits fun and stress-free for your little ones."
  },
  {
    id: "first-visit",
    question: "What should I expect during my first visit?",
    answer: "Your first visit will include a comprehensive examination, digital X-rays if needed, and a discussion of your oral health goals. We'll create a personalized treatment plan and answer any questions you have about your dental health."
  },
  {
    id: "emergency",
    question: "Do you offer emergency dental services?",
    answer: "Yes, we provide emergency dental care for urgent situations. If you have a dental emergency, please call our office immediately and we'll do our best to see you the same day."
  }
];

const popularServices = [
  {
    title: "Dental Exams",
    description: "Comprehensive checkups and early detection.",
    href: "/services/dental-exams",
  },
  {
    title: "Dental Hygiene",
    description: "Professional cleanings and gum health care.",
    href: "/services/dental-hygiene",
  },
  {
    title: "Children's Dentistry",
    description: "Gentle care for kids of all ages.",
    href: "/services/children-dentistry",
  },
  {
    title: "Baby's First Visit",
    description: "First visits for infants and toddlers.",
    href: "/services/childrens-dentistry/babys-first-visit",
  },
  {
    title: "Night Guards",
    description: "Protection for grinding and jaw tension.",
    href: "/services/night-guards",
  },
  {
    title: "TMJ Treatment",
    description: "Care for jaw pain and dysfunction.",
    href: "/tmj",
  },
];

export default function PatientInfo() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="pt-16 pb-20 bg-gray-50">
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/5 to-secondary/5 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">Patient Information</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Everything you need to know for a smooth and comfortable dental experience</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <PageBreadcrumbs items={[{ label: "Home", href: "/" }, { label: "Patient Info" }]} />
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Insurance Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="bg-secondary text-white feature-icon mx-auto mb-4">
                <Shield />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Insurance & Payment</h2>
            </div>
            <p className="text-gray-600 mb-6">We accept most major insurance plans and offer flexible payment options to make dental care accessible for your family.</p>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Accepted Insurance</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• Delta Dental</li>
                  <li>• Cigna</li>
                  <li>• MetLife</li>
                  <li>• Aetna</li>
                  <li>• Blue Cross Blue Shield</li>
                  <li>• Most PPO plans</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Payment Options</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• Cash and Credit Cards</li>
                  <li>• Flexible financing available</li>
                  <li>• Payment plans</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* What to Expect */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="bg-accent text-white feature-icon mx-auto mb-4">
                <Clock />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">What to Expect</h2>
            </div>
            <p className="text-gray-600 mb-6">Your comfort and understanding are our priorities. Here's what you can expect during your visit.</p>
            <div className="space-y-4">
              <div className="flex">
                <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-1 text-sm font-bold">1</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Warm Welcome</h3>
                  <p className="text-sm text-gray-600">Our friendly staff will greet you and help you get settled.</p>
                </div>
              </div>
              <div className="flex">
                <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-1 text-sm font-bold">2</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Thorough Examination</h3>
                  <p className="text-sm text-gray-600">Dr. Chuang will perform a comprehensive exam and explain findings.</p>
                </div>
              </div>
              <div className="flex">
                <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-1 text-sm font-bold">3</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Personalized Plan</h3>
                  <p className="text-sm text-gray-600">We'll create a treatment plan tailored to your needs and budget.</p>
                </div>
              </div>
              <div className="flex">
                <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-1 text-sm font-bold">4</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Comfortable Care</h3>
                  <p className="text-sm text-gray-600">Enjoy amenities like blankets, water, and entertainment during treatment.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Oral Health Education */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Oral Health Education</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                <Stethoscope className="text-primary w-16 h-16" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">How to Brush Properly</h3>
                <p className="text-gray-600 mb-4">Learn the correct brushing technique to effectively remove plaque and maintain healthy teeth and gums.</p>
                <Button asChild variant="link" className="text-primary font-medium p-0">
                  <Link href="/patient-info/brushing">Read More</Link>
                </Button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                <Scissors className="text-secondary w-16 h-16" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Flossing Fundamentals</h3>
                <p className="text-gray-600 mb-4">Discover why flossing is essential and learn the proper technique for optimal gum health.</p>
                <Button asChild variant="link" className="text-primary font-medium p-0">
                  <Link href="/patient-info/flossing">Read More</Link>
                </Button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                <Apple className="text-accent w-16 h-16" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Nutrition for Healthy Teeth</h3>
                <p className="text-gray-600 mb-4">Understand how your diet affects your oral health and which foods promote strong teeth.</p>
                <Button asChild variant="link" className="text-primary font-medium p-0">
                  <Link href="/patient-info/nutrition">Read More</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Services */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Popular Appointments</h2>
          <p className="text-lg text-gray-600 mb-8 text-center">
            Quick links to the services patients ask for most.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularServices.map((service) => (
              <Link key={service.href} href={service.href} className="block h-full">
                <div className="h-full bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <span className="text-primary font-semibold">Learn more</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* FAQs */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <Button
                  variant="ghost"
                  className="flex items-center justify-between w-full text-left font-semibold text-gray-800 hover:text-primary p-0"
                  onClick={() => toggleFAQ(faq.id)}
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`h-4 w-4 transform transition-transform ${expandedFAQ === faq.id ? "rotate-180" : ""}`} />
                </Button>
                {expandedFAQ === faq.id && (
                  <div className="mt-3 text-gray-600">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
