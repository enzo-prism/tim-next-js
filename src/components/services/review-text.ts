import type { Review } from "@/data/reviews";
import { publicReviewFeedSections, testimonialSections } from "@/content/testimonials";

// Several service reviews in data/reviews.ts are stored as truncated Google
// previews ("...he constructed..."). The same reviews appear in full in the
// curated testimonials content, so show the complete words when they exist.

const letters = (value: string) => value.toLowerCase().replace(/[^a-z]/g, "");

const fullQuotes = [
  ...testimonialSections.flatMap((section) => section.reviews),
  ...publicReviewFeedSections.flatMap((section) => section.reviews),
]
  .filter((review) => !/(\.\.\.|…)\s*$/.test(review.quote) && !/without a written comment/i.test(review.quote))
  .map((review) => ({ name: review.name.trim(), quote: review.quote }));

/** Truncated preview text without its trailing dots. */
export const trimPreview = (text: string) => text.replace(/[\s.…]+$/, "");

/**
 * Returns the review with its full text when the truncated preview matches a
 * complete quote from the same reviewer elsewhere in the content.
 */
export function resolveReview<T extends Review>(review: T): T {
  if (review.isComplete) return review;
  const prefix = letters(trimPreview(review.text)).slice(0, 24);
  const match = fullQuotes.find(
    (candidate) => candidate.name === review.name.trim() && letters(candidate.quote).startsWith(prefix),
  );
  return match ? { ...review, text: match.quote, isComplete: true } : review;
}
