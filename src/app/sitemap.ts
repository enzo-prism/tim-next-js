import type { MetadataRoute } from "next";
import { allCanonicalRoutes } from "@/content/routes";

const baseUrl = (process.env.CANONICAL_HOST || "https://famfirstsmile.com").replace(/\/$/, "");

const routePriorityMap: Partial<Record<string, number>> = {
  "/": 1,
  "/services": 0.9,
  "/blog": 0.75,
  "/about": 0.8,
  "/contact": 0.8,
  "/book-appointment": 0.9,
  "/team": 0.7,
  "/testimonials": 0.7,
  "/tmj": 0.7,
  "/patient-info": 0.6,
  "/services/children-dentistry": 0.6,
  "/services/childrens-dentistry/babys-first-visit": 0.6,
  "/services/dental-exams": 0.6,
  "/services/dental-hygiene": 0.6,
  "/services/family-dentistry": 0.6,
  "/services/night-guards": 0.6,
  "/services/restorative-dentistry": 0.6,
  "/services/invisalign": 0.6,
  "/services/teeth-whitening": 0.6,
  "/services/dental-crowns": 0.6,
  "/technology/itero-digital-scanner": 0.6,
  "/patient-info/brushing": 0.5,
  "/patient-info/flossing": 0.5,
  "/patient-info/nutrition": 0.5,
  "/privacy-policy": 0.3,
  "/sitemap": 0.3,
};

const routeFrequencyMap: Partial<Record<string, MetadataRoute.Sitemap[number]["changeFrequency"]>> = {
  "/": "weekly",
  "/services": "weekly",
  "/blog": "weekly",
  "/about": "monthly",
  "/contact": "monthly",
  "/book-appointment": "weekly",
  "/team": "monthly",
  "/testimonials": "monthly",
  "/patient-info": "monthly",
  "/patient-info/brushing": "monthly",
  "/patient-info/flossing": "monthly",
  "/patient-info/nutrition": "monthly",
  "/blog/when-should-kids-first-see-a-dentist-los-gatos": "monthly",
  "/privacy-policy": "yearly",
  "/sitemap": "yearly",
};

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return allCanonicalRoutes.map((route) => ({
    url: `${baseUrl}${route === "/" ? "" : route}`,
    lastModified,
    changeFrequency: routeFrequencyMap[route] ?? "monthly",
    priority: routePriorityMap[route] ?? (route.startsWith("/blog/") ? 0.65 : 0.6),
  }));
}
