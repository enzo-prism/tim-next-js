import type { CSSProperties } from "react";
import Image from "next/image";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { buildAppointmentUrl } from "@/lib/analytics";
import { AppointmentLink, PhoneLink, TrackedExternalLink } from "@/components/tracking/tracked-links";
import VideoFacade from "@/components/video-facade";
import { Pinwheel, ToothPerson, BrandDots } from "@/components/brand/pinwheel";
import { Squiggle } from "@/components/brand/squiggle";
import { Word, Words } from "@/components/motion/words";
import { Rotator } from "@/components/motion/rotator";
import { Section, SectionHeader } from "@/components/site/section";
import { StepTimeline } from "@/components/site/step-timeline";
import { AudienceTabs } from "@/components/site/audience-tabs";
import { ReviewCard } from "@/components/site/review-rows";
import { PhotoStrip } from "@/components/site/photo-strip";
import { CtaBand } from "@/components/site/cta-band";
import { Stars } from "@/components/site/stars";
import officeTourPoster from "@assets/Office Photo 1_1753972057110.jpeg";
import drChuangPhoto from "@assets/Dr. Chuang_1753977515693.jpg";
import officeManagerPhoto from "@assets/Office Manager_1753977345657.jpeg";
import assistantPhoto from "@assets/Trang Assistant Headshot_1756845643362.jpg";
import storefrontPhoto from "@assets/Office Photo 11_1753972057108.jpg";
import windowRoomPhoto from "@assets/Office Photo 6_1753972057109.jpeg";
import waitingRoomPhoto from "@assets/Office Photo 8_1753972057109.jpeg";
import lobbyPhoto from "@assets/Office Photo 10_1753972057108.jpeg";
import xrayAlcovePhoto from "@assets/Office Photo 4_1753972057109.jpeg";
import treatmentHallPhoto from "@assets/Office Photo 5_1753972057109.jpeg";
import { practiceHoursSummary } from "@/content/practice-hours";
import { featuredReview, testimonialSections, testimonialsPageSummary } from "@/content/testimonials";
import { HeroGhost, HeroMoon, NightSky, SeasonalGreeting, heroMoonBox } from "@/components/seasonal/seasonal-art";
import { HeroBats } from "@/components/seasonal/seasonal-client";

const OFFICE_TOUR_VIDEO_SRC =
  "https://player.vimeo.com/video/1106179834?title=0&byline=0&portrait=0&badge=0&autoplay=1&loop=0&muted=0&background=0&controls=1";

const homeReviews = [
  featuredReview,
  ...testimonialSections
    .flatMap((section) => section.reviews)
    .filter((review) => review.name === "Janey Lee" || review.name === "Jerry Jobe"),
];

const nextSteps = [
  {
    href: "/new-patients",
    title: "Your first visit",
    body: "Know what to expect and how to prepare.",
    tone: "bg-lime-wash",
    color: "var(--ff-lime)",
  },
  {
    href: "/insurance-and-payment",
    title: "Insurance & payment",
    body: "Find the next step for coverage and payment questions.",
    tone: "bg-periwinkle-wash",
    color: "var(--ff-periwinkle)",
  },
  {
    href: "/urgent-dental-care",
    title: "Something hurts?",
    body: "See how to contact the office about urgent dental concerns.",
    tone: "bg-blush-wash",
    color: "var(--ff-blush)",
  },
];

const ribbon = [
  "5.0 on Google",
  "Kids to grandparents",
  "3D digital scans",
  "Blankets, water & a show",
  "Mon–Thu · 9 AM–5 PM",
  "Los Gatos & Santa Cruz families",
];

const journey = [
  { place: "Cupertino", detail: "Grew up in the Bay Area" },
  { place: "UC San Diego", detail: "Human Biology" },
  { place: "University of the Pacific", detail: "Dental school, 2020" },
  { place: "Big Island, Hawaii", detail: "General dentistry residency" },
  { place: "Los Gatos", detail: "Family First Smile Care" },
];

