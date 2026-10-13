import type { CSSProperties, ReactNode } from "react";
import { PageHero } from "@/components/site/page-hero";
import { Eyebrow } from "@/components/site/section";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
 * Internal type specimen (unlinked, noindex): the site's two typefaces, the
 * type scale, weights, the Fraunces soft axis, and numerals.
 */

const weights = [
  { value: 300, name: "Light" },
  { value: 400, name: "Regular" },
  { value: 500, name: "Medium" },
  { value: 600, name: "Semibold" },
  { value: 700, name: "Bold" },
  { value: 800, name: "Extra bold" },
  { value: 900, name: "Black" },
];

const scale = [
  { name: "ff-display", note: "Home hero · 42–84px", className: "ff-display", sample: "A gentle family dentist" },
  { name: "ff-h1", note: "Page titles · 38–68px", className: "ff-h1", sample: "Care for every smile" },
  { name: "ff-h2", note: "Section titles · 31–52px", className: "ff-h2", sample: "Who’s coming in today?" },
  { name: "ff-h3", note: "Card titles · 22–28px", className: "ff-h3", sample: "Baby’s first visit" },
  { name: "ff-lead", note: "Intro paragraphs · 17–21px", className: "ff-lead", sample: "Calm, unhurried dental care for your whole family." },
  { name: "body", note: "Figtree · 17px", className: "text-[17px] leading-relaxed text-ink-soft", sample: "Blankets, water, and something to watch while you relax." },
  { name: "small", note: "Figtree · 14px medium", className: "text-sm font-medium text-ink-soft", sample: "Mon–Thu, 9 AM–5 PM · 15251 National Ave, Suite 102" },
];

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 & ! ? “ ” ‘ ’ — – · ( )";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2 border-t border-border py-6 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-baseline sm:gap-8">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">{label}</p>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export default function FontTest() {
  return (
    <div className="overflow-x-clip">
      <PageHero
        id="font-test-heading"
        tone="lime"
        art="pinwheel"
        eyebrow="Type specimen"
        titleText="Fraunces & Figtree"
        lead={
          <p>
            The two typefaces behind Family First Smile Care: Fraunces, a soft and friendly serif for headlines, and
            Figtree, a clear geometric sans for reading, buttons, and forms.
          </p>
        }
      />

      <section aria-labelledby="faces-heading" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="faces-heading" className="sr-only">
            The two faces
          </h2>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl bg-cream p-7 sm:p-10">
              <p className="font-display text-[clamp(6rem,4rem+8vw,11rem)] font-semibold leading-none text-ink">
                A<em className="ff-italic font-normal text-cobalt">a</em>
              </p>
              <p className="mt-6 font-display text-3xl font-semibold text-ink">Fraunces</p>
              <p className="mt-2 text-base text-ink-soft">Display · page and section titles, pull quotes, big numbers</p>
              <p className="mt-4 text-sm font-semibold text-ink">Weight 100–900 · Soft axis 0–100 · Optical size · Italic</p>
            </div>
            <div className="rounded-3xl bg-white p-7 ring-1 ring-border sm:p-10">
              <p className="font-sans text-[clamp(6rem,4rem+8vw,11rem)] font-semibold leading-none tracking-[-0.04em] text-ink">
                A<span className="text-cobalt">a</span>
              </p>
              <p className="mt-6 font-sans text-3xl font-bold text-ink">Figtree</p>
              <p className="mt-2 text-base text-ink-soft">Text and UI · body copy, buttons, labels, navigation, forms</p>
              <p className="mt-4 text-sm font-semibold text-ink">Weight 300–900 · Lining numerals</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="scale-heading" className="bg-cream py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Eyebrow className="mb-4">Scale</Eyebrow>
          <h2 id="scale-heading" className="ff-h2 mb-10">
            The type scale
          </h2>
          {scale.map((item) => (
            <Row key={item.name} label={`${item.name} · ${item.note}`}>
              <p className={item.className}>{item.sample}</p>
            </Row>
          ))}
          <Row label="ff-eyebrow · 12px caps">
            <Eyebrow>Care for every age</Eyebrow>
          </Row>
        </div>
      </section>

      <section aria-labelledby="weights-heading" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Eyebrow className="mb-4">Weights</Eyebrow>
          <h2 id="weights-heading" className="ff-h2 mb-10">
            Every weight, both faces
          </h2>
          <div className="grid gap-x-14 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 font-display text-xl font-semibold text-ink">Fraunces</h3>
              {weights.map((weight) => (
                <Row key={weight.value} label={`${weight.value} · ${weight.name}`}>
                  <p className="font-display text-3xl leading-tight text-ink" style={{ fontWeight: weight.value }}>
                    Every smile in the family
                  </p>
                </Row>
              ))}
              <Row label="Italic · soft">
                <p className="ff-italic font-display text-3xl font-normal leading-tight text-ink">gentle, unhurried, kind</p>
              </Row>
            </div>
            <div>
              <h3 className="mb-2 mt-12 font-sans text-xl font-bold text-ink lg:mt-0">Figtree</h3>
              {weights.map((weight) => (
                <Row key={weight.value} label={`${weight.value} · ${weight.name}`}>
                  <p className="font-sans text-2xl leading-tight text-ink" style={{ fontWeight: weight.value }}>
                    Request an appointment
                  </p>
                </Row>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="soft-heading" className="bg-lime-wash py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Eyebrow className="mb-4">Soft axis</Eyebrow>
          <h2 id="soft-heading" className="ff-h2 mb-10">
            Why the headlines feel friendly
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            {[0, 100].map((soft) => (
              <div key={soft} className="rounded-3xl bg-white p-7 ring-1 ring-border sm:p-9">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">SOFT {soft}</p>
                <p
                  className="mt-4 font-display text-[clamp(3rem,2rem+4vw,5rem)] font-semibold leading-none text-ink"
                  style={{ fontVariationSettings: `"SOFT" ${soft}` } as CSSProperties}
                >
                  Smile
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="numerals-heading" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Eyebrow className="mb-4">Details</Eyebrow>
          <h2 id="numerals-heading" className="ff-h2 mb-10">
            Numerals and characters
          </h2>
          <Row label="Lining numerals">
            <p className="text-2xl font-semibold text-ink">(408) 358-8100 · Mon–Thu, 9 AM–5 PM · 5.0 on Google</p>
          </Row>
          <Row label="Fraunces set">
            <p className="break-words font-display text-2xl leading-relaxed text-ink">{characters}</p>
          </Row>
          <Row label="Figtree set">
            <p className="break-words font-sans text-2xl leading-relaxed text-ink">{characters}</p>
          </Row>
          <Row label="Together">
            <div className="max-w-md rounded-3xl bg-white p-7 ring-1 ring-border">
              <Eyebrow className="mb-3">New here?</Eyebrow>
              <p className="ff-h3">
                A calmer <em className="ff-italic font-normal">checkup</em>
              </p>
              <p className="mt-3 text-base leading-relaxed text-ink-soft">
                Blankets, water, and something to watch. Dr. Chuang explains what he sees as he goes.
              </p>
              <span className={cn(buttonVariants({ size: "lg" }), "mt-6")}>Request an appointment</span>
            </div>
          </Row>
        </div>
      </section>
    </div>
  );
}
