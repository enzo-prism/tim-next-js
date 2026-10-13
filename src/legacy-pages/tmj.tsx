import type { CSSProperties } from "react";
import Image from "next/image";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { buildAppointmentUrl } from "@/lib/analytics";
import { AppointmentLink, PhoneLink } from "@/components/tracking/tracked-links";
import type { RelatedLink } from "@/lib/internal-links";
import { practiceHoursSummary } from "@/content/practice-hours";
import { testimonialSections } from "@/content/testimonials";
import { services } from "@/data/services";
import { PageHero } from "@/components/site/page-hero";
import { Eyebrow, Section, SectionHeader } from "@/components/site/section";
import { StepTimeline } from "@/components/site/step-timeline";
import { ReviewCard } from "@/components/site/review-rows";
import { Stars } from "@/components/site/stars";
import { CtaBand } from "@/components/site/cta-band";
import { BrandDots, ToothPerson } from "@/components/brand/pinwheel";
import { Squiggle } from "@/components/brand/squiggle";
import { HeroPhoto } from "@/components/services/hero-photo";
import { SymptomChecklist } from "@/components/services/symptom-checklist";
import { ExploreLinks } from "@/components/services/explore-links";
import { officePhotos } from "@/components/services/service-themes";
import { cn } from "@/lib/utils";

const relatedLinks: RelatedLink[] = [
  {
    href: "/services/night-guards",
    title: "Night Guards",
    description: "Custom protection for grinding and jaw tension that can worsen TMJ symptoms.",
  },
  {
    href: "/services/invisalign",
    title: "Invisalign Clear Aligners",
    description: "Orthodontic options that may help with bite-related jaw strain (doctor will confirm).",
  },
  {
    href: "/services/dental-exams",
    title: "Dental Exams",
    description: "Comprehensive evaluations to understand symptoms and plan next steps.",
  },
  {
    href: "/patient-info",
    title: "Patient Information",
    description: "FAQs, what to expect, and helpful resources for your visit.",
  },
  {
    href: "/contact",
    title: "Contact & Scheduling",
    description: "Book a TMJ consultation, ask a question, or get directions to our office.",
  },
];

// The first few facts from the Night Guards service, shown on its card.
const nightGuardPoints = (services.find((service) => service.id === "night-guards")?.details ?? []).slice(0, 3);

const symptoms = ["Jaw pain and stiffness", "Frequent headaches", "Difficulty chewing", "Clicking or popping sounds", "Limited jaw movement"];

type CareOption = {
  title: string;
  body: string;
  points?: string[];
  href?: string;
  linkLabel?: string;
  className: string;
  tone: string;
  tooth?: string;
};

// A 3×3 bento on wide screens (night guards tall, advanced procedures wide);
// 2 columns on tablets; one column on phones.
const careOptions: CareOption[] = [
  {
    title: "Custom Night Guards",
    body: "We design night guards to prevent teeth grinding and clenching, which can exacerbate TMJ discomfort.",
    href: "/services/night-guards",
    linkLabel: "Explore night guards",
    points: nightGuardPoints,
    className: "md:row-span-2",
    tone: "bg-periwinkle-wash",
    tooth: "var(--ff-periwinkle)",
  },
  {
    title: "Orthodontic Solutions",
    body: "Conditions related to bite misalignment can be treated through customized orthodontic treatment plans, such as braces or Invisalign.",
    href: "/services/invisalign",
    linkLabel: "Explore Invisalign",
    className: "",
    tone: "bg-blush-wash",
  },
  {
    title: "Digital Imaging",
    body: "When appropriate, digital imaging can help the dentist evaluate jaw structures and explain treatment options.",
    href: "/services/dental-exams",
    linkLabel: "Explore dental exams",
    className: "",
    tone: "bg-lime-wash",
  },
  {
    title: "Physical Therapy",
    body: "Jaw exercises and muscle relaxation techniques can alleviate tension and improve function.",
    className: "",
    tone: "bg-white ring-1 ring-border",
  },
  {
    title: "Lifestyle Modifications",
    body: "Stress reduction, dietary changes, and exercise can often significantly improve the management of TMJ symptoms.",
    className: "",
    tone: "bg-white ring-1 ring-border",
  },
  {
    title: "Advanced Procedures",
    body: "For more severe cases, we may recommend targeted treatments, such as restorative dental work, to improve the alignment of your bite.",
    className: "md:col-span-2 lg:col-span-3",
    tone: "bg-cream",
  },
];

