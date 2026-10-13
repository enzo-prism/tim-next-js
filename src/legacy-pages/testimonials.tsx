import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import RelatedLinksSection from "@/components/navigation/RelatedLinksSection";
import { ToothPerson } from "@/components/brand/pinwheel";
import { PageHero } from "@/components/site/page-hero";
import { Section, SectionHeader } from "@/components/site/section";
import { ReviewRows, type ReviewItem } from "@/components/site/review-rows";
import { Stars } from "@/components/site/stars";
import { CtaBand } from "@/components/site/cta-band";
import { ReviewExplorer, type ExplorerReview, type ExplorerTheme } from "@/components/story/review-explorer";
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  practiceInfo,
} from "@/content/structured-data";
import {
  featuredReview,
  publicReviewFeedSections,
  testimonialSections,
  testimonialsReviewLibrarySummary,
  testimonialsPageRelatedLinks,
  testimonialsPageSummary,
} from "@/content/testimonials";
import { practiceHoursSummary } from "@/content/practice-hours";
import { buildAppointmentUrl } from "@/lib/analytics";
import { AppointmentLink, PhoneLink, TrackedExternalLink } from "@/components/tracking/tracked-links";

// Chip label + brand dot per curated section (ids from content/testimonials.ts).
const themeStyle: Record<string, { label: string; dot: string; wash: string }> = {
  "new-patients": { label: "First visits", dot: "bg-periwinkle", wash: "bg-periwinkle-wash" },
  "gentle-care": { label: "Gentle care", dot: "bg-blush", wash: "bg-blush-wash" },
  "family-dentistry": { label: "Families & kids", dot: "bg-lime", wash: "bg-lime-wash" },
  "advanced-care": { label: "TMJ, Invisalign & tech", dot: "bg-cloud", wash: "bg-cloud-wash" },
};

// Masonry reading order, chosen so each column mixes themes and lengths
// (CSS columns fill top to bottom). Reviews not listed follow at the end.
const masonryOrder = [
  "Priscilla Barajas",
  "Jerry Jobe",
  "Don Spingola",
  "Jon Takagi",
  "Jinny",
  "Andrea Callaghan",
  "Janey Lee",
  "Kevin Lan",
  "Todd McMasters",
  "TO Preising",
  "Dayn Le",
  "Paula Gregoire",
];

// A few short quotes are set large on a soft wash; one longer one gets a wash only.
const featured: Record<string, { large?: boolean }> = {
  "Jerry Jobe": { large: true },
  "TO Preising": { large: true },
  "Kevin Lan": { large: true },
  Jinny: {},
};

// Public feed entries without a written review add nothing to read: keep the
// data, but don't display them.
function hasWrittenReview(review: { name: string; quote: string }) {
  return review.name.trim().length > 1 && !/without a written comment/i.test(review.quote);
}

const explorerThemes: ExplorerTheme[] = testimonialSections.map((section) => ({
  id: section.id,
  label: themeStyle[section.id]?.label ?? section.eyebrow,
  title: section.title,
  description: section.description,
  dot: themeStyle[section.id]?.dot ?? "bg-cloud",
  links: section.links,
}));

const rank = (name: string) => {
  const index = masonryOrder.indexOf(name);
  return index === -1 ? masonryOrder.length : index;
};

const explorerReviews: ExplorerReview[] = testimonialSections
  .flatMap((section) =>
    section.reviews.map((review) => ({
      name: review.name,
      quote: review.quote,
      label: review.patientLabel,
      meta: "Google review",
      theme: section.id,
      wash: featured[review.name] ? themeStyle[section.id]?.wash : undefined,
      large: featured[review.name]?.large,
    })),
  )
  .sort((a, b) => rank(a.name) - rank(b.name));

const googleFeed = publicReviewFeedSections.find((section) => section.id === "latest-google-reviews");
const yelpFeed = publicReviewFeedSections.find((section) => section.id === "yelp-reviews");

// Longer reviews share the first drift row and shorter ones the second, so
// no card sits half empty; within a row, long and short alternate.
function arrangeFeed(items: ReviewItem[]) {
  const sorted = [...items].sort((a, b) => b.quote.length - a.quote.length);
  const half = Math.ceil(sorted.length / 2);
  const alternate = (row: ReviewItem[]) =>
    row.map((_, index) => (index % 2 === 0 ? row[index / 2] : row[row.length - 1 - (index - 1) / 2]));
  return [...alternate(sorted.slice(0, half)), ...alternate(sorted.slice(half))];
}

