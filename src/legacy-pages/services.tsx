import type { CSSProperties } from "react";
import ServiceCard from "@/components/service-card";
import { services } from "@/data/services";
import type { Service } from "@/lib/types";
import { ReviewsSection } from "@/components/review";
import { generalReviews } from "@/data/reviews";
import { buildAppointmentUrl } from "@/lib/analytics";
import { AppointmentLink } from "@/components/tracking/tracked-links";
import { FinalCtaPhoneLink } from "@/components/service-growth/final-cta-phone-link";
import { practiceHoursSummary } from "@/content/practice-hours";
import { Button } from "@/components/ui/button";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { PageHero } from "@/components/site/page-hero";
import { Section, SectionHeader } from "@/components/site/section";
import { CtaBand } from "@/components/site/cta-band";
import { ToothPerson } from "@/components/brand/pinwheel";
import { Squiggle } from "@/components/brand/squiggle";
import { HeroPhoto } from "@/components/services/hero-photo";
import { IntentPicker } from "@/components/services/intent-picker";
import { brandTones, officePhotos, serviceGroups, type ServiceGroup } from "@/components/services/service-themes";
import { cn } from "@/lib/utils";

type CatalogEntry = { service: Service; isSubService: boolean };

const topLevelIds = new Set(services.map((service) => service.id));
const allServices = services.flatMap((service) => [service, ...(service.subServices ?? [])]);
const byId = new Map(allServices.map((service) => [service.id, service]));

// Services shown as their own card somewhere in the catalog.
const cardIds = new Set(serviceGroups.flatMap((group) => group.serviceIds).filter((id) => byId.has(id)));

// Any top-level service not placed in a group still gets a card (last group).
const ungrouped = services.filter((service) => !cardIds.has(service.id)).map((service) => service.id);
const catalogGroups: ServiceGroup[] = serviceGroups.map((group, index) =>
  index === serviceGroups.length - 1 ? { ...group, serviceIds: [...group.serviceIds, ...ungrouped] } : group,
);

const entriesFor = (group: ServiceGroup): CatalogEntry[] =>
  group.serviceIds.flatMap((id) => {
    const service = byId.get(id);
    return service ? [{ service, isSubService: !topLevelIds.has(id) }] : [];
  });

// Panel layout of the bento, by group id.
const panelLayout: Record<string, { panel: string; cards: string; header: "row" | "stack" }> = {
  "everyday-care": { panel: "lg:col-span-12", cards: "sm:grid-cols-2 lg:grid-cols-3", header: "row" },
  kids: { panel: "lg:col-span-5", cards: "", header: "stack" },
  smile: { panel: "lg:col-span-7", cards: "sm:grid-cols-2", header: "stack" },
  "comfort-repair": { panel: "lg:col-span-12", cards: "sm:grid-cols-2 lg:grid-cols-3", header: "row" },
};

function GroupPanel({ group, index }: { group: ServiceGroup; index: number }) {
  const tone = brandTones[group.tone];
  const layout = panelLayout[group.id] ?? panelLayout["everyday-care"];
  const entries = entriesFor(group);
  if (!entries.length) return null;
  const headingId = `${group.id}-heading`;
  const oddLast = entries.length % 2 === 1 && entries.length > 1;

  return (
    <section
      id={group.id}
      aria-labelledby={headingId}
      className={cn("relative scroll-mt-28 overflow-clip rounded-3xl p-3 pt-7 sm:p-5 sm:pt-9 lg:p-6 lg:pt-10", tone.wash, layout.panel)}
    >
      <ToothPerson
        color={tone.color}
        className={cn(
          "ff-reveal-pop pointer-events-none absolute -top-3 right-5 h-24 w-auto rotate-[8deg] sm:right-8 sm:h-28",
          group.tone === "cloud" && "[&_g]:stroke-ink/10 [&_g]:[stroke-width:3]",
        )}
        style={{ "--i": 1 } as CSSProperties}
      />
      <div
        className={cn(
          "ff-reveal relative mb-6 px-3 pr-24 sm:mb-8 sm:px-2 sm:pr-36",
          layout.header === "row" && "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-10",
        )}
      >
        <div>
          <p className="ff-eyebrow">
            <span aria-hidden="true" className="font-display text-sm font-semibold tracking-normal text-ink">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{group.label}</span>
          </p>
          <h3 id={headingId} className="ff-h3 mt-3 max-w-xl">
            {group.title}
          </h3>
        </div>
        <p className={cn("mt-3 max-w-md text-base leading-relaxed text-ink-soft", layout.header === "row" && "lg:mt-0")}>{group.blurb}</p>
      </div>
      <div className={cn("relative grid gap-3 sm:gap-4", layout.cards)}>
        {entries.map(({ service, isSubService }, position) => (
          <ServiceCard
            key={service.id}
            service={service}
            featured={service.featured === true}
            tone={group.tone}
            index={position}
            location={isSubService ? "service_card_subservice" : "service_card"}
            subServices={(service.subServices ?? []).filter((sub) => !cardIds.has(sub.id))}
            className={cn(oddLast && position === entries.length - 1 && "sm:col-span-2 lg:col-span-1")}
          />
        ))}
      </div>
    </section>
  );
}

