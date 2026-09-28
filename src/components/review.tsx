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
            <div className="inline-flex items-center gap-6">
              <TrackedExternalLink
                href={googleBusinessProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary font-medium transition-colors flex items-center gap-2"
                kind="review"
                provider="google"
                location="reviews_section"
              >
                Read More Reviews
                <MinimalGlyph name="external-link" className="w-4 h-4" />
              </TrackedExternalLink>
              <span className="text-gray-500">•</span>
              <AppointmentLink
                href={buildAppointmentUrl({ source: "reviews_cta" })}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 font-semibold transition-colors"
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
