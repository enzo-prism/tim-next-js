import type { MetadataRoute } from "next";

const baseUrl = (process.env.CANONICAL_HOST || "https://www.famfirstsmile.com").replace(/\/$/, "");
const disallow = ["/api/", "/admin"];

/**
 * One rule for every crawler. No Crawl-delay: Bing honors it, and Bing's index
 * feeds Copilot and ChatGPT search, so a delay only slows how quickly page
 * updates reach those answer engines. Search and AI crawlers (Googlebot,
 * Bingbot, OAI-SearchBot, PerplexityBot, Claude-SearchBot) share the same access.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // AdsBot ignores the "*" group, so it keeps an explicit rule.
      { userAgent: ["AdsBot-Google", "AdsBot-Google-Mobile"], allow: "/", disallow },
      { userAgent: "*", allow: "/", disallow },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
