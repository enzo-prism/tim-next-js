import type { CSSProperties } from "react";
import { Section, SectionHeader } from "@/components/site/section";
import { StepTimeline } from "@/components/site/step-timeline";
import { ToothPerson } from "@/components/brand/pinwheel";
import { FlossingArt, FlossToolArt, type FlossTool } from "@/components/guides/guide-art";
import { GuideClosing, HabitTrio, OralHealthHero, RelatedReading } from "@/components/guides/oral-health";
import { cn } from "@/lib/utils";

const SOURCE = "patient_info_flossing";

const options: { title: string; detail: string; tone: string; tool: FlossTool }[] = [
  { title: "String floss", detail: "Waxed or unwaxed string floss.", tone: "bg-periwinkle-wash", tool: "string" },
  { title: "Floss picks", detail: "Floss picks for on-the-go convenience.", tone: "bg-blush-wash", tool: "pick" },
  { title: "Water flossers", detail: "Water flossers for braces or sensitive gums.", tone: "bg-lime-wash", tool: "water" },
];

export default function PatientInfoFlossing() {
  return (
    <div className="overflow-x-clip">
      <OralHealthHero
        title="Flossing Fundamentals"
        lead="Flossing cleans the tight spaces your toothbrush cannot reach. Just a minute a day helps prevent cavities and gum inflammation."
        tone="blush"
        art={<FlossingArt />}
        chips={["Once a day", "About 18 inches"]}
        source={SOURCE}
      />

      <HabitTrio
        id="flossing-habits-heading"
        eyebrow="The basics"
        title="Small string, big difference"
        habits={[
          { big: "18″", title: "Use enough floss", description: "About 18 inches gives you a clean section for each tooth." },
          { big: "C", title: "Gentle C-shape", description: "Curve the floss around the tooth and slide up and down." },
          { big: "1×", title: "Daily habit", description: "Once per day is enough to remove plaque between teeth." },
        ]}
      />

      {/* ------------------------------------------------ Technique */}
      <Section tone="cream" labelledBy="flossing-steps-heading">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
          <SectionHeader
            id="flossing-steps-heading"
            eyebrow="Technique"
            title={
              <>
                Step-by-Step <em className="ff-italic font-normal">Flossing</em>
              </>
            }
          />
          <p className="ff-reveal ff-lead max-w-xl lg:justify-self-end">
            Go slowly the first few times. Once the motion feels familiar, the whole mouth takes about a minute.
          </p>
        </div>
        <div className="mt-14">
          <StepTimeline
            steps={[
              { title: "Wrap and hold", body: "Wrap floss around your middle fingers, leaving 1-2 inches to work with." },
              { title: "Glide in gently", body: "Guide the floss between teeth using a gentle sawing motion." },
              {
                title: "Hug the tooth",
                body: "Curve the floss into a C shape against one tooth, then slide up and down to clean below the gumline.",
              },
              {
                title: "Move along",
                body: "Repeat for the neighboring tooth, then move to a fresh section. Floss behind the last molars and around any dental work.",
              },
            ]}
          />
        </div>
      </Section>

      {/* ------------------------------------------------ Gums + options */}
      <Section labelledBy="flossing-options-heading">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
          <aside aria-labelledby="flossing-bleed-heading" className="ff-reveal relative overflow-clip rounded-3xl bg-night p-7 pb-12 text-white sm:p-9 sm:pb-14 lg:self-start">
            <ToothPerson color="var(--ff-blush)" className="pointer-events-none absolute -bottom-10 -right-5 h-28 w-auto rotate-[-10deg] opacity-90" />
            <p className="ff-eyebrow text-periwinkle">Good to know</p>
            <h2 id="flossing-bleed-heading" className="ff-h3 mt-3 text-white">
              If Your Gums Bleed
            </h2>
            <p className="relative mt-4 max-w-md text-base leading-relaxed text-white/80">
              Mild bleeding can be normal if you are new to flossing. It should improve within one to two weeks.
            </p>
            <p className="relative mt-3 max-w-md pr-14 text-base leading-relaxed text-white/80 sm:pr-20">
              Persistent bleeding, swelling, or pain can be a sign of gum disease. Schedule a visit so we can help.
            </p>
          </aside>
          <div>
            <SectionHeader id="flossing-options-heading" eyebrow="Find your tool" title="Flossing Options" lead="The best floss is the one you’ll use every day." />
            <ul className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {options.map((option, index) => (
                <li
                  key={option.title}
                  className={cn("ff-reveal flex items-center gap-4 rounded-3xl p-5 sm:flex-col sm:items-start lg:flex-row lg:items-center xl:flex-col xl:items-start", option.tone)}
                  style={{ "--i": index } as CSSProperties}
                >
                  <FlossToolArt kind={option.tool} className="size-20 shrink-0" />
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink">{option.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{option.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <RelatedReading
        links={[
          { href: "/patient-info/brushing", title: "How to Brush Properly", description: "Master the brushing basics that keep enamel strong." },
          { href: "/patient-info/nutrition", title: "Nutrition for Healthy Teeth", description: "See which foods help protect your smile." },
          {
            href: "/blog/bleeding-gums-when-flossing-los-gatos",
            title: "Why Gums Bleed When You Floss",
            description: "What is normal, what is not, and when to schedule a visit.",
          },
        ]}
      />

      <GuideClosing
        title={
          <>
            Need help with <em className="ff-italic font-normal text-lime">technique?</em>
          </>
        }
        body="We can demonstrate flossing during your cleaning and recommend the best tools for your needs."
        source={SOURCE}
        secondary={{ href: "/services/dental-hygiene", label: "Learn about hygiene visits" }}
      />
    </div>
  );
}
