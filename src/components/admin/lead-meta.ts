import { format, formatDistanceToNowStrict } from "date-fns";
import type { AdminContactItem } from "@/app/api/admin/contacts/types";
import type { LeadStatus } from "@/server/schema";

export const leadStatusOptions: Array<{ value: LeadStatus; label: string }> = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "booked", label: "Booked" },
  { value: "arrived", label: "Arrived" },
  { value: "no-show", label: "No-show" },
  { value: "lost", label: "Lost" },
];

export const statusLabel = (value: LeadStatus) =>
  leadStatusOptions.find((option) => option.value === value)?.label ?? value;

// Status pill visual contract (spec §5): muted, never color-only, always text.
export const statusPillClasses: Record<LeadStatus, string> = {
  new: "bg-[#E0F2FE] text-[#075985]",
  contacted: "bg-[#FEF3C7] text-[#92400E]",
  booked: "bg-[#DCFCE7] text-[#166534]",
  arrived: "bg-[#CCFBF1] text-[#115E59]",
  "no-show": "bg-[#F1F5F9] text-[#475569]",
  lost: "bg-[#F1F5F9] text-[#64748B] line-through",
};

// These values are the canonical source strings the API derives and filters on
// (`leadSourceSql` in src/server/storage.ts, `normalizeLeadSource` in
// src/app/api/admin/contacts/lead-source.ts). They are not slugs: the source
// filter is an equality match against exactly these strings, so a mismatch here
// silently returns zero leads.
export const leadSourceOptions = [
  { value: "Google Ads", label: "Google Ads" },
  { value: "Website form", label: "Website form" },
  { value: "Referral", label: "Referral" },
] as const;

export const sourceLabel = (value: string) =>
  leadSourceOptions.find((option) => option.value === value)?.label ?? value;

// Where a lead came from is the first thing the front desk needs to read off
// the list, so the three sources are separated by weight and shape, not by hue
// alone: paid is a solid block, owned is outlined, everything else is quiet.
// The palette stays inside DESIGN.md's blue family, which means colour on its
// own could never carry the distinction even if we wanted it to.
export const sourceBadgeClasses: Record<string, string> = {
  "Google Ads": "border border-[#075985] bg-[#075985] text-white",
  "Website form": "border border-[#0369A1] bg-white text-[#0C4A6E]",
  Referral: "border border-dashed border-[#94A3B8] bg-white text-[#475569]",
};

// The same three-way split carried on the left edge of every row and card, so
// the mix of paid and owned leads is legible before you read a single word.
export const sourceAccentClasses: Record<string, string> = {
  "Google Ads": "border-l-[#075985]",
  "Website form": "border-l-[#7DD3FC]",
  Referral: "border-l-[#CBD5E1]",
};

// Paid leads cost money and answer a different question ("is the spend
// working"), so the list says so in words next to the badge.
export const sourceKindLabel = (value: string) =>
  value === "Google Ads" ? "Paid ad" : value === "Referral" ? "Referral" : "Own site";

// The two request types a visitor can choose on the site. These drive the Type
// filter, so a Google Ads lead is deliberately absent: it is not something the
// visitor picked, and the Source filter already separates it.
export const requestTypeOptions = [
  { value: "contact", label: "Contact" },
  { value: "appointment", label: "Appointment" },
] as const;

// Every request_type the database can hold, including the one the webhook
// writes. Without this entry the drawer printed the raw slug
// "google_ads_lead" at the practice.
const requestTypeLabels: Record<string, string> = {
  contact: "Contact",
  appointment: "Appointment",
  google_ads_lead: "Google Ads lead form",
};

export const requestTypeLabel = (value: string) =>
  requestTypeLabels[value] ?? (value || "Contact");

const DAY_MS = 24 * 60 * 60 * 1000;

export const formatAbsoluteDateTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : format(date, "MMM d, yyyy h:mm a");
};

export const formatReceivedRelative = (value: string, now: number = Date.now()) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const ageMs = now - date.getTime();
  if (ageMs < 60_000) return "Just now";
  if (ageMs < DAY_MS) return formatDistanceToNowStrict(date, { addSuffix: true });
  if (ageMs < 2 * DAY_MS) return `Yesterday ${format(date, "h:mm a")}`;
  return formatAbsoluteDateTime(value);
};

// Fresh-and-unread marker: status=new and received within the last 24 hours.
export const isFreshNewLead = (row: AdminContactItem, now: number = Date.now()) => {
  const date = new Date(row.createdAt);
  if (Number.isNaN(date.getTime())) return false;
  return row.leadStatus === "new" && now - date.getTime() < DAY_MS;
};

// Historical rows exist with every field blank, so a name is not guaranteed.
// Falling through to an empty string would render a nameless, unclickable row.
export const fullName = (row: Pick<AdminContactItem, "firstName" | "lastName">) =>
  `${row.firstName} ${row.lastName}`.trim() || "No name given";

// A lead with neither a phone number nor an email address cannot be worked.
// Saying that on the row is the difference between "nobody has called them
// yet" and "nobody can".
export const hasContactDetails = (
  row: Pick<AdminContactItem, "email" | "phone">,
) => Boolean(row.phone?.trim() || row.email?.trim());

// Whether the notification email for a website submission actually left the
// building. Only website forms relay through Formspree, so this is null on
// Google Ads leads rather than a failure.
export const formspreeStatusLabel = (value: string | null) => {
  if (!value) return null;
  if (value === "delivered") return "Notification email sent";
  if (value === "failed") return "Notification email did not send";
  return value;
};

export const consentLabel = (row: Pick<AdminContactItem, "consentToContact">) =>
  row.consentToContact ? "Yes, agreed to be contacted" : "Not recorded";

export const ingestionProvenance = (row: AdminContactItem) => {
  const leadId = row.googleAdsLeadId ? `, lead_id ${row.googleAdsLeadId}` : "";
  switch (row.ingestedVia) {
    case "webhook":
      return `via Google Ads webhook${leadId}`;
    case "website-form":
      return "via website form";
    case "reconciliation":
      return `via twice-daily reconciliation${leadId}`;
    case "backfill":
      // Backfill covers two imports: the original Formspree history, and the
      // Google Ads lead emails that predate the webhook. Only the latter
      // carries a lead id.
      return leadId ? `via Google Ads backfill${leadId}` : "via Formspree backfill";
    default:
      return null;
  }
};
