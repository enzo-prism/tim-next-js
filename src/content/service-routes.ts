import { services } from "@/content/services";

/**
 * Service IDs that have their own page under `src/app/services/<id>/`.
 *
 * The `[serviceId]` route must not prerender these. Both routes write the same
 * build output path, and whichever job finishes last wins; that race once
 * shipped the generic service template as `/services/invisalign`.
 */
export const servicesWithDedicatedRoutes: ReadonlySet<string> = new Set(["invisalign"]);

export const getServiceDetailStaticParams = () =>
  services
    .flatMap((service) => [service, ...(service.subServices ?? [])])
    .filter((service) => !service.id.includes("/") && !servicesWithDedicatedRoutes.has(service.id))
    .map((service) => ({ serviceId: service.id }));
