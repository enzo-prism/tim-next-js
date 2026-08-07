import type { IngestedVia, LeadStatus } from "@/server/schema";

export type AdminContactItem = {
  id: string;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  service: string | null;
  message: string | null;
  requestType: string;
  preferredDate: string | null;
  preferredTime: string | null;
  submissionId: string | null;
  formspreeStatus: string | null;
  landingPage: string | null;
  referrer: string | null;
  ctaSource: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  consentToContact: boolean;
  consentVersion: string | null;
  source: string;
  leadSource: string;
  leadStatus: LeadStatus;
  contactedAt: string | null;
  bookedAt: string | null;
  arrivedAt: string | null;
  lostReason: string | null;
  staffNotes: string | null;
  googleAdsLeadId: string | null;
  campaignId: string | null;
  campaignName: string | null;
  ingestedVia: IngestedVia | null;
  updatedBy: string | null;
  isTest: boolean;
};

export type AdminContactDetail = AdminContactItem & {
  rawPayload: unknown;
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
  countsByStatus: Record<string, number>;
};

export type UpdateAdminContactInput = {
  leadStatus?: LeadStatus;
  lostReason?: string | null;
  staffNotes?: string | null;
  expectedUpdatedAt: string;
};

export type UpdateAdminContactResponse = {
  ok: true;
  item: AdminContactItem;
};
