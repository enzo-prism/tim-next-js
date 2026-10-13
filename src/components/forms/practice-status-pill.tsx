"use client";

import { useEffect, useState } from "react";
import {
  describePracticeStatus,
  getPracticeStatus,
  practiceHoursSummary,
  type PracticeStatus,
} from "@/content/practice-hours";
import { cn } from "@/lib/utils";

/**
 * Small "Open now · until 5 PM" pill. Open/closed depends on the visitor's
 * clock, so the server renders the neutral hours line and the live status
 * replaces it after mount (same approach as the mobile action bar). It is not
 * a live region: the booking page's only status region is its success panel.
 */
export function PracticeStatusPill({ className, tone = "light" }: { className?: string; tone?: "light" | "night" }) {
  const [status, setStatus] = useState<PracticeStatus | null>(null);

  useEffect(() => {
    const update = () => setStatus(getPracticeStatus(new Date()));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const night = tone === "night";
  const isOpen = status?.isOpen ?? false;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold",
        night ? "bg-white/10 text-white" : "bg-white text-ink ring-1 ring-ink/10",
        className,
      )}
    >
      <span aria-hidden="true" className="relative grid size-2.5 place-items-center">
        {isOpen ? (
          <span className="absolute inset-0 rounded-full bg-lime opacity-70 motion-safe:animate-ping motion-safe:[animation-iteration-count:3]" />
        ) : null}
        <span
          className={cn(
            "relative size-2.5 rounded-full",
            status ? (isOpen ? "bg-lime ring-2 ring-ink/15" : "bg-blush ring-2 ring-ink/10") : "bg-periwinkle",
          )}
        />
      </span>
      {status ? describePracticeStatus(status) : practiceHoursSummary}
    </span>
  );
}
