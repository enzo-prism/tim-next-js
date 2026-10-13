import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { buildAppointmentUrl } from "@/lib/analytics";
import { AppointmentLink, PhoneLink } from "@/components/tracking/tracked-links";
import RelatedLinksSection from "@/components/navigation/RelatedLinksSection";
import { Pinwheel, ToothPerson } from "@/components/brand/pinwheel";
import { Squiggle } from "@/components/brand/squiggle";
import { PageHero } from "@/components/site/page-hero";
import { Section, SectionHeader, Eyebrow } from "@/components/site/section";
import { ReviewCard } from "@/components/site/review-rows";
import { CtaBand } from "@/components/site/cta-band";
import { JourneyPath, type JourneyStop } from "@/components/story/journey-path";
import { practiceHoursSummary } from "@/content/practice-hours";
import type { RelatedLink } from "@/lib/internal-links";
import drChuangPhoto from "@assets/Dr. Chuang_1753977515693.jpg";
import officeManagerPhoto from "@assets/Office Manager_1753977345657.jpeg";
import assistantPhoto from "@assets/Trang Assistant Headshot_1756845643362.jpg";

const APPOINTMENT_SOURCE = "team_final";

const journey: JourneyStop[] = [
  {
    label: "Hometown",
    place: "Cupertino",
    detail: "Grew up in the Bay Area, a short drive from the office where he practices today.",
  },
  {
    label: "Undergraduate · Human Biology",
    place: "UC San Diego",
    detail: "Earned his undergraduate degree in Human Biology at the University of California, San Diego.",
  },
  {
    label: "Dental school · 2020",
    place: "University of the Pacific",
    detail: "Returned to the Bay Area to study dentistry, graduating from the University of the Pacific School of Dentistry in 2020.",
  },
  {
    label: "Residency",
    place: "Big Island, Hawaii",
    detail: "Completed a general dentistry residency on the Big Island of Hawaii.",
  },
  {
    label: "Today",
    place: "Los Gatos",
    detail: "Lead Dentist & Practice Owner at Family First Smile Care, caring for families from first visits to grandparents.",
  },
];

// Verbatim excerpts from public Google reviews (see content/testimonials.ts).
const patientWords = [
  {
    name: "Js L",
    quote:
      "Dr. Chuang is a true perfectionist who listens carefully and explains every step so I always feel at ease.",
    meta: "Google review",
  },
  {
    name: "Veronica R.",
    quote:
      "Dr. Chuang is incredibly patient, knowledgeable, and gentle, taking the time to listen to my concerns and clearly explain all my options.",
    meta: "Google review",
  },
  {
    name: "Kevin Lan",
    quote:
      "Dr Chuang was great for my 2 year old daughter's first dental visit. He was patient, fun and knew how to interact with toddlers well, and had necessary tools like toys and stickers to keep the kid happy.",
    meta: "Google review",
  },
];

const credentials = [
  { term: "Education", detail: "University of the Pacific School of Dentistry" },
  { term: "Training", detail: "General dentistry residency" },
  { term: "Care approach", detail: "Gentle, family-centered care" },
];

const supportTeam = [
  {
    role: "Office Manager",
    photo: officeManagerPhoto,
    alt: "Family First Smile Care office manager",
    body: "Have a question before you arrive? Our front-office team helps with scheduling and insurance questions so you can prepare for your visit.",
    wash: "bg-blush-wash",
    tooth: "var(--ff-blush)",
    position: "50% 18%",
  },
  {
    role: "Dental Assistant",
    photo: assistantPhoto,
    alt: "Family First Smile Care dental assistant beside the office moss-tooth wall",
    body: "Our dental assistant supports Dr. Chuang during your treatment and helps you settle in. Let the team know if you need a moment or have a question.",
    wash: "bg-lime-wash",
    tooth: "var(--ff-lime)",
    position: "50% 30%",
  },
];

