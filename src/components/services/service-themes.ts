import type { StaticImageData } from "next/image";
import type { HeroTone } from "@/components/site/page-hero";
import type { SectionTone } from "@/components/site/section";
import drChuangPhoto from "@assets/Dr. Chuang_1753977515693.jpg";
import assistantPhoto from "@assets/Trang Assistant Headshot_1756845643362.jpg";
import xrayAlcovePhoto from "@assets/Office Photo 4_1753972057109.jpeg";
import treatmentHallPhoto from "@assets/Office Photo 5_1753972057109.jpeg";
import windowRoomPhoto from "@assets/Office Photo 6_1753972057109.jpeg";

/** The logo's four colors, used as accents for a page or a group of services. */
export type BrandTone = "periwinkle" | "blush" | "lime" | "cloud";

export const brandTones: Record<BrandTone, { color: string; solid: string; wash: string; section: SectionTone }> = {
  periwinkle: { color: "var(--ff-periwinkle)", solid: "bg-periwinkle", wash: "bg-periwinkle-wash", section: "periwinkle" },
  blush: { color: "var(--ff-blush)", solid: "bg-blush", wash: "bg-blush-wash", section: "blush" },
  lime: { color: "var(--ff-lime)", solid: "bg-lime", wash: "bg-lime-wash", section: "lime" },
  cloud: { color: "var(--ff-cloud)", solid: "bg-cloud", wash: "bg-cloud-wash", section: "cloud" },
};

/**
 * How the services catalog is grouped for families. This is presentation only:
 * the service data (and its parent/sub-service tree) is unchanged.
 */
export type ServiceGroup = {
  id: string;
  label: string;
  title: string;
  blurb: string;
  tone: BrandTone;
  serviceIds: string[];
};

export const serviceGroups: ServiceGroup[] = [
  {
    id: "everyday-care",
    label: "Everyday care",
    title: "Checkups, cleanings, and care for the whole family",
    blurb: "The steady, preventive visits that keep every smile in the family on track.",
    tone: "periwinkle",
    serviceIds: ["family-dentistry", "dental-exams", "dental-hygiene"],
  },
  {
    id: "kids",
    label: "For kids",
    title: "Little smiles, big confidence",
    blurb: "Gentle first visits and habit-building that feels like play.",
    tone: "lime",
    serviceIds: ["children-dentistry"],
  },
  {
    id: "smile",
    label: "Smile & alignment",
    title: "Straighter, brighter, on your terms",
    blurb: "Clear aligners and professional whitening, planned around your goals.",
    tone: "blush",
    serviceIds: ["invisalign", "teeth-whitening"],
  },
  {
    id: "comfort-repair",
    label: "Comfort & repair",
    title: "Repair, protect, and ease the ache",
    blurb: "Restore damaged teeth, guard against grinding, and get answers about jaw pain.",
    tone: "cloud",
    serviceIds: ["restorative-dentistry", "night-guards", "tmj"],
  },
];

export const getServiceGroup = (serviceId: string) =>
  serviceGroups.find((group) => group.serviceIds.includes(serviceId)) ??
  serviceGroups.find((group) => serviceId === "dental-crowns" && group.id === "comfort-repair");

/** Detail bullets that should not be shown on the site (unverified claims). */
export const isPublishableDetail = (detail: string) => !/\bCBCT\b/i.test(detail);

export type ServicePhoto = { src: StaticImageData; alt: string; position?: string; zoom?: number };

export type ServiceTheme = {
  /** Accent color for the page (tooth-people, chips, washes). */
  tone: BrandTone;
  heroTone: HeroTone;
  photo: ServicePhoto;
  /** Two short, factual stickers beside the hero photo. */
  chips: [string, string];
};

const photos = {
  dentist: { src: drChuangPhoto, alt: "Dr. Tim Chuang smiling in his white coat", position: "50% 20%" },
  assistant: { src: assistantPhoto, alt: "A Family First Smile Care dental assistant beside the office moss-tooth wall", position: "50% 25%" },
  imaging: { src: xrayAlcovePhoto, alt: "The imaging alcove beside a wall of Hawaii photos", position: "50% 50%" },
  hallway: { src: treatmentHallPhoto, alt: "The hallway of bright treatment rooms", position: "50% 45%" },
  windowRoom: { src: windowRoomPhoto, alt: "A bright treatment room with a window onto the trees", position: "35% 20%", zoom: 1.3 },
} satisfies Record<string, ServicePhoto>;

export const serviceThemes: Record<string, ServiceTheme> = {
  "family-dentistry": { tone: "periwinkle", heroTone: "periwinkle", photo: photos.dentist, chips: ["Kids to grandparents", "Routine exams & cleanings"] },
  "children-dentistry": { tone: "lime", heroTone: "lime", photo: photos.assistant, chips: ["Toys & stickers", "Gentle first visits"] },
  "dental-exams": { tone: "periwinkle", heroTone: "periwinkle", photo: photos.imaging, chips: ["Digital X-rays", "A clear care plan"] },
  "dental-hygiene": { tone: "cloud", heroTone: "cloud", photo: photos.windowRoom, chips: ["Fresh, clean feeling", "Gum health check"] },
  "night-guards": { tone: "periwinkle", heroTone: "cloud", photo: photos.hallway, chips: ["Custom-fitted", "For grinding & clenching"] },
  "restorative-dentistry": { tone: "blush", heroTone: "cream", photo: photos.windowRoom, chips: ["Fillings & bonding", "Natural-looking results"] },
  "teeth-whitening": { tone: "blush", heroTone: "blush", photo: photos.dentist, chips: ["Shade goals for your smile", "Sensitivity advice"] },
  "dental-crowns": { tone: "blush", heroTone: "blush", photo: photos.windowRoom, chips: ["Custom-fitted crowns", "Natural look & feel"] },
};

const fallbackTheme: ServiceTheme = {
  tone: "periwinkle",
  heroTone: "periwinkle",
  photo: photos.windowRoom,
  chips: ["Kids to grandparents", "One Los Gatos team"],
};

export const getServiceTheme = (serviceId: string): ServiceTheme => serviceThemes[serviceId] ?? fallbackTheme;

export const officePhotos = photos;
