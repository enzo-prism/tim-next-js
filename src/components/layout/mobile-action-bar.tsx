"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AppointmentLink, PhoneLink } from "@/components/tracking/tracked-links";
import {
  describePracticeStatus,
  getPracticeStatus,
  practiceHoursSummary,
  practicePhone,
  type PracticeStatus,
} from "@/content/practice-hours";
import { buildAppointmentUrl } from "@/lib/analytics";

// Form routes already lead with a call link, and a docked bar there would
// compete with the fields and the on-screen keyboard.
const suppressedRoutes = ["/book-appointment", "/contact", "/admin"];

export const isMobileActionBarSuppressed = (pathname: string | null) =>
  suppressedRoutes.some((route) => pathname === route || pathname?.startsWith(`${route}/`));

/**
 * Phone-width bottom bar with the two ways to reach the office. The call
 * button shows whether the office is open right now; outside office hours the
 * request button takes the primary style instead. Urgent-care pages keep the
 * call primary, with the same honest open/closed status.
 */
export default function MobileActionBar() {
  const pathname = usePathname();
  const [status, setStatus] = useState<PracticeStatus | null>(null);

  useEffect(() => {
    // Open/closed depends on the visitor's clock, so the server renders the
    // neutral hours line and the live status replaces it after mount.
    const update = () => setStatus(getPracticeStatus(new Date()));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (isMobileActionBarSuppressed(pathname)) return null;

  const isOpen = status?.isOpen ?? false;
  const isUrgentCare = pathname === "/urgent-dental-care" || pathname?.startsWith("/urgent-dental-care/");
  const isCallPrimary = isUrgentCare || isOpen;
  const statusText = status ? describePracticeStatus(status) : practiceHoursSummary;

  return (
    <nav
      aria-label="Call or request a visit"
      data-mobile-action-bar=""
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-sm md:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-2 gap-2">
        <Button
          asChild
          variant={isCallPrimary ? "default" : "outline"}
          className={`h-12 flex-col gap-0 px-2 ${isCallPrimary ? "" : "border-primary/60 text-primary"}`}
        >
          <PhoneLink location="mobile_action_bar">
            <span className="text-sm font-semibold leading-5">
              Call<span className="hidden min-[360px]:inline"> {practicePhone.display}</span>
            </span>
            <span className="sr-only">, </span>
            <span
              data-testid="practice-status"
              className={`text-xs font-medium leading-4 ${isCallPrimary ? "text-primary-foreground/90" : "text-muted-foreground"}`}
            >
              {statusText}
            </span>
          </PhoneLink>
        </Button>
        <Button
          asChild
          variant={isCallPrimary ? "outline" : "default"}
          className={`h-12 text-sm font-semibold ${isCallPrimary ? "border-primary/60 text-primary" : ""}`}
        >
          <AppointmentLink
            href={buildAppointmentUrl({ source: "mobile_action_bar" })}
            source="mobile_action_bar"
          >
            Request visit
          </AppointmentLink>
        </Button>
      </div>
    </nav>
  );
}
