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

export const leadSourceOptions = [
  { value: "google-ads", label: "Google Ads" },
  { value: "website", label: "Website" },
  { value: "formspree-historical", label: "Formspree" },
] as const;

export const sourceLabel = (value: string) =>
  leadSourceOptions.find((option) => option.value === value)?.label ?? value;

export const sourceBadgeClasses: Record<string, string> = {
  "google-ads": "bg-[#E0F2FE] text-[#075985]",
  website: "bg-gray-100 text-gray-700",
  "formspree-historical": "bg-[#F1F5F9] text-[#475569]",
};

export const requestTypeOptions = [
  { value: "contact", label: "Contact" },
  { value: "appointment", label: "Appointment" },
] as const;

export const requestTypeLabel = (value: string) =>
  requestTypeOptions.find((option) => option.value === value)?.label ??
  (value || "Contact");

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

export const fullName = (row: Pick<AdminContactItem, "firstName" | "lastName">) =>
  `${row.firstName} ${row.lastName}`.trim();

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
