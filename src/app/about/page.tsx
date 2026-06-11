import type { Metadata } from "next";
import AboutPage from "@/legacy-pages/about";
import JsonLd from "@/components/seo/json-ld";
import { buildRouteMetadata } from "@/lib/metadata";
import { buildDentistPersonSchema } from "@/content/structured-data";

export const metadata: Metadata = buildRouteMetadata("/about");

export default function Page() {
  return (
    <>
      <JsonLd data={buildDentistPersonSchema()} />
      <AboutPage />
    </>
  );
}
