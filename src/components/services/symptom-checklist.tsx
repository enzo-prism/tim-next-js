import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { ToothPerson } from "@/components/brand/pinwheel";

/**
 * "Does this sound familiar?" A tappable symptom list. It is plain checkboxes
 * plus CSS (`:has(:checked)` and a CSS counter), so it costs no JavaScript and
 * still reads as a simple list without styles.
 */
export function SymptomChecklist({ symptoms, title }: { symptoms: string[]; title: string }) {
  return (
    <div role="group" aria-labelledby="tmj-symptoms-heading" className="group/check relative rounded-3xl bg-white p-6 ring-1 ring-border [counter-reset:symptoms] sm:p-8">
      <ToothPerson color="var(--ff-blush)" className="pointer-events-none absolute -top-8 right-6 h-20 w-auto rotate-[8deg] transition-[rotate,translate] duration-500 ease-[var(--ease-spring)] group-has-[:checked]/check:-translate-y-2 group-has-[:checked]/check:rotate-[-6deg] motion-reduce:transition-none" />
      <h3 id="tmj-symptoms-heading" className="ff-h3 pr-16">
        {title}
      </h3>
      <p className="mt-2 text-sm font-semibold text-ink-soft">Tap any that sound familiar.</p>
      <ul className="mt-5 space-y-2">
        {symptoms.map((symptom) => (
          <li key={symptom}>
            <label className="flex min-h-13 cursor-pointer items-center gap-3 rounded-2xl bg-paper px-4 py-3 ring-1 ring-border transition-colors hover:ring-ink/25 has-[:checked]:bg-blush-wash has-[:checked]:ring-ink/20 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring">
              <input type="checkbox" name="tmj-symptom" value={symptom} className="peer sr-only checked:[counter-increment:symptoms]" />
              <span
                aria-hidden="true"
                className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-sm text-transparent ring-1 ring-ink/20 transition-[background-color,color,scale] duration-300 ease-[var(--ease-spring)] peer-checked:scale-110 peer-checked:bg-ink peer-checked:text-white peer-checked:ring-ink motion-reduce:transition-none"
              >
                <MinimalGlyph name="check" />
              </span>
              <span className="text-base font-semibold text-ink">{symptom}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-5 rounded-2xl bg-cream px-5 py-4 text-sm leading-relaxed text-ink-soft">
        <p className="group-has-[:checked]/check:hidden">
          Jaw pain, headaches, and clicking can have several causes. An exam is the best way to find out what is going on.
        </p>
        <p className="hidden group-has-[:checked]/check:block">
          <span aria-hidden="true" className="mr-1 font-display text-lg font-semibold text-ink after:content-[counter(symptoms)]" />
          <span aria-hidden="true" className="font-semibold text-ink">
            of {symptoms.length} sound familiar.{" "}
          </span>
          These are worth mentioning at a TMJ consultation, so Dr. Chuang can look at your jaw and bite together with you.
        </p>
      </div>
    </div>
  );
}
