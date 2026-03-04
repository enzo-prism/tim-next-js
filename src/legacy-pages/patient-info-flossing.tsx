"use client";

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Scissors, Shield, CheckCircle, Heart, Smile } from "lucide-react";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";

export default function PatientInfoFlossing() {
  return (
    <div className="pt-16 pb-20 bg-white">
      <section className="relative bg-gradient-to-r from-primary/5 to-secondary/5 py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center bg-white shadow-md rounded-full px-4 py-2 text-sm font-semibold text-secondary mb-4">
            <Scissors className="w-4 h-4 mr-2" />
            Oral Health Education
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
            Flossing Fundamentals
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Flossing cleans the tight spaces your toothbrush cannot reach. Just a minute a day helps prevent
            cavities and gum inflammation.
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
            { label: "Flossing Fundamentals" },
          ]}
        />

        <section className="grid lg:grid-cols-3 gap-6">
          {[
            {
              title: "Use enough floss",
              description: "About 18 inches gives you a clean section for each tooth.",
              icon: <Shield className="w-5 h-5 text-primary" />,
            },
            {
              title: "Gentle C-shape",
              description: "Curve the floss around the tooth and slide up and down.",
              icon: <Heart className="w-5 h-5 text-secondary" />,
            },
            {
              title: "Daily habit",
              description: "Once per day is enough to remove plaque between teeth.",
              icon: <Smile className="w-5 h-5 text-accent" />,
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Step-by-Step Flossing</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Wrap floss around your middle fingers, leaving 1-2 inches to work with.",
              "Guide the floss between teeth using a gentle sawing motion.",
              "Curve the floss into a C shape against one tooth.",
              "Slide up and down to clean below the gumline.",
              "Repeat for the neighboring tooth, then move to a fresh section.",
              "Floss behind the last molars and around any dental work.",
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
            <h2 className="text-2xl font-bold text-gray-800 mb-4">If Your Gums Bleed</h2>
            <p className="text-gray-700 mb-4">
              Mild bleeding can be normal if you are new to flossing. It should improve within one to two weeks.
            </p>
            <p className="text-gray-700">
              Persistent bleeding, swelling, or pain can be a sign of gum disease. Schedule a visit so we can help.
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Flossing Options</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-secondary mt-1" />
                <span>Waxed or unwaxed string floss.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-secondary mt-1" />
                <span>Floss picks for on-the-go convenience.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-secondary mt-1" />
                <span>Water flossers for braces or sensitive gums.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-3">Need Help With Technique?</h2>
          <p className="text-white/95 mb-6">
            We can demonstrate flossing during your cleaning and recommend the best tools for your needs.
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
              <Link href="/services/dental-hygiene">Learn About Hygiene Visits</Link>
            </Button>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Related Reading</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/patient-info/brushing" className="block">
              <div className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow duration-200">
                <h3 className="font-semibold text-gray-800 mb-2">How to Brush Properly</h3>
                <p className="text-sm text-gray-600">Master the brushing basics that keep enamel strong.</p>
              </div>
            </Link>
            <Link href="/patient-info/nutrition" className="block">
              <div className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow duration-200">
                <h3 className="font-semibold text-gray-800 mb-2">Nutrition for Healthy Teeth</h3>
                <p className="text-sm text-gray-600">See which foods help protect your smile.</p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
