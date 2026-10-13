import type { CSSProperties } from "react";
import { Link } from "wouter";
import PracticeAddressLink from "@/components/location/PracticeAddressLink";
import { PhoneLink } from "@/components/tracking/tracked-links";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { ToothPerson } from "@/components/brand/pinwheel";
import { patientGuidanceFacts } from "@/content/patient-guidance";
import { practiceWeeklyHours } from "@/content/practice-hours";
import { cn } from "@/lib/utils";

export const arrowChip = (
  <span aria-hidden="true" className="ff-arrow grid size-8 place-items-center rounded-full bg-white/15">
    <MinimalGlyph name="arrow-right" />
  </span>
);

export const arrowChipNight = (
  <span aria-hidden="true" className="ff-arrow grid size-8 place-items-center rounded-full bg-ink/10">
    <MinimalGlyph name="arrow-right" />
  </span>
);

/** Address, hours and phone in one calm card. */
export function OfficeCard({ source, className, title = "Your Los Gatos office" }: { source: string; className?: string; title?: string }) {
  return (
    <div className={cn("rounded-3xl bg-white p-6 ring-1 ring-border sm:p-7", className)}>
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-cobalt-deep">{title}</p>
      <p className="mt-2 font-display text-xl font-semibold leading-snug text-ink sm:text-2xl">
        <PracticeAddressLink trackingLocation={`${source}_address`} className="decoration-cobalt/40 decoration-2 hover:text-cobalt" />
      </p>
      <dl className="mt-6 grid gap-5 border-t border-border pt-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">Hours</dt>
          <dd className="mt-1 font-semibold text-ink">{patientGuidanceFacts.hours}</dd>
          <dd className="text-sm text-ink-soft">Los Gatos time · closed Fri–Sun</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">Phone</dt>
          <dd>
            <PhoneLink location={`${source}_sidebar`} className="ff-link inline-flex min-h-11 items-center text-lg">
              {patientGuidanceFacts.phone.display}
            </PhoneLink>
          </dd>
        </div>
      </dl>
    </div>
  );
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hourLabel = (time: string) => {
  const hour = Number(time.split(":")[0]);
  return String(hour % 12 || 12);
};

/** The week at a glance, Monday first, built from the practice hours record. */
export function HoursWeek({ className }: { className?: string }) {
  const days = [1, 2, 3, 4, 5, 6, 0].map((weekday) => {
    const hours = practiceWeeklyHours.find((entry) => entry.weekday === weekday);
    return { label: DAY_LABELS[weekday], hours };
  });
  return (
    <ul aria-label="Weekly office hours" className={cn("grid grid-cols-7 gap-1.5 sm:gap-2", className)}>
      {days.map((day, index) => (
        <li
          key={day.label}
          className={cn(
            "ff-reveal-pop flex flex-col items-center rounded-2xl px-0.5 py-3 text-center sm:py-4",
            day.hours ? "bg-lime text-ink" : "bg-cloud-wash text-ink-soft ring-1 ring-inset ring-border",
          )}
          style={{ "--i": Math.min(index, 4) } as CSSProperties}
        >
          <span className="text-[0.7rem] font-bold uppercase tracking-[0.08em] sm:text-xs">{day.label}</span>
          {day.hours ? (
            <span className="mt-1 text-xs font-semibold sm:text-sm">
              <span aria-hidden="true">
                {hourLabel(day.hours.opens)}–{hourLabel(day.hours.closes)}
              </span>
              <span className="sr-only">
                {" "}
                open {hourLabel(day.hours.opens)} AM to {hourLabel(day.hours.closes)} PM
              </span>
            </span>
          ) : (
            <span className="mt-1 text-xs font-semibold sm:text-sm">
              <span aria-hidden="true">–</span>
              <span className="sr-only"> closed</span>
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

const GUIDES = [
  { href: "/new-patients", title: "Your first visit", body: "What to expect and how to prepare.", tone: "bg-lime-wash", color: "var(--ff-lime)" },
  { href: "/insurance-and-payment", title: "Insurance & payment", body: "The questions to ask before you visit.", tone: "bg-periwinkle-wash", color: "var(--ff-periwinkle)" },
  { href: "/urgent-dental-care", title: "Something hurts?", body: "How to reach us about an urgent concern.", tone: "bg-blush-wash", color: "var(--ff-blush)" },
  { href: "/patient-info", title: "Patient info & FAQs", body: "Guides for brushing, flossing, and more.", tone: "bg-cloud-wash", color: "var(--ff-cloud)" },
] as const;

/** Three other guides as friendly cards (the current page is left out). */
export function MoreGuides({ current, headingId }: { current: string; headingId: string }) {
  const guides = GUIDES.filter((guide) => guide.href !== current).slice(0, 3);
  return (
    <nav aria-labelledby={headingId}>
      <h2 id={headingId} className="ff-reveal font-display text-2xl font-semibold text-ink sm:text-3xl">
        Keep exploring
      </h2>
      <ul className="mt-6 grid gap-4 md:grid-cols-3">
        {guides.map((guide, index) => (
          <li key={guide.href} className="ff-reveal" style={{ "--i": index } as CSSProperties}>
            <Link
              href={guide.href}
              className={cn(
                "ff-lift group relative flex min-h-36 flex-col justify-between overflow-clip rounded-3xl p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                guide.tone,
              )}
            >
              <ToothPerson
                color={guide.color}
                className="pointer-events-none absolute -bottom-5 -right-2 h-24 w-auto rotate-[-8deg] transition-[rotate,translate] duration-500 ease-[var(--ease-spring)] group-hover:-translate-y-1.5 group-hover:rotate-[4deg] motion-reduce:transition-none"
              />
              <span className="relative block pr-14">
                <span className="block font-display text-xl font-semibold text-ink">{guide.title}</span>
                <span className="mt-1.5 block text-sm leading-relaxed text-ink-soft">{guide.body}</span>
              </span>
              <span aria-hidden="true" className="ff-arrow relative mt-5 grid size-9 place-items-center rounded-full bg-white text-ink ring-1 ring-ink/5 transition-colors group-hover:bg-ink group-hover:text-white">
                <MinimalGlyph name="arrow-right" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
