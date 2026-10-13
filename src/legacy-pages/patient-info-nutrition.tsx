import type { CSSProperties } from "react";
import { Section, SectionHeader } from "@/components/site/section";
import { Squiggle } from "@/components/brand/squiggle";
import { NutritionArt, SizedTooth } from "@/components/guides/guide-art";
import { DotList, GuideClosing, HabitTrio, OralHealthHero, RelatedReading } from "@/components/guides/oral-health";
import { cn } from "@/lib/utils";

const SOURCE = "patient_info_nutrition";

const snackIdeas = ["Cheese cubes with apple slices.", "Greek yogurt with berries.", "Celery with nut butter."];

const foodsToLimit = [
  "Sugary snacks, sodas, and sports drinks.",
  "Sticky candies that cling to teeth.",
  "Frequent grazing that keeps acid levels high.",
  "Acidic drinks like citrus juice or energy drinks.",
];

const habits = [
  "Pair sweets with meals instead of snacking all day.",
  "Rinse with water after acidic drinks or snacks.",
  "Choose sugar-free gum to boost saliva between meals.",
];

function FoodColumn({
  id,
  eyebrow,
  title,
  items,
  tone,
  tooth,
  tilt,
  index,
}: {
  id: string;
  eyebrow: string;
  title: string;
  items: string[];
  tone: "lime" | "blush";
  tooth: string;
  tilt: string;
  index: number;
}) {
  return (
    <article
      aria-labelledby={id}
      className={cn("ff-reveal relative flex flex-col overflow-clip rounded-3xl p-7 sm:p-9", tone === "lime" ? "bg-lime" : "bg-blush")}
      style={{ "--i": index } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink/70">{eyebrow}</p>
          <h3 id={id} className="ff-h3 mt-2">
            {title}
          </h3>
        </div>
        <SizedTooth color={tooth} scale={1} className={cn("h-20 w-auto shrink-0 sm:h-24", tilt)} />
      </div>
      <ul className="mt-7 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="rounded-2xl bg-white/75 px-4 py-3.5 text-base font-semibold leading-snug text-ink ring-1 ring-ink/5">
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function PatientInfoNutrition() {
  return (
    <div className="overflow-x-clip">
      <OralHealthHero
        title="Nutrition for Healthy Teeth"
        lead="What you eat and drink affects your enamel, gums, and overall oral health. Use these tips to build tooth-friendly habits."
        tone="lime"
        art={<NutritionArt />}
        chips={["Crunchy produce helps", "Water rinses acids"]}
        source={SOURCE}
      />

      <HabitTrio
        id="nutrition-habits-heading"
        eyebrow="The basics"
        title="Three easy wins for every plate"
        habits={[
          { big: "Calcium", title: "Choose calcium-rich foods", description: "Dairy, fortified alternatives, and leafy greens strengthen enamel." },
          { big: "Crunch", title: "Crunchy produce helps", description: "Apples, carrots, and celery increase saliva and gently clean teeth." },
          { big: "Water", title: "Hydrate often", description: "Water rinses acids and keeps the mouth balanced." },
        ]}
      />

      {/* ------------------------------------------------ Snack face-off */}
      <Section tone="cream" labelledBy="nutrition-snacks-heading">
        <SectionHeader
          id="nutrition-snacks-heading"
          eyebrow="Snack time"
          align="center"
          title={
            <>
              Tooth-friendly <Squiggle color="var(--ff-blush)">or</Squiggle> sticky?
            </>
          }
          lead="A quick guide for lunchboxes, after-school snacks, and the grown-up desk drawer."
        />
        <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-2">
          <FoodColumn
            id="nutrition-friendly-heading"
            eyebrow="Reach for these"
            title="Smile-Friendly Snack Ideas"
            items={snackIdeas}
            tone="lime"
            tooth="var(--ff-periwinkle)"
            tilt="rotate-[6deg]"
            index={0}
          />
          <FoodColumn
            id="nutrition-limit-heading"
            eyebrow="Save for mealtimes"
            title="Foods to Limit"
            items={foodsToLimit}
            tone="blush"
            tooth="var(--ff-cloud)"
            tilt="-rotate-[10deg]"
            index={1}
          />
        </div>
      </Section>

      {/* ------------------------------------------------ Habits */}
      <Section labelledBy="nutrition-daily-heading">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <SectionHeader
            id="nutrition-daily-heading"
            eyebrow="Every day"
            title="Smart Daily Habits"
            lead="It’s not only what you eat, it’s how often. Give teeth a break between snacks so saliva can do its work."
          />
          <div className="ff-reveal rounded-3xl bg-white p-7 ring-1 ring-border sm:p-9">
            <DotList items={habits} />
          </div>
        </div>
      </Section>

      <RelatedReading
        links={[
          { href: "/patient-info/brushing", title: "How to Brush Properly", description: "Master the brushing basics for healthier gums." },
          { href: "/patient-info/flossing", title: "Flossing Fundamentals", description: "Build the daily flossing habit that prevents decay." },
          {
            href: "/blog/why-does-my-child-keep-getting-cavities-los-gatos",
            title: "Why Kids Keep Getting Cavities",
            description: "Common reasons cavities keep coming back, and what helps.",
          },
        ]}
      />

      <GuideClosing
        title={
          <>
            Questions about diet and <em className="ff-italic font-normal text-lime">oral health?</em>
          </>
        }
        body="We can help you build a personalized nutrition plan that supports long-term oral health."
        source={SOURCE}
        secondary={{ href: "/services/family-dentistry", label: "Learn about family care" }}
      />
    </div>
  );
}
