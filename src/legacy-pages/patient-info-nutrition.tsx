"use client";

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Apple, Shield, CheckCircle, Sparkles, Heart } from "lucide-react";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";

export default function PatientInfoNutrition() {
  return (
    <div className="pt-16 pb-20 bg-white">
      <section className="relative bg-gradient-to-r from-primary/5 to-secondary/5 py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center bg-white shadow-md rounded-full px-4 py-2 text-sm font-semibold text-accent mb-4">
            <Apple className="w-4 h-4 mr-2" />
            Oral Health Education
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
            Nutrition for Healthy Teeth
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            What you eat and drink affects your enamel, gums, and overall oral health. Use these tips to build
            tooth-friendly habits.
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
            { label: "Nutrition for Healthy Teeth" },
          ]}
        />

        <section className="grid lg:grid-cols-3 gap-6">
          {[
            {
              title: "Choose calcium-rich foods",
              description: "Dairy, fortified alternatives, and leafy greens strengthen enamel.",
              icon: <Shield className="w-5 h-5 text-primary" />,
            },
            {
              title: "Crunchy produce helps",
              description: "Apples, carrots, and celery increase saliva and gently clean teeth.",
              icon: <Apple className="w-5 h-5 text-secondary" />,
            },
            {
              title: "Hydrate often",
              description: "Water rinses acids and keeps the mouth balanced.",
              icon: <Sparkles className="w-5 h-5 text-accent" />,
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Foods to Limit</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Sugary snacks, sodas, and sports drinks.",
              "Sticky candies that cling to teeth.",
              "Frequent grazing that keeps acid levels high.",
              "Acidic drinks like citrus juice or energy drinks.",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-1" />
                <p className="text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-primary/5 to-white rounded-2xl p-8 border border-primary/10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Smart Daily Habits</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-secondary mt-1" />
                <span>Pair sweets with meals instead of snacking all day.</span>
              </li>
              <li className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-secondary mt-1" />
                <span>Rinse with water after acidic drinks or snacks.</span>
              </li>
              <li className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-secondary mt-1" />
                <span>Choose sugar-free gum to boost saliva between meals.</span>
              </li>
            </ul>
          </div>
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Smile-Friendly Snack Ideas</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accent mt-1" />
                <span>Cheese cubes with apple slices.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accent mt-1" />
                <span>Greek yogurt with berries.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accent mt-1" />
                <span>Celery with nut butter.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-3">Questions About Diet and Oral Health?</h2>
          <p className="text-white/95 mb-6">
            We can help you build a personalized nutrition plan that supports long-term oral health.
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
              <Link href="/services/family-dentistry">Learn About Family Care</Link>
            </Button>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Related Reading</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/patient-info/brushing" className="block">
              <div className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow duration-200">
                <h3 className="font-semibold text-gray-800 mb-2">How to Brush Properly</h3>
                <p className="text-sm text-gray-600">Master the brushing basics for healthier gums.</p>
              </div>
            </Link>
            <Link href="/patient-info/flossing" className="block">
              <div className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow duration-200">
                <h3 className="font-semibold text-gray-800 mb-2">Flossing Fundamentals</h3>
                <p className="text-sm text-gray-600">Build the daily flossing habit that prevents decay.</p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
