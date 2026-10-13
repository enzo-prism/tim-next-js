import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { buildAppointmentUrl } from "@/lib/analytics";
import { AppointmentLink, PhoneLink, TrackedExternalLink } from "@/components/tracking/tracked-links";
import InstagramEmbedSection from "@/components/instagram-embed-section";
import RelatedLinksSection from "@/components/navigation/RelatedLinksSection";
import PracticeAddressLink from "@/components/location/PracticeAddressLink";
import PatientInfoFaqList from "@/components/patient-info/patient-info-faq-list";
import { practiceInfo } from "@/content/structured-data";
import { practiceHoursSummary } from "@/content/practice-hours";
import { testimonialSections } from "@/content/testimonials";
import { ToothPerson } from "@/components/brand/pinwheel";
import { Squiggle } from "@/components/brand/squiggle";
import { PageHero } from "@/components/site/page-hero";
import { Section, SectionHeader } from "@/components/site/section";
import { StepTimeline } from "@/components/site/step-timeline";
import { CtaBand } from "@/components/site/cta-band";
import { Stars } from "@/components/site/stars";
import { ParentAndBaby } from "@/components/features/parent-and-baby";
import { PhoneFrame } from "@/components/features/phone-frame";
import { ArrowChip, DrawnCheck, Sticker, brandDot, brandWash, typeset } from "@/components/features/feature-bits";
import type { RelatedLink } from "@/lib/internal-links";

const BOOKING_SERVICE = "childrens-dentistry/babys-first-visit";

// Stills from the practice's reel of a toddler's first visit (portrait, with
// the reel's own captions baked in).
const visitPhotos = [
  {
    src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1763743366/Screenshot_2025-11-21_at_8.40.28_AM_bwdpts.webp",
    width: 670,
    height: 1140,
    caption: "Hello, from a grown-up’s lap",
    alt: "Dr. Chuang greets a toddler sitting on dad’s lap in the dental chair",
  },
  {
    src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1763743366/Screenshot_2025-11-21_at_8.40.51_AM_rtvz7a.webp",
    width: 666,
    height: 1139,
    caption: "A quick, gentle look",
    alt: "Dr. Chuang gently checks a toddler’s teeth while dad holds them",
  },
  {
    src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1763743367/Screenshot_2025-11-21_at_8.40.56_AM_tonxf1.webp",
    width: 665,
    height: 1146,
    caption: "Toothbrush cleaning",
    alt: "Dr. Chuang brushes a toddler’s teeth with a soft toothbrush as dad holds them",
  },
  {
    src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1763743366/Screenshot_2025-11-21_at_8.40.38_AM_fkyaat.webp",
    width: 661,
    height: 1138,
    caption: "High fives and smiles",
    alt: "A laughing toddler high-fives Dr. Chuang from dad’s lap",
  },
];

const whyEarly = [
  "Helps your baby feel comfortable with the dental environment",
  "Ensures teeth and jaw are developing normally",
  "Allows us to spot early signs of cavities or oral habits that may cause problems later",
  "Gives parents personalized guidance for brushing, nutrition, pacifiers, and teething",
  "Builds a long-term positive relationship with dental care (less anxiety later)",
];
const whySpans = ["lg:col-span-2", "lg:col-span-2", "lg:col-span-2", "lg:col-span-3", "md:col-span-2 lg:col-span-3"];

const visitSteps = [
  {
    title: "A warm welcome",
    body: "Your baby gets to explore the lights, colors, tools, and sounds at their own pace. Familiarity comes before anything clinical.",
  },
  {
    title: "A quick exam on a grown-up’s lap",
    body: "Knee to knee with you, Dr. Chuang checks how teeth are coming in, gum health, the tongue, lips, and frenulum, bite and jaw development, and any early signs of decay.",
  },
  {
    title: "A soft toothbrush cleaning",
    body: "A soft infant toothbrush lightly cleans teeth and gums, with fluoride if Dr. Chuang recommends it. It starts the routine early.",
  },
  {
    title: "Tips for you, high fives for them",
    body: "We cover brushing, fluoride, teething, thumb sucking and pacifiers, diet, and when to come back. Then stickers, smiles, and a happy goodbye.",
  },
];