const technology = [
  "Digital records and imaging when clinically appropriate",
  "Digital X-rays for precise diagnosis",
  "Intraoral scanner technology",
  "Panoramic imaging capabilities",
];

const comfort = [
  "Soft blankets and pillow support",
  "TVs in treatment rooms",
  "Call ahead so we can discuss mobility or accessibility needs",
  "Ask about treatment costs and payment options",
];

const advancedCareReviews = testimonialSections.find((section) => section.id === "advanced-care")?.reviews ?? [];
const paula = advancedCareReviews.find((review) => review.name === "Paula Gregoire");
const jon = advancedCareReviews.find((review) => review.name === "Jon Takagi");
// Underline the last word of Paula's quote with the hand-drawn swoosh.
const paulaQuote =
  paula && paula.quote.endsWith("TMJ!") ? { lead: paula.quote.slice(0, -4), mark: "TMJ!" } : { lead: paula?.quote ?? "", mark: "" };

function CareCard({ option, index }: { option: CareOption; index: number }) {
  const content = (
    <>
      {option.tooth ? (
        <ToothPerson
          color={option.tooth}
          className="pointer-events-none absolute -bottom-6 -right-3 h-36 w-auto rotate-[-8deg] transition-[rotate,translate] duration-500 ease-[var(--ease-spring)] group-hover:-translate-y-2 group-hover:rotate-[4deg] motion-reduce:transition-none sm:h-44"
        />
      ) : null}
      <h3 className={cn("relative font-display font-semibold leading-tight text-ink", option.tooth ? "text-[1.75rem] sm:text-[2rem]" : "text-2xl")}>{option.title}</h3>
      <p className={cn("relative mt-3 text-base leading-relaxed text-ink-soft", option.tooth && "max-w-[22rem] pr-10")}>{option.body}</p>
      {option.points?.length ? (
        <ul className="relative mt-6 space-y-2.5 pr-16">
          {option.points.map((point) => (
            <li key={point} className="flex items-start gap-3 text-[0.95rem] font-semibold leading-snug text-ink">
              <span aria-hidden="true" className="mt-px grid size-5 shrink-0 place-items-center rounded-full bg-white text-[0.7rem] ring-1 ring-ink/10">
                <MinimalGlyph name="check" />
              </span>
              {point}
            </li>
          ))}
        </ul>
      ) : null}
      {option.href ? (
        <span className="relative mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold text-ink">
          {option.linkLabel}
          <span aria-hidden="true" className="ff-arrow grid size-9 place-items-center rounded-full bg-white ring-1 ring-ink/5 transition-colors group-hover:bg-ink group-hover:text-white">
            <MinimalGlyph name="arrow-right" />
          </span>
        </span>
      ) : null}
    </>
  );
  const shared = cn("relative flex h-full flex-col overflow-clip rounded-3xl p-6 sm:p-8", option.tone);
  return (
    <li className={cn("ff-reveal", option.className)} style={{ "--i": index % 3 } as CSSProperties}>
      {option.href ? (
        <Link
          href={option.href}
          className={cn(shared, "ff-lift group min-h-56 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2")}
        >
          {content}
        </Link>
      ) : (
        <div className={shared}>{content}</div>
      )}
    </li>
  );
}

