import { Star, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import type { Review } from "@/data/reviews";
import { googleBusinessProfileUrl } from "@/data/reviews";
import { Link } from "wouter";
import { APPOINTMENT_FORM_URL, trackAppointmentCtaClick } from "@/lib/analytics";

interface ReviewProps {
  review: Review;
  index?: number;
}

export default function ReviewComponent({ review, index = 0 }: ReviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{review.name}</h4>
          <div className="flex items-center mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
            <span className="ml-2 text-sm text-gray-500">Google Review</span>
          </div>
        </div>
        {!review.isComplete && (
          <a
            href={googleBusinessProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors"
            aria-label="Read full review on Google"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
      
      <p className="text-gray-700 leading-relaxed mb-3">
        "{review.text}"
        {!review.isComplete && (
          <a
            href={googleBusinessProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 ml-2 text-sm font-medium transition-colors"
          >
            Read full review →
          </a>
        )}
      </p>
      
      {review.ownerReply && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 italic">
            <span className="font-medium text-primary">Owner reply:</span> {review.ownerReply}
          </p>
        </div>
      )}
    </motion.div>
  );
}

interface ReviewsSectionProps {
  reviews: Review[];
  title?: string;
  showCTA?: boolean;
}

export function ReviewsSection({ reviews, title = "What Our Patients Say", showCTA = true }: ReviewsSectionProps) {
  if (!reviews || reviews.length === 0) return null;
  const handleAppointmentClick = () => {
    trackAppointmentCtaClick("reviews");
  };

  return (
    <motion.div 
      className="mt-16"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl p-8 lg:p-12">
        <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">{title}</h3>
        <p className="text-gray-600 text-center mb-8">Real experiences from our valued patients</p>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {reviews.map((review, index) => (
            <ReviewComponent key={index} review={review} index={index} />
          ))}
        </div>
        
        {showCTA && (
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="inline-flex items-center gap-6">
              <a
                href={googleBusinessProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-2"
              >
                Read More Reviews
                <ExternalLink className="w-4 h-4" />
              </a>
              <span className="text-gray-500">•</span>
              <Link
                href={APPOINTMENT_FORM_URL}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 font-semibold transition-colors"
                onClick={handleAppointmentClick}
              >
                Book Your Appointment
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
