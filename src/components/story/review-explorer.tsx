"use client";

import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ReviewCard } from "@/components/site/review-rows";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";

export type ExplorerTheme = {
  id: string;
  /** Short chip label. */
  label: string;
  title: string;
  description: string;
  /** Tailwind class for the theme's brand dot. */
  dot: string;
  links: { href: string; label: string }[];
};

export type ExplorerReview = {
  name: string;
  quote: string;
  label?: string;
  meta?: string;
  theme: string;
  /** A soft brand wash behind the card (Tailwind bg class). */
  wash?: string;
  /** Set the quote in the display face. */
  large?: boolean;
};

const ALL = "all";

/**
 * Curated reviews in a balanced masonry with theme filter chips. The server
 * renders "All" with every review visible; filtering is a progressive
 * enhancement (a toolbar of toggle buttons with a polite live count).
 */
export function ReviewExplorer({ themes, reviews }: { themes: ExplorerTheme[]; reviews: ExplorerReview[] }) {
  const [active, setActive] = useState<string>(ALL);
  const [changed, setChanged] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const gridId = useId();

  const options = [{ id: ALL, label: "All reviews", dot: "" }, ...themes];
  const activeTheme = themes.find((theme) => theme.id === active);
  const visible = active === ALL ? reviews : reviews.filter((review) => review.theme === active);

  const choose = (id: string, index: number) => {
    setActive(id);
    setFocusIndex(index);
    setChanged(true);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const last = options.length - 1;
    let next = focusIndex;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = focusIndex === last ? 0 : focusIndex + 1;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = focusIndex === 0 ? last : focusIndex - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = last;
    setFocusIndex(next);
    buttonsRef.current[next]?.focus();
  };

  const count =
    active === ALL
      ? `Showing all ${reviews.length} reviews`
      : `Showing ${visible.length} of ${reviews.length} reviews: ${activeTheme?.label}`;

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="toolbar"
          aria-label="Filter reviews by theme"
          aria-controls={gridId}
          onKeyDown={onKeyDown}
          className="flex flex-wrap gap-2"
        >
          {options.map((option, index) => {
            const pressed = option.id === active;
            return (
              <button
                key={option.id}
                ref={(node) => {
                  buttonsRef.current[index] = node;
                }}
                type="button"
                aria-pressed={pressed}
                tabIndex={index === focusIndex ? 0 : -1}
                onClick={() => choose(option.id, index)}
                onFocus={() => setFocusIndex(index)}
                className={cn(
                  "ff-press inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 forced-colors:aria-pressed:outline-2 forced-colors:aria-pressed:outline-[Highlight]",
                  pressed ? "border-ink bg-ink text-white" : "border-ink/15 bg-white text-ink hover:border-ink/35",
                )}
              >
                {option.dot ? <span aria-hidden="true" className={cn("size-2.5 rounded-full ring-1 ring-ink/10", option.dot)} /> : null}
                {option.label}
              </button>
            );
          })}
        </div>
        <p aria-live="polite" className="text-sm font-semibold text-ink-soft">
          {count}
        </p>
      </div>

      {activeTheme ? (
        <div key={`panel-${activeTheme.id}`} className="ff-panel mt-6 flex flex-col gap-4 rounded-3xl bg-white p-5 ring-1 ring-border sm:p-6 lg:flex-row lg:items-center lg:justify-between" data-state="active">
          <div className="max-w-2xl">
            <p className="font-display text-xl font-semibold text-ink">{activeTheme.title}</p>
            <p className="mt-1.5 text-base leading-relaxed text-ink-soft">{activeTheme.description}</p>
          </div>
          <ul className="flex flex-wrap gap-2 lg:max-w-sm lg:justify-end" aria-label={`Care mentioned in ${activeTheme.label.toLowerCase()} reviews`}>
            {activeTheme.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-10 items-center rounded-full bg-cream px-3.5 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <ul
        id={gridId}
        key={`grid-${active}`}
        data-state="active"
        aria-label={activeTheme ? `${activeTheme.label} reviews` : "Patient reviews"}
        className={cn(
          // Phones: one swipeable row. Wider screens: balanced masonry columns.
          "-mx-4 mt-8 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6",
          "md:mx-0 md:block md:columns-2 md:gap-5 md:overflow-visible md:px-0 md:pb-0 lg:columns-3",
          changed && "ff-panel",
        )}
      >
        {visible.map((review, index) => (
          <li
            key={`${review.theme}-${review.name}`}
            className="w-[min(84vw,24rem)] shrink-0 snap-start md:mb-5 md:w-auto md:break-inside-avoid"
            style={{ "--i": index % 3 } as CSSProperties}
          >
            <ReviewCard
              review={{ name: review.name, quote: review.quote, label: review.label, meta: review.meta }}
              index={reviews.indexOf(review)}
              size={review.large ? "lg" : "md"}
              className={cn(review.wash, review.wash && "border-transparent")}
            />
          </li>
        ))}
      </ul>
      {visible.length > 1 ? (
        <p aria-hidden="true" className="mt-4 flex items-center gap-2 text-sm font-semibold text-ink-soft md:hidden">
          Swipe for more
          <MinimalGlyph name="arrow-right" />
        </p>
      ) : null}
    </div>
  );
}
