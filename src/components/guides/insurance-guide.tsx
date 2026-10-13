import type { CSSProperties, ReactNode } from "react";
import { Section, SectionHeader } from "@/components/site/section";
import { StepTimeline } from "@/components/site/step-timeline";
import { ToothPerson } from "@/components/brand/pinwheel";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import type { PatientGuidanceSection } from "@/content/patient-guidance";
import { Checklist } from "./checklist";
import { MoreGuides, OfficeCard } from "./guide-shared";
import { insuranceHelpSteps } from "./guidance-content";

const bySection = (sections: readonly PatientGuidanceSection[], id: string) =>
  sections.find((section) => section.id === id);

const previewQuestions = [
  "In network for my exact plan?",
  "Benefits for this visit?",
  "Deductibles or waiting periods?",
  "How to share member info?",
];

/** Hero media: a little stack of question cards, three already ticked. */
export function InsuranceHeroMedia() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-full max-w-[26rem] pb-8 pt-10 lg:mr-0"
    >
      <div className="relative">
        <div className="absolute inset-0 translate-x-3 translate-y-4 rotate-[5deg] rounded-3xl bg-periwinkle" />
        <div className="absolute inset-0 -translate-x-2 translate-y-2 -rotate-[3deg] rounded-3xl bg-white/70 ring-1 ring-border" />
        <div className="relative rounded-3xl bg-white p-6 shadow-float ring-1 ring-border sm:p-7">
          <ToothPerson
            color="var(--ff-periwinkle)"
            className="absolute -top-12 right-6 h-16 w-auto rotate-[8deg]"
          />
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-cobalt-deep">
            Before your visit
          </p>
          <p className="mt-1 font-display text-2xl font-semibold text-ink">
            Questions for your insurer
          </p>
          <ul className="mt-5 space-y-2.5">
            {previewQuestions.map((question, index) => (
              <li
                key={question}
                className="flex items-center gap-3 rounded-2xl bg-paper px-3 py-2.5 text-sm font-semibold text-ink ring-1 ring-border/70"
              >
                {index < 3 ? (
                  <span
                    className="ff-intro-pop grid size-6 shrink-0 place-items-center rounded-full bg-cobalt text-xs text-white"
                    style={{ "--d": 700 + index * 200 } as CSSProperties}
                  >
                    <MinimalGlyph name="check" />
                  </span>
                ) : (
                  <span className="size-6 shrink-0 rounded-full border-2 border-input bg-white" />
                )}
                {question}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <span
        className="ff-chip ff-intro-pop absolute bottom-0 left-2 sm:-left-6"
        style={{ "--d": 1300 } as CSSProperties}
      >
        <span className="size-2.5 rounded-full bg-lime ring-2 ring-ink/10" />
        Call with your plan name
      </span>
    </div>
  );
}

export function InsuranceGuide({
  sections,
  source,
  children,
}: {
  sections: readonly PatientGuidanceSection[];
  source: string;
  children?: ReactNode;
}) {
  const insurer = bySection(sections, "plan-details");
  const cost = bySection(sections, "cost-and-payment");
  const privacy = bySection(sections, "contact-safely");

  return (
    <>
      {/* ------------------------------------------- Ask your insurer */}
      {insurer ? (
        <Section labelledBy="ins-insurer-heading">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <SectionHeader
                id="ins-insurer-heading"
                eyebrow="Ask your insurer"
                title={insurer.title}
                lead={insurer.description}
              />
              <p className="ff-reveal mt-7 flex items-center gap-3 text-sm font-semibold text-ink-soft">
                <span
                  aria-hidden="true"
                  className="grid size-8 place-items-center rounded-full bg-periwinkle-wash text-cobalt"
                >
                  <MinimalGlyph name="check" />
                </span>
                Tick each one off as you ask.
              </p>
            </div>
            <Checklist
              items={insurer.items}
              label={insurer.title}
              tone="periwinkle"
            />
          </div>
        </Section>
      ) : null}

      {/* ------------------------------------------- How we help */}
      <Section tone="cream" labelledBy="ins-help-heading">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
          <SectionHeader
            id="ins-help-heading"
            eyebrow="How we help"
            title={
              <>
                Fewer surprises,{" "}
                <em className="ff-italic font-normal">more answers</em>
              </>
            }
          />
          <p className="ff-reveal ff-lead max-w-xl lg:justify-self-end">
            Every plan is different, so we start with yours. Here’s how the team
            helps you plan before you visit.
          </p>
        </div>
        <div className="mt-14">
          <StepTimeline steps={insuranceHelpSteps} />
        </div>
      </Section>

      {/* ------------------------------------------- Ask us about cost */}
      {cost ? (
        <Section labelledBy="ins-cost-heading">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:order-2 lg:self-start">
              <SectionHeader
                id="ins-cost-heading"
                eyebrow="Ask our team"
                title={cost.title}
                lead={cost.description}
              />
            </div>
            <div className="lg:order-1">
              <Checklist items={cost.items} label={cost.title} tone="lime" />
            </div>
          </div>
        </Section>
      ) : null}

      {/* ------------------------------------------- Privacy + bills */}
      <Section
        tone="white"
        labelledBy={privacy ? "ins-privacy-heading" : undefined}
        className="py-14 sm:py-16 lg:py-20"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {privacy ? (
            <article className="ff-reveal relative overflow-clip rounded-3xl bg-cloud-wash p-7 sm:p-9">
              <ToothPerson
                color="var(--ff-cloud)"
                className="pointer-events-none absolute -bottom-6 right-6 h-28 w-auto rotate-[-6deg]"
              />
              <h2 id="ins-privacy-heading" className="ff-h3 relative">
                {privacy.title}
              </h2>
              <p className="relative mt-3 max-w-lg text-base leading-relaxed text-ink-soft">
                {privacy.description}
              </p>
              <ul className="relative mt-6 space-y-3 sm:pr-20">
                {privacy.items.map((item, index) => (
                  <li
                    key={item}
                    className="flex gap-3 text-base leading-relaxed text-ink"
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-2 size-2.5 shrink-0 rounded-full ring-2 ring-ink/10 ${["bg-periwinkle", "bg-blush", "bg-lime"][index % 3]}`}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ) : null}
          <div
            className="ff-reveal flex flex-col gap-4"
            style={{ "--i": 1 } as CSSProperties}
          >
            {children ? (
              <div className="rounded-3xl bg-lime-wash p-7 sm:p-9 [&_h2]:font-display [&_h2]:text-[clamp(1.35rem,1.2rem+0.6vw,1.75rem)] [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-ink [&_p]:text-ink-soft [&>section]:border-t-0 [&>section]:pt-0">
                {children}
              </div>
            ) : null}
            <OfficeCard source={source} title="Call us with your plan name" />
          </div>
        </div>
      </Section>

      <Section
        labelledBy="ins-more-heading"
        className="py-14 sm:py-16 lg:py-20"
      >
        <MoreGuides
          current="/insurance-and-payment"
          headingId="ins-more-heading"
        />
      </Section>
    </>
  );
}
