import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { buildAppointmentUrl } from "@/lib/analytics";
import { AppointmentLink, PhoneLink } from "@/components/tracking/tracked-links";
import RelatedLinksSection from "@/components/navigation/RelatedLinksSection";
import VideoFacade from "@/components/video-facade";
import { Pinwheel, ToothPerson } from "@/components/brand/pinwheel";
import { PageHero } from "@/components/site/page-hero";
import { Section, SectionHeader, Eyebrow } from "@/components/site/section";
import { PhotoStrip } from "@/components/site/photo-strip";
import { CtaBand } from "@/components/site/cta-band";
import { practiceHoursSummary } from "@/content/practice-hours";
import type { RelatedLink } from "@/lib/internal-links";
import patientExperiencePoster from "@assets/video-posters/patient-experience-1106163189.jpg";
import officeTourPoster from "@assets/video-posters/office-tour-1112347739.jpg";
import facilityTourPoster from "@assets/video-posters/facility-tour-1106179818.jpg";
import storefrontPhoto from "@assets/Office Photo 11_1753972057108.jpg";
import entrancePhoto from "@assets/Office Photo 12_1753972057108.jpg";
import operatoryCorridorPhoto from "@assets/Office Photo 1_1753972057110.jpeg";
import hallwayPhoto from "@assets/Office Photo 3_1753972057109.jpeg";
import imagingAlcovePhoto from "@assets/Office Photo 4_1753972057109.jpeg";
import treatmentHallPhoto from "@assets/Office Photo 5_1753972057109.jpeg";
import windowRoomPhoto from "@assets/Office Photo 6_1753972057109.jpeg";

const APPOINTMENT_SOURCE = "about_story";

const comforts = [
  { label: "A warm blanket", dot: "bg-periwinkle" },
  { label: "A glass of water", dot: "bg-blush" },
  { label: "Something to watch", dot: "bg-lime" },
  { label: "Toys & stickers for kids", dot: "bg-cloud" },
];

const values = [
  {
    title: "Compassion",
    body: "Every patient is treated with empathy, patience, and respect. If dental visits make you nervous, tell us when you arrange your visit. Comfort matters here as much as skill.",
    color: "var(--ff-periwinkle)",
  },
  {
    title: "Personalization",
    body: "Your care is planned around your needs, your goals, and your comfort level. Dr. Chuang explains what he finds and walks you through your options in plain language.",
    color: "var(--ff-blush)",
  },
  {
    title: "Prevention",
    body: "Careful exams, gentle cleanings, and simple habits at home help keep small problems small. For kids, that starts with a happy first visit.",
    color: "var(--ff-lime)",
  },
];

const tours = [
  {
    src: "https://player.vimeo.com/video/1112347739?title=0&byline=0&portrait=0&badge=0&autoplay=1",
    title: "Family First Smile Care Office Tour",
    poster: officeTourPoster,
    posterAlt: "The waiting room with cream sofas and framed tooth prints, from the office tour video",
    playLabel: "Play tour",
    caption: "Office tour",
    note: "Includes our waiting room",
    tilt: "-3deg",
  },
  {
    src: "https://player.vimeo.com/video/1106179818?title=0&byline=0&portrait=0&badge=0&autoplay=1",
    title: "Family First Smile Care Facility Tour",
    poster: facilityTourPoster,
    posterAlt: "A treatment room with a wall of windows onto the trees, from the facility tour video",
    playLabel: "Play tour",
    caption: "Facility tour",
    note: "Treatment rooms with a view",
    tilt: "3deg",
  },
];

const relatedLinks: RelatedLink[] = [
  {
    href: "/team",
    title: "Meet Our Team",
    description: "Get to know Dr. Chuang and the caring team behind your visit.",
  },
  {
    href: "/services",
    title: "All Dental Services",
    description: "Explore preventive, restorative, and family care options.",
  },
  {
    href: "/patient-info",
    title: "Patient Information",
    description: "FAQs, what to expect, and helpful resources for your visit.",
  },
];

