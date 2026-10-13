import type { CSSProperties } from "react";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import type { Service } from "@/lib/types";
import { buildAppointmentUrl } from "@/lib/analytics";
import { AppointmentLink, ServiceLink } from "@/components/tracking/tracked-links";
import { getServiceHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { brandTones, isPublishableDetail, type BrandTone } from "@/components/services/service-themes";

interface ServiceCardProps {
  service: Service;
  /** Shows the consultation sticker and a "Request a Consultation" link. */
  featured?: boolean;
  /** Accent from the family group the card sits in. */
  tone?: BrandTone;
  /** Nested services to list inside the card (defaults to the service's own). */
  subServices?: Service[];
  /** Tracking location for the main "Learn More About" link. */
  location?: "service_card" | "service_card_subservice";
  /** Stagger position for the scroll reveal. */
  index?: number;
  className?: string;
}

/**
 * One service in the /services catalog: title, one-line description, a few
 * details, nested sub-services, and a light "Learn More About …" pill.
 */
export default function ServiceCard({
  service,
  featured = false,
  tone = "periwinkle",
  subServices = service.subServices ?? [],
  location = "service_card",
  index = 0,
  className,
}: ServiceCardProps) {
  const accent = brandTones[tone];
  const details = service.details.filter(isPublishableDetail).slice(0, 3);

  return (
    <article
      className={cn("ff-reveal flex h-full min-w-0 flex-col rounded-3xl bg-white p-5 ring-1 ring-ink/5 sm:p-7", className)}
      style={{ "--i": index } as CSSProperties}
    >
      {featured ? (
        <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-lime px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-ink">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-ink" />
          Consultation available
        </p>
      ) : null}
      <h4 className="font-display text-[1.6rem] font-semibold leading-tight tracking-[-0.015em] text-ink">{service.title}</h4>
      <p className="mt-2 text-base leading-relaxed text-ink-soft">{service.description}.</p>

      <ul className="mt-5 space-y-2.5">
        {details.map((detail, position) => (
          <li key={detail} className={cn("flex items-start gap-3 text-[0.95rem] leading-snug text-ink", position === 2 && "max-sm:hidden")}>
            <span aria-hidden="true" className={cn("mt-px grid size-5 shrink-0 place-items-center rounded-full text-[0.7rem]", accent.solid)}>
              <MinimalGlyph name="check" />
            </span>
            <span>{detail}</span>
          </li>
        ))}
      </ul>

      {subServices.length > 0 ? (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <p className="mr-1 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">Also inside</p>
          {subServices.map((subService) => (
            <ServiceLink
              key={subService.id}
              href={getServiceHref(subService.id)}
              serviceId={subService.id}
              location="service_card_subservice"
              className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-paper py-1 pl-4 pr-1.5 text-sm font-semibold text-ink ring-1 ring-border transition-colors hover:ring-ink/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {subService.title}
              <span aria-hidden="true" className="ff-arrow grid size-8 shrink-0 place-items-center rounded-full bg-white text-ink ring-1 ring-ink/10 transition-colors group-hover:bg-ink group-hover:text-white">
                <MinimalGlyph name="arrow-right" />
              </span>
            </ServiceLink>
          ))}
        </div>
      ) : null}

      <div className="mt-auto flex flex-col gap-1 pt-7">
        <ServiceLink
          href={getServiceHref(service.id)}
          serviceId={service.id}
          location={location}
          className={cn(
            "group flex min-h-12 w-full items-center justify-between gap-3 rounded-full py-1.5 pl-5 pr-1.5 text-left text-[0.95rem] font-semibold leading-snug text-ink transition-colors hover:bg-ink hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            accent.wash,
          )}
        >
          <span className="py-1">Learn More About {service.title}</span>
          <span aria-hidden="true" className="ff-arrow grid size-9 shrink-0 place-items-center rounded-full bg-white text-ink">
            <MinimalGlyph name="arrow-right" />
          </span>
        </ServiceLink>
        {featured ? (
          <AppointmentLink
            href={buildAppointmentUrl({ serviceId: service.id, source: "service_card" })}
            source="service_card"
            ctaType="consultation"
            serviceId={service.id}
            className="ff-link inline-flex min-h-11 items-center justify-center text-sm"
          >
            Request a Consultation
          </AppointmentLink>
        ) : null}
      </div>
    </article>
  );
}
