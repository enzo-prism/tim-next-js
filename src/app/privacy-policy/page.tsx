import type { Metadata } from "next";
import PrivacyPolicyPage from "@/legacy-pages/privacy-policy";
import { buildRouteMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildRouteMetadata("/privacy-policy");

export default function Page() {
  return <PrivacyPolicyPage />;
}
