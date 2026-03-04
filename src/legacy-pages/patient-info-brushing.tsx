"use client";

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, Shield, CheckCircle, Heart, Clock, Smile } from "lucide-react";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";

export default function PatientInfoBrushing() {
  return (
    <div className="pt-16 pb-20 bg-white">
      <section className="relative bg-gradient-to-r from-primary/5 to-secondary/5 py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center bg-white shadow-md rounded-full px-4 py-2 text-sm font-semibold text-primary mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Oral Health Education
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
            How to Brush Properly
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Gentle, consistent brushing protects enamel, keeps gums healthy, and prevents cavities. Use these
            steps to make every brushing session effective.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 py-3">
              <Link href="/contact">Schedule a Checkup</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-primary text-primary hover:bg-primary/5 font-semibold px-6 py-3"
            >
              <Link href="/patient-info">Back to Patient Info</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <PageBreadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Patient Info", href: "/patient-info" },
            { label: "How to Brush Properly" },
          ]}
        />

        <section className="grid lg:grid-cols-3 gap-6">
          {[
            {
              title: "Brush twice daily",
              description: "Aim for morning and night, about two minutes each time.",
              icon: <Clock className="w-5 h-5 text-primary" />,
            },
            {
              title: "Use a soft brush",
              description: "Soft bristles protect gums while still removing plaque.",
              icon: <Heart className="w-5 h-5 text-secondary" />,
            },
            {
              title: "Fluoride matters",
              description: "A smear or pea-sized amount strengthens enamel.",
              icon: <Shield className="w-5 h-5 text-accent" />,
            },
          ].map((item) => (
            <div key={item.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-sm">
                  {item.icon}
                </div>
                <h2 className="text-lg font-semibold text-gray-800">{item.title}</h2>
              </div>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Step-by-Step Technique</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Place the brush at a 45-degree angle toward the gumline.",
              "Use small, gentle circles instead of hard back-and-forth scrubbing.",
              "Brush outer, inner, and chewing surfaces of every tooth.",
              "Spend extra time on the back molars where plaque builds up.",
              "Brush your tongue to reduce bacteria and freshen breath.",
              "Spit after brushing and avoid rinsing to keep fluoride working.",
            ].map((step) => (
              <div key={step} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-1" />
                <p className="text-gray-700">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-primary/5 to-white rounded-2xl p-8 border border-primary/10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Age-Based Guidance</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <Smile className="w-5 h-5 text-primary mt-1" />
                <span>Under age 3: use a smear of fluoride toothpaste.</span>
              </li>
              <li className="flex items-start gap-3">
                <Smile className="w-5 h-5 text-primary mt-1" />
                <span>Ages 3-6: use a pea-sized amount and supervise.</span>
              </li>
              <li className="flex items-start gap-3">
                <Smile className="w-5 h-5 text-primary mt-1" />
                <span>Ages 7+: encourage independence but check for thoroughness.</span>
              </li>
            </ul>
          </div>
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Common Mistakes to Avoid</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-secondary mt-1" />
                <span>Scrubbing too hard, which can irritate gums.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-secondary mt-1" />
                <span>Skipping the gumline and back teeth.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-secondary mt-1" />
                <span>Not replacing your brush every 3 months.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-3">Need Personalized Guidance?</h2>
          <p className="text-white/95 mb-6">
            If brushing causes sensitivity or bleeding, we can help. Schedule a visit to review technique and
            oral health needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="bg-white text-primary hover:bg-gray-100 font-semibold px-6 py-3">
              <Link href="/contact">Book an Appointment</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="bg-white/5 border-white/25 text-white hover:bg-white hover:text-primary font-semibold px-6 py-3"
            >
              <Link href="/services/dental-exams">Learn About Exams</Link>
            </Button>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Related Reading</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/patient-info/flossing" className="block">
              <div className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow duration-200">
                <h3 className="font-semibold text-gray-800 mb-2">Flossing Fundamentals</h3>
                <p className="text-sm text-gray-600">Learn the technique that keeps gums healthy and prevents decay.</p>
              </div>
            </Link>
            <Link href="/patient-info/nutrition" className="block">
              <div className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow duration-200">
                <h3 className="font-semibold text-gray-800 mb-2">Nutrition for Healthy Teeth</h3>
                <p className="text-sm text-gray-600">Build strong teeth with smart snack choices and hydration.</p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
