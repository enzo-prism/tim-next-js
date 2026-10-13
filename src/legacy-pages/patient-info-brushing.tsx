import type { CSSProperties } from "react";
import { Section, SectionHeader } from "@/components/site/section";
import { Squiggle } from "@/components/brand/squiggle";
import { BrushAlongTimer } from "@/components/guides/brush-along-timer";
import { BrushingArt, SizedTooth } from "@/components/guides/guide-art";
import { DotList, GuideClosing, HabitTrio, OralHealthHero, RelatedReading } from "@/components/guides/oral-health";
import { cn } from "@/lib/utils";

const SOURCE = "patient_info_brushing";

const technique = [
  "Place the brush at a 45-degree angle toward the gumline.",
  "Use small, gentle circles instead of hard back-and-forth scrubbing.",
  "Brush outer, inner, and chewing surfaces of every tooth.",
  "Spend extra time on the back molars where plaque builds up.",
  "Brush your tongue to reduce bacteria and freshen breath.",
  "Spit after brushing and avoid rinsing to keep fluoride working.",
];

const ageGuidance = [
  { age: "Under 3", detail: "Use a smear of fluoride toothpaste.", scale: 0.62, color: "var(--ff-lime)" },
  { age: "Ages 3–6", detail: "Use a pea-sized amount and supervise.", scale: 0.8, color: "var(--ff-blush)" },
  { age: "Ages 7+", detail: "Encourage independence but check for thoroughness.", scale: 1, color: "var(--ff-periwinkle)" },
];

const mistakes = [
  "Scrubbing too hard, which can irritate gums.",
  "Skipping the gumline and back teeth.",
  "Not replacing your brush every 3 months.",
];

const stepColors = ["bg-periwinkle", "bg-blush", "bg-lime", "bg-cloud", "bg-periwinkle", "bg-blush"];

export default function PatientInfoBrushing() {
  return (
    <div className="overflow-x-clip">
      <OralHealthHero
        title="How to Brush Properly"
        lead="Gentle, consistent brushing protects enamel, keeps gums healthy, and prevents cavities. Use these steps to make every brushing session effective."
        tone="cloud"
        art={<BrushingArt />}
        chips={["Two minutes, twice a day", "Soft bristles"]}
        source={SOURCE}
      />

      <HabitTrio
        id="brushing-habits-heading"
        eyebrow="The basics"
        title="Three habits that do the heavy lifting"
        habits={[
          { big: "2×", title: "Brush twice daily", description: "Aim for morning and night, about two minutes each time." },
          { big: "Soft", title: "Use a soft brush", description: "Soft bristles protect gums while still removing plaque." },
          { big: "Pea-size", title: "Fluoride matters", description: "A smear or pea-sized amount strengthens enamel." },
        ]}
      />

      {/* ------------------------------------------------ Brush along */}
      <Section tone="cream" labelledBy="brush-along-heading">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
          <SectionHeader
            id="brush-along-heading"
            eyebrow="Brush along"
            title={
              <>
                Two minutes, <Squiggle>four</Squiggle> little zones
              </>
            }
            lead="Two minutes can feel long, especially to little ones. Press start and brush each quarter of the mouth for 30 seconds while the circle fills. Pause any time."
          />
          <BrushAlongTimer className="ff-reveal shadow-float" />
        </div>
      </Section>

      {/* ------------------------------------------------ Technique */}
      <Section labelledBy="brushing-technique-heading">
        <SectionHeader id="brushing-technique-heading" eyebrow="Technique" title="Step-by-Step Technique" />
        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {technique.map((step, index) => (
            <li
              key={step}
              className="ff-reveal flex gap-4 rounded-3xl border border-border bg-white p-6 sm:p-7"
              style={{ "--i": index % 3 } as CSSProperties}
            >
              <span aria-hidden="true" className={cn("grid size-11 shrink-0 place-items-center rounded-full font-display text-lg font-semibold text-ink", stepColors[index])}>
                {index + 1}
              </span>
              <p className="pt-1.5 text-base leading-relaxed text-ink">
                <span className="sr-only">Step {index + 1}: </span>
                {step}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {/* ------------------------------------------------ Ages + mistakes */}
      <Section tone="lime" labelledBy="brushing-ages-heading">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-10">
          <div>
            <SectionHeader id="brushing-ages-heading" eyebrow="For every age" title="Age-Based Guidance" />
            <ul className="mt-10 grid gap-3 sm:grid-cols-3 sm:items-end sm:gap-4">
              {ageGuidance.map((group, index) => (
                <li key={group.age} className="ff-reveal flex h-full items-center gap-4 rounded-3xl bg-white p-4 ring-1 ring-ink/5 sm:flex-col sm:items-stretch sm:gap-0 sm:p-6" style={{ "--i": index } as CSSProperties}>
                  <SizedTooth color={group.color} scale={group.scale} className="h-20 w-auto shrink-0 sm:mx-auto sm:h-28" />
                  <div className="sm:mt-4">
                    <h3 className="font-display text-lg font-semibold text-ink sm:text-xl">{group.age}</h3>
                    <p className="mt-1 text-base leading-relaxed text-ink-soft">{group.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="ff-reveal self-end rounded-3xl bg-white p-7 ring-1 ring-ink/5 sm:p-8" style={{ "--i": 1 } as CSSProperties}>
            <h2 className="ff-h3">Common Mistakes to Avoid</h2>
            <DotList className="mt-6" items={mistakes} start={1} />
          </div>
        </div>
      </Section>

      <RelatedReading
        links={[
          { href: "/patient-info/flossing", title: "Flossing Fundamentals", description: "Learn the technique that keeps gums healthy and prevents decay." },
          { href: "/patient-info/nutrition", title: "Nutrition for Healthy Teeth", description: "Build strong teeth with smart snack choices and hydration." },
          {
            href: "/blog/why-does-my-child-have-bad-breath-even-after-brushing-los-gatos",
            title: "Child Bad Breath After Brushing",
            description: "Learn common causes and when persistent bad breath deserves a dental visit.",
          },
        ]}
      />

      <GuideClosing
        title={
          <>
            Need personalized <em className="ff-italic font-normal text-lime">guidance?</em>
          </>
        }
        body="If brushing causes sensitivity or bleeding, we can help. Schedule a visit to review technique and oral health needs."
        source={SOURCE}
        secondary={{ href: "/services/dental-exams", label: "Learn about exams" }}
      />
    </div>
  );
}
