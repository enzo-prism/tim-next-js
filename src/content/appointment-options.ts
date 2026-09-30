import type { leadServiceIds } from "@/content/form-schemas";

export const appointmentServiceLabels: Record<(typeof leadServiceIds)[number], string> = {
  "not-sure": "Help me choose",
  "tooth-pain": "Tooth pain or a dental concern",
  "dental-exams": "Checkup and exam",
  "dental-hygiene": "Cleaning and gum care",
  "children-dentistry": "A child's dental visit",
  "childrens-dentistry/babys-first-visit": "Baby's first dental visit",
  "family-dentistry": "Checkups for my family",
  "night-guards": "Teeth grinding or a night guard",
  "restorative-dentistry": "A damaged or missing tooth",
  invisalign: "Straightening my teeth with Invisalign",
  "teeth-whitening": "Whitening my teeth",
  "dental-crowns": "A crown",
  tmj: "Jaw discomfort or TMJ",
};

export const visitForLabels = { self: "Myself", child: "My child", family: "My family" } as const;
