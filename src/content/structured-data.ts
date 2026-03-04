import type { FaqItem } from "./marketing-pages";
import { services } from "./services";

export const practiceInfo = {
  name: "Family First Smile Care",
  url: "https://famfirstsmile.com",
  telephone: "+1-408-358-8100",
  email: "hello@famfirstsmile.com",
  logo: "https://famfirstsmile.com/attached_assets/Logo_1753972987510.png",
  image: [
    "https://famfirstsmile.com/attached_assets/Frame%205_1753974553020.png",
    "https://famfirstsmile.com/attached_assets/Office%20Photo%201_1753972057110.jpeg",
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "15251 National Ave, Suite 102",
    addressLocality: "Los Gatos",
    addressRegion: "CA",
    postalCode: "95032",
    addressCountry: "US",
  },
  sameAs: [
    "https://www.facebook.com/famfirstsmile/",
    "https://www.instagram.com/famfirstsmile/",
    "https://g.page/r/Cej0Xl18KcCyEAE",
  ],
  hasMap:
    "https://www.google.com/maps/search/?api=1&query=15251+National+Ave+Suite+102+Los+Gatos+CA+95032",
} as const;

export const buildLocalBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": ["Dentist", "MedicalBusiness", "LocalBusiness"],
  "@id": `${practiceInfo.url}/#dentist`,
  name: practiceInfo.name,
  url: practiceInfo.url,
  logo: practiceInfo.logo,
  image: practiceInfo.image,
  telephone: practiceInfo.telephone,
  email: practiceInfo.email,
  address: practiceInfo.address,
  hasMap: practiceInfo.hasMap,
  medicalSpecialty: "Dentistry",
  areaServed: {
    "@type": "City",
    name: "Los Gatos",
    address: {
      "@type": "PostalAddress",
      addressRegion: "CA",
      addressCountry: "US",
    },
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "09:00",
      closes: "17:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Friday",
      opens: "00:00",
      closes: "00:00",
      description: "Closed",
    },
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: practiceInfo.telephone,
      contactType: "appointments",
      areaServed: "US-CA",
    },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Dental Services",
    itemListElement: services.flatMap((service) => {
      const serviceUrl =
        service.id === "tmj"
          ? `${practiceInfo.url}/tmj`
          : `${practiceInfo.url}/services/${service.id}`;

      const baseOffer = {
        "@type": "Offer",
        itemOffered: {
          "@type": "MedicalProcedure",
          name: service.title,
          description: service.description,
          url: serviceUrl,
        },
      };

      const subOffers = (service.subServices || []).map((subService) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "MedicalProcedure",
          name: subService.title,
          description: subService.description,
          url: `${practiceInfo.url}/services/${subService.id}`,
        },
      }));

      return [baseOffer, ...subOffers];
    }),
  },
  sameAs: practiceInfo.sameAs,
});

export const buildServiceSchema = (
  name: string,
  description: string,
  url: string,
) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name,
  description,
  url,
  provider: {
    "@type": "Dentist",
    name: practiceInfo.name,
    url: practiceInfo.url,
    "@id": `${practiceInfo.url}/#dentist`,
    telephone: practiceInfo.telephone,
    address: practiceInfo.address,
  },
  areaServed: {
    "@type": "City",
    name: "Los Gatos",
    address: {
      "@type": "PostalAddress",
      addressRegion: "CA",
      addressCountry: "US",
    },
  },
});

export const buildFaqSchema = (faqs: ReadonlyArray<FaqItem>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});
