import type { Metadata } from "next";
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

type ServiceRouteProps = {
  params: Promise<{ serviceId: string }>;
};

export async function generateMetadata({ params }: ServiceRouteProps): Promise<Metadata> {
  const { serviceId } = await params;
  return buildRouteMetadata(`/services/${serviceId}`);
}

export default async function Page({ params }: ServiceRouteProps) {
  const { serviceId } = await params;
  const service = allServices.find((entry) => entry.id === serviceId);

  return (
    <>
      {service ? <JsonLd data={buildMedicalProcedureSchema(service)} /> : null}
      <ServiceDetailPage />
    </>
  );
}
