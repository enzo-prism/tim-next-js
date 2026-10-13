import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BrandDots } from "@/components/brand/pinwheel";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";

/**
 * Display typography for content strings: " - " becomes an en dash, and
 * straight quotes and apostrophes become curly ones.
 */
export function typeset(text: string) {
  return text
    .replace(/ - /g, " – ")
    .replace(/(\w)'(\w)/g, "$1’$2")
    .replace(/"([^"]+)"/g, "“$1”");
}

export const brandDot = ["bg-periwinkle", "bg-blush", "bg-lime", "bg-cloud"] as const;
export const brandWash = ["bg-periwinkle-wash", "bg-blush-wash", "bg-lime-wash", "bg-cloud-wash"] as const;
export const brandColor = ["var(--ff-periwinkle)", "var(--ff-blush)", "var(--ff-lime)", "var(--ff-cloud)"] as const;

/** Floating sticker used around hero media. */
export function Sticker({
  children,
  dot = "bg-lime",
  className,
  delay = 900,
}: {
  children: ReactNode;
  dot?: string;
  className?: string;
  delay?: number;
}) {
  return (
    <span className={cn("ff-chip ff-intro-pop absolute z-[2] whitespace-nowrap", className)} style={{ "--d": delay } as CSSProperties}>
      <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-full ring-2 ring-ink/10", dot)} />
      {children}
    </span>
  );
}

/** Small section label rendered as a heading (for bands whose title is the content itself). */
export function EyebrowHeading({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <h2 id={id} className={cn("ff-eyebrow", className)}>
      <BrandDots />
      <span>{children}</span>
    </h2>
  );
}

/** Round check marker that draws its tick as it scrolls into view. */
export function DrawnCheck({ className, tone = "lime" }: { className?: string; tone?: "lime" | "periwinkle" | "blush" | "cobalt" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "ff-reveal-pop grid size-8 shrink-0 place-items-center rounded-full",
        tone === "lime" && "bg-lime text-ink",
        tone === "periwinkle" && "bg-periwinkle text-ink",
        tone === "blush" && "bg-blush text-ink",
        tone === "cobalt" && "bg-cobalt text-white",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="ff-draw-view size-[1.05rem] overflow-visible" focusable="false">
        <path
          d="M5 12.5l4.2 4.2L19 7"
          pathLength={1}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/** Arrow chip used inside primary pill buttons. */
export function ArrowChip({ tone = "light" }: { tone?: "light" | "night" }) {
  return (
    <span
      aria-hidden="true"
      className={cn("ff-arrow grid size-8 place-items-center rounded-full", tone === "light" ? "bg-white/15" : "bg-ink/10")}
    >
      <MinimalGlyph name="arrow-right" />
    </span>
  );
}
