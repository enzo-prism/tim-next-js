"use client";

import type { ComponentPropsWithoutRef } from "react";
import { Link } from "wouter";
import {
  trackAppointmentCtaClick,
  trackMapClick,
  trackPayBillClick,
  trackPhoneClick,
  trackReviewLinkClick,
  trackServiceLearnMoreClick,
  trackSocialClick,
} from "@/lib/analytics";
import { practicePhone } from "@/content/practice-hours";

// Server-rendered pages cannot pass onClick handlers, so these small client
// links carry the tracking call and let the surrounding page stay a server
// component. Each one keeps the payload of the helper it wraps.

type AppointmentLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  source: string;
  ctaType?: string;
  serviceId?: string;
};

export function AppointmentLink({
  source,
  ctaType,
  serviceId,
  onClick,
  ...props
}: AppointmentLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        trackAppointmentCtaClick(source, { ctaType, serviceId });
        onClick?.(event);
      }}
    />
  );
}

type ServiceLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  serviceId: string;
  location: string;
};

export function ServiceLink({ serviceId, location, onClick, ...props }: ServiceLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        trackServiceLearnMoreClick(serviceId, location);
        onClick?.(event);
      }}
    />
  );
}

type PhoneLinkProps =Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  location: string;
  serviceId?: string;
};

export function PhoneLink({ location, serviceId, onClick, children, ...props }: PhoneLinkProps) {
  return (
    <a
      {...props}
      href={practicePhone.href}
      onClick={(event) => {
        trackPhoneClick(location, serviceId);
        onClick?.(event);
      }}
    >
      {children ?? practicePhone.display}
    </a>
  );
}

type TrackedExternalLinkProps = ComponentPropsWithoutRef<"a"> & {
  kind: "map" | "pay_bill" | "review" | "social";
  location: string;
  provider?: string;
};

export function TrackedExternalLink({
  kind,
  location,
  provider = "",
  onClick,
  ...props
}: TrackedExternalLinkProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        if (kind === "map") trackMapClick(location);
        if (kind === "pay_bill") trackPayBillClick(location);
        if (kind === "review") trackReviewLinkClick(provider, location);
        if (kind === "social") trackSocialClick(provider, location);
        onClick?.(event);
      }}
    />
  );
}
