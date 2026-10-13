import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { ToothPerson } from "@/components/brand/pinwheel";
import { AppointmentLink, PhoneLink } from "@/components/tracking/tracked-links";
import PracticeAddressLink from "@/components/location/PracticeAddressLink";
import { practiceHoursSummary } from "@/content/practice-hours";
import { cn } from "@/lib/utils";
import { brandTones, type BrandTone } from "./service-themes";

/**
 * The sticky "Plan your visit" card beside a service explanation: quick facts,
 * a booking link, and the phone number.
 */
export function VisitCard({
  tone,
  title = "Plan your visit",
  facts,
  appointmentHref,
  source,
  ctaType,
  serviceId,
  ctaLabel = "Request an appointment",
  className,
}: {
  tone: BrandTone;
  title?: string;
  facts?: { label: string; value: ReactNode }[];
  appointmentHref: string;
  source: string;
  ctaType?: string;
  serviceId?: string;
  ctaLabel?: string;
  className?: string;
}) {
  const accent = brandTones[tone];
  return (
    <div className={cn("relative overflow-clip rounded-3xl p-6 sm:p-7", accent.wash, className)}>
      <ToothPerson
        color={accent.color}
        className={cn("pointer-events-none absolute -right-3 -top-4 h-28 w-auto rotate-[10deg]", tone === "cloud" && "[&_g]:stroke-ink/10 [&_g]:[stroke-width:3]")}
      />
      <p className="relative font-display text-2xl font-semibold text-ink">{title}</p>
      <dl className="relative mt-5 divide-y divide-ink/10 border-y border-ink/10">
        {facts?.map((fact) => (
          <div key={fact.label} className="py-3">
            <dt className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">{fact.label}</dt>
            <dd className="mt-1 text-[0.95rem] font-semibold leading-snug text-ink">{fact.value}</dd>
          </div>
        ))}
        <div className="py-3">
          <dt className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">Office hours</dt>
          <dd className="mt-1 text-[0.95rem] font-semibold text-ink">{practiceHoursSummary}</dd>
        </div>
        <div className="py-3">
          <dt className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">Where</dt>
          <dd className="mt-1 text-[0.95rem] font-semibold leading-snug text-ink">
            <PracticeAddressLink trackingLocation={source} className="underline decoration-ink/20 underline-offset-4 hover:decoration-cobalt">
              15251 National Ave, Suite 102, Los Gatos
            </PracticeAddressLink>
          </dd>
        </div>
      </dl>
      <div className="relative mt-6 flex flex-col gap-2">
        <Button asChild size="lg" className="group h-13 w-full justify-between pl-6 pr-2">
          <AppointmentLink href={appointmentHref} source={source} ctaType={ctaType} serviceId={serviceId}>
            {ctaLabel}
            <span aria-hidden="true" className="ff-arrow grid size-9 place-items-center rounded-full bg-white/15">
              <MinimalGlyph name="arrow-right" />
            </span>
          </AppointmentLink>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-13 w-full">
          <PhoneLink location={source} serviceId={serviceId}>
            Call (408) 358-8100
          </PhoneLink>
        </Button>
      </div>
    </div>
  );
}
