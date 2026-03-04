import type { Metadata } from "next";
import ServiceDetailPage from "@/legacy-pages/service-detail";
import { buildRouteMetadata } from "@/lib/metadata";
import { services } from "@/content/services";

export function generateStaticParams() {
  return services
    .flatMap((service) => [service, ...(service.subServices ?? [])])
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

export default function Page() {
  return <ServiceDetailPage />;
}
