import type { MetadataRoute } from "next";

const baseUrl = (process.env.CANONICAL_HOST || "https://famfirstsmile.com").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "AdsBot-Google",
        allow: "/",
        disallow: ["/api/", "/admin"],
        crawlDelay: 0,
      },
      {
        userAgent: "AdsBot-Google-Mobile",
        allow: "/",
        disallow: ["/api/", "/admin"],
        crawlDelay: 0,
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/admin"],
        crawlDelay: 0,
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin"],
        crawlDelay: 1,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
