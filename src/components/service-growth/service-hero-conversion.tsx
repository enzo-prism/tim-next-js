"use client";

import { Link } from "wouter";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

export function ServiceHeroConversion({
  serviceId,
  serviceName,
  source,
  review,
  className,
}: ServiceHeroConversionProps) {
  const appointmentUrl = buildAppointmentUrl({ serviceId, source });

  return (
    <Card
      className={cn("border-border bg-card text-left shadow-none", className)}
    >
      <CardContent className="p-5 sm:p-6">
        <p className="text-sm font-bold uppercase tracking-[0.08em] text-primary">
          Take the next step
        </p>
        <p className="mt-2 text-lg font-semibold text-foreground">
          Interested in {serviceName}?
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Request an appointment online or call our Los Gatos office to talk with the team.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="min-h-12 w-full sm:w-auto">
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
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="min-h-12 w-full bg-white sm:w-auto"
          >
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
            <figcaption className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
              <span className="font-semibold text-foreground">
                {review.rating} out of 5
              </span>
              <span className="text-muted-foreground">
                {serviceName} review from {review.name}
              </span>
            </figcaption>
            {review.isComplete ? (
              <blockquote className="mt-2 text-sm leading-relaxed text-muted-foreground">
                “{review.text}”
              </blockquote>
            ) : null}
          </figure>
        ) : null}
      </CardContent>
    </Card>
  );
}
