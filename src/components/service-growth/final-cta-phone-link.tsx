import type { ReactNode } from "react";
import { PhoneLink } from "@/components/tracking/tracked-links";

type FinalCtaPhoneLinkProps = {
  location: string;
  serviceId?: string;
  children: ReactNode;
};

/** Secondary call action inside the blue closing CTA panels on service pages. */
export function FinalCtaPhoneLink({ location, serviceId, children }: FinalCtaPhoneLinkProps) {
  return (
    <PhoneLink
      location={location}
      serviceId={serviceId}
      className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold text-white underline decoration-white/60 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
    >
      {children}
    </PhoneLink>
  );
}
