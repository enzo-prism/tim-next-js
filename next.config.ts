import type { NextConfig } from "next";

const configuredCanonicalOrigin = (
  process.env.CANONICAL_HOST || "https://www.famfirstsmile.com"
).replace(/\/$/, "");
const canonicalOrigin =
  configuredCanonicalOrigin === "https://famfirstsmile.com"
    ? "https://www.famfirstsmile.com"
    : configuredCanonicalOrigin;
const cspReportEndpoint = "/api/security/csp-report";
const cspReportUrl = `${canonicalOrigin}${cspReportEndpoint}`;
const cspReportGroup = "csp-endpoint";
const reportOnlyCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://cdn.jsdelivr.net https://www.instagram.com https://platform.instagram.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com https://i.postimg.cc https://www.google-analytics.com https://www.googletagmanager.com https://www.instagram.com https://*.cdninstagram.com https://lh3.googleusercontent.com",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://region1.google-analytics.com https://stats.g.doubleclick.net https://vitals.vercel-insights.com https://*.vercel-insights.com https://api.elevenlabs.io https://*.elevenlabs.io https://formspree.io https://cdn.jsdelivr.net https://www.instagram.com",
  "media-src 'self' blob: https://*.vimeocdn.com https://vod-progressive.akamaized.net",
  "frame-src 'self' https://player.vimeo.com https://www.instagram.com https://platform.instagram.com",
  `report-uri ${cspReportUrl}`,
  `report-to ${cspReportGroup}`,
].join("; ");

const reportToHeader = JSON.stringify({
  group: cspReportGroup,
  max_age: 60 * 60 * 24 * 30,
  endpoints: [{ url: cspReportUrl }],
});

const legacyRedirects: NonNullable<NextConfig["redirects"]> = async () => [
  { source: "/hello-world", destination: "/", permanent: true },
  {
    source: "/dental-services/dental-crowns",
    destination: "/services/dental-crowns",
    permanent: true,
  },
  {
    source: "/digital-x-ray",
    destination: "/services/dental-exams",
    permanent: true,
  },
  {
    source: "/articles/premium_education/category/47362",
    destination: "/services",
    permanent: true,
  },
  {
    source: "/articles/premium_education/category/47364",
    destination: "/services",
    permanent: true,
  },
  {
    source: "/articles/premium_education/category/47367",
    destination: "/services",
    permanent: true,
  },
  { source: "/services/tmj", destination: "/tmj", permanent: true },
  // Misspelled parent path that existed in old internal links/indexes
  // (the real parent service ID is "children-dentistry").
  {
    source: "/services/childrens-dentistry",
    destination: "/services/children-dentistry",
    permanent: true,
  },
  // Catch-alls for legacy URL families (specific mappings above win first).
  {
    source: "/dental-services/:slug",
    destination: "/services/:slug",
    permanent: true,
  },
  {
    source: "/articles/:path*",
    destination: "/blog",
    permanent: true,
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: process.cwd(),
  redirects: legacyRedirects,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "i.postimg.cc",
      },
    ],
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "X-Frame-Options",
          value: "SAMEORIGIN",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000",
        },
        {
          key: "Permissions-Policy",
          value: "geolocation=(), payment=(), usb=(), browsing-topics=()",
        },
        {
          key: "Content-Security-Policy-Report-Only",
          value: reportOnlyCsp,
        },
        {
          key: "Reporting-Endpoints",
          value: `${cspReportGroup}="${cspReportUrl}"`,
        },
        {
          key: "Report-To",
          value: reportToHeader,
        },
      ],
    },
    {
      source: "/api/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "no-store, max-age=0",
        },
      ],
    },
    {
      source: "/attached_assets/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ],
};

export default nextConfig;
