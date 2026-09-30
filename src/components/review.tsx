import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import type { Review } from "@/data/reviews";
import { googleBusinessProfileUrl } from "@/data/reviews";
import { buildAppointmentUrl } from "@/lib/analytics";
import { AppointmentLink, TrackedExternalLink } from "@/components/tracking/tracked-links";

interface ReviewProps {
  review: Review;
  index?: number;
}

export default function ReviewComponent({ review }: ReviewProps) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{review.name}</h4>
          <div className="mt-1 text-sm text-gray-500">
            {review.rating}.0 rating · Google Review
          </div>
        </div>
        {!review.isComplete && (
          <TrackedExternalLink
            href={googleBusinessProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary transition-colors"
            aria-label="Read full review on Google"
            kind="review"
            provider="google"
            location="review_card_icon"
          >
            <MinimalGlyph name="external-link" className="w-4 h-4" />
          </TrackedExternalLink>
        )}
      </div>
      
      <p className="text-gray-700 leading-relaxed mb-3">
        "{review.text}"
        {!review.isComplete && (
          <TrackedExternalLink
            href={googleBusinessProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary ml-2 text-sm font-medium transition-colors"
            kind="review"
            provider="google"
            location="review_card_excerpt"
          >
            Read full review →
          </TrackedExternalLink>
        )}
      </p>
      
      {review.ownerReply && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 italic">
            <span className="font-medium text-primary">Owner reply:</span> {review.ownerReply}
          </p>
        </div>
      )}
    </div>
  );
}

interface ReviewsSectionProps {
  reviews: Review[];
  title?: string;
  showCTA?: boolean;
}

export function ReviewsSection({ reviews, title = "What Our Patients Say", showCTA = true }: ReviewsSectionProps) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="mt-16">
      <div className="bg-muted/40 rounded-xl p-8 lg:p-12">
        <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">{title}</h3>
        <p className="text-gray-600 text-center mb-8">Real experiences from our valued patients</p>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {reviews.map((review, index) => (
            <ReviewComponent key={index} review={review} index={index} />
          ))}
        </div>
        
        {showCTA && (
          <div className="text-center">
            <div className="flex flex-col items-center gap-3 sm:inline-flex sm:flex-row sm:gap-6">
              <TrackedExternalLink
                href={googleBusinessProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center gap-2 font-medium text-primary transition-colors hover:text-primary"
                kind="review"
                provider="google"
                location="reviews_section"
              >
                Read More Reviews
                <MinimalGlyph name="external-link" className="w-4 h-4" />
              </TrackedExternalLink>
              <span aria-hidden="true" className="hidden text-gray-500 sm:inline">•</span>
              <AppointmentLink
                href={buildAppointmentUrl({ source: "reviews_cta" })}
                className="w-full rounded-lg bg-primary px-6 py-3 text-center font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
                source="reviews_section"
              >
                Book Your Appointment
              </AppointmentLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
