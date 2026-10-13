import type { CSSProperties } from "react";
import Image from "next/image";
import { Link } from "wouter";
import { Section, SectionHeader } from "@/components/site/section";
import { StepTimeline } from "@/components/site/step-timeline";
import { Squiggle } from "@/components/brand/squiggle";
import { patientGuidanceFacts, type PatientGuidanceSection } from "@/content/patient-guidance";
import { testimonialSections } from "@/content/testimonials";
import storefrontPhoto from "@assets/Office Photo 11_1753972057108.jpg";
import waitingRoomPhoto from "@assets/Office Photo 8_1753972057109.jpeg";
import { Checklist } from "./checklist";
import { ComfortArt } from "./guide-art";
import { MoreGuides, OfficeCard } from "./guide-shared";
import { comfortCards } from "./guidance-content";

const bySection = (sections: readonly PatientGuidanceSection[], id: string) => sections.find((section) => section.id === id);

const anxiousReview = testimonialSections.flatMap((section) => section.reviews).find((review) => review.name === "Janey Lee");

/** Hero media: the waiting room, cropped to the sofas and the framed prints. */
export function NewPatientHeroMedia() {
  return (
    <figure className="relative mx-auto w-full max-w-[22rem] sm:max-w-[25rem] lg:mr-0">
      <div className="ff-arch relative aspect-[4/5] bg-white ring-8 ring-white">
        <Image
          src={waitingRoomPhoto}
          alt="The Family First Smile Care waiting room, with cream sofas, navy pillows, and framed smile prints"
          fill
          priority
          sizes="(max-width: 1023px) 80vw, 400px"
          quality={72}
          className="origin-[52%_84%] scale-[1.55] object-cover"
        />
      </div>
      <span className="ff-chip ff-intro-pop absolute -left-3 top-[22%] sm:-left-8" style={{ "--d": 820 } as CSSProperties}>
        <span aria-hidden="true" className="size-2.5 rounded-full bg-lime ring-2 ring-ink/10" />
        Blankets &amp; water
      </span>
      <span className="ff-chip ff-intro-pop absolute -right-2 top-[58%] sm:-right-8" style={{ "--d": 960 } as CSSProperties}>
        <span aria-hidden="true" className="size-2.5 rounded-full bg-blush ring-2 ring-ink/10" />
        Something to watch
      </span>
      <figcaption className="ff-intro relative z-[1] mx-auto -mt-8 w-[88%] rounded-2xl bg-white px-5 py-4 text-sm leading-snug text-ink-soft shadow-float ring-1 ring-border" style={{ "--d": 700 } as CSSProperties}>
        <span className="block font-bold text-ink">Bring the whole family</span>
        Kids, teens, parents, and grandparents.
      </figcaption>
    </figure>
  );
}

