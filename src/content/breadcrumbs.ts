import { buildBreadcrumbSchema, practiceInfo } from "./structured-data";

type Crumb = { name: string; path: string };

const services: Crumb = { name: "Services", path: "/services" };
const patientInfo: Crumb = { name: "Patient Info", path: "/patient-info" };

/**
 * Breadcrumb trails (after "Home") for static pages whose route files do not
 * build their own BreadcrumbList. Names match the visible PageHero breadcrumbs.
 * Service detail, TMJ, baby's first visit, Santa Cruz, testimonials and blog
 * routes emit their own trails.
 */
export const staticBreadcrumbTrails: Record<string, readonly Crumb[]> = {
  "/about": [{ name: "About", path: "/about" }],
  "/services": [services],
  "/team": [{ name: "Our Team", path: "/team" }],
  "/patient-info": [patientInfo],
  "/patient-info/brushing": [patientInfo, { name: "How to Brush Properly", path: "/patient-info/brushing" }],
  "/patient-info/flossing": [patientInfo, { name: "Flossing Fundamentals", path: "/patient-info/flossing" }],
  "/patient-info/nutrition": [patientInfo, { name: "Nutrition for Healthy Teeth", path: "/patient-info/nutrition" }],
  "/new-patients": [{ name: "New Patients", path: "/new-patients" }],
  "/insurance-and-payment": [{ name: "Insurance & Payment", path: "/insurance-and-payment" }],
  "/urgent-dental-care": [{ name: "Urgent Dental Care", path: "/urgent-dental-care" }],
  "/contact": [{ name: "Contact", path: "/contact" }],
  "/book-appointment": [{ name: "Book Appointment", path: "/book-appointment" }],
  "/privacy-policy": [{ name: "Privacy Policy", path: "/privacy-policy" }],
  "/services/invisalign": [services, { name: "Invisalign", path: "/services/invisalign" }],
  "/technology/itero-digital-scanner": [
    services,
    { name: "iTero Digital Scanner", path: "/technology/itero-digital-scanner" },
  ],
};

export const buildRouteBreadcrumbSchema = (path: keyof typeof staticBreadcrumbTrails) => {
  const trail = staticBreadcrumbTrails[path];
  if (!trail) {
    throw new Error(`No breadcrumb trail is registered for ${path}`);
  }

  return buildBreadcrumbSchema([
    { name: "Home", item: practiceInfo.url },
    ...trail.map((crumb) => ({ name: crumb.name, item: `${practiceInfo.url}${crumb.path}` })),
  ]);
};