export default function Home() {
  return (
    <div className="overflow-x-clip">
      {/* ------------------------------------------------------------ Hero */}
      <section aria-labelledby="home-heading" className="relative px-2 pt-2 sm:px-3">
        <div className="relative mx-auto max-w-[88rem] overflow-hidden rounded-3xl bg-white ring-1 ring-border">
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-14 pt-10 sm:px-8 sm:pb-16 sm:pt-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-10 lg:px-10 lg:pb-20 lg:pt-16">
            <div className="max-w-2xl">
              <SeasonalGreeting />
              <p className="ff-intro ff-chip mb-7 w-fit gap-2.5 shadow-none" style={{ "--d": 0 } as CSSProperties}>
                <BrandDots />
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">Kids · Teens · Adults · Grandparents</span>
              </p>
              <h1 id="home-heading" className="ff-display ff-words-intro" style={{ "--d": 80 } as CSSProperties}>
                <Words text="A" />{" "}
                <Squiggle draw="load" delay={900}>
                  <Word index={1}>
                    <em className="ff-italic font-medium text-cobalt">Gentle</em>
                  </Word>
                </Squiggle>{" "}
                <Words text="Family Dentist in Los Gatos" start={2} />
              </h1>
              <p className="ff-lead ff-intro mt-7 max-w-xl" style={{ "--d": 520 } as CSSProperties}>
                Calm, unhurried dental care for{" "}
                <Rotator
                  delay={900}
                  className="font-semibold text-ink"
                  words={["little ones", "teens", "parents", "grandparents", "your whole family"]}
                  srText="little ones, teens, parents, grandparents, and your whole family"
                />
                . One Los Gatos team your family can grow with.
              </p>
              <div className="ff-intro mt-9 flex flex-col gap-3 sm:flex-row" style={{ "--d": 640 } as CSSProperties}>
                <Button asChild size="lg" className="group h-14 pl-7 pr-5 text-base">
                  <AppointmentLink href={buildAppointmentUrl({ source: "home_hero" })} source="home_hero">
                    Request an Appointment
                    <span aria-hidden="true" className="ff-arrow grid size-8 place-items-center rounded-full bg-white/15">
                      <MinimalGlyph name="arrow-right" />
                    </span>
                  </AppointmentLink>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 px-7 text-base">
                  <PhoneLink location="home_hero">Call (408) 358-8100</PhoneLink>
                </Button>
              </div>
              <div data-home-review-proof="" className="ff-intro mt-8 flex flex-wrap items-center gap-x-4 gap-y-2" style={{ "--d": 760 } as CSSProperties}>
                <Stars className="text-lg" />
                <div>
                  <TrackedExternalLink
                    href={testimonialsPageSummary.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    kind="review"
                    provider="google"
                    location="home_hero_proof"
                    className="inline-flex flex-wrap gap-x-2 text-sm font-bold text-ink underline decoration-ink/20 underline-offset-4 transition-colors hover:decoration-cobalt"
                  >
                    <span>{testimonialsPageSummary.averageRating} on Google</span>
                    <span aria-hidden="true">·</span>
                    <span>{testimonialsPageSummary.reviewCountLabel}</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </TrackedExternalLink>
                  <p className="mt-0.5 text-xs text-ink-soft">{testimonialsPageSummary.verifiedAtLabel}</p>
                </div>
              </div>
            </div>

            {/* Dentist composition */}
            <figure data-home-dentist="" className="relative mx-auto w-full max-w-[26rem] lg:max-w-none">
              <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 size-56 sm:-right-16 sm:size-72 lg:-right-20 lg:-top-16 lg:size-[22rem]">
                <Pinwheel gather="load" spin="page" delay={200} className="size-full" />
              </div>
              <div className="ff-intro-scale relative mx-auto w-[78%] lg:w-[80%]" style={{ "--d": 180 } as CSSProperties}>
                <div className="relative">
                  <HeroMoon />
                  <div className="ff-arch relative aspect-[4/5] bg-periwinkle-wash ring-8 ring-white">
                    <Image
                      src={drChuangPhoto}
                      alt="Dr. Tim J. Chuang, DDS"
                      priority
                      sizes="(max-width: 1023px) 78vw, 420px"
                      className="relative z-[1] size-full object-cover object-[50%_20%]"
                    />
                  </div>
                  <HeroGhost />
                  <HeroBats className={heroMoonBox} />
                </div>
                <span className="ff-chip ff-intro-pop absolute -left-6 top-[18%] z-[2] sm:-left-10" style={{ "--d": 900 } as CSSProperties}>
                  <span aria-hidden="true" className="size-2.5 rounded-full bg-lime ring-2 ring-ink/10" />
                  Bay Area native
                </span>
                <span className="ff-chip ff-intro-pop absolute -right-5 top-[52%] z-[2] sm:-right-8" style={{ "--d": 1020 } as CSSProperties}>
                  <span aria-hidden="true" className="size-2.5 rounded-full bg-blush ring-2 ring-ink/10" />
                  Toys &amp; stickers for kids
                </span>
              </div>
              <figcaption className="ff-intro relative z-[2] mx-auto -mt-10 w-[86%] rounded-2xl bg-white p-4 shadow-float ring-1 ring-border sm:w-[80%] sm:p-5" style={{ "--d": 820 } as CSSProperties}>
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-cobalt">Meet your dentist</p>
                <Link href="/team" className="group mt-1 flex items-center justify-between gap-3 rounded-sm text-lg font-bold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  Dr. Tim J. Chuang, DDS
                  <span aria-hidden="true" className="ff-arrow grid size-8 place-items-center rounded-full bg-cream text-ink transition-colors group-hover:bg-cobalt group-hover:text-white">
                    <MinimalGlyph name="arrow-right" />
                  </span>
                </Link>
                <p className="mt-0.5 text-sm text-ink-soft">Practice owner · University of the Pacific dental graduate</p>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Ribbon */}
      <div aria-hidden="true" className="relative z-[1] -mt-1 overflow-hidden py-10 sm:py-14">
        <div className="-rotate-2 bg-lime py-4 shadow-float sm:py-5">
          <div className="ff-drift flex w-max items-center gap-8 whitespace-nowrap px-8" style={{ "--ff-drift-from": "0%", "--ff-drift-to": "-28%" } as CSSProperties}>
            {[...ribbon, ...ribbon, ...ribbon].map((item, index) => (
              <span key={index} className="flex items-center gap-8">
                <span className="font-display text-2xl font-semibold italic text-ink sm:text-3xl">{item}</span>
                <ToothPerson color={index % 2 ? "var(--ff-paper)" : "var(--ff-ink)"} className="h-7 w-auto sm:h-8" />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------- Next steps */}
      <section aria-labelledby="visit-next-steps-heading" className="pb-4 pt-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="visit-next-steps-heading" className="ff-reveal text-center font-display text-2xl font-semibold text-ink sm:text-3xl">
            Make your next step a little easier
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {nextSteps.map((step, index) => (
              <Link
                key={step.href}
                href={step.href}
                className={`ff-reveal ff-lift group relative flex min-h-48 flex-col justify-between overflow-hidden rounded-3xl p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:p-7 ${step.tone}`}
                style={{ "--i": index } as CSSProperties}
              >
                <ToothPerson
                  color={step.color}
                  className="pointer-events-none absolute -bottom-6 -right-3 h-28 w-auto rotate-[-8deg] transition-[rotate,translate] duration-500 ease-[var(--ease-spring)] group-hover:-translate-y-2 group-hover:rotate-[4deg] motion-reduce:transition-none"
                />
                <h3 className="relative font-display text-2xl font-semibold text-ink">{step.title}</h3>
                <p className="relative mt-3 max-w-[16rem] text-base leading-relaxed text-ink-soft">{step.body}</p>
                <span aria-hidden="true" className="ff-arrow relative mt-6 grid size-10 place-items-center rounded-full bg-white text-ink ring-1 ring-ink/5 transition-colors group-hover:bg-ink group-hover:text-white">
                  <MinimalGlyph name="arrow-right" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- Audience */}
      <Section labelledBy="audience-heading" className="pt-20 sm:pt-24 lg:pt-28">
        <SectionHeader
          id="audience-heading"
          align="center"
          eyebrow="Care for every age"
          title={
            <>
              Who’s coming in <em className="ff-italic font-normal">today?</em>
            </>
          }
          lead="One dental home from a baby’s first visit to a grandparent’s crown. Pick a family member to see what care looks like for them."
        />
        <div className="mt-12">
          <AudienceTabs />
        </div>
        <div className="ff-reveal mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/services">Explore all dental services</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/patient-info">Patient information and FAQs</Link>
          </Button>
        </div>
      </Section>

      {/* ------------------------------------------------------- First visit */}
      <Section tone="cream" labelledBy="first-visit-heading">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-end">
          <SectionHeader
            id="first-visit-heading"
            eyebrow="New here?"
            title={
              <>
                Four easy steps to a <Squiggle color="var(--ff-blush)">calmer</Squiggle> checkup
              </>
            }
          />
          <p className="ff-reveal ff-lead max-w-xl lg:justify-self-end">
            No guesswork, no pressure. Here is exactly how a first visit with our team works, from the first click to the plan you leave with.
          </p>
        </div>
        <div className="mt-14">
          <StepTimeline
            steps={[
              { title: "Request a time", body: "Tell us what you need and when you prefer to visit. It only takes a moment." },
              { title: "We confirm the details", body: "Our team reaches out during office hours to confirm and answer insurance questions." },
              { title: "A gentle, thorough visit", body: "Blankets, water, and something to watch. Dr. Chuang explains what he sees as he goes." },
              { title: "A clear plan", body: "You leave knowing your options, in plain language, with time for every question." },
            ]}
          />
        </div>
        <div className="ff-reveal mt-12">
          <Link href="/new-patients" className="ff-link">
            Read the full new-patient guide
          </Link>
        </div>
      </Section>

      {/* -------------------------------------------------------- Dr. Chuang */}
      <Section labelledBy="meet-heading">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
          <div className="relative order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="ff-reveal-right ff-arch relative aspect-[3/4] bg-blush-wash">
                <Image
                  src={officeManagerPhoto}
                  alt="Family First Smile Care office manager"
                  fill
                  sizes="(max-width: 1023px) 45vw, 300px"
                  quality={70}
                  className="ff-parallax object-cover object-top"
                  style={{ "--ff-parallax": "-4%" } as CSSProperties}
                />
              </div>
              <div className="ff-reveal-left relative mt-16 aspect-[3/4] overflow-hidden rounded-3xl bg-lime-wash" style={{ "--i": 1 } as CSSProperties}>
                <Image
                  src={assistantPhoto}
                  alt="Family First Smile Care dental assistant beside the office moss-tooth wall"
                  fill
                  sizes="(max-width: 1023px) 45vw, 300px"
                  quality={70}
                  className="object-cover object-top"
                />
              </div>
            </div>
            <div className="ff-reveal-pop absolute -bottom-6 left-1/2 w-[min(92%,22rem)] -translate-x-1/2 rounded-2xl bg-white p-5 shadow-float ring-1 ring-border" style={{ "--i": 2 } as CSSProperties}>
              <p className="font-display text-lg font-semibold leading-snug text-ink">
                “Georgia at the front office is also wonderful—always friendly and helpful with the scheduling process.”
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">Veronica R. · Google review</p>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <SectionHeader
              id="meet-heading"
              eyebrow="Meet the team"
              title={
                <>
                  A Bay Area dentist who <em className="ff-italic font-normal">listens first</em>
                </>
              }
              lead="Dr. Tim Chuang’s approach to family care centers on listening to your concerns, explaining your options, and helping you feel comfortable with the next step."
            />
            <ol className="mt-10 space-y-0" aria-label="Dr. Chuang’s path to Los Gatos">
              {journey.map((stop, index) => (
                <li key={stop.place} className="ff-reveal relative flex gap-4 pb-5 last:pb-0" style={{ "--i": index } as CSSProperties}>
                  {index < journey.length - 1 ? <span aria-hidden="true" className="absolute left-[0.6875rem] top-7 h-[calc(100%-1.25rem)] w-px bg-border" /> : null}
                  <span aria-hidden="true" className={`mt-1 grid size-6 shrink-0 place-items-center rounded-full ${index === journey.length - 1 ? "bg-cobalt" : "bg-cream ring-1 ring-border"}`}>
                    <span className={`size-2 rounded-full ${index === journey.length - 1 ? "bg-white" : "bg-ink/40"}`} />
                  </span>
                  <span>
                    <span className="block font-bold text-ink">{stop.place}</span>
                    <span className="block text-sm text-ink-soft">{stop.detail}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="ff-reveal mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="outline">
                <Link href="/team">Meet the whole team</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="/about">About our practice</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------------- Reviews */}
      <Section tone="periwinkle" labelledBy="patient-reviews-heading" className="overflow-clip">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,2fr)] lg:gap-14">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeader
              id="patient-reviews-heading"
              eyebrow="Real patients"
              title="What Our Patients Say"
              lead="Selected excerpts from public Google reviews."
            />
            <div className="ff-reveal mt-8 rounded-3xl bg-white p-6 ring-1 ring-border">
              <p className="font-display text-6xl font-semibold leading-none text-ink">{testimonialsPageSummary.averageRating}</p>
              <Stars className="mt-3 text-xl" />
              <p className="mt-2 text-sm font-semibold text-ink-soft">{testimonialsPageSummary.reviewCountLabel}</p>
            </div>
            <div className="ff-reveal mt-6 flex flex-col items-start gap-3">
              <Button asChild variant="default">
                <Link href="/testimonials">Read more patient reviews</Link>
              </Button>
              <TrackedExternalLink
                href={testimonialsPageSummary.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                kind="review"
                provider="google"
                location="home_reviews"
                className="ff-link text-sm"
              >
                Read reviews on Google<span className="sr-only"> (opens in a new tab)</span>
              </TrackedExternalLink>
            </div>
          </div>
          <div data-home-static-reviews="" className="grid gap-5 md:grid-cols-2">
            {homeReviews.map((review, index) => (
              <div
                key={review.name}
                className={`ff-straighten ${index === 0 ? "md:col-span-2" : ""}`}
                style={{ "--i": index, "--ff-tilt": index % 2 ? "3deg" : "-3deg" } as CSSProperties}
              >
                <ReviewCard
                  review={{ name: review.name, quote: review.quote, label: review.patientLabel }}
                  index={index}
                  size={index === 0 ? "lg" : "md"}
                />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------- Office tour */}
      <Section labelledBy="office-tour-heading" width="full" className="overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-end gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <SectionHeader
            id="office-tour-heading"
            eyebrow="Take a look around"
            title="A familiar place before your first visit"
          />
          <div className="ff-reveal lg:justify-self-end lg:text-right">
            <p className="ff-lead max-w-md lg:ml-auto">
              Preview our Los Gatos office at your own pace. Play the tour when you’re ready, or explore the office photos.
            </p>
            <Link href="/about" className="ff-link mt-4 inline-block text-sm">
              See our office and learn about our approach
            </Link>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="ff-unclip relative aspect-video overflow-hidden rounded-3xl bg-cream" style={{ "--ff-unclip-radius": "1.5rem" } as CSSProperties}>
            <VideoFacade
              videoSrc={OFFICE_TOUR_VIDEO_SRC}
              title="Family First Smile Care Office Tour"
              poster={officeTourPoster}
              posterAlt="Inside the Family First Smile Care office in Los Gatos"
              posterSizes="(max-width: 1280px) calc(100vw - 2rem), 1216px"
              posterQuality={65}
              playLabel="Play office tour"
            />
          </div>
        </div>
        <PhotoStrip
          className="mt-14"
          photos={[
            { src: storefrontPhoto, alt: "The Family First Smile Care storefront at Suite 102", caption: "Find us at Suite 102" },
            { src: windowRoomPhoto, alt: "A bright treatment room with a window onto the trees", caption: "Treatment rooms with a view", position: "50% 40%" },
            { src: waitingRoomPhoto, alt: "The waiting room with sofas and the moss tooth wall", caption: "A comfy waiting room", position: "30% 50%" },
            { src: xrayAlcovePhoto, alt: "The imaging alcove beside a wall of Hawaii photos", caption: "Modern imaging" },
            { src: treatmentHallPhoto, alt: "The hallway of treatment rooms", caption: "Room to breathe" },
            { src: lobbyPhoto, alt: "Daylight through the front windows of the lobby", caption: "Sunny front lobby", position: "70% 50%" },
          ]}
        />
      </Section>

      {/* ----------------------------------------------------------- Closing */}
      <CtaBand
        id="home-cta-heading"
        title={
          <>
            Ready to meet your Los Gatos <em className="ff-italic font-normal text-lime">dental team?</em>
          </>
        }
        body="Tell us what you need and when you prefer to visit. Our team will contact you to confirm the next step."
        decoration={<NightSky />}
        actions={
          <>
            <Button asChild size="lg" variant="night" className="group h-14 pl-7 pr-5 text-base">
              <AppointmentLink href={buildAppointmentUrl({ source: "home_final_cta" })} source="home_final_cta">
                Request an Appointment
                <span aria-hidden="true" className="ff-arrow grid size-8 place-items-center rounded-full bg-ink/10">
                  <MinimalGlyph name="arrow-right" />
                </span>
              </AppointmentLink>
            </Button>
            <Button asChild size="lg" variant="night-outline" className="h-14 px-7 text-base">
              <PhoneLink location="home_final_cta">Call (408) 358-8100</PhoneLink>
            </Button>
          </>
        }
        note={<>{practiceHoursSummary} · 15251 National Ave, Suite 102, Los Gatos</>}
      />
    </div>
  );
}
