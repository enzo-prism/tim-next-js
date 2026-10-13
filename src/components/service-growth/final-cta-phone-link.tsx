import type { ReactNode } from "react";
import { PhoneLink } from "@/components/tracking/tracked-links";

type FinalCtaPhoneLinkProps = {
  location: string;
  serviceId?: string;
  children: ReactNode;
};

/** Secondary call action inside the night closing CTA bands on service pages. */
export function FinalCtaPhoneLink({ location, serviceId, children }: FinalCtaPhoneLinkProps) {
  return (
    <PhoneLink
      location={location}
      serviceId={serviceId}
      className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-white underline decoration-white/50 underline-offset-4 transition-colors hover:decoration-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-night"
    >
      {children}
    </PhoneLink>
  );
}
