import type { Metadata } from "next";
import BookAppointmentPage from "@/legacy-pages/book-appointment";
import { buildRouteMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildRouteMetadata("/book-appointment");

export default function Page() {
  return <BookAppointmentPage />;
}
