import type { Metadata } from "next";
import { Suspense } from "react";
import BookAppointmentPage from "@/legacy-pages/book-appointment";
import QueryProvider from "@/components/query-provider";
import { buildRouteMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildRouteMetadata("/book-appointment");

export default function Page() {
  return (
    <QueryProvider>
      <Suspense fallback={<div className="min-h-screen bg-white" aria-busy="true" />}>
        <BookAppointmentPage />
      </Suspense>
    </QueryProvider>
  );
}
