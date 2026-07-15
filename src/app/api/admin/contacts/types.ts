import type { LeadStatus } from "@/server/schema";

export type AdminContactItem = {
  id: string;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  service: string | null;
  message: string | null;
  requestType: string;
  preferredDate: string | null;
  preferredTime: string | null;
  formspreeStatus: string | null;
  landingPage: string | null;
  referrer: string | null;
  ctaSource: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  leadStatus: LeadStatus;
  contactedAt: string | null;
  bookedAt: string | null;
  arrivedAt: string | null;
  lostReason: string | null;
  staffNotes: string | null;
};

export type AdminLeadSourceSummary = {
  source: string;
  leads: number;
  booked: number;
  arrived: number;
  bookingRate: number;
  arrivalRate: number;
};

export type AdminContactsResponse = {
  total: number;
  items: AdminContactItem[];
  sourceSummary: AdminLeadSourceSummary[];
};

export type UpdateAdminContactInput = {
  leadStatus?: LeadStatus;
  lostReason?: string | null;
  staffNotes?: string | null;
};

export type UpdateAdminContactResponse = {
  ok: true;
  item: AdminContactItem;
};