export default function About() {
  return (
    <div className="overflow-x-clip">
      {/* ------------------------------------------------------------ Hero */}
      <PageHero
        id="about-heading"
        tone="blush"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        eyebrow="Our story"
        titleText="About Family First Smile Care"
        lead="A locally owned family dental office in Los Gatos, founded by Dr. Tim J. Chuang so every generation of a family could have one calm, familiar place to go."
        actions={
          <>
            <Button asChild size="lg" className="group h-14 pl-7 pr-5 text-base">
              <AppointmentLink href={buildAppointmentUrl({ source: APPOINTMENT_SOURCE })} source={APPOINTMENT_SOURCE}>
                Request an Appointment
                <span aria-hidden="true" className="ff-arrow grid size-8 place-items-center rounded-full bg-white/15">
                  <MinimalGlyph name="arrow-right" />
                </span>
              </AppointmentLink>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-7 text-base">
              <Link href="/team">Meet Dr. Chuang</Link>
            </Button>
          </>
        }
        meta={
          <p className="flex flex-wrap gap-x-3 gap-y-1">
            <span className="font-semibold text-ink">15251 National Ave, Suite 102</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span>{practiceHoursSummary}</span>
          </p>
        }
        media={
          <figure className="relative mx-auto w-full max-w-[24rem] lg:max-w-[26rem]">
            <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 size-44 sm:-right-14 sm:size-56 lg:-right-20 lg:-top-14 lg:size-64">
              <Pinwheel gather="load" spin="page" delay={240} className="size-full" />
            </div>
            <div className="ff-arch relative aspect-[4/5] bg-white ring-8 ring-white">
              <Image
                src={storefrontPhoto}
                alt="The Family First Smile Care storefront in Los Gatos, with the tooth-family logo and Tim J. Chuang, DDS on the glass"
                priority
                sizes="(max-width: 1023px) 384px, 416px"
                className="size-full object-cover object-[62%_50%]"
              />
            </div>
            <span className="ff-chip ff-intro-pop absolute -left-4 top-[22%] sm:-left-10" style={{ "--d": 820 } as CSSProperties}>
              <span aria-hidden="true" className="size-2.5 rounded-full bg-lime ring-2 ring-ink/10" />
              Locally owned
            </span>
            <span className="ff-chip ff-intro-pop absolute -right-3 bottom-[18%] sm:-right-8" style={{ "--d": 960 } as CSSProperties}>
              <span aria-hidden="true" className="size-2.5 rounded-full bg-periwinkle ring-2 ring-ink/10" />
              Just off Highway 17
            </span>
          </figure>
        }
      />

      {/* ----------------------------------------------------------- Story */}
      <Section labelledBy="story-heading">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          <div>
            <SectionHeader
              id="story-heading"
              eyebrow="How it started"
              title={
                <>
                  One family, <em className="ff-italic font-normal">every</em> smile.
                </>
              }
            />
            <figure className="ff-reveal-scale mt-10 max-w-md">
              <div className="relative aspect-square overflow-clip rounded-3xl bg-white ring-1 ring-border [&_button>span:first-of-type]:bg-transparent">
                <VideoFacade
                  videoSrc="https://player.vimeo.com/video/1106163189?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&loop=1&muted=1&background=1"
                  title="Family First Smile Care Patient Experience"
                  poster={patientExperiencePoster}
                  posterAlt="Colorful family tooth characters from the Family First Smile Care animation"
                  posterSizes="(max-width: 1023px) 92vw, 448px"
                  playLabel="Play animation"
                />
              </div>
              <figcaption className="mt-3 px-1 text-sm font-semibold text-ink-soft">
                Our logo family, animated: four friends who stick together.
              </figcaption>
            </figure>
          </div>

          <div className="lg:pt-10">
            <p className="ff-reveal font-display text-[1.6rem] font-medium leading-snug text-ink sm:text-[2rem] sm:leading-[1.25]">
              Dr. Tim J. Chuang founded Family First Smile Care with a simple idea: a family should be able to bring{" "}
              <em className="ff-italic">everyone</em>, from a toddler’s first checkup to a grandparent’s crown, to one calm, familiar office.
            </p>
            <div className="ff-reveal mt-8 max-w-[62ch] space-y-5 text-lg leading-relaxed text-ink-soft">
              <p>
                He grew up nearby in Cupertino, studied in San Diego and the Bay Area, completed a general dentistry residency on the Big Island of Hawaii,
                then came home to build a locally owned practice in Los Gatos.
              </p>
              <p>
                Today our patients include neighbors from around town, and many Santa Cruz families make the easy trip over Highway 17. Whoever is in the
                chair, the pace is the same: gentle, unhurried, and clear. Dr. Chuang explains what he sees, walks you through your options, and helps you
                feel comfortable with the next step.
              </p>
            </div>

            <div className="ff-reveal mt-10 rounded-3xl bg-cream p-6 sm:p-7">
              <p className="font-display text-xl font-semibold text-ink">Comfort is part of every visit</p>
              <p className="mt-1.5 text-base text-ink-soft">Just ask. During treatment you’re welcome to:</p>
              <ul className="mt-5 flex flex-wrap gap-2.5">
                {comforts.map((item) => (
                  <li key={item.label} className="ff-chip shadow-none">
                    <span aria-hidden="true" className={`size-2.5 rounded-full ring-2 ring-ink/10 ${item.dot}`} />
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="ff-reveal mt-8 flex flex-wrap gap-x-6 gap-y-3">
              <Link href="/team" className="ff-link">
                Meet Dr. Chuang and the team
              </Link>
              <Link href="/services" className="ff-link">
                Explore our services
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------- Values */}
      <Section tone="cream" labelledBy="values-heading">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeader
              id="values-heading"
              eyebrow="Our mission & values"
              title={
                <>
                  What guides <em className="ff-italic font-normal">every</em> visit
                </>
              }
              lead="Three ideas we come back to, whether it’s a baby’s first visit or a crown for grandpa."
            />
          </div>
          <ol className="border-b border-ink/10">
            {values.map((value, index) => (
              <li
                key={value.title}
                className="ff-reveal grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-5 border-t border-ink/10 py-9 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-x-8 sm:py-11"
                style={{ "--i": index } as CSSProperties}
              >
                <span aria-hidden="true" className="relative block self-start">
                  <ToothPerson color={value.color} className="absolute -top-4 left-10 h-12 w-auto rotate-[14deg] sm:-top-6 sm:left-[4.75rem] sm:h-16" />
                  <span className="relative font-display text-6xl font-semibold leading-none tracking-tight text-ink sm:text-8xl">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </span>
                <div className="pt-1 sm:pt-3">
                  <h3 className="ff-h3 sm:text-[2rem]">{value.title}</h3>
                  <p className="mt-3 max-w-xl text-lg leading-relaxed text-ink-soft">{value.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* ------------------------------------------------------------ Tour */}
      <Section labelledBy="tour-heading" width="full" className="overflow-clip">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:px-8">
          <div>
            <SectionHeader
              id="tour-heading"
              eyebrow="Office tour"
              title={
                <>
                  Walk through the office <em className="ff-italic font-normal">before</em> you visit
                </>
              }
              lead="Two short vertical video tours of our Los Gatos office. Press play whenever you’re ready, and see where you’ll sit before you arrive."
            />
            <ul className="ff-reveal mt-8 space-y-3 text-base text-ink-soft">
              <li className="flex items-center gap-3">
                <ToothPerson color="var(--ff-blush)" className="h-6 w-auto shrink-0" />
                Our front door at Suite 102, with the tooth family on the glass
              </li>
              <li className="flex items-center gap-3">
                <ToothPerson color="var(--ff-periwinkle)" className="h-6 w-auto shrink-0" />
                A comfy waiting room with soft sofas
              </li>
              <li className="flex items-center gap-3">
                <ToothPerson color="var(--ff-lime)" className="h-6 w-auto shrink-0" />
                Bright treatment rooms with windows onto the trees
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:gap-8">
            {tours.map((tour, index) => (
              <figure
                key={tour.title}
                className={`ff-straighten ${index === 1 ? "mt-12 sm:mt-20" : ""}`}
                style={{ "--i": index, "--ff-tilt": tour.tilt } as CSSProperties}
              >
                <div className="rounded-3xl bg-ink p-1.5 shadow-float sm:p-2.5">
                  <div className="relative aspect-[9/16] overflow-clip rounded-2xl bg-ink">
                    <VideoFacade
                      videoSrc={tour.src}
                      title={tour.title}
                      poster={tour.poster}
                      posterAlt={tour.posterAlt}
                      posterSizes="(max-width: 1023px) 46vw, 300px"
                      posterQuality={65}
                      playLabel={tour.playLabel}
                    />
                  </div>
                </div>
                <figcaption className="mt-4 px-1">
                  <span className="block font-display text-lg font-semibold text-ink sm:text-xl">{tour.caption}</span>
                  <span className="block text-sm text-ink-soft">{tour.note}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-7xl px-4 sm:mt-24 sm:px-6 lg:px-8">
          <div className="ff-reveal flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow className="mb-3">A look around</Eyebrow>
              <h3 className="ff-h3">More of the office</h3>
            </div>
            <p className="max-w-sm text-base text-ink-soft">Swipe or scroll to see the rooms you’ll visit.</p>
          </div>
        </div>
        <PhotoStrip
          className="mt-10"
          photos={[
            { src: entrancePhoto, alt: "The glass front door to Suite 102", caption: "Our front door, Suite 102" },
            { src: windowRoomPhoto, alt: "A bright treatment room with a floor-to-ceiling window onto the trees", caption: "Treatment rooms with a view", position: "50% 40%" },
            { src: treatmentHallPhoto, alt: "The hallway of treatment rooms, one with a TV showing a nature scene", caption: "Something calm to watch" },
            { src: operatoryCorridorPhoto, alt: "A corridor of open treatment rooms with windows at the far end", caption: "Open, airy treatment rooms", position: "40% 50%" },
            { src: imagingAlcovePhoto, alt: "A wall of island landscape photos beside the dental imaging alcove", caption: "Island photos and modern imaging" },
            { src: hallwayPhoto, alt: "The carpeted hallway toward the treatment rooms, with a mirrored alcove", caption: "The way to your visit" },
          ]}
        />
      </Section>

      {/* --------------------------------------------------------- Related */}
      <Section tone="cream" className="py-14 sm:py-16 lg:py-20">
        <div className="md:[&_.grid]:grid-cols-3 [&>section]:mt-0">
          <RelatedLinksSection title="Keep exploring" links={relatedLinks} />
        </div>
      </Section>

      {/* ----------------------------------------------------------- Close */}
      <CtaBand
        id="about-cta-heading"
        eyebrow="Come say hello"
        title={
          <>
            We’d love to meet your <em className="ff-italic font-normal text-lime">whole family.</em>
          </>
        }
        body="Tell us what you need and when you prefer to visit. Our team will contact you during office hours to confirm the details."
        actions={
          <>
            <Button asChild size="lg" variant="night" className="group h-14 pl-7 pr-5 text-base">
              <AppointmentLink href={buildAppointmentUrl({ source: APPOINTMENT_SOURCE })} source={APPOINTMENT_SOURCE}>
                Request an Appointment
                <span aria-hidden="true" className="ff-arrow grid size-8 place-items-center rounded-full bg-ink/10">
                  <MinimalGlyph name="arrow-right" />
                </span>
              </AppointmentLink>
            </Button>
            <Button asChild size="lg" variant="night-outline" className="h-14 px-7 text-base">
              <PhoneLink location={APPOINTMENT_SOURCE}>Call (408) 358-8100</PhoneLink>
            </Button>
          </>
        }
        note={<>{practiceHoursSummary} · 15251 National Ave, Suite 102, Los Gatos</>}
      />
    </div>
  );
}
