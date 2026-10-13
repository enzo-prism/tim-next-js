"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { ToothPerson } from "@/components/brand/pinwheel";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { trackServiceLearnMoreClick } from "@/lib/analytics";

type Audience = {
  id: string;
  label: string;
  color: string;
  wash: string;
  size: string;
  title: string;
  body: string;
  facts: string[];
  links: { id: string; title: string; href: string; note: string }[];
};

const audiences: Audience[] = [
  {
    id: "kids",
    label: "Kids",
    color: "var(--ff-lime)",
    wash: "bg-lime-wash",
    size: "h-[62%]",
    title: "First visits that feel like play.",
    body: "Gentle, unhurried exams, habit-building that’s actually fun, and a rewards program with toys and stickers. Little ones can even start on a grown-up’s lap.",
    facts: ["Toys & stickers", "Sealants & fluoride", "Baby’s first visit"],
    links: [
      { id: "children-dentistry", title: "Children’s Dentistry", href: "/services/children-dentistry", note: "Gentle care for little smiles" },
      { id: "childrens-dentistry/babys-first-visit", title: "Baby’s First Visit", href: "/services/childrens-dentistry/babys-first-visit", note: "By the first birthday" },
      { id: "dental-hygiene", title: "Dental Hygiene", href: "/services/dental-hygiene", note: "Cleanings and coaching" },
    ],
  },
  {
    id: "teens",
    label: "Teens",
    color: "var(--ff-blush)",
    wash: "bg-blush-wash",
    size: "h-[78%]",
    title: "Confident smiles that fit busy schedules.",
    body: "Clear Invisalign aligners planned from a quick iTero digital scan instead of messy impression trays, plus checkups that keep growing smiles on track.",
    facts: ["Clear aligners", "3D digital scans", "No putty trays"],
    links: [
      { id: "invisalign", title: "Invisalign", href: "/services/invisalign", note: "Clear aligners, personal plan" },
      { id: "itero-digital-scanner", title: "iTero Digital Scanner", href: "/technology/itero-digital-scanner", note: "A 3D scan in minutes" },
      { id: "dental-exams", title: "Dental Exams", href: "/services/dental-exams", note: "Checkups and X-rays" },
    ],
  },
  {
    id: "adults",
    label: "Adults",
    color: "var(--ff-periwinkle)",
    wash: "bg-periwinkle-wash",
    size: "h-[92%]",
    title: "Care that explains every step.",
    body: "Thorough exams, cleanings, crowns, whitening, and jaw-pain care from a dentist who listens first, walks you through your options, and never rushes.",
    facts: ["Clear options", "No pressure", "Comfort first"],
    links: [
      { id: "family-dentistry", title: "General & Family Dentistry", href: "/services/family-dentistry", note: "Your everyday dental home" },
      { id: "dental-crowns", title: "Dental Crowns", href: "/services/dental-crowns", note: "Protect a weak tooth" },
      { id: "teeth-whitening", title: "Teeth Whitening", href: "/services/teeth-whitening", note: "A brighter, safe shade" },
      { id: "tmj", title: "TMJ Treatment", href: "/tmj", note: "Jaw pain and clicking" },
    ],
  },
  {
    id: "grandparents",
    label: "Grandparents",
    color: "var(--ff-cloud)",
    wash: "bg-cloud-wash",
    size: "h-[86%]",
    title: "Comfortable care for lasting smiles.",
    body: "Restorative care that protects the teeth you have, from crowns to night guards to gentle cleanings, with time for every question along the way.",
    facts: ["Gentle pace", "Lasting repairs", "Time for questions"],
    links: [
      { id: "restorative-dentistry", title: "Restorative Dentistry", href: "/services/restorative-dentistry", note: "Repair and protect" },
      { id: "night-guards", title: "Night Guards", href: "/services/night-guards", note: "For grinding and clenching" },
      { id: "dental-hygiene", title: "Dental Hygiene", href: "/services/dental-hygiene", note: "Healthy gums at every age" },
    ],
  },
];

