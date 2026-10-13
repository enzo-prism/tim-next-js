import type { CSSProperties } from "react";
import { Link } from "wouter";
import { Section, SectionHeader } from "@/components/site/section";
import { PhoneLink } from "@/components/tracking/tracked-links";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { ToothPerson } from "@/components/brand/pinwheel";
import { patientGuidanceFacts, type PatientGuidanceSection } from "@/content/patient-guidance";
import { getBlogPostHref } from "@/content/blog";
import { cn } from "@/lib/utils";
import { Checklist } from "./checklist";
import { HoursWeek, MoreGuides, OfficeCard } from "./guide-shared";
import { whileYouWaitTips } from "./guidance-content";

const bySection = (sections: readonly PatientGuidanceSection[], id: string) => sections.find((section) => section.id === id);

const tipDots = ["bg-periwinkle", "bg-lime", "bg-blush", "bg-periwinkle", "bg-lime", "bg-blush"];

/** The big, friendly tap-to-call card that leads the urgent-care page. */
export function UrgentCallCard({ source }: { source: string }) {
  return (
    <PhoneLink
      location={`${source}_hero`}
      className="ff-press group flex w-full max-w-lg items-center justify-between gap-4 rounded-3xl bg-primary px-5 py-5 text-white shadow-float transition-colors hover:bg-cobalt-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-7 sm:py-6"
    >
      <span className="min-w-0">
        <span className="block text-xs font-bold uppercase tracking-[0.14em] text-white/80">Call the office</span>{" "}
        <span className="mt-1.5 block whitespace-nowrap font-display text-[clamp(1.6rem,1rem+3.6vw,3rem)] font-semibold leading-none tracking-tight">
          {patientGuidanceFacts.phone.display}
        </span>
      </span>
      <span aria-hidden="true" className="ff-arrow hidden size-12 shrink-0 place-items-center rounded-full bg-white text-lg text-ink min-[400px]:grid">
        <MinimalGlyph name="arrow-right" />
      </span>
    </PhoneLink>
  );
}

