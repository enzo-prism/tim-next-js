import type { MetadataRoute } from "next";
import { allCanonicalRoutes } from "@/content/routes";
import { getAllBlogPosts, getBlogPostHref } from "@/content/blog";

const baseUrl = (process.env.CANONICAL_HOST || "https://famfirstsmile.com").replace(/\/$/, "");

// Noindexed utility pages should not be advertised to crawlers.
const excludedRoutes = new Set<string>(["/sitemap"]);

// Real content dates. Routes without a known date omit lastModified instead
// of stamping every URL with the build time, which search engines learn to
// ignore.
const blogLastModified = new Map(
  getAllBlogPosts().map((post) => [
    getBlogPostHref(post.slug),
    new Date(post.updatedAt || post.publishedAt),
  ]),
);

const routePriorityMap: Partial<Record<string, number>> = {
  "/": 1,
  "/services": 0.9,
  "/blog": 0.75,
  "/about": 0.8,
  "/contact": 0.8,
  "/areas-we-serve/santa-cruz": 0.8,
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
};

const routeFrequencyMap: Partial<Record<string, MetadataRoute.Sitemap[number]["changeFrequency"]>> = {
  "/": "weekly",
  "/services": "weekly",
  "/blog": "weekly",
  "/book-appointment": "weekly",
  "/about": "monthly",
  "/contact": "monthly",
  "/areas-we-serve/santa-cruz": "monthly",
  "/team": "monthly",
  "/testimonials": "monthly",
  "/patient-info": "monthly",
  "/patient-info/brushing": "monthly",
  "/patient-info/flossing": "monthly",
  "/patient-info/nutrition": "monthly",
  "/privacy-policy": "yearly",
};

export default function sitemap(): MetadataRoute.Sitemap {
  return allCanonicalRoutes
    .filter((route) => !excludedRoutes.has(route))
    .map((route) => {
      const lastModified = blogLastModified.get(route);

      return {
        url: `${baseUrl}${route === "/" ? "" : route}`,
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: routeFrequencyMap[route] ?? "monthly",
        priority: routePriorityMap[route] ?? (route.startsWith("/blog/") ? 0.65 : 0.6),
      };
    });
}
