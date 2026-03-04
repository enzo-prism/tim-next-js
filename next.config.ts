import type { NextConfig } from "next";

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
