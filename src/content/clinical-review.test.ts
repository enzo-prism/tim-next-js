import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getAllBlogPosts } from "./blog";
import { getBlogContentDigest, getClinicalReview, type ClinicalReviewAttestation } from "./clinical-review";
import { buildBlogPostingSchema } from "./structured-data";
import ClinicalReviewByline from "@/components/blog/clinical-review-byline";

const post = getAllBlogPosts()[0];
const attestation: ClinicalReviewAttestation = {
  status: "confirmed",
  reviewer: { name: "Test Clinician", credentials: "DDS", profileHref: "/team#test-clinician" },
  reviewedAt: "2026-09-01",
  contentDigest: getBlogContentDigest(post),
  evidenceReference: "test-evidence-only",
};
const lookup = (record: ClinicalReviewAttestation, article = post) =>
  getClinicalReview(article, { [post.slug]: record }, "2026-09-30");

describe("clinical review publication", () => {
  it("makes no clinician-review claim when attestation is unknown or pending", () => {
    expect(getClinicalReview(post)).toBeUndefined();
    expect(lookup({ ...attestation, status: "pending" })).toBeUndefined();
    expect(renderToStaticMarkup(createElement(ClinicalReviewByline, {}))).toBe("");
  });

  it("publishes a confirmed, evidenced review of exactly the current article", () => {
    const review = lookup(attestation);
    expect(review).toEqual({ reviewer: attestation.reviewer, reviewedAt: attestation.reviewedAt });
    const html = renderToStaticMarkup(createElement(ClinicalReviewByline, { review }));
    expect(html).toContain("Clinically reviewed by");
    expect(html).toContain("Test Clinician, DDS");
    expect(html).toContain('href="/team#test-clinician"');
    expect(html).toContain("September 1, 2026");
    expect(html).not.toContain(attestation.evidenceReference);
  });

  it("withdraws a review when patient-facing text changes, even if its date was not updated", () => {
    expect(lookup(attestation, { ...post, quickAnswer: "Changed clinical guidance" })).toBeUndefined();
  });

  it("rejects missing evidence, stale or future dates, impossible dates, and unsafe profile links", () => {
    for (const changes of [
      { evidenceReference: "" },
      { reviewedAt: "2026-01-01" },
      { reviewedAt: "2026-10-01" },
      { reviewedAt: "2026-02-30" },
      { reviewer: { ...attestation.reviewer, profileHref: "//another-host.example/reviewer" } },
    ]) expect(lookup({ ...attestation, ...changes })).toBeUndefined();
  });

  it("keeps editorial authorship separate and publishes review properties on the WebPage only", () => {
    const args = { title: post.title, description: post.metaDescription, url: `https://www.famfirstsmile.com/blog/${post.slug}`, datePublished: post.publishedAt, dateModified: post.updatedAt };
    const unreviewed = buildBlogPostingSchema(args);
    expect(unreviewed.mainEntityOfPage).not.toHaveProperty("reviewedBy");
    expect(unreviewed.mainEntityOfPage).not.toHaveProperty("lastReviewed");
    const reviewed = buildBlogPostingSchema({ ...args, clinicalReview: lookup(attestation) });
    expect(reviewed.mainEntityOfPage).toMatchObject({ lastReviewed: "2026-09-01", reviewedBy: { "@type": "Person", name: "Test Clinician", honorificSuffix: "DDS" } });
    expect(reviewed.author.name).toBe("Family First Smile Care Editorial Team");
    expect(JSON.stringify(reviewed)).not.toContain(attestation.evidenceReference);
  });
});
