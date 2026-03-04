import type { Metadata } from "next";
import InvisalignPage from "@/legacy-pages/invisalign";
import { buildRouteMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildRouteMetadata("/services/invisalign");

export default function Page() {
  return <InvisalignPage />;
}
