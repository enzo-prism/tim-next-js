import type { Metadata } from "next";
import AdminPage from "@/legacy-pages/admin";
import QueryProvider from "@/components/query-provider";
import { buildRouteMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  ...buildRouteMetadata("/admin"),
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <QueryProvider>
      <AdminPage />
    </QueryProvider>
  );
}
