import type { Metadata } from "next";
import TeamPage from "@/legacy-pages/team";
import JsonLd from "@/components/seo/json-ld";
import { buildRouteMetadata } from "@/lib/metadata";
import { buildDentistPersonSchema } from "@/content/structured-data";

export const metadata: Metadata = buildRouteMetadata("/team");

export default function Page() {
  return (
    <>
      <JsonLd data={buildDentistPersonSchema()} />
      <TeamPage />
    </>
  );
}
