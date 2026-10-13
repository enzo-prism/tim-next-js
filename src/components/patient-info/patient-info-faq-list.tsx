import React from "react";
import { patientInfoFaqs } from "@/content/patient-info-faqs";
import type { FAQItem } from "@/lib/types";

export default function PatientInfoFaqList({ faqs = patientInfoFaqs }: { faqs?: readonly FAQItem[] }) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-white">
      {faqs.map((faq) => (
        <details key={faq.id} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-base font-bold text-ink transition-colors hover:bg-cream/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-7 sm:text-lg [&::-webkit-details-marker]:hidden">
            <span>{faq.question}</span>
            <span aria-hidden="true" className="relative grid size-9 shrink-0 place-items-center rounded-full bg-cream transition-colors group-open:bg-ink">
              <span className="absolute h-0.5 w-3.5 rounded-full bg-ink transition-colors group-open:bg-white" />
              <span className="absolute h-3.5 w-0.5 rounded-full bg-ink transition-[rotate,background-color] duration-300 group-open:rotate-90 group-open:bg-white motion-reduce:transition-none" />
            </span>
          </summary>
          <p className="px-5 pb-6 pt-1 text-base leading-relaxed text-ink-soft sm:px-7">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
