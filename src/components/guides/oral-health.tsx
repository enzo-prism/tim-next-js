import type { CSSProperties, ReactNode } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PageHero, type HeroTone } from "@/components/site/page-hero";
import { Section, SectionHeader } from "@/components/site/section";
import { CtaBand } from "@/components/site/cta-band";
import RelatedLinksSection from "@/components/navigation/RelatedLinksSection";
import { AppointmentLink } from "@/components/tracking/tracked-links";
import { buildAppointmentUrl } from "@/lib/analytics";
import { practiceHoursSummary } from "@/content/practice-hours";
import type { RelatedLink } from "@/lib/internal-links";
import { cn } from "@/lib/utils";
import { arrowChip, arrowChipNight } from "./guide-shared";

/*
 * Shared frame for the oral-health education guides (brushing, flossing,
 * nutrition): a toned hero with a tooth-people scene, three quick habits,
 * related reading, and a night closing band.
 */

export function OralHealthHero({
  title,
  lead,
  tone,
  art,
  chips,
  source,
}: {
  title: string;
  lead: string;
  tone: HeroTone;
  art: ReactNode;
  chips: [string, string];
  source: string;
}) {
  return (
    <PageHero
      id="guide-heading"
      tone={tone}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Patient Info", href: "/patient-info" }, { label: title }]}
      eyebrow="Oral health education"
      titleText={title}
      lead={<p>{lead}</p>}
      actions={
        <>
          <Button asChild size="lg" className="group h-14 pl-7 pr-5 text-base">
            <AppointmentLink href={buildAppointmentUrl({ source })} source={source}>
              Schedule a checkup
              {arrowChip}
            </AppointmentLink>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-14 px-7 text-base">
            <Link href="/patient-info">Back to Patient Info</Link>
          </Button>
        </>
      }
      media={
        <figure className="relative mx-auto w-full max-w-[28rem] lg:mr-0">
          <div className="rounded-3xl bg-white/80 p-6 ring-1 ring-ink/5 sm:p-8">{art}</div>
          <span className="ff-chip ff-intro-pop absolute -top-4 left-4 sm:-left-5" style={{ "--d": 760 } as CSSProperties}>
            <span aria-hidden="true" className="size-2.5 rounded-full bg-lime ring-2 ring-ink/10" />
            {chips[0]}
          </span>
          <span className="ff-chip ff-intro-pop absolute -bottom-4 right-4 sm:-right-5" style={{ "--d": 900 } as CSSProperties}>
            <span aria-hidden="true" className="size-2.5 rounded-full bg-blush ring-2 ring-ink/10" />
            {chips[1]}
          </span>
        </figure>
      }
    />
  );
}

const trioTones = [
  { card: "bg-periwinkle-wash", dot: "bg-periwinkle" },
  { card: "bg-blush-wash", dot: "bg-blush" },
  { card: "bg-lime-wash", dot: "bg-lime" },
];

/** Three quick habits as colorful cards with a big display word. */
export function HabitTrio({
  id,
  eyebrow,
  title,
  habits,
}: {
  id: string;
  eyebrow: string;
  title: ReactNode;
  habits: { big: string; title: string; description: string }[];
}) {
  return (
    <Section labelledBy={id}>
      <SectionHeader id={id} eyebrow={eyebrow} title={title} />
      <ul className="mt-12 grid gap-4 md:grid-cols-3">
        {habits.map((habit, index) => (
          <li
            key={habit.title}
            className={cn("ff-reveal relative flex flex-col overflow-clip rounded-3xl p-7 sm:p-8", trioTones[index % 3].card)}
            style={{ "--i": index } as CSSProperties}
          >
            <span aria-hidden="true" className="font-display text-[clamp(2.5rem,1.4rem+2.6vw,3.75rem)] font-semibold italic leading-none tracking-tight text-ink">
              {habit.big}
            </span>
            <h3 className="mt-6 text-lg font-bold text-ink">{habit.title}</h3>
            <p className="mt-2 text-base leading-relaxed text-ink-soft">{habit.description}</p>
            <span aria-hidden="true" className={cn("absolute right-6 top-7 size-4 rounded-full ring-4 ring-white", trioTones[index % 3].dot)} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** A simple list with brand-colored "heads" as bullets. */
export function DotList({ items, className, start = 0 }: { items: readonly ReactNode[]; className?: string; start?: number }) {
  const dots = ["bg-periwinkle", "bg-blush", "bg-lime", "bg-cloud"];
  return (
    <ul className={cn("space-y-3.5", className)}>
      {items.map((item, index) => (
        <li key={index} className="flex gap-3 text-base leading-relaxed text-ink">
          <span aria-hidden="true" className={cn("mt-2 size-2.5 shrink-0 rounded-full ring-2 ring-ink/10", dots[(index + start) % dots.length])} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function RelatedReading({ links }: { links: RelatedLink[] }) {
  return (
    <Section tone="paper" className="pb-16 pt-0 sm:pb-20 sm:pt-0 lg:pb-24 lg:pt-0">
      <RelatedLinksSection title="Related reading" links={links} />
    </Section>
  );
}

export function GuideClosing({
  title,
  body,
  source,
  secondary,
}: {
  title: ReactNode;
  body: string;
  source: string;
  secondary: { href: string; label: string };
}) {
  return (
    <CtaBand
      id="guide-cta-heading"
      eyebrow="We can help"
      title={title}
      body={body}
      actions={
        <>
          <Button asChild size="lg" variant="night" className="group h-14 pl-7 pr-5 text-base">
            <AppointmentLink href={buildAppointmentUrl({ source })} source={source}>
              Book an appointment
              {arrowChipNight}
            </AppointmentLink>
          </Button>
          <Button asChild size="lg" variant="night-outline" className="h-14 px-7 text-base">
            <Link href={secondary.href}>{secondary.label}</Link>
          </Button>
        </>
      }
      note={<>{practiceHoursSummary}, Los Gatos time · 15251 National Ave, Suite 102, Los Gatos</>}
    />
  );
}