/** Hero media: when to skip the dental office and call 911. */
export function EmergencyCard() {
  return (
    <aside aria-labelledby="urgent-911-heading" className="mx-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-float ring-1 ring-border sm:p-8 lg:mr-0">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-night font-display text-base font-semibold text-white">
          911
        </span>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">Safety first</p>
      </div>
      <h2 id="urgent-911-heading" className="mt-5 font-display text-2xl font-semibold leading-tight text-ink">
        When to call 911 instead
      </h2>
      <p className="mt-2 text-base leading-relaxed text-ink-soft">Call 911 or go to the nearest emergency room if you have:</p>
      <ul className="mt-4 space-y-2.5">
        {["Swelling that affects your breathing or swallowing", "Bleeding that won’t stop", "A serious injury to your face or jaw"].map((item) => (
          <li key={item} className="flex gap-3 text-base font-semibold leading-snug text-ink">
            <span aria-hidden="true" className="mt-1.5 size-2.5 shrink-0 rounded-full bg-blush ring-2 ring-ink/15" />
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-5 border-t border-border pt-4 text-sm leading-relaxed text-ink-soft">Once you’re safe, call us and we’ll help with the dental side.</p>
    </aside>
  );
}

export function UrgentCareGuide({ sections, source }: { sections: readonly PatientGuidanceSection[]; source: string }) {
  const call = bySection(sections, "call-the-office");
  const hours = bySection(sections, "hours-and-requests");
  const featuredTip = whileYouWaitTips.find((tip) => /knocked-out/i.test(tip.title));
  const otherTips = whileYouWaitTips.filter((tip) => tip !== featuredTip);

  return (
    <>
      {/* ------------------------------------------- While you wait */}
      <Section labelledBy="urgent-wait-heading">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
          <SectionHeader
            id="urgent-wait-heading"
            eyebrow="While you wait"
            title={
              <>
                A few things that can <em className="ff-italic font-normal">help</em>
              </>
            }
          />
          <p className="ff-reveal ff-lead max-w-xl lg:justify-self-end">
            General comfort steps for the time before you’re seen. They aren’t a diagnosis; when you call, the team will tell you what to do for your situation.
          </p>
        </div>
        <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featuredTip ? (
            <li className="ff-reveal relative flex flex-col overflow-clip rounded-3xl bg-blush-wash p-7 sm:p-9 md:col-span-2 lg:col-span-1 lg:row-span-3">
              <span className="ff-chip w-fit shadow-none">
                <span aria-hidden="true" className="size-2.5 rounded-full bg-blush ring-2 ring-ink/10" />
                Time matters
              </span>
              <h3 className="ff-h3 mt-6">{featuredTip.title}</h3>
              <p className="mt-3 max-w-md text-base leading-relaxed text-ink-soft lg:text-lg">{featuredTip.body}</p>
              <ToothPerson
                color="var(--ff-blush)"
                className="pointer-events-none -mb-10 mt-4 h-24 w-auto self-end rotate-[8deg] sm:h-28 lg:mt-auto lg:h-40"
              />
            </li>
          ) : null}
          {otherTips.map((tip, index) => (
            <li
              key={tip.title}
              className={cn(
                "ff-reveal flex flex-col rounded-3xl border border-border bg-white p-6 sm:p-7",
                index === otherTips.length - 1 && otherTips.length % 2 === 1 && "md:col-span-2",
              )}
              style={{ "--i": (index % 2) + 1 } as CSSProperties}
            >
              <span aria-hidden="true" className="flex items-center gap-2">
                <span className={cn("size-3 rounded-full ring-2 ring-ink/10", tipDots[index])} />
                <span className="h-px w-8 bg-border" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-ink">{tip.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-ink-soft">{tip.body}</p>
            </li>
          ))}
        </ul>
        <div className="ff-reveal mt-8 flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:gap-x-6">
          <span className="font-semibold text-ink">Read more from our guides:</span>
          <Link href={getBlogPostHref("what-should-you-do-if-your-child-has-a-toothache-los-gatos")} className="ff-link">
            When a child has a toothache
          </Link>
          <Link href={getBlogPostHref("child-knocked-out-tooth-los-gatos")} className="ff-link">
            If a tooth gets knocked out
          </Link>
        </div>
      </Section>

      {/* ------------------------------------------- What to tell us */}
      {call ? (
        <Section tone="cream" labelledBy="urgent-call-heading">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <SectionHeader id="urgent-call-heading" eyebrow="When you call" title={call.title} lead={call.description} />
              <PhoneLink
                location={`${source}_sidebar`}
                className="ff-reveal ff-link mt-7 inline-flex min-h-11 items-center text-lg"
              >
                Call {patientGuidanceFacts.phone.display}
              </PhoneLink>
            </div>
            <Checklist items={call.items} label={call.title} tone="blush" />
          </div>
        </Section>
      ) : null}

      {/* ------------------------------------------- Hours & requests */}
      {hours ? (
        <Section labelledBy="urgent-hours-heading">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
            <div>
              <SectionHeader id="urgent-hours-heading" eyebrow="Good to know" title={hours.title} lead={hours.description} />
              <HoursWeek className="mt-10 max-w-xl" />
              <ul className="mt-10 space-y-4">
                {hours.items.map((item, index) => (
                  <li key={item} className="ff-reveal flex gap-3 text-base leading-relaxed text-ink" style={{ "--i": index } as CSSProperties}>
                    <span aria-hidden="true" className={cn("mt-2 size-2.5 shrink-0 rounded-full ring-2 ring-ink/10", tipDots[index])} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:pt-16">
              <OfficeCard source={source} className="ff-reveal" />
              <Link href="/contact" className="ff-link ff-reveal mt-6 inline-flex min-h-11 items-center">
                Office details &amp; directions
              </Link>
            </div>
          </div>
        </Section>
      ) : null}

      <Section tone="cream" labelledBy="urgent-more-heading" className="py-14 sm:py-16 lg:py-20">
        <MoreGuides current="/urgent-dental-care" headingId="urgent-more-heading" />
      </Section>
    </>
  );
}
