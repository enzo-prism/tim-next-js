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
    "Your visit is booked once our team confirms the date and time with you.",
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
    title: "Questions to ask before you come",
    description: "A few quick questions now make arrival easier. Ask them when you call or when our team reaches out to confirm.",
    items: [
      "Is the visit for me, my child, or a few of us? Let us know so we can plan together.",
      "What paperwork should I complete, and how do I share records from my previous dentist?",
      "If I have insurance, what should I confirm with my insurer? Have your plan name handy.",
      "How much time should I allow, when should I arrive, and does my first appointment include a cleaning?",
    ],
  },
  {
    id: "at-your-visit",
    title: "A clear plan for your care",
    description:
      "Your first visit includes an examination, digital X-rays if needed, and a conversation about your oral health goals. Dr. Chuang explains what he finds and the next steps.",
    items: [
      "The questions you want answered about your teeth, your child's visit, or treatment options.",
      "Anything you'd like explained about a recommendation, including timing and expected costs.",
      "Your comfort preferences. Blankets, water, and entertainment are available during treatment.",
    ],
  },
  {
    id: "plan-your-arrival",
    title: "Plan your arrival",
    description: "Our office is in Los Gatos at 15251 National Ave, Suite 102.",
    items: [
      "Open the directions link to plan your trip before you set out.",
      "Questions about parking, the entrance, stroller access, or mobility needs? Call ahead and we'll help you plan.",
      "Feeling nervous about dental care? Tell us when you arrange your visit. It helps us make it easier.",
    ],
  },
];

export const insuranceSections: readonly PatientGuidanceSection[] = [
  {
    id: "plan-details",
    title: "Questions to ask your insurer",
    description:
      "Participation and benefits depend on your specific plan. Call us with your plan name and we'll help you work out what to confirm with your insurer before your visit.",
    items: [
      "Is this practice in network for my exact plan, or would my visit use out-of-network benefits?",
      "What benefits apply to the appointment or treatment we're discussing?",
      "Are there deductibles, benefit limits, waiting periods, or other plan conditions to check?",
      "What member information should I give the office, and how should I share it?",
    ],
  },
  {
    id: "cost-and-payment",
    title: "Questions to ask us about cost",
    description:
      "A treatment recommendation and an insurance benefit are two different parts of planning a visit. Ask about both, and we'll walk through them with you.",
    items: [
      "Can you explain the expected cost of the proposed care and what I may pay myself?",
      "What payment methods are available right now, and when is payment due?",
      "I don't have dental insurance. How can we talk through visit costs and payment options?",
      "If my plan doesn't cover the proposed care, what should we discuss before going ahead?",
    ],
  },
  {
    id: "contact-safely",
    title: "Share private details by phone",
    description:
      "The website is great for a general question or a request to call you back. Member numbers and health details are best shared with the team by phone.",
    items: [
      "Have your plan name ready when you call.",
      "Keep insurance member numbers and private medical details out of website notes.",
      "Your specific plan decides coverage, so confirm benefits with your insurer.",
    ],
  },
];

export const urgentCareSections: readonly PatientGuidanceSection[] = [
  {
    id: "call-the-office",
    title: "What to tell us when you call",
    description:
      "Talk with the team about what's going on. We'll listen, check appointment availability, and help you arrange the next step.",
    items: [
      "Let us know you're calling about a dental concern that needs prompt attention.",
      "Which tooth or area hurts, and whether the pain is sharp, throbbing, or only when you chew.",
      "When it started, and whether anything happened first, like a fall or biting something hard.",
      "Any swelling, bleeding, or a broken tooth, crown, or filling.",
      "Who the visit is for. If it's your child, share their age.",
    ],
  },
  {
    id: "hours-and-requests",
    title: "Our hours, and how requests work",
    description:
      "We're open Monday through Thursday, 9 AM–5 PM, Los Gatos time. The office is closed Friday through Sunday.",
    items: [
      "If you call outside these hours, you may not reach the team.",
      "Online requests are answered during office hours and don't reserve a time, so please call when you need help soon.",
      "Health details are best discussed by phone rather than in website notes.",
    ],
  },
];
