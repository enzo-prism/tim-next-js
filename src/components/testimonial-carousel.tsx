import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
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
      className="relative max-w-4xl mx-auto"
      role="region"
      aria-label="Patient testimonials"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="w-full flex-shrink-0 px-2 sm:px-4">
              <div className="testimonial-card p-5 sm:p-8 text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-accent fill-current" />
                  ))}
                </div>
                <p className="text-base sm:text-lg text-gray-700 mb-5 sm:mb-6 italic text-balance">"{testimonial.content}"</p>
                <div className="font-semibold text-gray-800">{testimonial.name}</div>
                <div className="text-sm text-gray-600">{testimonial.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Carousel Navigation */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-1 top-1/2 hidden -translate-y-1/2 rounded-full bg-white shadow-lg sm:inline-flex"
        onClick={previousTestimonial}
        aria-label="Previous testimonial"
      >
        <ChevronLeft className="h-4 w-4 text-primary" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute right-1 top-1/2 hidden -translate-y-1/2 rounded-full bg-white shadow-lg sm:inline-flex"
        onClick={nextTestimonial}
        aria-label="Next testimonial"
      >
        <ChevronRight className="h-4 w-4 text-primary" />
      </Button>

      <div className="mt-4 flex items-center justify-center gap-3 sm:hidden">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={previousTestimonial}
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="h-4 w-4 text-primary" />
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={nextTestimonial}
          aria-label="Next testimonial"
        >
          Next
          <ChevronRight className="h-4 w-4 text-primary" />
        </Button>
      </div>
      
      {/* Carousel Indicators */}
      <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-1">
        {testimonials.map((_, index) => {
          const isActive = index === currentIndex;
          return (
            <Button
              key={index}
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full hover:bg-gray-100 sm:h-9 sm:w-9"
              onClick={() => goToTestimonial(index)}
              aria-label={`Go to testimonial ${index + 1}`}
              aria-current={isActive}
            >
              <span
                aria-hidden="true"
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  isActive ? "bg-primary" : "bg-gray-500"
                }`}
              />
            </Button>
          );
        })}
      </div>
    </div>
  );
}
