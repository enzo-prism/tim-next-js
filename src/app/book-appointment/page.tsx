import type { Metadata } from "next";
import BookAppointmentPage from "@/legacy-pages/book-appointment";
import QueryProvider from "@/components/query-provider";
import { leadServiceIds } from "@/content/form-schemas";
import { buildRouteMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildRouteMetadata("/book-appointment");

type BookAppointmentRouteProps = {
  searchParams: Promise<{ service?: string | string[] }>;
};

export default async function Page({ searchParams }: BookAppointmentRouteProps) {
  const requestedService = (await searchParams).service;
  const initialServiceId =
    typeof requestedService === "string" &&
    leadServiceIds.includes(requestedService as (typeof leadServiceIds)[number])
      ? (requestedService as (typeof leadServiceIds)[number])
      : undefined;

  return (
    <QueryProvider>
      <BookAppointmentPage initialServiceId={initialServiceId} />
    </QueryProvider>
  );
}
