import type { Metadata } from "next";
import IteroPage from "@/legacy-pages/itero-digital-scanner";
import JsonLd from "@/components/seo/json-ld";
import { buildRouteMetadata } from "@/lib/metadata";
import { iteroContent } from "@/content/marketing-pages";
import { buildFaqSchema, buildServiceSchema } from "@/content/structured-data";

export const metadata: Metadata = buildRouteMetadata("/technology/itero-digital-scanner");

const serviceSchema = buildServiceSchema(
  "Digital impressions with iTero scanner",
  iteroContent.hero.subtitle,
  "https://famfirstsmile.com/technology/itero-digital-scanner",
);

export default function Page() {
  return (
    <>
      <JsonLd data={serviceSchema} />
      <JsonLd data={buildFaqSchema(iteroContent.faqs)} />
      <IteroPage />
    </>
  );
}
