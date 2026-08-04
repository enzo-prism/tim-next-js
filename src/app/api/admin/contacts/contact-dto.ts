import type { AdminContactDetail, AdminContactItem } from "@/app/api/admin/contacts/types";
import type { Contact } from "@/server/schema";
import { normalizeLeadSource } from "@/app/api/admin/contacts/lead-source";

export const toAdminContactItem = (contact: Contact): AdminContactItem => ({
  id: contact.id,
  createdAt: contact.createdAt.toISOString(),
  updatedAt: contact.updatedAt.toISOString(),
  firstName: contact.firstName,
  lastName: contact.lastName,
  email: contact.email,
  phone: contact.phone,
  service: contact.service,
  message: contact.message,
  requestType: contact.requestType,
  preferredDate: contact.preferredDate,
  preferredTime: contact.preferredTime,
  formspreeStatus: contact.formspreeStatus,
  landingPage: contact.landingPage,
  referrer: contact.referrer,
  ctaSource: contact.ctaSource,
  utmSource: contact.utmSource,
  utmMedium: contact.utmMedium,
  utmCampaign: contact.utmCampaign,
  source: normalizeLeadSource(contact),
  leadSource: normalizeLeadSource(contact),
  leadStatus: contact.leadStatus,
  contactedAt: contact.contactedAt?.toISOString() ?? null,
  bookedAt: contact.bookedAt?.toISOString() ?? null,
  arrivedAt: contact.arrivedAt?.toISOString() ?? null,
  lostReason: contact.lostReason,
  staffNotes: contact.staffNotes,
  googleAdsLeadId: contact.googleAdsLeadId,
  campaignId: contact.campaignId,
  campaignName: contact.campaignName,
  ingestedVia: contact.ingestedVia,
  updatedBy: contact.updatedBy,
  isTest: contact.isTest,
});

export const toAdminContactDetail = (contact: Contact): AdminContactDetail => ({
  ...toAdminContactItem(contact),
  rawPayload: contact.rawPayload,
});
