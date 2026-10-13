import type { CSSProperties } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { services } from "@/data/services";
import { ReviewsSection } from "@/components/review";
import { serviceReviews } from "@/data/reviews";
import { buildAppointmentUrl } from "@/lib/analytics";
import { AppointmentLink, PhoneLink } from "@/components/tracking/tracked-links";
import { FinalCtaPhoneLink } from "@/components/service-growth/final-cta-phone-link";
import { getRelatedLinksForService } from "@/lib/internal-links";
import { practiceHoursSummary } from "@/content/practice-hours";
import { PageHero } from "@/components/site/page-hero";
import { Eyebrow, Section, SectionHeader } from "@/components/site/section";
import { StepTimeline } from "@/components/site/step-timeline";
import { CtaBand } from "@/components/site/cta-band";
import { ToothPerson } from "@/components/brand/pinwheel";
import { HeroPhoto } from "@/components/services/hero-photo";
import { VisitCard } from "@/components/services/visit-card";
import { DecisionGuide } from "@/components/services/decision-guide";
import { ExploreLinks } from "@/components/services/explore-links";
import { brandTones, getServiceGroup, getServiceTheme, isPublishableDetail } from "@/components/services/service-themes";
import { cn } from "@/lib/utils";

type ServiceDetailProps = {
  serviceId: string;
};

// Services without their own reviews borrow their parent's.
const parentReviewIds: Record<string, string> = {
  invisalign: "restorative-dentistry",
  "teeth-whitening": "restorative-dentistry",
  "dental-crowns": "restorative-dentistry",
};

const numberTones = ["bg-periwinkle", "bg-blush", "bg-lime", "bg-cloud"];