export function NewPatientGuide({ sections, source }: { sections: readonly PatientGuidanceSection[]; source: string }) {
  const before = bySection(sections, "before-your-visit");
  const atVisit = bySection(sections, "at-your-visit");
  const arrival = bySection(sections, "plan-your-arrival");
  const nervousNote = arrival?.items.find((item) => /nervous/i.test(item));
  const arrivalNotes = arrival?.items.filter((item) => item !== nervousNote) ?? [];

  return (
    <>
      {/* ---------------------------------------------------- The visit */}
      <Section labelledBy="np-visit-heading">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
          <SectionHeader
            id="np-visit-heading"
            eyebrow="How it works"
            title={
              <>
                Your first visit, <em className="ff-italic font-normal">step by step</em>
              </>
            }
          />
          <p className="ff-reveal ff-lead max-w-xl lg:justify-self-end">
            No guesswork. Here’s how a first visit comes together, from the first hello to the plan you leave with.
          </p>
        </div>
        <div className="mt-14">
          <StepTimeline
            steps={[
              {
                title: "Request a time",
                body: "Send a request online or give us a call. Tell us who the visit is for: you, your child, or a few of you.",
              },
              {
                title: "We confirm with you",
                body: `Our team reaches out during office hours to answer questions about paperwork, records, and insurance. ${patientGuidanceFacts.appointmentExpectation}`,
              },
              {
                title: "Settle in",
                body: "We’ll welcome you and help you get comfortable, with a blanket, water, and something to watch during treatment.",
              },
              {
                title: atVisit?.title ?? "A clear plan for your care",
                body: atVisit?.description,
              },
            ]}
          />
        </div>
      </Section>

      {/* ---------------------------------------------------- Comfort */}
      <Section tone="cream" labelledBy="np-comfort-heading">
        <SectionHeader
          id="np-comfort-heading"
          eyebrow="Comfort, built in"
          title={
            <>
              Little things that make visits <Squiggle color="var(--ff-blush)">easier</Squiggle>
            </>
          }
          lead="Small comforts are part of every visit here. Ask for anything that helps you relax."
        />
        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <article className="ff-reveal relative flex flex-col overflow-clip rounded-3xl bg-blush-wash p-6 sm:p-9 col-span-2 lg:row-span-2">
            <ComfortArt kind="hug" className="w-24 sm:w-28" />
            <h3 className="ff-h3 mt-6">Nervous? Tell us.</h3>
            <p className="mt-3 max-w-md text-base leading-relaxed text-ink-soft">
              {nervousNote ?? "Feeling nervous about dental care? Tell us when you arrange your visit."} Share what helps you feel at ease, and ask as many questions as you like.
            </p>
            {anxiousReview ? (
              <figure className="mt-auto pt-8">
                <blockquote className="rounded-2xl bg-white p-5 font-display text-lg leading-snug text-ink ring-1 ring-ink/5 sm:p-6 sm:text-xl">
                  “{anxiousReview.quote}”
                </blockquote>
                <figcaption className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
                  {anxiousReview.name} · {anxiousReview.patientLabel} · Google review
                </figcaption>
              </figure>
            ) : null}
          </article>
          {comfortCards.map((card, index) => (
            <article
              key={card.kind}
              className={`ff-reveal flex gap-4 rounded-3xl p-5 sm:gap-5 sm:p-7 ${card.tone} ${index === 2 ? "col-span-2 items-center" : "flex-col"}`}
              style={{ "--i": index + 1 } as CSSProperties}
            >
              <ComfortArt kind={card.kind} className="w-16 shrink-0 sm:w-24" />
              <div>
                <h3 className="font-display text-lg font-semibold leading-snug text-ink sm:text-xl">{card.title}</h3>
                <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink-soft sm:text-base">{card.body}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------- Checklists */}
      <Section labelledBy="np-ready-heading">
        <SectionHeader
          id="np-ready-heading"
          eyebrow="Before you come"
          title={
            <>
              Get ready in a few <em className="ff-italic font-normal">happy ticks</em>
            </>
          }
          lead="Tick things off as you go. Nothing here is saved or sent; it’s just for you."
        />
        <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-14">
          {atVisit ? (
            <div>
              <h3 className="ff-h3">What to bring along</h3>
              <p className="mt-2 text-base leading-relaxed text-ink-soft">Bring these with you, or keep them in mind for the visit.</p>
              <Checklist className="mt-6" items={atVisit.items} label="What to bring along" tone="lime" />
            </div>
          ) : null}
          {before ? (
            <div>
              <h3 className="ff-h3">{before.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-ink-soft">{before.description}</p>
              <Checklist className="mt-6" items={before.items} label={before.title} tone="lime" />
            </div>
          ) : null}
        </div>
      </Section>

      {/* ---------------------------------------------------- Arrival */}
      {arrival ? (
        <Section tone="lime" labelledBy="np-arrival-heading">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <figure className="relative mx-auto w-full max-w-[17rem] sm:max-w-[20rem] lg:max-w-[26rem]">
              <div className="ff-reveal-right ff-arch relative aspect-[3/4] bg-white ring-8 ring-white">
                <Image
                  src={storefrontPhoto}
                  alt="The Family First Smile Care storefront on National Ave, with the logo on the glass"
                  fill
                  sizes="(max-width: 1023px) 80vw, 420px"
                  quality={70}
                  className="ff-parallax object-cover"
                  style={{ "--ff-parallax": "-4%" } as CSSProperties}
                />
              </div>
              <figcaption className="ff-chip ff-reveal-pop absolute -right-2 bottom-10 sm:-right-6" style={{ "--i": 2 } as CSSProperties}>
                <span aria-hidden="true" className="size-2.5 rounded-full bg-periwinkle ring-2 ring-ink/10" />
                Find us at Suite 102
              </figcaption>
            </figure>
            <div>
              <SectionHeader id="np-arrival-heading" eyebrow="Getting here" title={arrival.title} lead={arrival.description} />
              <OfficeCard source={source} className="ff-reveal mt-8" />
              <ul className="mt-8 space-y-4">
                {arrivalNotes.map((item, index) => (
                  <li key={item} className="ff-reveal flex gap-3 text-base leading-relaxed text-ink" style={{ "--i": index } as CSSProperties}>
                    <span aria-hidden="true" className={`mt-2 size-2.5 shrink-0 rounded-full ${index % 2 ? "bg-blush" : "bg-periwinkle"} ring-2 ring-ink/10`} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/contact" className="ff-link ff-reveal mt-7 inline-flex min-h-11 items-center">
                Office details &amp; directions
              </Link>
            </div>
          </div>
        </Section>
      ) : null}

      <Section labelledBy="np-more-heading" className="py-14 sm:py-16 lg:py-20">
        <MoreGuides current="/new-patients" headingId="np-more-heading" />
      </Section>
    </>
  );
}
