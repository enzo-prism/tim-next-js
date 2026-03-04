import type { Metadata } from "next";
import HomePage from "@/legacy-pages/home";
import { buildRouteMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildRouteMetadata("/");

export default function Page() {
  return <HomePage />;
}
