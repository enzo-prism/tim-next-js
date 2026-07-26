import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceDetailPage from "@/legacy-pages/service-detail";
import JsonLd from "@/components/seo/json-ld";
import { buildRouteMetadata } from "@/lib/metadata";
import { services } from "@/content/services";
import { buildMedicalProcedureSchema } from "@/content/structured-data";

const allServices = services.flatMap((service) => [service, ...(service.subServices ?? [])]);

export function generateStaticParams() {
  return allServices
    .filter((service) => !service.id.includes("/"))
    .map((service) => ({ serviceId: service.id }));
}

// Only the service IDs above are valid routes; anything else must be a real
// 404 (previously unknown IDs rendered a 200 "Service Not Found" soft 404).
// Let unknown slugs reach the route so `notFound()` can return the shared 404
// cleanly in the production server instead of triggering Next's fallback error.
export const dynamicParams = true;

type ServiceRouteProps = {
  params: Promise<{ serviceId: string }>;
};

export async function generateMetadata({ params }: ServiceRouteProps): Promise<Metadata> {
  const { serviceId } = await params;
  const service = allServices.find((entry) => entry.id === serviceId);
  if (!service) {
    notFound();
  }
  return buildRouteMetadata(`/services/${serviceId}`);
}

export default async function Page({ params }: ServiceRouteProps) {
  const { serviceId } = await params;
  const service = allServices.find((entry) => entry.id === serviceId);

  if (!service) {
    notFound();
  }

  return (
    <>
      <JsonLd data={buildMedicalProcedureSchema(service)} />
      <ServiceDetailPage />
    </>
  );
}
