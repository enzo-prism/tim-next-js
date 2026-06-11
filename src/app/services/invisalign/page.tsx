import type { Metadata } from "next";
import InvisalignPage from "@/legacy-pages/invisalign";
import JsonLd from "@/components/seo/json-ld";
import { buildRouteMetadata } from "@/lib/metadata";
import { invisalignContent } from "@/content/marketing-pages";
import { buildFaqSchema, buildServiceSchema } from "@/content/structured-data";

export const metadata: Metadata = buildRouteMetadata("/services/invisalign");

const serviceSchema = buildServiceSchema(
  "Invisalign Clear Aligners",
  invisalignContent.hero.subtitle,
  "https://famfirstsmile.com/services/invisalign",
);

export default function Page() {
  return (
    <>
      <JsonLd data={serviceSchema} />
      <JsonLd data={buildFaqSchema(invisalignContent.faqs)} />
      <InvisalignPage />
    </>
  );
}
