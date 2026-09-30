import { practiceHoursSummary, practicePhone } from "./practice-hours";
import { practiceInfo } from "./structured-data";

/**
 * Operating details already published by the practice. Keep plan participation,
 * payment products, appointment lengths and response-time promises out of these
 * guides until the practice supplies them. Hours and contact details reuse the
 * same records as the rest of the site.
 */
export const patientGuidanceFacts = {
  phone: practicePhone,
  hours: practiceHoursSummary,
  address: practiceInfo.addressText,
  billPayUrl: "https://swipesimple.com/links/lnk_67505de480da165de07d5bd3f42fbcce",
  amenities: ["Blankets", "Water", "Entertainment during treatment"],
  appointmentExpectation:
    "Your visit is not booked until our team confirms the date and time with you.",
} as const;

export type PatientGuidanceSection = {
  id: string;
  title: string;
  description: string;
  items: readonly string[];
};

export const newPatientSections: readonly PatientGuidanceSection[] = [
  {
    id: "before-your-visit",
    title: "Before your first visit",
    description: "A few questions now can make arrival easier.",
    items: [
      "Tell us whether you are arranging care for yourself, a child, or more than one family member.",
      "Ask what paperwork to complete and how to share records from a previous dentist.",
      "If you have insurance, have your plan name available and ask what to confirm with your insurer.",
      "Ask how much time to allow, when to arrive, and whether your first appointment includes a cleaning.",
    ],
  },
  {
    id: "at-your-visit",
    title: "A clear plan for your care",
    description:
      "Your first visit includes an examination, digital X-rays if needed, and a conversation about your oral health goals. Dr. Chuang explains the findings and next steps.",
    items: [
      "Bring the questions you want answered about your teeth, your child's visit, or treatment options.",
      "Ask the team to explain any recommendation, including timing and expected costs.",
      "Share comfort preferences with the team. Blankets, water, and entertainment are available during treatment.",
    ],
  },
  {
    id: "plan-your-arrival",
    title: "Plan your arrival",
    description: "Our office is in Los Gatos at 15251 National Ave, Suite 102.",
    items: [
      "Use our directions link to plan your journey before setting out.",
      "Call ahead with questions about parking, the entrance, stroller access, or mobility needs.",
      "If you are nervous about dental care, let the team know when you arrange your visit.",
    ],
  },
];

export const insuranceSections: readonly PatientGuidanceSection[] = [
  {
    id: "plan-details",
    title: "Start with your specific plan",
    description:
      "Participation and benefits depend on the plan. Call the office with your plan name before your visit so the team can help identify what to confirm with your insurer.",
    items: [
      "Is this practice in network for my exact plan, or would my visit use out-of-network benefits?",
      "What benefits apply to the appointment or treatment being discussed?",
      "Are there deductibles, benefit limits, waiting periods, or other plan conditions to check?",
      "What member information should I provide, and how should I share it with the office?",
    ],
  },
  {
    id: "cost-and-payment",
    title: "Ask about cost before care",
    description:
      "A treatment recommendation and an insurance benefit are different parts of planning a visit. Ask about both so you understand the next step.",
    items: [
      "Can you explain the expected cost for the proposed care and what I may pay myself?",
      "What payment methods are currently available, and when is payment due?",
      "If I do not have dental insurance, how can I discuss visit costs and payment options?",
      "If my plan does not cover the proposed care, what should I discuss with the team before proceeding?",
    ],
  },
  {
    id: "contact-safely",
    title: "Keep personal details off the public form",
    description:
      "Use the contact form for a general question or request a call. Speak with the office about how to share member information and other private details.",
    items: [
      "Have your plan name available when you call.",
      "Do not put insurance member numbers or private medical details in website notes.",
      "Confirm benefits with your insurer; the specific plan determines coverage.",
    ],
  },
];

export const urgentCareSections: readonly PatientGuidanceSection[] = [
  {
    id: "call-the-office",
    title: "Call for a time-sensitive dental concern",
    description:
      "Speak with the team about your concern and appointment availability. The office must confirm whether and when it can see you.",
    items: [
      "Say that you are calling about a dental concern that needs prompt attention.",
      "Ask about the next available appointment and how the office can help you arrange care.",
      "Discuss health concerns by phone rather than including private medical details in website notes.",
    ],
  },
  {
    id: "hours-and-requests",
    title: "Know what to expect from a request",
    description:
      "Regular office hours are Monday through Thursday, 9 AM–5 PM, Los Gatos time. The office is closed Friday through Sunday.",
    items: [
      "If you call outside regular hours, you may not reach the team.",
      "An online appointment request does not provide an immediate response or reserve an appointment.",
      "Do not wait for a website-form reply when you need prompt help. Call to discuss availability.",
    ],
  },
];
