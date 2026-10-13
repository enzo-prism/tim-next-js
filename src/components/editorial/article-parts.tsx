import type { CSSProperties, ReactNode } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { ToothPerson } from "@/components/brand/pinwheel";
import { AppointmentLink, PhoneLink } from "@/components/tracking/tracked-links";
import { buildAppointmentUrl } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { BlogPostLink, BlogPostSource } from "@/content/blog";
import { getBalancedSpan } from "./editorial-theme";

/** "Short answer" card that opens every article. */
export function ShortAnswer({
  answer,
  support,
  label = "Short answer",
  compact = false,
}: {
  answer: string;
  support?: string;
  label?: string;
  /** Smaller type for a summary rather than a one-line answer. */
  compact?: boolean;
}) {
  return (
    <section aria-labelledby="short-answer-heading" className="relative overflow-clip rounded-3xl bg-lime-wash p-6 pr-16 sm:p-8 sm:pr-36">
      <ToothPerson
        color="var(--ff-lime)"
        className="pointer-events-none absolute -bottom-7 -right-3 h-24 w-auto rotate-[10deg] sm:-bottom-8 sm:right-7 sm:h-36"
      />
      <h2 id="short-answer-heading" className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-cobalt-deep">
        <span aria-hidden="true" className="size-2 rounded-full bg-cobalt" />
        {label}
      </h2>
      <p
        className={cn(
          "relative mt-4 font-display font-semibold leading-snug tracking-[-0.015em] text-ink",
          compact ? "text-[1.2rem] sm:text-[1.35rem]" : "text-[1.4rem] sm:text-[1.65rem]",
        )}
      >
        {answer}
      </p>
      {support ? <p className="relative mt-4 text-base leading-relaxed text-ink-soft">{support}</p> : null}
    </section>
  );
}

/** A soft callout inside the article body. */
export function ArticleCallout({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-9 flex gap-4 rounded-2xl bg-periwinkle-wash p-5 sm:gap-5 sm:p-6">
      <ToothPerson color="var(--ff-periwinkle)" className="mt-1 h-11 w-auto shrink-0" />
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-cobalt-deep">Good to know</p>
        <p className="mt-2 text-[1.075rem] leading-relaxed text-ink">{children}</p>
      </div>
    </div>
  );
}

/** Numbered list of the sources an article cites. */
export function ArticleSources({ sources }: { sources: BlogPostSource[] }) {
  if (!sources.length) return null;
  return (
    <section aria-labelledby="sources-heading" className="mt-16 border-t border-border pt-10">
      <h2 id="sources-heading" className="font-display text-xl font-semibold tracking-[-0.015em] text-ink">
        Sources referenced
      </h2>
      <ol className="mt-6 space-y-4">
        {sources.map((source, index) => {
          let host = "";
          try {
            host = new URL(source.href).hostname.replace(/^www\./, "");
          } catch {
            host = "";
          }
          return (
            <li key={source.href} className="flex gap-4">
              <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-cream text-xs font-bold text-ink tabular-nums">
                {index + 1}
              </span>
              <div className="min-w-0 pt-0.5">
                <a
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-ink underline decoration-ink/20 decoration-2 underline-offset-4 transition-colors hover:text-cobalt hover:decoration-cobalt"
                >
                  {source.label}
                  <MinimalGlyph name="external-link" className="ml-1.5 inline-flex text-sm" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                {host ? <p className="mt-1 text-sm text-ink-soft">{host}</p> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** In-article booking prompt near the end of the article. */
export function AskPrompt({ forChild }: { forChild: boolean }) {
  return (
    <section aria-labelledby="ask-heading" className="relative mt-16 overflow-clip rounded-3xl bg-blush-wash p-6 sm:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-6 right-4 hidden items-end gap-1 sm:flex">
        <ToothPerson color="var(--ff-periwinkle)" className="h-24 w-auto rotate-[-6deg]" />
        <ToothPerson color="var(--ff-lime)" className="h-16 w-auto" />
        <ToothPerson color="var(--ff-blush)" className="h-20 w-auto rotate-[6deg]" />
      </div>
      <div className="relative sm:pr-40">
        <h2 id="ask-heading" className="font-display text-2xl font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[1.85rem]">
          {forChild ? (
            <>
              Wondering what this means for <em className="ff-italic font-normal">your child?</em>
            </>
          ) : (
            <>
              Wondering what this means for <em className="ff-italic font-normal">your smile?</em>
            </>
          )}
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-soft">
          Every mouth is different. Dr. Chuang and our team can take a look, answer your questions in plain language,
          and help you decide on a next step that fits your family.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild size="lg" className="group h-12 pl-6 pr-4">
            <AppointmentLink href={buildAppointmentUrl({ source: "blog_post" })} source="blog_post">
              Request a visit
              <span aria-hidden="true" className="ff-arrow grid size-7 place-items-center rounded-full bg-white/15">
                <MinimalGlyph name="arrow-right" />
              </span>
            </AppointmentLink>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-6">
            <PhoneLink location="blog_post">Call (408) 358-8100</PhoneLink>
          </Button>
        </div>
      </div>
    </section>
  );
}

const nextStepTones = [
  { wash: "bg-periwinkle-wash", color: "var(--ff-periwinkle)" },
  { wash: "bg-lime-wash", color: "var(--ff-lime)" },
  { wash: "bg-blush-wash", color: "var(--ff-blush)" },
  { wash: "bg-cloud-wash", color: "var(--ff-periwinkle)" },
];

/** Colorful wash cards for an article's related care pages. */
export function NextStepCards({ links }: { links: BlogPostLink[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      {links.map((link, index) => {
        const tone = nextStepTones[index % nextStepTones.length];
        const span = getBalancedSpan(links.length, index);
        return (
          <li key={link.href} className={cn("ff-reveal", span.className)} style={{ "--i": index % 3 } as CSSProperties}>
            <Link
              href={link.href}
              className={cn(
                "ff-lift group relative flex h-full flex-col justify-between overflow-clip rounded-3xl p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-h-52 sm:p-7",
                tone.wash,
              )}
            >
              <ToothPerson
                color={tone.color}
                className="pointer-events-none absolute -bottom-6 -right-2 h-20 w-auto rotate-[-8deg] sm:-bottom-7 sm:h-28 transition-[rotate,translate] duration-500 ease-[var(--ease-spring)] group-hover:-translate-y-2 group-hover:rotate-[4deg] motion-reduce:transition-none"
              />
              <div className="relative pr-12">
                <h3 className="font-display text-[1.35rem] font-semibold leading-snug tracking-[-0.015em] text-ink">{link.title}</h3>
                {link.description ? <p className="mt-2 text-[0.975rem] leading-relaxed text-ink-soft">{link.description}</p> : null}
              </div>
              <span
                aria-hidden="true"
                className="ff-arrow relative mt-4 grid size-10 place-items-center rounded-full bg-white text-ink ring-1 ring-ink/5 transition-colors group-hover:bg-ink group-hover:text-white sm:mt-6"
              >
                <MinimalGlyph name="arrow-right" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
