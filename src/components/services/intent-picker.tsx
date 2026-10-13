import type { CSSProperties } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { ToothPerson } from "@/components/brand/pinwheel";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { brandTones, type BrandTone } from "./service-themes";

type Intent = {
  says: string;
  description: string;
  href: string;
  destination: string;
  tone: BrandTone;
};

// Ordered so neighbouring cards never share a color in the 2- and 3-column grids.
const intents: Intent[] = [
  {
    says: "I need a checkup",
    description: "Start with a complete exam and a clear care plan.",
    href: "/services/dental-exams",
    destination: "Dental Exams",
    tone: "periwinkle",
  },
  {
    says: "I want a cleaning",
    description: "Explore preventive cleanings and gum-health care.",
    href: "/services/dental-hygiene",
    destination: "Dental Hygiene",
    tone: "cloud",
  },
  {
    says: "I’m bringing my child",
    description: "See gentle dental care designed for growing smiles.",
    href: "/services/children-dentistry",
    destination: "Children’s Dentistry",
    tone: "lime",
  },
  {
    says: "I want to improve my smile",
    description: "Explore clear aligners and cosmetic treatment options.",
    href: "/services/invisalign",
    destination: "Invisalign",
    tone: "blush",
  },
  {
    says: "I need to repair a tooth",
    description: "Review fillings, crowns, and restorative options.",
    href: "/services/restorative-dentistry",
    destination: "Restorative Dentistry",
    tone: "periwinkle",
  },
  {
    says: "I have jaw pain",
    description: "Learn how the team evaluates TMJ and bite concerns.",
    href: "/tmj",
    destination: "TMJ Treatment",
    tone: "cloud",
  },
];

// Each tooth-person leans a little differently, so the row feels alive.
const leans = ["-rotate-6", "rotate-3", "-rotate-3", "rotate-6", "-rotate-2", "rotate-2"];

/**
 * "Start with what you need": six intents, each spoken by a little
 * tooth-person in a speech bubble. Tap one to land on the right service.
 */
export function IntentPicker() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
      {intents.map((intent, index) => {
        const tone = brandTones[intent.tone];
        return (
          <li key={intent.href} className="ff-reveal" style={{ "--i": index % 3 } as CSSProperties}>
            <Link
              href={intent.href}
              className="ff-lift group relative flex h-full flex-col rounded-3xl bg-white p-4 ring-1 ring-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:p-6"
            >
              <span className="flex items-end gap-3">
                <span aria-hidden="true" className="relative flex h-16 w-11 shrink-0 items-end justify-center sm:h-20 sm:w-14">
                  <ToothPerson
                    color={tone.color}
                    className={cn(
                      "h-full w-auto origin-bottom transition-[rotate,translate] duration-500 ease-[var(--ease-spring)] group-hover:-translate-y-2 group-hover:rotate-0 motion-reduce:transition-none",
                      leans[index % leans.length],
                      intent.tone === "cloud" && "[&_g]:stroke-ink/10 [&_g]:[stroke-width:3]",
                    )}
                  />
                </span>
                <span
                  className={cn(
                    "relative mb-6 rounded-2xl rounded-bl-[4px] px-4 py-2.5 font-display text-xl font-semibold leading-tight text-ink transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-translate-y-1 motion-reduce:transition-none sm:mb-9 sm:text-[1.375rem]",
                    tone.solid,
                  )}
                >
                  {intent.says}
                </span>
              </span>
              <span className="mt-4 hidden text-base leading-relaxed text-ink-soft sm:block">{intent.description}</span>
              <span className="mt-auto flex items-center justify-between gap-3 pt-3 sm:pt-5">
                <span className="text-sm font-bold text-ink">
                  <span className="sr-only">Go to </span>
                  {intent.destination}
                </span>
                <span
                  aria-hidden="true"
                  className="ff-arrow grid size-10 shrink-0 place-items-center rounded-full bg-cream text-ink transition-colors group-hover:bg-ink group-hover:text-white"
                >
                  <MinimalGlyph name="arrow-right" />
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