const feedReviews: ReviewItem[] = arrangeFeed([
  ...(googleFeed?.reviews ?? []).filter(hasWrittenReview).map((review) => ({
    name: review.name,
    quote: review.quote,
    meta: `Google · ${review.dateLabel}`,
  })),
  ...(yelpFeed?.reviews ?? []).filter(hasWrittenReview).map((review) => ({
    name: review.name,
    quote: review.quote,
    meta: `Yelp · ${review.dateLabel}`,
  })),
]);

// A short line from the featured review, verbatim.
const heroQuote = "Our kids actually enjoy going to the dentist now, which says everything.";

export default function TestimonialsPage() {
  const pageUrl = `${practiceInfo.url}/testimonials`;
  const pageTitle = "Patient Testimonials, Google Reviews & Yelp Reviews";
  const pageDescription =
    "Read what patients say about Family First Smile Care in Los Gatos, from gentle cleanings and thorough exams to family dentistry, Invisalign, TMJ care, and public Yelp feedback.";

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", item: practiceInfo.url },
    { name: pageTitle, item: pageUrl },
  ]);
  const collectionPageSchema = buildCollectionPageSchema({
    name: pageTitle,
    description: pageDescription,
    url: pageUrl,
  });

  return (
    <div className="overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ------------------------------------------------------------ Hero */}
      <PageHero
        id="testimonials-heading"
        tone="lime"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Testimonials" }]}
        eyebrow="Verified patient feedback"
        title={
          <>
            Patient <em className="ff-italic font-normal">Testimonials,</em>{" "}
            <span className="mt-3 block text-[0.5em] leading-[1.15] tracking-[-0.02em]">Google Reviews &amp; Yelp Reviews</span>
          </>
        }
        lead="Hear from Los Gatos patients and families who chose Family First Smile Care for gentle preventive visits, child-friendly dentistry, Invisalign, TMJ support, and clear treatment planning."
        actions={
          <>
            <Button asChild size="lg" className="group h-14 pl-7 pr-5 text-base">
              <AppointmentLink href={buildAppointmentUrl({ source: "testimonials_final_cta" })} source="testimonials_page">
                Book an appointment
                <span aria-hidden="true" className="ff-arrow grid size-8 place-items-center rounded-full bg-white/15">
                  <MinimalGlyph name="arrow-right" />
                </span>
              </AppointmentLink>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-7 text-base">
              <PhoneLink location="testimonials_page">Call (408) 358-8100</PhoneLink>
            </Button>
          </>
        }
        media={
          <div className="relative mx-auto w-full max-w-[26rem] pb-4 lg:max-w-[28rem] lg:pb-28">
            <ToothPerson
              color="var(--ff-lime)"
              className="ff-intro-pop absolute -right-3 -top-10 z-0 h-28 w-auto rotate-[12deg] sm:-right-8 sm:h-32"
              style={{ "--d": 760 } as CSSProperties}
            />
            <ToothPerson
              color="var(--ff-periwinkle)"
              className="ff-intro-pop absolute -right-12 bottom-[22%] z-0 hidden h-24 w-auto rotate-[16deg] lg:block"
              style={{ "--d": 880 } as CSSProperties}
            />
            <div className="relative z-[1] rounded-3xl bg-white p-7 shadow-float ring-1 ring-border sm:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-cobalt-deep">Average rating</p>
              <p className="mt-3 flex items-end gap-3">
                <span className="font-display text-[5.5rem] font-semibold leading-[0.85] tracking-tight text-ink sm:text-[7rem]">
                  {testimonialsReviewLibrarySummary.averageRating}
                </span>
                <span className="pb-2 text-sm font-semibold text-ink-soft">out of 5</span>
              </p>
              <Stars className="mt-4 text-2xl" />
              <p className="mt-4 text-lg font-bold text-ink">{testimonialsReviewLibrarySummary.reviewCountLabel}</p>
              <p className="mt-1 text-sm text-ink-soft">{testimonialsReviewLibrarySummary.verifiedAtLabel}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm" className="h-10">
                  <TrackedExternalLink
                    href={testimonialsPageSummary.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    kind="review"
                    provider="google"
                    location="testimonials_featured"
                  >
                    View Google profile
                    <MinimalGlyph name="external-link" className="h-4 w-4" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </TrackedExternalLink>
                </Button>
                {yelpFeed ? (
                  <Button asChild variant="outline" size="sm" className="h-10">
                    <TrackedExternalLink
                      href={yelpFeed.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      kind="review"
                      provider="yelp"
                      location="testimonials_featured"
                    >
                      View Yelp profile
                      <MinimalGlyph name="external-link" className="h-4 w-4" />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </TrackedExternalLink>
                  </Button>
                ) : null}
              </div>
            </div>
            <figure
              className="ff-intro-pop relative z-[2] mx-4 -mt-4 rotate-[-2.5deg] rounded-2xl bg-ink p-5 text-white shadow-float sm:mx-8 lg:absolute lg:-bottom-4 lg:-left-12 lg:mx-0 lg:w-72"
              style={{ "--d": 640 } as CSSProperties}
            >
              <blockquote className="font-display text-lg leading-snug">“{heroQuote}”</blockquote>
              <figcaption className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-white/70">
                {featuredReview.name} · {featuredReview.patientLabel}
              </figcaption>
            </figure>
          </div>
        }
      />

      {/* -------------------------------------------------------- Explorer */}
      <Section labelledBy="review-themes-heading">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-end">
          <SectionHeader
            id="review-themes-heading"
            eyebrow="In their words"
            title={
              <>
                What patients mention <em className="ff-italic font-normal">most</em>
              </>
            }
          />
          <p className="ff-reveal ff-lead max-w-xl lg:justify-self-end">
            {testimonialsPageSummary.editorialNote} Pick a theme to read the reviews that matter most to you.
          </p>
        </div>
        <div className="ff-reveal mt-10">
          <ReviewExplorer themes={explorerThemes} reviews={explorerReviews} />
        </div>
      </Section>

      {/* ----------------------------------------------------------- Feeds */}
      <Section tone="periwinkle" labelledBy="public-reviews-heading" width="full" className="overflow-clip">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <SectionHeader
            id="public-reviews-heading"
            eyebrow="Straight from Google & Yelp"
            title={
              <>
                The latest <em className="ff-italic font-normal">public</em> reviews
              </>
            }
            lead="Recent reviews from Google, plus excerpts from Yelp. Read every review in full on each site."
          />
          <div className="ff-reveal flex flex-col gap-3 sm:flex-row lg:shrink-0">
            {[googleFeed, yelpFeed].map((feed) =>
              feed ? (
                <Button key={feed.id} asChild variant="outline" size="lg">
                  <TrackedExternalLink
                    href={feed.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    kind="review"
                    provider={feed.id === "yelp-reviews" ? "yelp" : "google"}
                    location="testimonials_review_section"
                  >
                    {feed.sourceLabel}
                    <MinimalGlyph name="external-link" className="h-4 w-4" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </TrackedExternalLink>
                </Button>
              ) : null,
            )}
          </div>
        </div>
        <ReviewRows reviews={feedReviews} className="mt-12 [&_.ff-marquee]:items-start" />
      </Section>

      {/* --------------------------------------------------------- Related */}
      <Section className="py-14 sm:py-16 lg:py-20">
        <div className="[&>section]:mt-0">
          <RelatedLinksSection title="Explore more patient resources" links={testimonialsPageRelatedLinks} />
        </div>
      </Section>

      {/* ----------------------------------------------------------- Close */}
      <CtaBand
        id="testimonials-cta-heading"
        title={
          <>
            Ready to see what your visit <em className="ff-italic font-normal text-lime">could feel like?</em>
          </>
        }
        body="If you are looking for a Los Gatos dentist who explains options clearly, moves at your pace, and provides family-friendly care with modern dental technology, we would love to help."
        actions={
          <>
            <Button asChild size="lg" variant="night" className="group h-14 pl-7 pr-5 text-base">
              <AppointmentLink href={buildAppointmentUrl({ source: "testimonials_final_cta" })} source="testimonials_page">
                Book an appointment
                <span aria-hidden="true" className="ff-arrow grid size-8 place-items-center rounded-full bg-ink/10">
                  <MinimalGlyph name="arrow-right" />
                </span>
              </AppointmentLink>
            </Button>
            <Button asChild size="lg" variant="night-outline" className="h-14 px-7 text-base">
              <TrackedExternalLink
                href={testimonialsPageSummary.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                kind="review"
                provider="google"
                location="testimonials_bottom_cta"
              >
                Read more reviews on Google
                <MinimalGlyph name="external-link" className="h-4 w-4" />
                <span className="sr-only"> (opens in a new tab)</span>
              </TrackedExternalLink>
            </Button>
          </>
        }
        note={<>{practiceHoursSummary} · 15251 National Ave, Suite 102, Los Gatos</>}
      />
    </div>
  );
}
