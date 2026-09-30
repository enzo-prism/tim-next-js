import type { Contact } from "@/server/schema";

export type LeadNotificationPayload = {
  leadId: string;
  submissionId: string;
  requestType: "appointment" | "contact";
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  service?: string | null;
  message?: string | null;
  preferredDate?: string | null;
  preferredTime?: string | null;
  preferredContactMethod?: "phone" | "email" | null;
  visitFor?: "self" | "child" | "family" | null;
  landingPage?: string | null;
  referrer?: string | null;
  ctaSource?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  gclid?: string | null;
  gbraid?: string | null;
  wbraid?: string | null;
  consentToContact: boolean;
  consentVersion?: string | null;
};

export const toFormspreePayload = (
  contact: Contact,
): LeadNotificationPayload | null => {
  if (contact.requestType !== "appointment" && contact.requestType !== "contact") {
    return null;
  }
  if (!contact.submissionId || (!contact.email && !contact.phone)) return null;

  return {
    leadId: contact.id,
    submissionId: contact.submissionId,
    requestType: contact.requestType,
    firstName: contact.firstName,
    lastName: contact.lastName,
    ...(contact.email ? { email: contact.email } : {}),
    phone: contact.phone,
    service: contact.service,
    message: contact.message,
    preferredDate: contact.preferredDate,
    preferredTime: contact.preferredTime,
    preferredContactMethod: contact.preferredContactMethod,
    visitFor: contact.visitFor,
    landingPage: contact.landingPage,
    referrer: contact.referrer,
    ctaSource: contact.ctaSource,
    utmSource: contact.utmSource,
    utmMedium: contact.utmMedium,
    utmCampaign: contact.utmCampaign,
    utmTerm: contact.utmTerm,
    utmContent: contact.utmContent,
    gclid: contact.gclid,
    gbraid: contact.gbraid,
    wbraid: contact.wbraid,
    consentToContact: contact.consentToContact,
    consentVersion: contact.consentVersion,
  };
};

const DEFAULT_FORMSPREE_ENDPOINT = "https://formspree.io/f/mojngolr";
const RELAY_TIMEOUT_MS = 8_000;

/** An explicit rejection can be retried; an ambiguous network result cannot. */
export class LeadNotificationRejectedError extends Error {
  constructor(readonly status: number) {
    super(`Lead notification failed with status ${status}`);
    this.name = "LeadNotificationRejectedError";
  }
}

const getEndpoint = (requestType: LeadNotificationPayload["requestType"]) => {
  if (requestType === "contact") {
    return (
      process.env.FORMSPREE_CONTACT_ENDPOINT?.trim() ||
      process.env.FORMSPREE_APPOINTMENT_ENDPOINT?.trim() ||
      DEFAULT_FORMSPREE_ENDPOINT
    );
  }

  return process.env.FORMSPREE_APPOINTMENT_ENDPOINT?.trim() || DEFAULT_FORMSPREE_ENDPOINT;
};

export async function relayLeadNotification(payload: LeadNotificationPayload) {
  const response = await fetch(getEndpoint(payload.requestType), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      ...payload,
      source: "www.famfirstsmile.com",
      site: "tim",
      form_key: payload.requestType === "appointment" ? "appointments" : "contacts",
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "production",
    }),
    signal: AbortSignal.timeout(RELAY_TIMEOUT_MS),
  });

  if (!response.ok) {
    // A server failure or request timeout can follow an accepted submission.
    // Only explicit client rejections safely permit an automatic retry.
    if (response.status >= 400 && response.status < 500 && response.status !== 408) {
      throw new LeadNotificationRejectedError(response.status);
    }
    throw new Error(`Lead notification outcome is uncertain (status ${response.status})`);
  }
}