const relatedLinks: RelatedLink[] = [
  {
    href: "/about",
    title: "About Our Office",
    description: "Take the video tour and see what makes Family First Smile Care different.",
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

export default function Team() {
  return (
    <div className="overflow-x-clip">
      {/* ------------------------------------------------------------ Hero */}
      <PageHero
        id="team-heading"
        tone="periwinkle"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Our Team" }]}
        eyebrow="Meet our team"
        titleText="Meet Dr. Chuang"
        lead={
          <>
            <span className="mb-4 flex w-fit items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-sm font-bold text-ink shadow-float">
              <span aria-hidden="true" className="size-2.5 rounded-full bg-cobalt" />
              Lead Dentist &amp; Practice Owner
            </span>
            <span className="block">
              Dr. Tim J. Chuang is a Bay Area native who grew up in Cupertino, then trained at UC San Diego, the University of the Pacific
              School of Dentistry, and a residency on the Big Island of Hawaii. His approach to family care centers on listening to your
              concerns, explaining your options, and helping you feel comfortable with the next step.
            </span>
          </>
        }
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
              <PhoneLink location={APPOINTMENT_SOURCE}>Call (408) 358-8100</PhoneLink>
            </Button>
          </>
        }
        media={
          <figure className="relative mx-auto w-full max-w-[24rem] lg:max-w-[27rem]">
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-8 -left-16 size-40 sm:-left-24 sm:size-52 lg:-bottom-12 lg:-left-32 lg:size-60">
              <Pinwheel gather="load" spin="page" delay={260} className="size-full" />
            </div>
            <div className="ff-arch relative aspect-[4/5] bg-white ring-8 ring-white">
              <Image
                src={drChuangPhoto}
                alt="Dr. Tim J. Chuang professional headshot"
                priority
                sizes="(max-width: 1023px) 384px, 432px"
                className="size-full object-cover object-[50%_18%]"
              />
            </div>
            <span className="ff-chip ff-intro-pop absolute -right-3 top-[20%] sm:-right-10" style={{ "--d": 820 } as CSSProperties}>
              <span aria-hidden="true" className="size-2.5 rounded-full bg-lime ring-2 ring-ink/10" />
              Bay Area native
            </span>
            <span className="ff-chip ff-intro-pop absolute -right-1 bottom-[16%] sm:-right-6" style={{ "--d": 960 } as CSSProperties}>
              <span aria-hidden="true" className="size-2.5 rounded-full bg-blush ring-2 ring-ink/10" />
              Residency in Hawaii
            </span>
          </figure>
        }
      />

      {/* --------------------------------------------------------- Journey */}
      <Section labelledBy="journey-heading">
        <SectionHeader
          id="journey-heading"
          align="center"
          eyebrow="His path to Los Gatos"
          title={
            <>
              From Cupertino to Los&nbsp;Gatos, <em className="ff-italic font-normal">the long way</em> around
            </>
          }
          lead={"Five stops between growing up in the Bay Area and caring for families in Los\u00a0Gatos."}
        />
        <JourneyPath stops={journey} label="Dr. Chuang’s path to Los Gatos" className="mx-auto mt-14 max-w-5xl sm:mt-16" />
      </Section>

      {/* -------------------------------------------------------- Approach */}
      <Section tone="blush" labelledBy="approach-heading" className="overflow-clip">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 top-10 hidden h-48 w-auto rotate-[12deg] opacity-70 lg:block">
          <ToothPerson color="var(--ff-blush)" className="h-full w-auto" />
        </div>
        <div className="mx-auto max-w-5xl text-center">
          <div className="ff-reveal">
            <Eyebrow className="mb-6 justify-center">Dr. Chuang’s approach</Eyebrow>
            <h2 id="approach-heading" className="font-display text-[2.1rem] font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-[4rem]">
              Listen first. Explain every option. Then take the next step{" "}
              <Squiggle color="var(--ff-periwinkle)">
                <em className="ff-italic font-normal">together.</em>
              </Squiggle>
            </h2>
            <p className="ff-lead mx-auto mt-8 max-w-2xl">
              Expect clear explanations and a personalized conversation about your oral health goals. Bring your questions about treatment, or
              any worries about visiting the dentist.
            </p>
          </div>
          <dl className="mx-auto mt-12 grid max-w-4xl gap-3 text-left sm:grid-cols-3">
            {credentials.map((item, index) => (
              <div key={item.term} className="ff-reveal rounded-2xl bg-white/80 p-5 ring-1 ring-ink/5" style={{ "--i": index } as CSSProperties}>
                <dt className="text-xs font-bold uppercase tracking-[0.14em] text-cobalt-deep">{item.term}</dt>
                <dd className="mt-1.5 font-semibold leading-snug text-ink">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* --------------------------------------------------- Patient words */}
      <Section labelledBy="patient-words-heading">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            id="patient-words-heading"
            eyebrow="In patients’ words"
            title={
              <>
                What it’s like in <em className="ff-italic font-normal">his</em> chair
              </>
            }
          />
          <Link href="/testimonials" className="ff-link ff-reveal shrink-0 self-start lg:self-end">
            Read more patient reviews
          </Link>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {patientWords.map((review, index) => (
            <div key={review.name} className="ff-straighten" style={{ "--i": index, "--ff-tilt": index === 1 ? "2deg" : "-3deg" } as CSSProperties}>
              <ReviewCard review={review} index={index} />
            </div>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------- Support team */}
      <Section tone="cream" labelledBy="support-team-heading" className="overflow-clip">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeader
              id="support-team-heading"
              eyebrow="Our caring team"
              title={
                <>
                  The friendly faces behind <em className="ff-italic font-normal">your</em> visit
                </>
              }
              lead="Support before, during, and after your appointment, from your first phone call to the moment you head home."
            />
            <p className="ff-reveal mt-8 text-base text-ink-soft">
              Questions before you visit?{" "}
              <PhoneLink location={APPOINTMENT_SOURCE} className="ff-link">
                Call (408) 358-8100
              </PhoneLink>
            </p>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 sm:gap-6 lg:gap-8">
            {supportTeam.map((member, index) => (
              <figure key={member.role} className={index === 1 ? "sm:mt-24" : undefined}>
                <div className={`relative ${index === 0 ? "ff-reveal-right" : "ff-reveal-left"}`} style={{ "--i": index } as CSSProperties}>
                  <div className={`ff-arch relative aspect-[4/5] ring-8 ring-white ${member.wash}`}>
                    <Image
                      src={member.photo}
                      alt={member.alt}
                      fill
                      sizes="(max-width: 639px) 92vw, (max-width: 1023px) 45vw, 340px"
                      quality={72}
                      className="ff-parallax object-cover"
                      style={{ objectPosition: member.position, "--ff-parallax": "-3%" } as CSSProperties}
                    />
                  </div>
                  <ToothPerson
                    color={member.tooth}
                    className={`absolute -bottom-5 h-20 w-auto ${index === 0 ? "-left-3 -rotate-[10deg]" : "-right-3 rotate-[10deg]"}`}
                  />
                </div>
                <figcaption className="ff-reveal mt-8 px-1">
                  <h3 className="ff-h3">{member.role}</h3>
                  <p className="mt-2 text-base leading-relaxed text-ink-soft">{member.body}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Section>

      {/* --------------------------------------------------------- Related */}
      <Section className="py-14 sm:py-16 lg:py-20">
        <div className="md:[&_.grid]:grid-cols-3 [&>section]:mt-0">
          <RelatedLinksSection title="Explore more" links={relatedLinks} />
        </div>
      </Section>

      {/* ----------------------------------------------------------- Close */}
      <CtaBand
        id="team-cta-heading"
        eyebrow="Join our dental family"
        title={
          <>
            Come meet Dr.&nbsp;Chuang <em className="ff-italic font-normal text-lime">and the team.</em>
          </>
        }
        body="Experience the difference that compassionate, personalized dental care can make for you and your family. Tell us what you need, and our team will contact you to confirm."
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
