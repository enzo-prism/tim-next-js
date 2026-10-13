import type { ComfortKind } from "./guide-art";

/*
 * Presentation copy for the three patient guides. Facts come from
 * src/content/patient-guidance.ts and the practice's published blog guides;
 * nothing here adds plan names, prices, visit lengths, or availability
 * promises.
 */

export const comfortCards: { kind: ComfortKind; title: string; body: string; tone: string }[] = [
  { kind: "blanket", title: "A cozy blanket", body: "Snuggle in. Blankets are available during treatment.", tone: "bg-lime-wash" },
  { kind: "water", title: "A glass of water", body: "Just ask the team whenever you need a sip.", tone: "bg-periwinkle-wash" },
  { kind: "screen", title: "Something to watch", body: "Entertainment is available during treatment, so the time passes easier.", tone: "bg-cloud-wash" },
];

/** General comfort steps from the practice's own toothache and knocked-out tooth guides. */
export const whileYouWaitTips: { title: string; body: string }[] = [
  {
    title: "Toothache",
    body: "Rinse with warm water, then gently brush and floss around the sore spot in case food is caught. Don’t poke at it with sharp objects.",
  },
  {
    title: "Swelling",
    body: "Hold a cold compress, wrapped in a cloth, on the outside of the cheek for short stretches.",
  },
  {
    title: "Chipped or broken tooth",
    body: "Save any pieces, rinse gently with warm water, and stick to soft foods on the other side.",
  },
  {
    title: "Knocked-out adult tooth",
    body: "Pick it up by the crown, not the root. Keep it moist in milk or saliva (not tap water), and call right away. Don’t put a baby tooth back in.",
  },
  {
    title: "Lost filling or crown",
    body: "Keep the crown or any pieces you find, chew on the other side, and give us a call.",
  },
  {
    title: "Easing discomfort",
    body: "Soft foods help; skip very hot, cold, or sugary ones. If you use a pain reliever, follow the label, and ask a pharmacist or pediatrician what’s right for a child.",
  },
];

export const insuranceHelpSteps = [
  { title: "Call with your plan name", body: "Tell us the name of your plan and the visit or treatment you’re planning." },
  { title: "We help you know what to ask", body: "We’ll review the details you share and help you work out what to confirm with your insurer." },
  { title: "Talk through cost before care", body: "Ask us to explain any recommendation, including timing and expected costs, before you decide." },
];
