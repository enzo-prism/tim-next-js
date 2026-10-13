"use client";

import { Link } from "wouter";

import { Button } from "@/components/ui/button";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { BrandDots } from "@/components/brand/pinwheel";
import { Stars } from "@/components/site/stars";
import {
  buildAppointmentUrl,
  trackAppointmentCtaClick,
  trackSiteEvent,
} from "@/lib/analytics";
import { cn } from "@/lib/utils";

type ServiceReview = {
  name: string;
  rating: number;
  text: string;
  isComplete: boolean;
};

interface ServiceHeroConversionProps {
  serviceId: string;
  serviceName: string;
  source: string;
  review?: ServiceReview;
  className?: string;
}

const PHONE_HREF = "tel:+14083588100";
const PHONE_DISPLAY = "(408) 358-8100";

/** "Take the next step" card for service heroes: request, call, and one real review. */
export function ServiceHeroConversion({
  serviceId,
  serviceName,
  source,
  review,
  className,
}: ServiceHeroConversionProps) {
  const appointmentUrl = buildAppointmentUrl({ serviceId, source });

  return (
    <div className={cn("rounded-3xl bg-white p-5 text-left ring-1 ring-border shadow-float sm:p-6", className)}>
      <p className="ff-eyebrow">
        <BrandDots />
        <span>Take the next step</span>
      </p>
      <p className="mt-3 font-display text-2xl font-semibold leading-tight text-ink">
        Interested in {serviceName}?
      </p>
      <p className="mt-2 text-base leading-relaxed text-ink-soft">
        Request an appointment online or call our Los Gatos office to talk with the team.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button asChild size="lg" className="group h-12 w-full pl-6 pr-2 sm:w-auto">
          <Link
            href={appointmentUrl}
            onClick={() =>
              trackAppointmentCtaClick(source, {
                ctaType: "service_hero",
                destination: appointmentUrl,
                serviceId,
              })
            }
          >
            Request an appointment
            <span aria-hidden="true" className="ff-arrow grid size-8 place-items-center rounded-full bg-white/15">
              <MinimalGlyph name="arrow-right" />
            </span>
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-12 w-full sm:w-auto">
          <a
            href={PHONE_HREF}
            onClick={() =>
              trackSiteEvent("phone_click", {
                destination: PHONE_HREF,
                location: source,
                service_id: serviceId,
              })
            }
          >
            Call {PHONE_DISPLAY}
          </a>
        </Button>
      </div>

      {review ? (
        <figure className="mt-5 border-t border-border pt-4">
          <figcaption className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <Stars className="text-sm" count={Math.round(review.rating)} />
            <span className="font-semibold text-ink">{review.rating} out of 5</span>
            <span className="text-ink-soft">
              {serviceName} review from {review.name}
            </span>
          </figcaption>
          {review.isComplete ? (
            <blockquote className="mt-2 line-clamp-4 text-sm leading-relaxed text-ink-soft">“{review.text}”</blockquote>
          ) : null}
        </figure>
      ) : null}
    </div>
  );
}
