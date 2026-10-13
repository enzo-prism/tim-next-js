import type { CSSProperties } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import PracticeAddressLink from "@/components/location/PracticeAddressLink";
import { ToothPerson } from "@/components/brand/pinwheel";
import { Words } from "@/components/motion/words";
import { Eyebrow } from "@/components/site/section";
import { LostPinwheel } from "@/components/editorial/lost-pinwheel";
import { practiceInfo } from "@/content/structured-data";
import { practiceHoursSummary } from "@/content/practice-hours";
import { buildAppointmentUrl } from "@/lib/analytics";
import { AppointmentLink, PhoneLink } from "@/components/tracking/tracked-links";
import { SeasonalNotFoundArt, SeasonalNotFoundLine } from "@/components/seasonal/seasonal-art";

const tileClass =
  "ff-lift group relative flex h-full flex-col justify-between overflow-clip rounded-3xl p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-h-44 sm:p-7";
const toothClass =
  "pointer-events-none absolute -bottom-6 -right-2 h-20 w-auto rotate-[-8deg] sm:h-24 transition-[rotate,translate] duration-500 ease-[var(--ease-spring)] group-hover:-translate-y-2 group-hover:rotate-[4deg] motion-reduce:transition-none";
const arrowClass =
  "ff-arrow relative mt-4 grid size-10 sm:mt-6 place-items-center rounded-full bg-white text-ink ring-1 ring-ink/5 transition-colors group-hover:bg-ink group-hover:text-white";

const quickLinks = [
  { href: "/services", title: "Our services", body: "Checkups, kids’ care, Invisalign, crowns, and more.", wash: "bg-periwinkle-wash", color: "var(--ff-periwinkle)" },
  { href: "/new-patients", title: "New patients", body: "What to expect at a first visit and how to prepare.", wash: "bg-lime-wash", color: "var(--ff-lime)" },
  { href: "/contact", title: "Contact & location", body: "Send a message or find us on National Ave.", wash: "bg-cloud-wash", color: "var(--ff-periwinkle)" },
];

export default function NotFound() {
  return (
    <div className="overflow-x-clip">
      <section aria-labelledby="not-found-heading" className="ffe-404 relative px-2 pt-2 sm:px-3">
        <div className="relative overflow-clip rounded-3xl bg-periwinkle-wash">
          <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-12 lg:px-8 lg:pb-24 lg:pt-20">
            <div className="max-w-2xl">
              <div className="ff-intro mb-5" style={{ "--d": 0 } as CSSProperties}>
                <Eyebrow>Error 404</Eyebrow>
              </div>
              <SeasonalNotFoundLine />
              <h1 id="not-found-heading" className="ff-display ff-words-intro" style={{ "--d": 80 } as CSSProperties}>
                <Words text="Oops! Page not found." />
              </h1>
              <p className="ff-lead ff-intro mt-6 max-w-xl" style={{ "--d": 360 } as CSSProperties}>
                Even our tooth-people wander off sometimes. The page you’re looking for may have moved or no longer
                exists. Let’s get you back to familiar ground.
              </p>
              <div className="ff-intro mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap" style={{ "--d": 480 } as CSSProperties}>
                <Button asChild size="lg" className="ffe-404-home group h-14 pl-7 pr-5 text-base">
                  <Link href="/">
                    Back to homepage
                    <span aria-hidden="true" className="ff-arrow grid size-8 place-items-center rounded-full bg-white/15">
                      <MinimalGlyph name="arrow-right" />
                    </span>
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 px-7 text-base">
                  <PhoneLink location="not_found_page">Call us: (408) 358-8100</PhoneLink>
                </Button>
              </div>
            </div>

            <div aria-hidden="true" className="ffe-404-art ff-intro-scale relative mx-auto w-full max-w-md sm:max-w-lg lg:max-w-none" style={{ "--d": 160 } as CSSProperties}>
              <div className="pointer-events-none absolute -bottom-6 right-0 z-[1] origin-bottom-right scale-75 sm:scale-90">
                <SeasonalNotFoundArt />
              </div>
              <LostPinwheel className="w-full" />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="not-found-links-heading" className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="not-found-links-heading" className="ff-h2 ff-reveal max-w-2xl">
            Good places to <em className="ff-italic font-normal">start</em>
          </h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <li className="ff-reveal">
              <AppointmentLink href={buildAppointmentUrl({ source: "not_found_page" })} source="not_found_page" className={`${tileClass} bg-blush-wash`}>
                <ToothPerson color="var(--ff-blush)" className={toothClass} />
                <span className="relative block pr-10">
                  <span className="block font-display text-2xl font-semibold text-ink">Request a visit</span>
                  <span className="mt-2 block text-base leading-relaxed text-ink-soft">Tell us what you need and when you’d like to come in.</span>
                </span>
                <span aria-hidden="true" className={arrowClass}>
                  <MinimalGlyph name="arrow-right" />
                </span>
              </AppointmentLink>
            </li>
            {quickLinks.map((item, index) => (
              <li key={item.href} className="ff-reveal" style={{ "--i": index + 1 } as CSSProperties}>
                <Link href={item.href} className={`${tileClass} ${item.wash}`}>
                  <ToothPerson color={item.color} className={toothClass} />
                  <span className="relative block pr-10">
                    <span className="block font-display text-2xl font-semibold text-ink">{item.title}</span>
                    <span className="mt-2 block text-base leading-relaxed text-ink-soft">{item.body}</span>
                  </span>
                  <span aria-hidden="true" className={arrowClass}>
                    <MinimalGlyph name="arrow-right" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="ff-reveal mt-10 grid gap-6 rounded-3xl bg-white p-6 ring-1 ring-border sm:grid-cols-3 sm:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-cobalt-deep">Visit</p>
              <p className="mt-2 text-base font-semibold text-ink">
                <PracticeAddressLink className="text-inherit underline decoration-ink/20 underline-offset-4 hover:text-cobalt" trackingLocation="not_found_page">
                  <>
                    {practiceInfo.addressLines[0]}
                    <br />
                    {practiceInfo.addressLines[1]}
                  </>
                </PracticeAddressLink>
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-cobalt-deep">Hours</p>
              <p className="mt-2 text-base text-ink">
                <span className="font-semibold">{practiceHoursSummary}</span>
                <br />
                <span className="text-ink-soft">Closed Friday through Sunday</span>
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-cobalt-deep">Family First Smile Care</p>
              <p className="mt-2 text-base text-ink-soft">Gentle family dentistry in Los Gatos, for little ones to grandparents.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
