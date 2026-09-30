import React from "react";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { patientInfoFaqs } from "@/content/patient-info-faqs";
import type { FAQItem } from "@/lib/types";

export default function PatientInfoFaqList({ faqs = patientInfoFaqs }: { faqs?: readonly FAQItem[] }) {
  return (
    <div className="space-y-2">
      {faqs.map((faq) => (
        <details key={faq.id} className="group border-b border-border pb-2 last:border-b-0">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-md py-3 font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
            <span>{faq.question}</span>
            <MinimalGlyph name="chevron-down" aria-hidden="true" className="h-4 w-4 shrink-0 group-open:rotate-180" />
          </summary>
          <p className="pb-3 pt-1 leading-relaxed text-muted-foreground">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
