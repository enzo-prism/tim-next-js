import type { Metadata } from "next";
import BabysFirstVisitPage from "@/legacy-pages/babys-first-visit";
import { buildRouteMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildRouteMetadata(
  "/services/childrens-dentistry/babys-first-visit",
);

export default function Page() {
  return <BabysFirstVisitPage />;
}
