import type { CSSProperties } from "react";
import { Link } from "wouter";
import type { ServiceDecisionGuide } from "@/content/services";
import JsonLd from "@/components/seo/json-ld";
import { buildFaqSchema } from "@/content/structured-data";
import { SectionHeader } from "@/components/site/section";
import PatientInfoFaqList from "@/components/patient-info/patient-info-faq-list";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { cn } from "@/lib/utils";
import { brandTones, type BrandTone } from "./service-themes";

const index = [
  { id: "guide-fit", label: "When it may help" },
  { id: "guide-options", label: "Options to discuss" },
  { id: "guide-expect", label: "What to expect" },
  { id: "guide-cost", label: "What affects the cost" },
  { id: "guide-care", label: "Care and follow-up" },
  { id: "guide-faq", label: "Common questions" },
];

const dots = ["bg-periwinkle", "bg-blush", "bg-lime", "bg-cloud", "bg-periwinkle", "bg-blush"];

/**
 * The planning guide for services that carry a decisionGuide: a sticky index
 * on wide screens beside the answers, with the FAQ as collapsible questions.
 */
export function DecisionGuide({
  title,
  guide,
  tone,
}: {
  title: string;
  guide: ServiceDecisionGuide;
  tone: BrandTone;
}) {
  const accent = brandTones[tone];
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-16">
      <JsonLd data={buildFaqSchema(guide.faqs)} />
      <div className="lg:sticky lg:top-28 lg:self-start">
        <SectionHeader
          id="planning-heading"
          eyebrow="Plan your visit"
          title={
            <>
              Deciding on <em className="ff-italic font-normal">{title.toLowerCase()}</em>
            </>
          }
          lead="Plain answers to help you prepare your questions before you visit."
        />
        <nav aria-label="In this guide" className="ff-reveal mt-8">
          <ol className="flex flex-wrap gap-2 lg:flex-col lg:gap-0.5">
            {index.map((item, position) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="group inline-flex min-h-11 items-center gap-3 rounded-full border border-ink/10 bg-white px-4 text-sm font-semibold text-ink transition-colors hover:border-ink/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:w-full lg:rounded-xl lg:border-transparent lg:bg-transparent lg:px-3 lg:hover:bg-white"
                >
                  <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-full", dots[position])} />
                  {item.label}
                  <MinimalGlyph name="arrow-right" className="ff-arrow ml-auto hidden text-xs text-ink-soft lg:inline-block" />
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <article className={cn("ff-reveal rounded-3xl p-6 sm:p-8", accent.wash)}>
            <h3 id="guide-fit" className="ff-h3">When it may help</h3>
            <p className="mt-3 text-base leading-relaxed text-ink-soft">{guide.candidacy}</p>
          </article>
          <article className="ff-reveal rounded-3xl bg-white p-6 ring-1 ring-border sm:p-8" style={{ "--i": 1 } as CSSProperties}>
            <h3 id="guide-options" className="ff-h3">Options to discuss</h3>
            <p className="mt-3 text-base leading-relaxed text-ink-soft">{guide.alternatives}</p>
          </article>
        </div>

        <article className="ff-reveal rounded-3xl bg-white p-6 ring-1 ring-border sm:p-8">
          <h3 id="guide-expect" className="ff-h3">What to expect</h3>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-soft">{guide.visitExpectations}</p>
          <Link className="ff-link mt-3 inline-flex min-h-11 items-center" href="/new-patients">
            Preparing for your first visit
          </Link>
        </article>

        <div className="grid gap-5 md:grid-cols-2">
          <article className="ff-reveal rounded-3xl bg-cream p-6 sm:p-8">
            <h3 id="guide-cost" className="ff-h3">What affects the cost?</h3>
            <ol className="mt-4 space-y-3">
              {guide.costFactors.map((factor, position) => (
                <li key={factor} className="flex gap-3 text-base leading-snug text-ink">
                  <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full bg-white font-display text-sm font-semibold text-ink ring-1 ring-ink/10">
                    {position + 1}
                  </span>
                  <span className="pt-0.5">{factor}</span>
                </li>
              ))}
            </ol>
            <Link className="ff-link mt-4 inline-flex min-h-11 items-center" href="/insurance-and-payment">
              Questions about an estimate or your plan
            </Link>
          </article>
          <article className="ff-reveal rounded-3xl bg-white p-6 ring-1 ring-border sm:p-8" style={{ "--i": 1 } as CSSProperties}>
            <h3 id="guide-care" className="ff-h3">Care and follow-up</h3>
            <p className="mt-3 text-base leading-relaxed text-ink-soft">{guide.maintenance}</p>
          </article>
        </div>

        <div className="ff-reveal pt-6">
          <h3 id="guide-faq" className="ff-h3 mb-5">Common questions</h3>
          <PatientInfoFaqList faqs={guide.faqs.map((faq, position) => ({ id: `faq-${position}`, ...faq }))} />
        </div>

        <div className="pt-2 text-sm leading-relaxed text-ink-soft">
          <p>General information helps you prepare questions. Your examination and treatment plan determine the right approach for you.</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="font-semibold text-ink">Sources:</span>
            {guide.sources.map((source) => (
              <a key={source.href} className="ff-link inline-flex min-h-11 items-center" href={source.href} target="_blank" rel="noopener noreferrer">
                {source.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}
