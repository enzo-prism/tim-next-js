import type { CSSProperties, ReactNode } from "react";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { Button } from "@/components/ui/button";
import type { Review } from "@/data/reviews";
import { googleBusinessProfileUrl } from "@/data/reviews";
import { buildAppointmentUrl } from "@/lib/analytics";
import { AppointmentLink, TrackedExternalLink } from "@/components/tracking/tracked-links";
import { Eyebrow } from "@/components/site/section";
import { Stars } from "@/components/site/stars";
import { testimonialsPageSummary } from "@/content/testimonials";
import { resolveReview, trimPreview } from "@/components/services/review-text";
import { cn } from "@/lib/utils";

const accents = ["bg-periwinkle", "bg-blush", "bg-lime", "bg-cloud"];

interface ReviewProps {
  review: Review;
  index?: number;
  /** "feature": regular size on phones, big display quote from tablets up. */
  size?: "md" | "lg" | "feature";
  className?: string;
}

/** One Google review as a quote card, with the full-review link and any reply from the practice. */
export default function ReviewComponent({ review: original, index = 0, size = "md", className }: ReviewProps) {
  const review = resolveReview(original);
  const quote = review.isComplete ? review.text : `${trimPreview(review.text)}…`;

  return (
    <figure className={cn("flex h-full flex-col rounded-3xl border border-border bg-white p-6 sm:p-7", className)}>
      <div className="flex items-center justify-between gap-3">
        <Stars className="text-[0.95rem]" count={Math.round(review.rating)} />
        <span className="rounded-full bg-cream px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-ink-soft">Google review</span>
      </div>
      <blockquote
        className={cn(
          "mt-5 flex-1 text-ink",
          size === "lg" && "font-display text-[1.3rem] leading-snug sm:text-[1.6rem]",
          size === "md" && "text-[1.0625rem] leading-relaxed",
          size === "feature" && "text-[1.0625rem] leading-relaxed md:font-display md:text-[1.6rem] md:leading-snug",
        )}
      >
        <p>“{quote}”</p>
      </blockquote>
      {!review.isComplete ? (
        <TrackedExternalLink
          href={googleBusinessProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          kind="review"
          provider="google"
          location="review_card_excerpt"
          className="ff-link mt-2 inline-flex min-h-11 items-center gap-1.5 self-start text-sm"
        >
          Read the full review on Google
          <MinimalGlyph name="external-link" className="text-xs" />
          <span className="sr-only"> (opens in a new tab)</span>
        </TrackedExternalLink>
      ) : null}
      {review.ownerReply ? (
        <p className="mt-5 rounded-2xl rounded-tl-[4px] bg-cream px-4 py-3 text-sm leading-relaxed text-ink-soft">
          <span className="block text-xs font-bold uppercase tracking-[0.1em] text-ink">Reply from the practice</span>
          {review.ownerReply}
        </p>
      ) : null}
      <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-4">
        <span aria-hidden="true" className={cn("grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold text-ink", accents[index % accents.length])}>
          {review.name.trim().charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold text-ink">{review.name}</span>
          <span className="block text-xs text-ink-soft">{review.rating}.0 rating · Google review</span>
        </span>
      </figcaption>
    </figure>
  );
}

interface ReviewsSectionProps {
  reviews: Review[];
  title?: string;
  /** Shows the "read more reviews" link (and the booking link unless `showBooking` is false). */
  showCTA?: boolean;
  showBooking?: boolean;
  eyebrow?: ReactNode;
  lead?: ReactNode;
  /** id for the heading (for aria-labelledby on the surrounding section). */
  id?: string;
  as?: "h2" | "h3";
  /** "feature": the first review as a big quote beside the others (3+ reviews). */
  layout?: "columns" | "feature";
  className?: string;
}

/**
 * A titled set of review cards. One review sits beside the heading as a big
 * quote; more reviews flow into balanced columns.
 */
export function ReviewsSection({
  reviews,
  title = "What Our Patients Say",
  showCTA = true,
  showBooking = true,
  eyebrow = "Patient reviews",
  lead = "Real experiences from our patients, in their own words.",
  id,
  as: Heading = "h2",
  layout = "columns",
  className,
}: ReviewsSectionProps) {
  if (!reviews || reviews.length === 0) return null;

  const single = reviews.length === 1;

  const header = (
    <div className="ff-reveal max-w-2xl">
      {eyebrow ? <Eyebrow className="mb-4">{eyebrow}</Eyebrow> : null}
      <Heading id={id} className="ff-h2">
        {title}
      </Heading>
      {lead ? <p className="ff-lead mt-5">{lead}</p> : null}
      <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-ink">
        <Stars className="text-base" />
        <span>
          {testimonialsPageSummary.averageRating} on Google · {testimonialsPageSummary.reviewCountLabel}
        </span>
      </p>
    </div>
  );

  const actions = showCTA ? (
    <div className="ff-reveal flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
      {showBooking ? (
        <Button asChild variant="outline" size="lg" className="h-12">
          <AppointmentLink href={buildAppointmentUrl({ source: "reviews_cta" })} source="reviews_section">
            Book Your Appointment
          </AppointmentLink>
        </Button>
      ) : null}
      <TrackedExternalLink
        href={googleBusinessProfileUrl}
        target="_blank"
        rel="noopener noreferrer"
        kind="review"
        provider="google"
        location="reviews_section"
        className="ff-link inline-flex min-h-11 items-center gap-1.5 self-start text-sm sm:self-auto"
      >
        Read more reviews on Google
        <MinimalGlyph name="external-link" className="text-xs" />
        <span className="sr-only"> (opens in a new tab)</span>
      </TrackedExternalLink>
    </div>
  ) : null;

  if (single) {
    return (
      <div className={cn("grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16", className)}>
        <div className="space-y-8">
          {header}
          {actions}
        </div>
        <div className="ff-straighten" style={{ "--ff-tilt": "-2deg" } as CSSProperties}>
          <ReviewComponent review={reviews[0]} size="lg" index={1} className="shadow-float" />
        </div>
      </div>
    );
  }

  const feature = layout === "feature" && reviews.length >= 3;
  const columns = reviews.length === 2 || reviews.length === 4 ? "md:columns-2" : "md:columns-2 lg:columns-3";

  return (
    <div className={className}>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        {header}
        {actions}
      </div>
      {/* Phones: one swipeable row. Wider screens: balanced columns, or a featured quote beside the rest. */}
      <ul
        aria-label="Patient reviews"
        className={cn(
          "ff-reveal -mx-4 mt-10 flex snap-x snap-mandatory items-start gap-4 md:items-stretch overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:-mx-6 sm:px-6 md:mx-0 md:mt-12 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden",
          feature ? "md:grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-5" : cn("md:block md:gap-5", columns),
        )}
      >
        {reviews.map((review, index) => (
          <li
            key={`${review.name}-${index}`}
            className={cn(
              "w-[min(84vw,22rem)] shrink-0 snap-start md:w-auto",
              !feature && "md:mb-5 md:break-inside-avoid",
            )}
            style={feature && index === 0 ? ({ gridRow: `span ${reviews.length - 1}` } as CSSProperties) : undefined}
          >
            <ReviewComponent
              review={review}
              index={index}
              size={feature && index === 0 ? "feature" : "md"}
              className={cn(feature && index === 0 && "md:sticky md:top-28 md:h-auto")}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
