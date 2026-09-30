import { createHash } from "node:crypto";
import type { BlogPost } from "./blog";

export interface ClinicalReviewer {
  name: string;
  credentials: string;
  profileHref: string;
}

export interface ClinicalReviewAttestation {
  status: "confirmed" | "pending";
  reviewer: ClinicalReviewer;
  reviewedAt: string;
  contentDigest: string;
  /** Internal evidence identifier only. Never render a private record or URL. */
  evidenceReference: string;
}

export interface PublishedClinicalReview {
  reviewer: ClinicalReviewer;
  reviewedAt: string;
}

// Review status is currently unknown. Add records only after real clinician
// attestation; an editorial update or a deployment is not a clinical review.
export const clinicalReviewAttestations: Readonly<Record<string, ClinicalReviewAttestation>> = {};

/** Includes all patient-facing article content so an edit invalidates the badge. */
export function getBlogContentDigest(post: BlogPost): string {
  return createHash("sha256").update(JSON.stringify(post)).digest("hex");
}

const isDateOnly = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export function getClinicalReview(
  post: BlogPost,
  attestations: Readonly<Record<string, ClinicalReviewAttestation>> = clinicalReviewAttestations,
  today = new Date().toISOString().slice(0, 10),
): PublishedClinicalReview | undefined {
  const attestation = attestations[post.slug];
  if (
    !attestation || attestation.status !== "confirmed" ||
    !isDateOnly(attestation.reviewedAt) || !isDateOnly(post.updatedAt) ||
    attestation.reviewedAt < post.updatedAt || attestation.reviewedAt > today ||
    !attestation.evidenceReference.trim() ||
    !attestation.reviewer.name.trim() || !attestation.reviewer.credentials.trim() ||
    !/^\/(?!\/)[^\s]*$/.test(attestation.reviewer.profileHref) ||
    attestation.contentDigest !== getBlogContentDigest(post)
  ) return undefined;

  return { reviewer: { ...attestation.reviewer }, reviewedAt: attestation.reviewedAt };
}
