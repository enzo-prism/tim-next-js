import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Stars } from "./stars";

export type ReviewItem = {
  name: string;
  quote: string;
  label?: string;
  meta?: string;
};

const accents = ["bg-periwinkle", "bg-blush", "bg-lime", "bg-cloud"];

/** One review as a quote card. */
export function ReviewCard({
  review,
  index = 0,
  className,
  size = "md",
}: {
  review: ReviewItem;
  index?: number;
  className?: string;
  size?: "md" | "lg";
}) {
  return (
    <figure className={cn("flex h-full flex-col rounded-3xl border border-border bg-white p-6 sm:p-7", className)}>
      <div className="flex items-center justify-between gap-3">
        <Stars className="text-[0.95rem]" />
        {review.label ? (
          <span className="rounded-full bg-cream px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-ink-soft">{review.label}</span>
        ) : null}
      </div>
      <blockquote className={cn("mt-5 flex-1 leading-relaxed text-ink", size === "lg" ? "font-display text-[1.3rem] leading-snug sm:text-2xl" : "text-[1.0625rem]")}>
        “{review.quote}”
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-4">
        <span aria-hidden="true" className={cn("grid size-9 place-items-center rounded-full text-sm font-bold text-ink", accents[index % accents.length])}>
          {review.name.trim().charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold text-ink">{review.name}</span>
          {review.meta ? <span className="block text-xs text-ink-soft">{review.meta}</span> : null}
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * Two rows of review cards that drift in opposite directions as the section
 * scrolls past (wide screens with scroll-timeline support). On phones, and
 * wherever scroll timelines are unsupported, each row is a swipeable strip.
 * Nothing moves on its own.
 */
export function ReviewRows({ reviews, className, footer }: { reviews: ReviewItem[]; className?: string; footer?: ReactNode }) {
  const half = Math.ceil(reviews.length / 2);
  const rows = [reviews.slice(0, half), reviews.slice(half)].filter((row) => row.length > 0);
  return (
    <div className={cn("ff-marquee-scope space-y-4", className)}>
      {rows.map((row, rowIndex) => (
        <ul key={rowIndex} className="ff-marquee" data-direction={rowIndex % 2 === 0 ? "left" : "right"} aria-label={rowIndex === 0 ? "Patient reviews" : "More patient reviews"}>
          {row.map((review, index) => (
            <li key={`${review.name}-${index}`} className="w-[min(84vw,24rem)] lg:w-[26rem]" style={{ "--i": index } as CSSProperties}>
              <ReviewCard review={review} index={index + rowIndex} />
            </li>
          ))}
        </ul>
      ))}
      {footer}
    </div>
  );
}
