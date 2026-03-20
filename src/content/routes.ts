import { services } from "@/content/services";
import { getAllBlogRoutes } from "@/content/blog";
import { getServiceHref } from "@/lib/routes";

export const staticSiteRoutes = [
  "/",
  "/about",
  "/services",
  "/blog",
  "/team",
  "/testimonials",
  "/patient-info",
  "/patient-info/brushing",
  "/patient-info/flossing",
  "/patient-info/nutrition",
  "/contact",
  "/areas-we-serve/santa-cruz",
  "/book-appointment",
  "/privacy-policy",
  "/sitemap",
  "/tmj",
  "/services/childrens-dentistry/babys-first-visit",
  "/services/invisalign",
  "/technology/itero-digital-scanner",
] as const;

export const serviceRoutes = services
  .flatMap((service) => [service, ...(service.subServices ?? [])])
  .map((service) => getServiceHref(service.id));

export const blogRoutes = getAllBlogRoutes();

export const allCanonicalRoutes = Array.from(
  new Set([...staticSiteRoutes, ...serviceRoutes, ...blogRoutes]),
);
