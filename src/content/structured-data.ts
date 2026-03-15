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
