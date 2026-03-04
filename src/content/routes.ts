import { services } from "@/content/services";
import { getServiceHref } from "@/lib/routes";

export const staticSiteRoutes = [
  "/",
  "/about",
  "/services",
  "/team",
  "/patient-info",
  "/patient-info/brushing",
  "/patient-info/flossing",
  "/patient-info/nutrition",
  "/contact",
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

export const allCanonicalRoutes = Array.from(new Set([...staticSiteRoutes, ...serviceRoutes]));
