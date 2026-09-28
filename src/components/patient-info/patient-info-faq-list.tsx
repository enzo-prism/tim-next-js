"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { patientInfoFaqs } from "@/content/patient-info-faqs";

export default function PatientInfoFaqList() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {patientInfoFaqs.map((faq) => (
        <div key={faq.id} className="border-b border-gray-200 pb-4 last:border-b-0">
          <h3>
            <Button
              id={`faq-trigger-${faq.id}`}
              type="button"
              variant="ghost"
              className="flex h-auto min-h-11 w-full items-center justify-between whitespace-normal p-0 py-3 text-left font-semibold text-gray-800 hover:text-primary"
              aria-expanded={expandedFAQ === faq.id}
              aria-controls={`faq-panel-${faq.id}`}
              onClick={() => toggleFAQ(faq.id)}
            >
              <span>{faq.question}</span>
              <MinimalGlyph
                name="chevron-down"
                aria-hidden="true"
                className={`h-4 w-4 shrink-0 transform transition-transform ${
                  expandedFAQ === faq.id ? "rotate-180" : ""
                }`}
              />
            </Button>
          </h3>
          {expandedFAQ === faq.id && (
            <div
              id={`faq-panel-${faq.id}`}
              role="region"
              aria-labelledby={`faq-trigger-${faq.id}`}
              className="mt-3 text-gray-600"
            >
              <p>{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