const checklist = [
  "Schedule when your baby is usually well-rested",
  "Bring a favorite comfort item (toy, blanket, pacifier)",
  "Feed them lightly beforehand and brush teeth/gums that morning",
  "Write down questions about teething, habits, or development",
];

const promises = [
  "Tell-show-do pacing with plenty of breaks",
  "Comfortable seating for parents chairside",
  "Positive reinforcement and age-appropriate rewards",
  "Flavor options for fluoride and polishing when appropriate",
  "Latex-free environment and age-appropriate tools",
  "Friendly team trained to support little patients",
];

const parentFaqs = [
  {
    id: "baby-faq-when",
    question: "When should I bring my baby to the dentist?",
    answer: "Before their first birthday or when the first tooth erupts.",
  },
  {
    id: "baby-faq-cries",
    question: "What if my baby cries?",
    answer: "That’s completely normal. Babies cry in new environments – there’s no pressure to perform.",
  },
  {
    id: "baby-faq-regular",
    question: "Do you take children as regular patients?",
    answer: "Absolutely. We love helping families build healthy habits early and continue care through childhood and beyond.",
  },
  {
    id: "baby-faq-fluoride",
    question: "Will my child get fluoride?",
    answer: "If appropriate, Dr. Chuang may recommend a safe, gentle fluoride application to strengthen enamel.",
  },
];

const cavityTips = [
  "Wipe gums after feeding",
  "Brush twice daily with a tiny smear of toothpaste",
  "Avoid putting baby to bed with milk or juice",
  "Limit frequent snacking",
  "Choose water between meals",
  "Encourage transition off bottles by age 12–18 months",
];

const reels = [
  { permalink: "https://www.instagram.com/reel/DNrGJb4ZMXi/", label: "What to expect at baby’s first visit" },
  { permalink: "https://www.instagram.com/reel/DE8HuqhStM9/", label: "When should baby’s first visit be?" },
];

const relatedLinks: RelatedLink[] = [
  {
    href: "/services/children-dentistry",
    title: "Children's Dentistry",
    description: "Gentle, kid-friendly care that builds lifelong healthy habits.",
  },
  {
    href: "/patient-info",
    title: "Patient Information",
    description: "FAQs, what to expect, and helpful resources for your visit.",
  },
  {
    href: "/patient-info/brushing",
    title: "How to Brush Properly",
    description: "Age-based brushing tips to protect enamel and gums.",
  },
  {
    href: "/patient-info/nutrition",
    title: "Nutrition for Healthy Teeth",
    description: "Tooth-friendly snack ideas and habits for little smiles.",
  },
  {
    href: "/contact",
    title: "Contact & Scheduling",
    description: "Ask a question, request an appointment, or get directions.",
  },
  {
    href: "/team",
    title: "Meet Our Team",
    description: "Get to know Dr. Chuang and our caring staff.",
  },
];

const parentReview = testimonialSections.flatMap((section) => section.reviews).find((review) => review.name === "Kevin Lan");