export default function ServiceDetail({ serviceId }: ServiceDetailProps) {
  // Find the service by ID (check both main services and sub-services)
  const service =
    services.find((s) => s.id === serviceId) || services.flatMap((s) => s.subServices || []).find((s) => s.id === serviceId);

  if (!service) {
    return (
      <Section width="narrow" className="text-center">
        <h1 className="ff-h1">Service Not Found</h1>
        <p className="ff-lead mt-5">The service you’re looking for doesn’t exist.</p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/services">
            <MinimalGlyph name="arrow-left" />
            Back to Services
          </Link>
        </Button>
      </Section>
    );
  }

  const reviewData =
    serviceReviews.find((sr) => sr.serviceId === service.id) ??
    (parentReviewIds[service.id] ? serviceReviews.find((sr) => sr.serviceId === parentReviewIds[service.id]) : undefined);
  const relatedLinks = getRelatedLinksForService(service.id);
  const theme = getServiceTheme(service.id);
  const accent = brandTones[theme.tone];
  const group = getServiceGroup(service.id);
  const details = service.details.filter(isPublishableDetail);
  const lowerTitle = service.title.toLowerCase();

  return (
    <div className="overflow-x-clip">
      <PageHero
        id="service-heading"
        tone={theme.heroTone}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: service.title },
        ]}
        eyebrow={group ? `${group.label} · Los Gatos` : "Dental care in Los Gatos"}
        titleText={`${service.title} in Los Gatos`}
        lead={service.heroDescription || service.description}
        actions={
          <>
            <Button asChild size="lg" className="group h-14 pl-7 pr-3 text-base">
              <AppointmentLink
                href={buildAppointmentUrl({ serviceId: service.id, source: "service_detail_hero" })}
                source="service_detail_hero"
                serviceId={service.id}
              >
                Request a visit
                <span aria-hidden="true" className="ff-arrow grid size-8 place-items-center rounded-full bg-white/15">
                  <MinimalGlyph name="arrow-right" />
                </span>
              </AppointmentLink>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-7 text-base">
              <PhoneLink location="service_detail_hero" serviceId={service.id}>
                Call (408) 358-8100
              </PhoneLink>
            </Button>
          </>
        }
        meta={
          <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold text-ink">{practiceHoursSummary}</span>
            <span aria-hidden="true">·</span>
            <span>15251 National Ave, Suite 102</span>
          </span>
        }
        media={<HeroPhoto photo={theme.photo} chips={theme.chips} chipColors={[accent.color, theme.tone === "lime" ? "var(--ff-periwinkle)" : "var(--ff-lime)"]} />}
      />

      {/* ------------------------------------------------------------ About */}
      <Section labelledBy="about-heading">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <div className="ff-reveal">
              <Eyebrow className="mb-4">The essentials</Eyebrow>
              <h2 id="about-heading" className="ff-h2">
                About {service.title}
              </h2>
              <p className="mt-7 max-w-3xl font-display text-[1.35rem] font-medium leading-snug tracking-[-0.01em] text-ink sm:text-[1.6rem]">
                {service.longDescription ||
                  `Learn how our Los Gatos team approaches ${lowerTitle} with clear explanations, thoughtful planning, and your comfort in mind.`}
              </p>
            </div>
            <div className="mt-12">
              <h3 className="ff-reveal text-lg font-bold text-ink">What’s included</h3>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {details.map((detail, index) => (
                  <li
                    key={detail}
                    className={cn(
                      "ff-reveal flex items-start gap-3 rounded-2xl bg-white p-4 text-base leading-snug text-ink ring-1 ring-border",
                      details.length % 2 === 1 && index === details.length - 1 && "sm:col-span-2",
                    )}
                    style={{ "--i": index % 2 } as CSSProperties}
                  >
                    <span aria-hidden="true" className={cn("grid size-6 shrink-0 place-items-center rounded-full text-xs text-ink", accent.solid)}>
                      <MinimalGlyph name="check" />
                    </span>
                    <span className="pt-0.5">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="lg:sticky lg:top-28 lg:self-start">
            <VisitCard
              tone={theme.tone}
              facts={group ? [{ label: "Care area", value: group.label }] : undefined}
              appointmentHref={buildAppointmentUrl({ serviceId: service.id, source: "service_detail_about" })}
              source="service_detail_about"
              serviceId={service.id}
              className="ff-reveal"
            />
          </div>
        </div>
      </Section>

      {/* --------------------------------------------------------- Benefits */}
      {service.benefits?.length ? (
        <Section tone="white" labelledBy="benefits-heading">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <SectionHeader
                id="benefits-heading"
                eyebrow="Why it helps"
                title={`Benefits of ${service.title}`}
                lead={`What ${lowerTitle} can do for your oral health and everyday comfort.`}
              />
              <div aria-hidden="true" className="ff-reveal-pop mt-10 hidden items-end gap-3 lg:flex" style={{ "--i": 1 } as CSSProperties}>
                {["var(--ff-periwinkle)", "var(--ff-blush)", "var(--ff-lime)", "var(--ff-cloud)"].map((color, index) => (
                  <ToothPerson
                    key={color}
                    color={color}
                    className={cn("w-auto", ["h-24", "h-20", "h-14", "h-16"][index], index === 3 && "[&_g]:stroke-ink/10 [&_g]:[stroke-width:3]")}
                  />
                ))}
              </div>
            </div>
            <ol className="divide-y divide-border border-y border-border">
              {service.benefits.map((benefit, index) => (
                <li key={benefit} className="ff-reveal flex items-center gap-5 py-5 sm:gap-7 sm:py-6" style={{ "--i": index % 3 } as CSSProperties}>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-12 shrink-0 place-items-center rounded-full font-display text-xl font-semibold text-ink sm:size-14 sm:text-2xl",
                      numberTones[index % numberTones.length],
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-xl font-medium leading-snug tracking-[-0.01em] text-ink sm:text-2xl">{benefit}</span>
                </li>
              ))}
            </ol>
          </div>
        </Section>
      ) : null}

      {/* ---------------------------------------------------------- Process */}
      {service.process?.length ? (
        <Section tone="cream" labelledBy="process-heading">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
            <SectionHeader
              id="process-heading"
              eyebrow="What to expect"
              title={
                <>
                  Your visit, <em className="ff-italic font-normal">step by step</em>
                </>
              }
            />
            <p className="ff-reveal ff-lead max-w-xl lg:justify-self-end">
              Here’s how it usually goes with our team. We explain each step as we go, with time for every question.
            </p>
          </div>
          <div className="mt-14">
            <StepTimeline steps={service.process.map((step) => ({ title: step }))} />
          </div>
        </Section>
      ) : null}

      {/* ---------------------------------------------------- Decision guide */}
      {service.decisionGuide ? (
        <Section labelledBy="planning-heading">
          <DecisionGuide title={service.title} guide={service.decisionGuide} tone={theme.tone} />
        </Section>
      ) : null}

      {/* ---------------------------------------------------------- Reviews */}
      {reviewData && reviewData.reviews.length > 0 ? (
        <Section tone={accent.section} labelledBy="service-reviews-heading" className="overflow-clip">
          <ReviewsSection
            id="service-reviews-heading"
            reviews={reviewData.reviews}
            title={`${service.title} Patient Reviews`}
            lead="Real experiences from our patients, shared on Google."
            showCTA={true}
            showBooking={false}
          />
        </Section>
      ) : null}

      {/* ---------------------------------------------------------- Related */}
      <Section labelledBy="related-heading">
        <ExploreLinks id="related-heading" links={relatedLinks} />
      </Section>

      {/* ---------------------------------------------------------- Closing */}
      <CtaBand
        id="service-cta-heading"
        title={
          <>
            Ready to get <em className="ff-italic font-normal text-lime">started?</em>
          </>
        }
        body={`Tell us what you need and when you prefer to visit. Our team will contact you to confirm the next step for your ${lowerTitle} visit.`}
        actions={
          <>
            <Button asChild size="lg" variant="night" className="group h-14 pl-7 pr-3 text-base">
              <AppointmentLink
                href={buildAppointmentUrl({ serviceId: service.id, source: "service_detail" })}
                source="service_detail"
                ctaType="consultation"
                serviceId={service.id}
              >
                Book Your Appointment
                <span aria-hidden="true" className="ff-arrow grid size-8 place-items-center rounded-full bg-ink/10">
                  <MinimalGlyph name="arrow-right" />
                </span>
              </AppointmentLink>
            </Button>
            <FinalCtaPhoneLink location="service_detail_final" serviceId={service.id}>
              or call (408) 358-8100
            </FinalCtaPhoneLink>
          </>
        }
        note={<>{practiceHoursSummary} · 15251 National Ave, Suite 102, Los Gatos</>}
      />
    </div>
  );
}
