import type { Metadata } from "next";
import ServicesPage from "@/legacy-pages/services";
import { buildRouteMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildRouteMetadata("/services");

export default function Page() {
  return <ServicesPage />;
}
