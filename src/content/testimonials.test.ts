import { describe, expect, it } from "vitest";
import {
  publicReviewFeedSections,
  testimonialsPageSummary,
  testimonialsReviewLibrarySummary,
} from "@/content/testimonials";

describe("public review snapshot", () => {
  it("uses the verified August 2026 Google review count everywhere", () => {
    expect(testimonialsPageSummary.reviewCountLabel).toBe("82 Google reviews");
    expect(testimonialsReviewLibrarySummary.reviewCountLabel).toBe(
      "82 Google reviews + 6 Yelp reviews",
    );
    expect(testimonialsPageSummary.verifiedAtLabel).toBe(
      "Google review count verified August 19, 2026",
    );
  });

  it("leads the Google review feed with newly verified reviewers", () => {
    const googleFeed = publicReviewFeedSections.find(
      (section) => section.id === "latest-google-reviews",
    );

    expect(googleFeed?.reviews.slice(0, 4).map((review) => review.name)).toEqual([
      "l",
      "Laura Manthey",
      "Leung Lok",
      "Elsie C",
    ]);
  });
});
