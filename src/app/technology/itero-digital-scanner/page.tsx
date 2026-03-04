import type { Metadata } from "next";
import IteroPage from "@/legacy-pages/itero-digital-scanner";
import { buildRouteMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildRouteMetadata("/technology/itero-digital-scanner");

export default function Page() {
  return <IteroPage />;
}
