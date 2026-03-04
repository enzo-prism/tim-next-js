import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MessageSquareQuote, Star } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import type { Testimonial } from "@/lib/types";

const testimonials: Testimonial[] = [
  {
    id: 0,
    name: "Priscilla Barajas",
    title: "Patient & parent",
    content: "They treat my family of seven with so much kindness and care. Every visit feels comfortable, and our kids actually enjoy going to the dentist now. We trust Dr. Chuang and his team completely.",
    rating: 5
  },
  {
    id: 1,
    name: "Kevin Lan",
    title: "Parent",
    content: "Dr Chuang was great for my 2-year-old daughter's first dental visit. He was patient, fun and knew how to interact with toddlers.",
    rating: 5
  },
  {
    id: 2,
    name: "Eternel Elegance",
    title: "Patient",
    content: "I am impressed with the excellent care I have received from Dr. Tim J Chuang and his team. Dr. Chuang is a skilled and caring professional.",
    rating: 5
  },
  {
    id: 3,
    name: "Monica Lee",
    title: "Patient",
    content: "Dr. Chuang is stellar and provides great service! He was very patient and walked me through every step of my annual cleaning. Highly recommend!",
    rating: 5
  },
  {
    id: 4,
    name: "Janey Lee",
    title: "Patient",
    content: "I have some dental anxiety and Dr. Chuang is always readily available with solid advice and a reassuring manner in addressing my concerns.",
    rating: 5
  },
  {
    id: 5,
    name: "Chloe Yue",
    title: "New Patient",
    content: "We moved to Bay mid of last year and Family First Smile Care was the first and ideal dental care that we feel comfortable with.",
    rating: 5
  },
  {
    id: 6,
    name: "Don Goers",
    title: "Patient",
    content: "Cleanings have been a breeze with a fun staff and a knowledgeable and laid-back Doctor leading the team.",
    rating: 5
  },
  {
    id: 7,
    name: "Josephine Lan",
    title: "Patient",
    content: "I had a wonderful experience at this establishment. Dr. Chuang is warm, knowledgeable, and incredibly patient.",
    rating: 5
  },
  {
    id: 8,
    name: "Tiecheng Yang",
    title: "Patient",
    content: "Great dental clinic! Dr Chuang and his team are friendly and professional. My treatment was smooth and painless. Highly recommended!",
    rating: 5
  },
  {
    id: 9,
    name: "Davy H",
    title: "Patient",
    content: "Dr. Chuang's clinic is welcoming, professional, and truly caring. His team provides attentive, personalized care with expertise and kindness.",
    rating: 5
  },
  {
    id: 10,
    name: "Zach Reece",
    title: "Patient",
    content: "Tim and the team here are great. He is patient, transparent, and took time to explain things to me. Definitely would recommend.",
    rating: 5
  }
];

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const [isPaused, setIsPaused] = useState(false);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const previousTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (prefersReducedMotion || isPaused) return;

    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000);

    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, isPaused]);

  return (
    <div
      className="relative mx-auto max-w-6xl"
      role="region"
      aria-label="Patient testimonials"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white/95 p-4 shadow-[0_32px_80px_-48px_rgba(15,23,42,0.7)] backdrop-blur sm:p-6 lg:p-8">
        <div
          className="pointer-events-none absolute -top-24 right-16 h-44 w-44 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-secondary/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {testimonials.map((testimonial) => (
              <article key={testimonial.id} className="w-full flex-shrink-0 px-1 py-2">
                <div className="grid gap-7 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
                  <aside className="rounded-2xl border border-slate-200/80 bg-slate-50/90 px-4 py-5 text-center lg:px-5 lg:py-6">
                    <div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                      <MessageSquareQuote className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Google Review</p>
                    <div className="mx-auto mt-3 inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 ring-1 ring-amber-200/70">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current text-accent" aria-hidden="true" />
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      {testimonial.id + 1} of {testimonials.length}
                    </p>
                  </aside>
                  <div className="min-w-0 text-center lg:text-left">
                    <p className="text-xl leading-relaxed text-slate-700 italic sm:text-2xl sm:leading-relaxed">
                      "{testimonial.content}"
                    </p>
                    <div className="mx-auto mt-6 h-px w-20 bg-slate-200 lg:mx-0" aria-hidden="true" />
                    <div className="mt-4 text-2xl font-semibold text-slate-800">{testimonial.name}</div>
                    <div className="text-base text-slate-600">{testimonial.title}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-slate-300 bg-white"
              onClick={previousTestimonial}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4 text-primary" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-slate-300 bg-white"
              onClick={nextTestimonial}
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4 text-primary" />
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
            {testimonials.map((_, index) => {
              const isActive = index === currentIndex;
              return (
                <button
                  key={index}
                  type="button"
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    isActive ? "w-10 bg-primary" : "w-2.5 bg-slate-400 hover:bg-slate-500"
                  }`}
                  onClick={() => goToTestimonial(index)}
                  aria-label={`Go to testimonial ${index + 1}`}
                  aria-current={isActive}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
