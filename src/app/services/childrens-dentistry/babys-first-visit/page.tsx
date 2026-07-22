import type { Metadata } from "next";
import BabysFirstVisitPage from "@/legacy-pages/babys-first-visit";
import JsonLd from "@/components/seo/json-ld";
import { buildRouteMetadata } from "@/lib/metadata";
import { services } from "@/content/services";
import {
  buildBreadcrumbSchema,
  buildMedicalProcedureSchema,
  practiceInfo,
} from "@/content/structured-data";

export const metadata: Metadata = buildRouteMetadata(
  "/services/childrens-dentistry/babys-first-visit",
);

const babysFirstVisitService = services
  .flatMap((service) => [service, ...(service.subServices ?? [])])
  .find((service) => service.id === "childrens-dentistry/babys-first-visit");

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", item: practiceInfo.url },
  { name: "Services", item: `${practiceInfo.url}/services` },
  {
    name: "Children's Dentistry",
    item: `${practiceInfo.url}/services/children-dentistry`,
  },
  {
    name: "Baby's First Visit",
    item: `${practiceInfo.url}/services/childrens-dentistry/babys-first-visit`,
  },
]);

export default function Page() {
  return (
    <>
      {babysFirstVisitService ? (
        <JsonLd data={buildMedicalProcedureSchema(babysFirstVisitService)} />
      ) : null}
      <JsonLd data={breadcrumbSchema} />
      <BabysFirstVisitPage />
    </>
  );
}