export default function Services() {
  return (
    <div className="overflow-x-clip">
      <PageHero
        id="services-heading"
        tone="periwinkle"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
        eyebrow="Dental services in Los Gatos"
        titleText="Our Comprehensive Services"
        lead="From a baby’s first visit to a grandparent’s crown: checkups, cleanings, repairs, clear aligners, and jaw-comfort care, all with one Los Gatos team."
        actions={
          <>
            <Button asChild size="lg" className="group h-14 pl-7 pr-3 text-base">
              <AppointmentLink href={buildAppointmentUrl({ source: "services_hero" })} source="services_hero">
                Request an Appointment
                <span aria-hidden="true" className="ff-arrow grid size-8 place-items-center rounded-full bg-white/15">
                  <MinimalGlyph name="arrow-right" />
                </span>
              </AppointmentLink>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-7 text-base">
              <a href="#care-starting-points">Help me choose</a>
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
        media={
          <HeroPhoto
            photo={officePhotos.windowRoom}
            chips={["Kids to grandparents", "One Los Gatos team"]}
            chipColors={["var(--ff-lime)", "var(--ff-blush)"]}
          />
        }
      />

      {/* ------------------------------------------------- Intent picker */}
      <Section labelledBy="care-starting-points" className="pt-16 sm:pt-20 lg:pt-24">
        <SectionHeader
          id="care-starting-points"
          align="center"
          eyebrow="Find the right starting point"
          title={
            <>
              Start with what you <Squiggle color="var(--ff-lime)">need</Squiggle>
            </>
          }
          lead="Choose the one that sounds closest. Not sure? Request a visit and our team will help you plan the right next step."
        />
        <div className="mt-12">
          <IntentPicker />
        </div>
      </Section>

      {/* ------------------------------------------------------- Catalog */}
      <Section tone="white" labelledBy="service-catalog-heading">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end">
          <SectionHeader
            id="service-catalog-heading"
            eyebrow="Every service"
            title={
              <>
                One dental home, <em className="ff-italic font-normal">every</em> smile
              </>
            }
            lead="Grouped by what your family needs, from everyday cleanings to repairs and jaw comfort."
          />
          <nav aria-label="Service groups" className="ff-reveal flex flex-wrap gap-2 lg:max-w-[24rem] lg:justify-self-end">
            {catalogGroups.map((group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/10 bg-white px-4 text-sm font-semibold text-ink transition-colors hover:border-ink/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span aria-hidden="true" className={cn("size-2.5 rounded-full", brandTones[group.tone].solid, group.tone === "cloud" && "ring-1 ring-ink/15")} />
                {group.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="mt-12 grid gap-4 sm:gap-5 lg:grid-cols-12">
          {catalogGroups.map((group, index) => (
            <GroupPanel key={group.id} group={group} index={index} />
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------- Reviews */}
      <Section tone="cream" labelledBy="services-reviews-heading">
        <ReviewsSection
          id="services-reviews-heading"
          reviews={generalReviews.slice(0, 4)}
          title="What Our Patients Say About Our Services"
          showCTA={true}
          showBooking={false}
          layout="feature"
        />
      </Section>

      {/* ------------------------------------------------------- Closing */}
      <CtaBand
        id="services-cta-heading"
        title={
          <>
            Ready to start your <em className="ff-italic font-normal text-lime">dental journey?</em>
          </>
        }
        body="Send a visit request and tell us what you need. Our team will contact you to confirm the next step."
        actions={
          <>
            <Button asChild size="lg" variant="night" className="group h-14 pl-7 pr-3 text-base">
              <AppointmentLink href={buildAppointmentUrl({ source: "services_hero" })} source="services_cta">
                Request an Appointment
                <span aria-hidden="true" className="ff-arrow grid size-8 place-items-center rounded-full bg-ink/10">
                  <MinimalGlyph name="arrow-right" />
                </span>
              </AppointmentLink>
            </Button>
            <FinalCtaPhoneLink location="services_final">or call (408) 358-8100</FinalCtaPhoneLink>
          </>
        }
        note={<>{practiceHoursSummary} · 15251 National Ave, Suite 102, Los Gatos</>}
      />
    </div>
  );
}