export default function TMJ() {
  return (
    <div className="overflow-x-clip">
      <PageHero
        id="tmj-heading"
        tone="blush"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: "TMJ Treatment" },
        ]}
        eyebrow="Jaw comfort · Los Gatos"
        titleText="TMJ Treatment in Los Gatos"
        lead="Find relief from jaw pain and dysfunction with personalized TMJ treatment from Dr. Tim J. Chuang. We listen first, look closely at your jaw and bite, and build a plan around your symptoms."
        actions={
          <>
            <Button asChild size="lg" className="group h-14 pl-7 pr-3 text-base">
              <AppointmentLink
                href={buildAppointmentUrl({ serviceId: "tmj", source: "tmj_page" })}
                source="tmj_hero"
                ctaType="consultation"
                serviceId="tmj"
              >
                Request a TMJ consultation
                <span aria-hidden="true" className="ff-arrow grid size-8 place-items-center rounded-full bg-white/15">
                  <MinimalGlyph name="arrow-right" />
                </span>
              </AppointmentLink>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-7 text-base">
              <PhoneLink location="tmj_hero" serviceId="tmj">
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
        media={<HeroPhoto photo={officePhotos.hallway} chips={["Blankets & pillow support", "TVs in treatment rooms"]} chipColors={["var(--ff-periwinkle)", "var(--ff-lime)"]} />}
      />

      {/* ------------------------------------------------- Understanding */}
      <Section labelledBy="understanding-heading">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start lg:gap-16">
          <div className="ff-reveal">
            <Eyebrow className="mb-4">The jaw joint, explained</Eyebrow>
            <h2 id="understanding-heading" className="ff-h2">
              Understanding TMJ
            </h2>
            <p className="mt-7 font-display text-[1.35rem] font-medium leading-snug tracking-[-0.01em] text-ink sm:text-[1.6rem]">
              The temporomandibular joint, commonly referred to as TMJ, is one of the most complex joints in the human body. Located on both sides of your jaw, it connects your jawbone to your skull and allows for essential functions like chewing, speaking, and even smiling.
            </p>
            <p className="ff-lead mt-6">
              However, when this joint becomes inflamed or dysfunctional, it can lead to a condition known as temporomandibular joint disorder (TMD). Common symptoms include jaw pain, stiffness, headaches, difficulty chewing, and clicking sounds when opening or closing your mouth.
            </p>
          </div>
          <div className="ff-reveal pt-6 lg:sticky lg:top-28 lg:pt-0" style={{ "--i": 1 } as CSSProperties}>
            <SymptomChecklist title="Common TMJ Symptoms" symptoms={symptoms} />
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------- Consultation */}
      <Section tone="cream" labelledBy="consultation-heading">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
          <SectionHeader
            id="consultation-heading"
            eyebrow="Your first visit"
            title="What to Expect During Your TMJ Consultation"
          />
          <p className="ff-reveal ff-lead max-w-xl lg:justify-self-end">
            Your first step toward finding relief is scheduling a consultation with Dr. Tim Chuang at Family First Smile Care.
          </p>
        </div>
        <div className="mt-14">
          <StepTimeline
            steps={[
              { title: "A thorough assessment", body: "We conduct a comprehensive evaluation of your jaw function and symptoms." },
              { title: "Imaging, when useful", body: "The dentist may recommend imaging when it is useful for evaluating jaw structures." },
              { title: "Your personalized plan", body: "We develop a treatment plan tailored specifically to your needs and symptoms." },
            ]}
          />
        </div>
      </Section>

      {/* ----------------------------------------------------- Care options */}
      <Section labelledBy="care-options-heading">
        <SectionHeader
          id="care-options-heading"
          eyebrow="Ways we can help"
          title="How TMJ Treatment in Los Gatos Can Help"
          lead="Living with the discomfort and pain caused by TMJ issues can be overwhelming, but effective treatment options are available. At Family First Smile Care, we take a personalized approach to address your specific symptoms and needs."
        />
        <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {careOptions.map((option, index) => (
            <CareCard key={option.title} option={option} index={index} />
          ))}
        </ul>
      </Section>

      {/* ---------------------------------------------------- Patient story */}
      {paula ? (
        <Section tone="periwinkle" labelledBy="tmj-story-heading" className="overflow-clip">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-center lg:gap-14">
            <figure className="ff-reveal relative">
              <h2 id="tmj-story-heading" className="ff-eyebrow mb-6">
                <BrandDots />
                <span>A TMJ patient’s story</span>
              </h2>
              <div>
                <Stars className="text-xl" />
              </div>
              <blockquote className="mt-6">
                <p className="font-display text-[1.5rem] font-medium leading-snug tracking-[-0.015em] text-ink sm:text-[1.9rem] lg:text-[2.05rem]">
                  “{paulaQuote.lead}
                  {paulaQuote.mark ? <Squiggle color="var(--ff-blush)">{paulaQuote.mark}</Squiggle> : null}”
                </p>
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                <span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-blush font-display text-xl font-semibold text-ink">
                  P
                </span>
                <span>
                  <span className="block font-bold text-ink">{paula.name}</span>
                  <span className="block text-sm text-ink-soft">{paula.patientLabel} · Google review</span>
                </span>
              </figcaption>
            </figure>
            {jon ? (
              <div className="ff-straighten" style={{ "--i": 1, "--ff-tilt": "3deg" } as CSSProperties}>
                <ReviewCard review={{ name: jon.name, quote: jon.quote, label: jon.patientLabel, meta: "Google review" }} index={2} />
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}

      {/* ------------------------------------------------------ Why choose */}
      <Section labelledBy="why-heading">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-center lg:gap-16">
          <div className="ff-reveal-right relative mx-auto w-[min(80%,22rem)] lg:w-full lg:max-w-sm">
            <div className="ff-arch relative aspect-[4/5] bg-cream">
              <Image
                src={officePhotos.imaging.src}
                alt={officePhotos.imaging.alt}
                fill
                sizes="(max-width: 1023px) 80vw, 384px"
                quality={70}
                className="ff-parallax object-cover"
                style={{ "--ff-parallax": "-4%" } as CSSProperties}
              />
            </div>
            <span className="ff-chip absolute -left-4 bottom-[14%] sm:-left-8">
              <span aria-hidden="true" className="size-2.5 rounded-full bg-lime ring-2 ring-ink/10" />
              Panoramic imaging
            </span>
          </div>
          <div>
            <SectionHeader
              id="why-heading"
              eyebrow="Why families choose us"
              title="Why Choose Family First Smile Care for TMJ Treatment?"
              lead="At Family First Smile Care in Los Gatos, we pride ourselves on providing high-quality, patient-centered care in a comfortable and modern setting."
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                { title: "Advanced Technology", items: technology, tone: "bg-periwinkle-wash", dot: "bg-periwinkle" },
                { title: "Patient Comfort", items: comfort, tone: "bg-blush-wash", dot: "bg-blush" },
              ].map((group, index) => (
                <div key={group.title} className={cn("ff-reveal rounded-3xl p-6 sm:p-7", group.tone)} style={{ "--i": index } as CSSProperties}>
                  <h3 className="text-lg font-bold text-ink">{group.title}</h3>
                  <ul className="mt-4 space-y-3">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-[0.95rem] leading-snug text-ink">
                        <span aria-hidden="true" className={cn("mt-px grid size-5 shrink-0 place-items-center rounded-full text-[0.7rem]", group.dot)}>
                          <MinimalGlyph name="check" />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------- Related */}
      <Section tone="white" labelledBy="related-heading">
        <ExploreLinks id="related-heading" links={relatedLinks} />
      </Section>

      {/* ---------------------------------------------------------- Closing */}
      <CtaBand
        id="tmj-cta-heading"
        title={
          <>
            Schedule your TMJ consultation <em className="ff-italic font-normal text-lime">today</em>
          </>
        }
        body="If jaw pain is interfering with daily life, request an evaluation and learn which next steps may help."
        actions={
          <>
            <Button asChild size="lg" variant="night" className="group h-14 pl-7 pr-3 text-base">
              <AppointmentLink
                href={buildAppointmentUrl({ serviceId: "tmj", source: "tmj_page" })}
                source="tmj"
                ctaType="consultation"
                serviceId="tmj"
              >
                Schedule Consultation
                <span aria-hidden="true" className="ff-arrow grid size-8 place-items-center rounded-full bg-ink/10">
                  <MinimalGlyph name="arrow-right" />
                </span>
              </AppointmentLink>
            </Button>
            <Button asChild size="lg" variant="night-outline" className="h-14 px-7 text-base">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </>
        }
        note={<>{practiceHoursSummary} · 15251 National Ave, Suite 102, Los Gatos</>}
      />
    </div>
  );
}
