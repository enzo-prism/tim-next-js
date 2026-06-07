"use client";

import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import type { ReactNode } from "react";
import { practiceInfo } from "@/content/structured-data";
import { trackMapClick } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type PracticeAddressLinkProps = {
  children?: ReactNode;
  className?: string;
  iconClassName?: string;
  showExternalIcon?: boolean;
  ariaLabel?: string;
  trackingLocation?: string;
};

export default function PracticeAddressLink({
  children,
  className,
  iconClassName,
  showExternalIcon = false,
  ariaLabel = `Open ${practiceInfo.name} in Google Maps (opens in a new tab)`,
  trackingLocation = "practice_address_link",
}: PracticeAddressLinkProps) {
  return (
    <a
      href={practiceInfo.mapUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      onClick={() => trackMapClick(trackingLocation)}
      className={cn(
        "rounded-sm underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
        showExternalIcon && "inline-flex items-start gap-1.5",
        className,
      )}
    >
      <span>{children ?? practiceInfo.addressText}</span>
      {showExternalIcon ? (
        <MinimalGlyph name="external-link" className={cn("mt-0.5 h-4 w-4 shrink-0 opacity-70", iconClassName)} />
      ) : null}
    </a>
  );
}
