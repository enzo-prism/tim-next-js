import type { Metadata } from "next";
import FontTestPage from "@/legacy-pages/font-test";
import { buildRouteMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildRouteMetadata("/font-test");

export default function Page() {
  return <FontTestPage />;
}
