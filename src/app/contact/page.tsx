import type { Metadata } from "next";
import ContactPage from "@/legacy-pages/contact";
import QueryProvider from "@/components/query-provider";
import { buildRouteMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildRouteMetadata("/contact");

export default function Page() {
  return (
    <QueryProvider>
      <ContactPage />
    </QueryProvider>
  );
}
