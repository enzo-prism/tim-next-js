import type { FaqItem } from "./marketing-pages";
import { services } from "./services";

export const practiceInfo = {
  name: "Family First Smile Care",
  url: "https://www.famfirstsmile.com",
  telephone: "+1-408-358-8100",
  email: "hello@famfirstsmile.com",
  addressText: "15251 National Ave, Suite 102, Los Gatos, CA 95032",
  addressLines: ["15251 National Ave, Suite 102", "Los Gatos, CA 95032"],
  mapUrl: "https://maps.app.goo.gl/RVPut9T6J8XDvHWi7",
  logo: "https://www.famfirstsmile.com/attached_assets/Logo_1753972987510.png",
  image: [
    "https://www.famfirstsmile.com/og-image.jpg",
    "https://www.famfirstsmile.com/attached_assets/Office%20Photo%201_1753972057110.jpeg",
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
  hasMap: "https://maps.app.goo.gl/RVPut9T6J8XDvHWi7",
} as const;

export const serviceAreas = [
  {
    "@type": "City",
    name: "Los Gatos",
    address: {
      "@type": "PostalAddress",
      addressRegion: "CA",
      addressCountry: "US",
    },
  },
  {
    "@type": "City",
    name: "Santa Cruz",
    address: {
      "@type": "PostalAddress",
      addressRegion: "CA",
      addressCountry: "US",
    },
  },
] as const;

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
  geo: {
    "@type": "GeoCoordinates",
    latitude: 37.246289,
    longitude: -121.950504,
  },
  priceRange: "$$",
  hasMap: practiceInfo.hasMap,
  medicalSpecialty: "Dentistry",
  areaServed: serviceAreas,
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "09:00",
      closes: "17:00",
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

export const buildDentistPersonSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${practiceInfo.url}/team#dr-tim-chuang`,
  name: "Dr. Tim J. Chuang",
  honorificSuffix: "DDS",
  jobTitle: "Lead Dentist & Practice Owner",
  url: `${practiceInfo.url}/team`,
  image: `${practiceInfo.url}/attached_assets/Dr.%20Chuang_1753977515693.png`,
  worksFor: {
    "@id": `${practiceInfo.url}/#dentist`,
  },
  alumniOf: [
    {
      "@type": "CollegeOrUniversity",
      name: "University of the Pacific School of Dentistry",
    },
    {
      "@type": "CollegeOrUniversity",
      name: "University of California, San Diego",
    },
  ],
  knowsAbout: [
    "Family dentistry",
    "Children's dentistry",
    "Invisalign",
    "TMJ treatment",
    "Restorative dentistry",
  ],
});

export const buildMedicalProcedureSchema = (service: {
  id: string;
  title: string;
  description: string;
  heroDescription?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "MedicalProcedure",
  name: service.title,
  description: service.heroDescription || service.description,
  url:
    service.id === "tmj"
      ? `${practiceInfo.url}/tmj`
      : `${practiceInfo.url}/services/${service.id}`,
  provider: {
    "@type": "Dentist",
    "@id": `${practiceInfo.url}/#dentist`,
    name: practiceInfo.name,
    url: practiceInfo.url,
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
  medicalSpecialty: "Dentistry",
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

export const buildBreadcrumbSchema = (
  items: ReadonlyArray<{ name: string; item?: string }>,
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((entry, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: entry.name,
    ...(entry.item ? { item: entry.item } : {}),
  })),
});

export const buildCollectionPageSchema = ({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${url}#webpage`,
  url,
  name,
  description,
  inLanguage: "en-US",
  about: {
    "@id": `${practiceInfo.url}/#dentist`,
  },
  isPartOf: {
    "@type": "WebSite",
    "@id": `${practiceInfo.url}/#website`,
    name: practiceInfo.name,
    url: practiceInfo.url,
  },
  primaryImageOfPage: practiceInfo.image[0],
});

export const buildBlogCollectionSchema = ({
  name,
  description,
  url,
  posts,
}: {
  name: string;
  description: string;
  url: string;
  posts: ReadonlyArray<{
    title: string;
    url: string;
    datePublished: string;
    dateModified?: string;
    description: string;
  }>;
}) => ({
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": `${url}#blog`,
  url,
  name,
  description,
  inLanguage: "en-US",
  publisher: {
    "@type": "Dentist",
    "@id": `${practiceInfo.url}/#dentist`,
    name: practiceInfo.name,
    url: practiceInfo.url,
  },
  blogPost: posts.map((post) => ({
    "@type": "BlogPosting",
    headline: post.title,
    url: post.url,
    datePublished: post.datePublished,
    dateModified: post.dateModified ?? post.datePublished,
    description: post.description,
    publisher: {
      "@id": `${practiceInfo.url}/#dentist`,
    },
  })),
});

export const buildBlogPostingSchema = ({
  title,
  description,
  url,
  datePublished,
  dateModified,
  keywords,
  articleSection,
  image = practiceInfo.image[0],
}: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  keywords?: string[];
  articleSection?: string;
  image?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": url,
  },
  headline: title,
  description,
  url,
  datePublished,
  dateModified: dateModified ?? datePublished,
  articleSection,
  keywords: keywords?.join(", "),
  image: [image],
  author: {
    "@type": "Organization",
    name: "Family First Smile Care Editorial Team",
    url: practiceInfo.url,
  },
  publisher: {
    "@type": "Dentist",
    "@id": `${practiceInfo.url}/#dentist`,
    name: practiceInfo.name,
    logo: {
      "@type": "ImageObject",
      url: practiceInfo.logo,
    },
  },
  about: {
    "@id": `${practiceInfo.url}/#dentist`,
  },
  isPartOf: {
    "@type": "Blog",
    "@id": `${practiceInfo.url}/blog#blog`,
    name: `${practiceInfo.name} Blog`,
    url: `${practiceInfo.url}/blog`,
  },
});
