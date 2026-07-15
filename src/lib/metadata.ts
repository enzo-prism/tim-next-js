import type { Metadata } from "next";
import { resolveCanonicalPath, resolvePageMeta } from "@/content/seo";

const defaultHost = (process.env.CANONICAL_HOST || "https://www.famfirstsmile.com").replace(/\/$/, "");

export const metadataBase = new URL(defaultHost);

export function buildRouteMetadata(path: string): Metadata {
  const canonicalPath = resolveCanonicalPath(path);
  const meta = resolvePageMeta(path);
  const canonical = canonicalPath === "/" ? "/" : canonicalPath;
  const canonicalUrl = `${defaultHost}${canonical}`;

  return {
    metadataBase,
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonicalUrl,
      siteName: "Family First Smile Care",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: `${defaultHost}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: "Family First Smile Care - Gentle dental care for the whole family",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [`${defaultHost}/og-image.jpg`],
    },
  };
}
