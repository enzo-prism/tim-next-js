import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import PageBreadcrumbs from "@/components/navigation/PageBreadcrumbs";
import { Pinwheel } from "@/components/brand/pinwheel";
import { Words } from "@/components/motion/words";
import { Eyebrow } from "./section";

export type HeroTone = "periwinkle" | "blush" | "lime" | "cloud" | "cream";

const toneClass: Record<HeroTone, string> = {
  periwinkle: "bg-periwinkle-wash",
  blush: "bg-blush-wash",
  lime: "bg-lime-wash",
  cloud: "bg-cloud-wash",
  cream: "bg-cream",
};

/**
 * Interior page hero: an inset, softly rounded color panel under the floating
 * header. The title rises in word by word; media (or the brand pinwheel) sits
 * on the right. Everything is visible in the server HTML.
 */
export function PageHero({
  id,
  breadcrumbs,
  eyebrow,
  title,
  titleText,
  lead,
  actions,
  media,
  meta,
  tone = "periwinkle",
  art = "pinwheel",
  className,
  children,
}: {
  /** id for the h1 (for aria-labelledby). */
  id?: string;
  breadcrumbs?: { label: string; href?: string }[];
  eyebrow?: ReactNode;
  /** Rich title. Prefer `titleText` so the words can animate in. */
  title?: ReactNode;
  titleText?: string;
  lead?: ReactNode;
  actions?: ReactNode;
  /** Right-hand media (photo in an arch frame, illustration, card). */
  media?: ReactNode;
  /** Small row under the actions (hours, proof, notes). */
  meta?: ReactNode;
  tone?: HeroTone;
  /** Decorative art when there is no media. */
  art?: "pinwheel" | "none";
  className?: string;
  children?: ReactNode;
}) {
  const hasAside = Boolean(media) || art === "pinwheel";
  return (
    <section aria-labelledby={id} className={cn("relative px-2 pt-2 sm:px-3", className)}>
      <div className={cn("relative overflow-hidden rounded-3xl", toneClass[tone])}>
        {!media && art === "pinwheel" ? (
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 hidden size-[30rem] md:block lg:-right-16 lg:-top-20 lg:size-[34rem]">
            <Pinwheel gather="load" spin="page" delay={150} className="size-full opacity-80" />
          </div>
        ) : null}
        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8 lg:pb-24 lg:pt-12">
          {breadcrumbs?.length ? (
            <div className="ff-intro-fade" style={{ "--d": 0 } as CSSProperties}>
              <PageBreadcrumbs items={breadcrumbs} />
            </div>
          ) : null}
          <div
            className={cn(
              "grid items-center gap-10",
              media && "lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14",
              !media && hasAside && "md:max-w-[min(44rem,62%)]",
            )}
          >
            <div className="max-w-3xl">
              {eyebrow ? (
                <div className="ff-intro mb-5" style={{ "--d": 60 } as CSSProperties}>
                  <Eyebrow>{eyebrow}</Eyebrow>
                </div>
              ) : null}
              {titleText ? (
                <h1 id={id} className="ff-h1 ff-words-intro" style={{ "--d": 120 } as CSSProperties}>
                  <Words text={titleText} />
                </h1>
              ) : (
                <h1 id={id} className="ff-h1 ff-intro" style={{ "--d": 120 } as CSSProperties}>
                  {title}
                </h1>
              )}
              {lead ? (
                <div className="ff-lead ff-intro mt-6 max-w-2xl" style={{ "--d": 240 } as CSSProperties}>
                  {lead}
                </div>
              ) : null}
              {actions ? (
                <div className="ff-intro mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center" style={{ "--d": 320 } as CSSProperties}>
                  {actions}
                </div>
              ) : null}
              {meta ? (
                <div className="ff-intro mt-6 text-sm text-ink-soft" style={{ "--d": 400 } as CSSProperties}>
                  {meta}
                </div>
              ) : null}
              {children}
            </div>
            {media ? (
              <div className="ff-intro-settle relative" style={{ "--d": 0 } as CSSProperties}>
                {media}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
