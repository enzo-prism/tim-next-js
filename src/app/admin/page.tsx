import type { Metadata } from "next";
import AdminPage from "@/legacy-pages/admin";
import { buildRouteMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  ...buildRouteMetadata("/admin"),
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <AdminPage />;
}
