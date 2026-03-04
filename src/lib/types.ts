export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  service?: string;
  message?: string;
}

export interface Testimonial {
  id: number;
  name: string;
  title: string;
  content: string;
  rating: number;
}

export type { Service } from "@shared/services";

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}
