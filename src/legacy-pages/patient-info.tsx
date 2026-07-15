"use client";

import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";
import { patientInfoFaqs } from "@/content/patient-info-faqs";

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

  return (
    <div className="pt-16 pb-20 bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-muted/40 py-20 lg:py-32">
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
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Insurance & Payment</h2>
            </div>
            <p className="text-gray-600 mb-6">Insurance participation, benefits, and payment options can vary. Call our office before your visit so we can review the details you provide and explain the next step.</p>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Insurance Questions</h3>
                <p className="text-gray-600">
                  Have your plan name and member information ready when you call. Coverage and
                  benefits are determined by your insurer and specific plan.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Payment Questions</h3>
                <p className="text-gray-600">Call the office to ask about current payment methods and options for your proposed care.</p>
              </div>
              <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Coming from Santa Cruz?</h3>
                <p className="text-sm text-gray-600">
                  Many Santa Cruz families are happy to come over Highway 17 for care here. If you
                  have insurance questions, call ahead with your plan details before you make the
                  trip.
                </p>
                <Button asChild variant="link" className="mt-3 h-auto p-0 text-primary">
                  <Link href="/areas-we-serve/santa-cruz">See Santa Cruz visit details</Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* What to Expect */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">What to Expect</h2>
            </div>
            <p className="text-gray-600 mb-6">Your comfort and understanding are our priorities. Here's what you can expect during your visit.</p>
            <div className="space-y-4">
              <div className="flex">
                <div className="bg-primary text-white w-8 h-8 rounded-lg flex items-center justify-center mr-3 mt-1 text-sm font-bold">1</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Warm Welcome</h3>
                  <p className="text-sm text-gray-600">Our friendly staff will greet you and help you get settled.</p>
                </div>
              </div>
              <div className="flex">
                <div className="bg-primary text-white w-8 h-8 rounded-lg flex items-center justify-center mr-3 mt-1 text-sm font-bold">2</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Thorough Examination</h3>
                  <p className="text-sm text-gray-600">Dr. Chuang will perform a comprehensive exam and explain findings.</p>
                </div>
              </div>
              <div className="flex">
                <div className="bg-primary text-white w-8 h-8 rounded-lg flex items-center justify-center mr-3 mt-1 text-sm font-bold">3</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Personalized Plan</h3>
                  <p className="text-sm text-gray-600">We'll create a treatment plan tailored to your needs and budget.</p>
                </div>
              </div>
              <div className="flex">
                <div className="bg-primary text-white w-8 h-8 rounded-lg flex items-center justify-center mr-3 mt-1 text-sm font-bold">4</div>
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
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="h-32 border-b border-border bg-muted/40 px-6 py-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Guide</p>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">How to Brush Properly</h3>
                <p className="text-gray-600 mb-4">Learn the correct brushing technique to effectively remove plaque and maintain healthy teeth and gums.</p>
                <Button asChild variant="link" className="text-primary font-medium p-0">
                  <Link href="/patient-info/brushing">Read More</Link>
                </Button>
              </div>
            </div>
            
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="h-32 border-b border-border bg-muted/40 px-6 py-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Guide</p>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Flossing Fundamentals</h3>
                <p className="text-gray-600 mb-4">Discover why flossing is essential and learn the proper technique for optimal gum health.</p>
                <Button asChild variant="link" className="text-primary font-medium p-0">
                  <Link href="/patient-info/flossing">Read More</Link>
                </Button>
              </div>
            </div>
            
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="h-32 border-b border-border bg-muted/40 px-6 py-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Guide</p>
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
                <div className="h-full bg-white rounded-xl shadow-sm p-6 transition-shadow duration-300 border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <span className="text-primary font-semibold">Learn more</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* FAQs */}
        <div className="mt-16 bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {patientInfoFaqs.map((faq) => (
              <div key={faq.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <Button
                  variant="ghost"
                  className="flex items-center justify-between w-full text-left font-semibold text-gray-800 hover:text-primary p-0"
                  onClick={() => toggleFAQ(faq.id)}
                >
                  <span>{faq.question}</span>
                  <MinimalGlyph name="chevron-down" className={`h-4 w-4 transform transition-transform ${expandedFAQ === faq.id ? "rotate-180" : ""}`} />
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
