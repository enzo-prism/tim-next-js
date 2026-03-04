import type { Metadata } from "next";
import TMJPage from "@/legacy-pages/tmj";
import { buildRouteMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildRouteMetadata("/tmj");

export default function Page() {
  return <TMJPage />;
}
