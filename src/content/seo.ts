import { services, type Service } from "./services";

const canonicalOverrides: Record<string, string> = {
  "/services/tmj": "/tmj",
};

export const normalizePath = (path: string) => {
  const trimmed = path.split(/[?#]/)[0] || "/";
  if (trimmed === "/") return "/";
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
};

export const resolveCanonicalPath = (path: string) => {
  const normalized = normalizePath(path);
  return canonicalOverrides[normalized] ?? normalized;
};

export interface PageMeta {
  title: string;
  description: string;
}

const staticMeta: Record<string, PageMeta> = {
  "/": {
    title: "Family First Smile Care | Los Gatos, CA Dentist",
    description: "Gentle, compassionate dental care for the whole family in Los Gatos, CA. Dr. Tim J. Chuang provides comprehensive dentistry in a welcoming environment.",
  },
  "/about": {
    title: "About Our Los Gatos, CA Dentist | Family First Smile Care",
    description: "Meet Dr. Tim J. Chuang and learn how Family First Smile Care delivers compassionate, personalized dentistry in Los Gatos, CA.",
  },
  "/services": {
    title: "Dental Services in Los Gatos, CA | Family First Smile Care",
    description: "Explore family, restorative, cosmetic, and preventive dental services in Los Gatos, CA including exams, cleanings, Invisalign, crowns, whitening, and TMJ care.",
  },
  "/team": {
    title: "Our Los Gatos Dental Team | Family First Smile Care",
    description: "Meet Dr. Tim J. Chuang and our caring dental team providing gentle, comprehensive dentistry in Los Gatos, CA.",
  },
  "/patient-info": {
    title: "Patient Info | Los Gatos, CA Dentist",
    description: "Patient information for Family First Smile Care in Los Gatos, CA including insurance, FAQs, and visit preparation.",
  },
  "/contact": {
    title: "Contact Family First Smile Care | Los Gatos, CA Dentist",
    description: "Contact Family First Smile Care in Los Gatos, CA to schedule an appointment. Call (408) 358-8100 or visit 15251 National Ave, Suite 102.",
  },
  "/privacy-policy": {
    title: "Privacy Policy | Family First Smile Care",
    description: "Learn how Family First Smile Care collects and uses information submitted through our website and how we protect your privacy.",
  },
  "/sitemap": {
    title: "Site Map | Family First Smile Care",
    description: "Browse all pages, patient resources, and dental services available on the Family First Smile Care website.",
  },
  "/patient-info/brushing": {
    title: "How to Brush Properly | Los Gatos Dentist",
    description: "Learn the right brushing technique, timing, and tools to protect enamel and keep gums healthy. Tips from your Los Gatos dentist.",
  },
  "/patient-info/flossing": {
    title: "Flossing Fundamentals | Los Gatos Dentist",
    description: "Step-by-step flossing guidance to clean between teeth, reduce gum inflammation, and prevent cavities from your Los Gatos dental team.",
  },
  "/patient-info/nutrition": {
    title: "Nutrition for Healthy Teeth | Los Gatos Dentist",
    description: "Tooth-friendly nutrition tips, foods to limit, and daily habits that help prevent decay and support healthy gums.",
  },
  "/tmj": {
    title: "TMJ Treatment in Los Gatos - Family First Smile Care",
    description: "Expert TMJ treatment in Los Gatos by Dr. Tim J. Chuang. Relief for jaw pain, headaches, and TMD symptoms with personalized care and advanced technology.",
  },
  "/technology/itero-digital-scanner": {
    title: "iTero Digital Scanner Los Gatos | Family First Smile Care",
    description: "Digital impressions in Los Gatos with an iTero\u00ae scanner. Comfortable 3D scans for Invisalign planning and smile previews. Book your visit today.",
  },
  "/font-test": {
    title: "Font Test - Family First Smile Care",
    description: "Internal typography preview for Family First Smile Care.",
  },
  "/admin": {
    title: "Admin - Family First Smile Care",
    description: "Private admin dashboard for Family First Smile Care.",
  },
};

const fallbackMeta: PageMeta = {
  title: "Page Not Found - Family First Smile Care",
  description: "The page you're looking for doesn't exist. Return to our homepage or contact us for assistance.",
};

const allServices: Service[] = services.flatMap((service) => [
  service,
  ...(service.subServices ?? []),
]);
const serviceById = new Map(allServices.map((service) => [service.id, service]));

const buildServiceMeta = (service: Service): PageMeta => {
  const baseDescription = service.heroDescription || service.description;
  const title =
    service.seoTitle ||
    `${service.title} in Los Gatos, CA | Family First Smile Care`;
  const description =
    service.seoDescription ||
    `${baseDescription} Professional ${service.title.toLowerCase()} services in Los Gatos, CA by Dr. Tim J. Chuang.`;

  return { title, description };
};

export const resolvePageMeta = (path: string): PageMeta => {
  const canonicalPath = resolveCanonicalPath(path);

  if (staticMeta[canonicalPath]) {
    return staticMeta[canonicalPath];
  }

  if (canonicalPath.startsWith("/services/")) {
    const slug = canonicalPath.replace("/services/", "");
    const service = serviceById.get(slug);
    if (service) return buildServiceMeta(service);
  }

  return fallbackMeta;
};
