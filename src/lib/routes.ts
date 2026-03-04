export const getServiceHref = (serviceId: string) =>
  serviceId === "tmj" ? "/tmj" : `/services/${serviceId}`;

