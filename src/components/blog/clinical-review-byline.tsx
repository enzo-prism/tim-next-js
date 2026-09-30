import * as React from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import type { PublishedClinicalReview } from "@/content/clinical-review";

export default function ClinicalReviewByline({ review }: { review?: PublishedClinicalReview }) {
  if (!review) return null;
  return (
    <span>
      Clinically reviewed by{" "}
      <Link className="font-semibold text-primary underline underline-offset-4" href={review.reviewer.profileHref}>
        {review.reviewer.name}, {review.reviewer.credentials}
      </Link>{" "}
      on {format(parseISO(review.reviewedAt), "MMMM d, yyyy")}
    </span>
  );
}