export default function BabysFirstVisit() {
  return (
    <div className="overflow-x-clip">
      {/* ------------------------------------------------------------ Hero */}
      <PageHero
        id="baby-visit-heading"
        tone="lime"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: "Children's Dentistry", href: "/services/children-dentistry" },
          { label: "Baby's First Visit" },
        ]}
        eyebrow={"Children’s dentistry · Ages\u00a00–3"}
        titleText="Baby’s First Dental Visit in Los Gatos, CA"
        lead={
          <>
            <p>
              A gentle, positive introduction to lifelong oral health. The American Academy of Pediatric Dentistry recommends seeing a dentist
              by age 1 or within six months of the first tooth.
            </p>
            <p className="mt-3 text-base text-ink">We make first visits simple, calm, and fun so babies and parents feel at ease.</p>
          </>
        }
        actions={
          <>
            <Button asChild size="lg" className="group h-14 pl-7 pr-5 text-base">
              <AppointmentLink href={buildAppointmentUrl({ serviceId: BOOKING_SERVICE, source: "baby_visit_hero" })} source="babys_first_visit">
                Schedule Baby’s First Visit
                <ArrowChip />
              </AppointmentLink>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-7 text-base">
              <a href="#first-visit-checklist">First-visit checklist</a>
            </Button>
          </>
        }
        meta={
          <ul className="flex flex-wrap gap-2" aria-label="What families can expect">
            {["Calm, kid-friendly rooms", "Parents welcome chairside", "Toys & stickers"].map((item, index) => (
              <li key={item} className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-sm font-semibold text-ink ring-1 ring-ink/5">
                <span aria-hidden="true" className={`size-2 rounded-full ${brandDot[index]}`} />
                {item}
              </li>
            ))}
          </ul>
        }
        media={
          <div className="relative mx-auto w-full max-w-[20rem] pb-2 pt-4 sm:max-w-[26rem] lg:max-w-[29rem]">
            <div className="relative aspect-square">
              <div aria-hidden="true" className="absolute inset-[3%] rounded-full bg-white" />
              <div aria-hidden="true" className="absolute right-[2%] top-[4%] size-[18%] rounded-full bg-blush" />
              <ParentAndBaby className="absolute inset-x-[14%] bottom-[16%] top-[17%]" />
              <Sticker dot="bg-blush" className="-left-[2%] top-[56%] sm:-left-[8%]" delay={1000}>
                Exam on a grown-up’s lap
              </Sticker>
              <Sticker dot="bg-periwinkle" className="-right-[1%] top-[30%] sm:-right-[6%]" delay={1140}>
                High fives
              </Sticker>
            </div>
            <div
              className="ff-intro relative z-[2] mx-auto -mt-12 w-[94%] rounded-2xl bg-white p-4 shadow-float ring-1 ring-border sm:w-[88%] sm:p-5"
              style={{ "--d": 860 } as CSSProperties}
            >
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-cobalt">Our promise to parents</p>
              <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink">
                You stay right beside your baby, we follow their pace with no pressure and no rush, and you leave with a home-care plan made for
                your family.
              </p>
            </div>
          </div>
        }
      />

      {/* ------------------------------------------------------- Why early */}
      <Section labelledBy="why-early-heading">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
          <SectionHeader
            id="why-early-heading"
            eyebrow="Why so early?"
            title={
              <>
                Why your baby should see a dentist <Squiggle color="var(--ff-lime)">before age one</Squiggle>
              </>
            }
          />
          <p className="ff-reveal ff-lead max-w-xl lg:justify-self-end">
            Early visits aren’t about fixing teeth – they’re about strong foundations, healthy habits, and catching issues early.
          </p>
        </div>
        <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-6 lg:gap-5">
          {whyEarly.map((reason, index) => (
            <li
              key={reason}
              className={`ff-reveal relative flex items-start gap-4 overflow-clip rounded-3xl p-5 sm:min-h-44 sm:flex-col sm:justify-between sm:gap-8 sm:p-7 ${brandWash[index % brandWash.length]} ${whySpans[index]}`}
              style={{ "--i": index % 3 } as CSSProperties}
            >
              <span aria-hidden="true" className={`grid size-10 shrink-0 place-items-center rounded-full font-display text-lg font-semibold text-ink ring-4 ring-white/70 sm:size-11 ${brandDot[index % brandDot.length]}`}>
                {index + 1}
              </span>
              <p className="relative max-w-sm pt-1 font-display text-lg font-semibold leading-snug text-ink sm:pt-0 sm:text-[1.4rem]">{reason}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* -------------------------------------------------------- The visit */}
      <Section tone="cream" labelledBy="baby-visit-steps-heading">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
          <SectionHeader
            id="baby-visit-steps-heading"
            eyebrow="What to expect"
            title={
              <>
                The visit, <em className="ff-italic font-normal">step by little step</em>
              </>
            }
          />
          <p className="ff-reveal ff-lead max-w-xl lg:justify-self-end">
            Intentionally quick, calm, and playful. We follow your child’s cues and celebrate every small win.
          </p>
        </div>
        <div className="mt-14">
          <StepTimeline steps={visitSteps} />
        </div>

        <div className="mt-20 grid gap-10 lg:mt-24 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,2fr)] lg:items-center lg:gap-14">
          <div className="ff-reveal">
            <h3 className="ff-h3">Real moments from a first visit</h3>
            <p className="mt-3 text-base leading-relaxed text-ink-soft">
              Stills from one of our reels: a toddler’s first exam on dad’s lap, a soft toothbrush cleaning, and plenty of high fives.
            </p>
            <a href="#dr-chuang-reels" className="ff-link mt-5 inline-flex min-h-11 items-center text-sm">
              Watch Dr. Chuang’s reels
            </a>
          </div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-5" aria-label="Photos from a toddler’s first visit">
            {visitPhotos.map((photo, index) => (
              <li key={photo.src} className={index % 2 === 1 ? "sm:mt-10" : undefined}>
                <PhoneFrame
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  caption={photo.caption}
                  index={index}
                  tilt={index % 2 ? "4deg" : "-4deg"}
                  sizes="(max-width: 639px) 44vw, (max-width: 1023px) 22vw, 200px"
                />
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* -------------------------------------------------------- Checklist */}
      <Section id="first-visit-checklist" labelledBy="checklist-heading">
        <div className="relative overflow-clip rounded-3xl bg-lime-wash px-5 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
            <div>
              <SectionHeader
                id="checklist-heading"
                eyebrow="Before you come"
                title={
                  <>
                    A checklist for <em className="ff-italic font-normal">the big day</em>
                  </>
                }
                lead="We tailor the visit to your child’s temperament – no pressure, no rush."
              />
              <p className="ff-reveal mt-6 max-w-sm text-sm leading-relaxed text-ink-soft">
                Want to talk through feeding challenges, special accommodations, or stroller access first?{" "}
                <PhoneLink location="babys_first_visit_checklist" className="ff-link">
                  Call (408) 358-8100
                </PhoneLink>
              </p>
              <div aria-hidden="true" className="-mb-10 mt-10 hidden h-28 items-end gap-2 sm:-mb-14 lg:flex lg:-mb-16">
                <ToothPerson color="var(--ff-periwinkle)" className="h-full w-auto -rotate-[4deg]" />
                <ToothPerson color="var(--ff-lime)" className="h-[54%] w-auto rotate-[8deg]" />
              </div>
            </div>
            <ol className="space-y-3 self-center" aria-label="First-visit checklist">
              {checklist.map((item, index) => (
                <li
                  key={item}
                  className="ff-reveal flex items-center gap-4 rounded-2xl bg-white px-5 py-4 ring-1 ring-ink/5 sm:px-6 sm:py-5"
                  style={{ "--i": index } as CSSProperties}
                >
                  <DrawnCheck tone="lime" className="size-10" />
                  <span className="text-[1.0625rem] font-semibold leading-snug text-ink">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------- Parent quote + promises */}
      <Section tone="periwinkle" labelledBy="baby-promises-heading">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          {parentReview ? (
            <figure className="ff-reveal relative self-start rounded-3xl bg-white p-7 ring-1 ring-border sm:p-10 lg:sticky lg:top-28">
              <ToothPerson color="var(--ff-lime)" className="pointer-events-none absolute -top-9 right-8 h-16 w-auto rotate-[8deg]" />
              <div className="flex items-center gap-3">
                <Stars className="text-lg" />
                <span className="text-sm font-bold text-ink">{parentReview.rating}.0 Google review</span>
              </div>
              <blockquote className="mt-6 font-display text-[1.45rem] font-medium leading-snug text-ink sm:text-[1.8rem]">
                “{typeset(parentReview.quote)}”
              </blockquote>
              <figcaption className="mt-7 flex items-center gap-3 border-t border-border pt-5">
                <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-lime font-display font-semibold text-ink">
                  {parentReview.name.charAt(0)}
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink">{parentReview.name}</span>
                  <span className="block text-sm text-ink-soft">{parentReview.patientLabel}</span>
                </span>
              </figcaption>
            </figure>
          ) : null}
          <div>
            <SectionHeader
              id="baby-promises-heading"
              eyebrow="Comfort & safety"
              title={
                <>
                  Gentle for babies, <em className="ff-italic font-normal">easy for parents</em>
                </>
              }
            />
            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {promises.map((promise, index) => (
                <li
                  key={promise}
                  className="ff-reveal flex items-start gap-3 rounded-2xl bg-white/80 p-4 ring-1 ring-ink/5 sm:p-5"
                  style={{ "--i": index % 2 } as CSSProperties}
                >
                  <span aria-hidden="true" className={`mt-1.5 size-3 shrink-0 rounded-full ${brandDot[index % brandDot.length]} ring-2 ring-ink/5`} />
                  <span className="text-base leading-snug text-ink">{promise}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------ Reels */}
      <Section id="dr-chuang-reels" labelledBy="dr-chuang-message-heading">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-14">
          <SectionHeader
            id="dr-chuang-message-heading"
            eyebrow="From our Instagram"
            title={
              <>
                A message from <em className="ff-italic font-normal">Dr. Tim J. Chuang</em>
              </>
            }
            lead="Two short reels from Dr. Chuang on what to expect and when to come in. They load from Instagram only when you press play."
          />
          <InstagramEmbedSection reels={reels} location="babys_first_visit_embed" />
        </div>
      </Section>

      {/* --------------------------------------------------- FAQs + cavities */}
      <Section tone="cream" labelledBy="parent-questions-heading">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
          <div>
            <SectionHeader id="parent-questions-heading" eyebrow="Good questions" title="Common questions parents ask" />
            <div className="ff-reveal mt-10">
              <PatientInfoFaqList faqs={parentFaqs} />
            </div>
          </div>
          <div className="ff-reveal-scale self-start rounded-3xl bg-white p-7 ring-1 ring-border sm:p-9 lg:mt-24">
            <h2 id="preventing-cavities-heading" className="ff-h3">
              Preventing cavities from the start
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-soft">
              Even babies can develop early childhood cavities. Here’s how to protect their smile:
            </p>
            <ol className="mt-6 space-y-3.5">
              {cavityTips.map((tip, index) => (
                <li key={tip} className="flex items-start gap-3.5">
                  <span
                    aria-hidden="true"
                    className={`grid size-7 shrink-0 place-items-center rounded-full font-display text-sm font-semibold text-ink ${brandDot[index % brandDot.length]}`}
                  >
                    {index + 1}
                  </span>
                  <span className="pt-0.5 text-base leading-snug text-ink">{tip}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------- Related */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <RelatedLinksSection title="Related services & resources" links={relatedLinks} />
      </div>

      {/* ---------------------------------------------------------- Closing */}
      <CtaBand
        id="baby-visit-cta-heading"
        eyebrow="Ages 0–3 welcome"
        title={
          <>
            Schedule your baby’s <em className="ff-italic font-normal text-lime">first visit</em>
          </>
        }
        body="Give your child the best start to lifelong oral health. We’re honored to help your family smile with confidence."
        actions={
          <>
            <Button asChild size="lg" variant="night" className="group h-14 pl-7 pr-5 text-base">
              <AppointmentLink href={buildAppointmentUrl({ serviceId: BOOKING_SERVICE, source: "baby_visit_final" })} source="babys_first_visit">
                Schedule Now
                <ArrowChip tone="night" />
              </AppointmentLink>
            </Button>
            <Button asChild size="lg" variant="night-outline" className="h-14 px-7 text-base">
              <PhoneLink location="babys_first_visit_cta">Call (408) 358-8100</PhoneLink>
            </Button>
          </>
        }
        note={
          <span className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-2">
            <span>{practiceHoursSummary}</span>
            <span aria-hidden="true" className="hidden sm:inline">
              ·
            </span>
            <PracticeAddressLink className="text-white/80 underline decoration-white/30 hover:text-white">{practiceInfo.addressText}</PracticeAddressLink>
            <span aria-hidden="true" className="hidden sm:inline">
              ·
            </span>
            <TrackedExternalLink
              href={practiceInfo.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              kind="map"
              location="babys_first_visit_cta"
              className="font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-lime"
            >
              Open in Google Maps<span className="sr-only"> (opens in a new tab)</span>
            </TrackedExternalLink>
          </span>
        }
      />
    </div>
  );
}