/**
 * "Who's coming in?" — pick a family member and see the care that fits.
 * The server renders the first panel, so the section is complete without JS.
 */
export function AudienceTabs({ trackingLocation = "home_audience" }: { trackingLocation?: string }) {
  const [value, setValue] = useState(audiences[0].id);
  const listRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const active = list.querySelector<HTMLElement>('[data-state="active"]');
      if (active) setIndicator({ left: active.offsetLeft, width: active.offsetWidth });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [value]);

  return (
    <TabsPrimitive.Root value={value} onValueChange={setValue} className="w-full">
      <div className="flex justify-center">
        <TabsPrimitive.List
          ref={listRef}
          aria-label="Choose a family member"
          data-ready={indicator ? "" : undefined}
          className="group/list relative inline-flex rounded-full bg-white p-1.5 ring-1 ring-border"
        >
          <span
            aria-hidden="true"
            className="absolute inset-y-1.5 left-0 rounded-full bg-ink opacity-0 transition-[translate,width] duration-500 ease-[var(--ease-spring)] group-data-[ready]/list:opacity-100 motion-reduce:transition-none"
            style={indicator ? { width: indicator.width, translate: `${indicator.left}px 0` } : undefined}
          />
          {audiences.map((audience) => (
            <TabsPrimitive.Trigger
              key={audience.id}
              value={audience.id}
              className="relative z-[1] inline-flex min-h-11 items-center gap-2 rounded-full px-3.5 text-sm font-bold text-ink-soft transition-colors duration-300 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=active]:bg-ink data-[state=active]:text-white group-data-[ready]/list:data-[state=active]:bg-transparent sm:px-5 sm:text-[0.95rem]"
            >
              <span aria-hidden="true" className="hidden size-2.5 rounded-full sm:block" style={{ background: audience.color }} />
              {audience.label}
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>
      </div>

      {audiences.map((audience) => (
        <TabsPrimitive.Content key={audience.id} value={audience.id} className="ff-panel mt-10 focus-visible:outline-none">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8">
            <div className={cn("relative flex min-h-[18rem] items-end justify-center overflow-hidden rounded-3xl px-6 pt-10 sm:min-h-[22rem]", audience.wash)}>
              <span aria-hidden="true" className="absolute left-1/2 top-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60" />
              <span aria-hidden="true" className={cn("ff-intro-pop relative flex items-end", audience.size)} style={{ "--d": 80 } as CSSProperties}>
                <ToothPerson color={audience.color} className="h-full w-auto drop-shadow-sm" />
              </span>
              <ul className="absolute inset-x-4 top-4 flex flex-wrap gap-2" aria-label={`${audience.label}: highlights`}>
                {audience.facts.map((fact, index) => (
                  <li key={fact} className="ff-chip ff-intro-pop text-xs sm:text-sm" style={{ "--d": 200 + index * 90 } as CSSProperties}>
                    {fact}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col justify-center rounded-3xl bg-white p-6 ring-1 ring-border sm:p-9">
              <h3 className="ff-h3 text-[clamp(1.6rem,1.3rem+1vw,2.25rem)]">{audience.title}</h3>
              <p className="mt-4 text-lg leading-relaxed text-ink-soft">{audience.body}</p>
              <ul className="mt-7 divide-y divide-border border-y border-border">
                {audience.links.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      onClick={() => trackServiceLearnMoreClick(link.id, trackingLocation)}
                      className="group flex min-h-14 items-center justify-between gap-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span>
                        <span className="block font-bold text-ink transition-colors group-hover:text-cobalt">{link.title}</span>
                        <span className="block text-sm text-ink-soft">{link.note}</span>
                      </span>
                      <span aria-hidden="true" className="ff-arrow grid size-9 shrink-0 place-items-center rounded-full bg-cream text-ink transition-colors group-hover:bg-cobalt group-hover:text-white">
                        <MinimalGlyph name="arrow-right" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
