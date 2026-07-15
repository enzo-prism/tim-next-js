import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { useReducedMotion } from "framer-motion";
import { homepageTestimonials } from "@/content/testimonials";
import type { Testimonial } from "@/lib/types";

const testimonials: Testimonial[] = homepageTestimonials;

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const [isUserPaused, setIsUserPaused] = useState(false);
  const [isInteractionPaused, setIsInteractionPaused] = useState(false);

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
    if (prefersReducedMotion || isUserPaused || isInteractionPaused) return;

    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000);

    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, isUserPaused, isInteractionPaused]);

  return (
    <div
      className="relative mx-auto max-w-6xl"
      role="region"
      aria-label="Patient testimonials"
      onMouseEnter={() => setIsInteractionPaused(true)}
      onMouseLeave={() => setIsInteractionPaused(false)}
      onFocusCapture={() => setIsInteractionPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsInteractionPaused(false);
        }
      }}
    >
      <div className="relative overflow-hidden rounded-xl border border-slate-200/90 bg-white/95 p-4 shadow-sm sm:p-6 lg:p-8">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {testimonials.map((testimonial, index) => (
              <article
                key={testimonial.id}
                className="w-full flex-shrink-0 px-1 py-2"
                aria-hidden={index !== currentIndex}
              >
                <div className="grid gap-7 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
                  <aside className="rounded-xl border border-slate-200/80 bg-slate-50/90 px-4 py-5 text-center lg:px-5 lg:py-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Google Review</p>
                    <p className="mx-auto mt-3 inline-flex rounded-lg bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-900 ring-1 ring-sky-200/70">
                      {testimonial.rating}.0 rating
                    </p>
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
              className="rounded-lg border-slate-300 bg-white"
              onClick={previousTestimonial}
              aria-label="Previous testimonial"
            >
              <MinimalGlyph name="chevron-left" className="h-4 w-4 text-primary" />
            </Button>
            <Button
              variant="outline"
              className="min-h-11 border-slate-300 bg-white px-4"
              onClick={() => setIsUserPaused((paused) => !paused)}
              aria-pressed={isUserPaused}
            >
              {isUserPaused ? "Resume" : "Pause"}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-lg border-slate-300 bg-white"
              onClick={nextTestimonial}
              aria-label="Next testimonial"
            >
              <MinimalGlyph name="chevron-right" className="h-4 w-4 text-primary" />
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
            {testimonials.map((_, index) => {
              const isActive = index === currentIndex;
              return (
                <button
                  key={index}
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => goToTestimonial(index)}
                  aria-label={`Go to testimonial ${index + 1}`}
                  aria-current={isActive}
                >
                  <span
                    aria-hidden="true"
                    className={`h-2.5 rounded-lg transition-all duration-300 ${
                      isActive ? "w-8 bg-primary" : "w-2.5 bg-slate-500"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
