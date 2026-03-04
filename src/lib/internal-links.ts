import { services } from "@/data/services";
import { getServiceHref } from "@/lib/routes";
import type { Service } from "@shared/services";

export type RelatedLink = {
  href: string;
  title: string;
  description?: string;
};

type ServiceIndexEntry = {
  service: Service;
  parent?: Service;
};

const buildServiceIndex = () => {
  const index = new Map<string, ServiceIndexEntry>();

  for (const service of services) {
    index.set(service.id, { service });

    for (const subService of service.subServices ?? []) {
      index.set(subService.id, { service: subService, parent: service });
    }
  }

  return index;
};

const serviceIndex = buildServiceIndex();

const staticLinksByHref: Record<string, RelatedLink> = {
  "/services": {
    href: "/services",
    title: "All Dental Services",
    description: "Explore our full list of preventive, restorative, and family care options.",
  },
  "/patient-info": {
    href: "/patient-info",
    title: "Patient Information",
    description: "FAQs, what to expect, and helpful resources for your visit.",
  },
  "/patient-info/brushing": {
    href: "/patient-info/brushing",
    title: "How to Brush Properly",
    description: "Step-by-step brushing tips for healthier teeth and gums.",
  },
  "/patient-info/flossing": {
    href: "/patient-info/flossing",
    title: "Flossing Fundamentals",
    description: "Daily flossing technique to help prevent cavities and gum inflammation.",
  },
  "/patient-info/nutrition": {
    href: "/patient-info/nutrition",
    title: "Nutrition for Healthy Teeth",
    description: "Tooth-friendly eating habits and foods to limit.",
  },
  "/team": {
    href: "/team",
    title: "Meet Our Team",
    description: "Get to know Dr. Chuang and the caring team behind your visit.",
  },
  "/contact": {
    href: "/contact",
    title: "Contact & Scheduling",
    description: "Ask a question, request an appointment, or get directions to our office.",
  },
  "/technology/itero-digital-scanner": {
    href: "/technology/itero-digital-scanner",
    title: "iTero Digital Scanner",
    description: "Comfortable 3D digital scans for Invisalign planning and smile previews.",
  },
  "/tmj": {
    href: "/tmj",
    title: "TMJ Treatment",
    description: "Care for jaw pain, headaches, and TMJ/TMD symptoms.",
  },
};

const asRelatedLink = (value: string): RelatedLink | null => {
  if (value.startsWith("/")) {
    return staticLinksByHref[value] ?? { href: value, title: value };
  }

  const entry = serviceIndex.get(value);
  if (!entry) return null;

  return {
    href: getServiceHref(entry.service.id),
    title: entry.service.title,
    description: entry.service.description,
  };
};

const curatedBoosts: Record<string, string[]> = {
  "dental-exams": ["dental-hygiene", "family-dentistry", "/patient-info/brushing", "/contact"],
  "dental-hygiene": ["dental-exams", "/patient-info/flossing", "/patient-info/brushing", "/contact"],
  "family-dentistry": ["dental-exams", "dental-hygiene", "/patient-info", "/team"],
  "children-dentistry": ["childrens-dentistry/babys-first-visit", "/patient-info/brushing", "/contact"],
  "night-guards": ["tmj", "dental-exams", "/contact"],
  "restorative-dentistry": ["invisalign", "teeth-whitening", "dental-crowns", "dental-exams"],
  invisalign: ["/technology/itero-digital-scanner", "restorative-dentistry", "teeth-whitening", "/contact"],
  "teeth-whitening": ["dental-hygiene", "restorative-dentistry", "/contact"],
  "dental-crowns": ["restorative-dentistry", "dental-exams", "/contact"],
};

export const getRelatedLinksForService = (serviceId: string): RelatedLink[] => {
  const entry = serviceIndex.get(serviceId);
  const currentHref = getServiceHref(serviceId);
  const candidates: RelatedLink[] = [];

  if (entry?.parent) {
    candidates.push({
      href: getServiceHref(entry.parent.id),
      title: entry.parent.title,
      description: entry.parent.description,
    });

    for (const sibling of entry.parent.subServices ?? []) {
      if (sibling.id === serviceId) continue;
      candidates.push({
        href: getServiceHref(sibling.id),
        title: sibling.title,
        description: sibling.description,
      });
    }
  }

  for (const child of entry?.service.subServices ?? []) {
    candidates.push({
      href: getServiceHref(child.id),
      title: child.title,
      description: child.description,
    });
  }

  for (const boost of curatedBoosts[serviceId] ?? []) {
    const link = asRelatedLink(boost);
    if (link) candidates.push(link);
  }

  // Ensure we always have a few high-value hubs available as fallbacks.
  candidates.push(staticLinksByHref["/services"]);
  candidates.push(staticLinksByHref["/patient-info"]);
  candidates.push(staticLinksByHref["/contact"]);

  const seen = new Set<string>();
  const result: RelatedLink[] = [];

  for (const candidate of candidates) {
    if (!candidate?.href) continue;
    if (candidate.href === currentHref) continue;
    if (seen.has(candidate.href)) continue;
    seen.add(candidate.href);
    result.push(candidate);
    if (result.length >= 8) break;
  }

  return result;
};

