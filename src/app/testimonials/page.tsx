import type { Metadata } from "next";
import TestimonialsPage from "@/legacy-pages/testimonials";
import { buildRouteMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildRouteMetadata("/testimonials");

export default function Page() {
  return <TestimonialsPage />;
}
