import { services, type Service } from "@/content/services";
import { getAllBlogPosts, getBlogPostHref } from "@/content/blog";
import { practiceInfo } from "@/content/structured-data";
import { practiceHoursSummary, practicePhone } from "@/content/practice-hours";
import { staticMeta } from "@/content/seo";
import { getServiceHref } from "@/lib/routes";
import { googleBusinessProfileUrl, yelpBusinessProfileUrl } from "@/data/reviews";


const absolute = (path: string) => `${practiceInfo.url}${path === "/" ? "" : path}`;
const oneLine = (text: string) => text.replace(/\s+/g, " ").trim();

const serviceSummary = (service: Service) =>
  oneLine(service.seoDescription || service.heroDescription || service.description);

const guidePaths = [
  "/new-patients",
  "/insurance-and-payment",
  "/urgent-dental-care",
  "/patient-info",
  "/patient-info/brushing",
  "/patient-info/flossing",
  "/patient-info/nutrition",
  "/areas-we-serve/santa-cruz",
  "/technology/itero-digital-scanner",
  "/testimonials",
] as const;

/**
 * llms.txt built from the same content modules as the pages, so service
 * summaries and article answers can't drift from what the site publishes.
 * It helps assistants that read it; Google says it does not affect Search.
 */
export function buildLlmsTxt() {
  const allServices = services.flatMap((service) => [service, ...(service.subServices ?? [])]);
  const articles = getAllBlogPosts();

  const lines = [
    `# ${practiceInfo.name}`,
    "",
    "> Gentle, compassionate dental care for the whole family in Los Gatos, California, led by Dr. Tim J. Chuang, DDS.",
    "",
    `${practiceInfo.name} is a family and general dental practice with one office, at ${practiceInfo.addressText}. It sees children and adults, and it also welcomes patients from nearby communities such as Santa Cruz. Fees, insurance participation, appointment length and availability are confirmed by the office by phone.`,
    "",
    "## Practice facts",
    "",
    `- Lead dentist: [Dr. Tim J. Chuang, DDS](${absolute("/team")}), lead dentist and practice owner`,
    `- Address: ${practiceInfo.addressText} ([map](${practiceInfo.mapUrl}))`,
    `- Phone: ${practicePhone.display}`,
    `- Email: ${practiceInfo.email}`,
    `- Office hours: ${practiceHoursSummary}`,
    `- Request an appointment: ${absolute("/book-appointment")}`,
    `- Patient reviews: [Google](${googleBusinessProfileUrl}), [Yelp](${yelpBusinessProfileUrl}), [testimonials](${absolute("/testimonials")})`,
    "",
    "## Services",
    "",
    ...allServices.map(
      (service) => `- [${service.title}](${absolute(getServiceHref(service.id))}): ${serviceSummary(service)}`,
    ),
    "",
    "## Patient guides",
    "",
    ...guidePaths.map((path) => {
      const meta = staticMeta[path];
      return `- [${meta.title.split(" | ")[0]}](${absolute(path)}): ${oneLine(meta.description)}`;
    }),
    "",
    "## Articles",
    "",
    "Each article opens with a short answer; the full article explains when to see a dentist.",
    "",
    ...articles.map(
      (post) => `- [${post.title}](${absolute(getBlogPostHref(post.slug))}): ${oneLine(post.quickAnswer)}`,
    ),
    "",
    "## Notes",
    "",
    "- Content is general information, not a diagnosis or a substitute for an exam.",
    `- For anything urgent, call the office at ${practicePhone.display}.`,
    `- Sitemap: ${absolute("/sitemap.xml")}`,
    "",
  ];

  return lines.join("\n");
}
