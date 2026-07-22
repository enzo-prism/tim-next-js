import type { Metadata } from "next";
import TMJPage from "@/legacy-pages/tmj";
import JsonLd from "@/components/seo/json-ld";
import { buildRouteMetadata } from "@/lib/metadata";
import { services } from "@/content/services";
import {
  buildBreadcrumbSchema,
  buildMedicalProcedureSchema,
  practiceInfo,
} from "@/content/structured-data";

export const metadata: Metadata = buildRouteMetadata("/tmj");

const tmjService = services.find((service) => service.id === "tmj");

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", item: practiceInfo.url },
  { name: "Services", item: `${practiceInfo.url}/services` },
  { name: "TMJ Treatment", item: `${practiceInfo.url}/tmj` },
]);

export default function Page() {
  return (
    <>
      {tmjService ? <JsonLd data={buildMedicalProcedureSchema(tmjService)} /> : null}
      <JsonLd data={breadcrumbSchema} />
      <TMJPage />
    </>
  );
}
