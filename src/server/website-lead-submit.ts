import { after, NextResponse } from "next/server";
import type { Contact } from "@/server/schema";
import { deliverWebsiteLead } from "@/server/formspree-retry";
import { processOutboxBatch } from "@/server/notification-processor";
import { storage } from "@/server/storage";

const duplicateConflictMessage =
  "This submission ID is already associated with different form data.";

export const websiteLeadCanonicalFields = [
  "submissionId", "firstName", "lastName", "email", "phone", "service", "message",
  "requestType", "preferredDate", "preferredTime", "preferredContactMethod", "visitFor", "landingPage", "referrer",
  "ctaSource", "utmSource", "utmMedium", "utmCampaign", "utmTerm", "utmContent",
  "gclid", "gbraid", "wbraid", "consentToContact", "consentVersion",
] as const satisfies ReadonlyArray<keyof Contact>;

export type WebsiteLeadCanonical = Pick<Contact, (typeof websiteLeadCanonicalFields)[number]>;

export const matchesCanonicalPayload = (
  contact: Contact,
  expected: WebsiteLeadCanonical,
) => websiteLeadCanonicalFields.every((field) => {
  // Requests saved before the intake migration retain their original UUID.
  // Null legacy preferences mean the same effective defaults as new requests.
  if (contact.requestType === "appointment" && field === "preferredContactMethod") {
    return (contact[field] ?? (contact.phone ? "phone" : "email")) === expected[field];
  }
  if (contact.requestType === "appointment" && field === "visitFor") {
    return (contact[field] ?? "self") === expected[field];
  }
  return contact[field] === expected[field];
});

const conflictResponse = () => NextResponse.json(
  { success: false, message: duplicateConflictMessage }, { status: 409 },
);

const receipt = (contact: Contact, created: boolean) => {
  const delivered = contact.formspreeStatus === "delivered";
  return NextResponse.json({
    success: true,
    created,
    delivered,
    queued: !delivered,
    leadId: contact.id,
    serviceId: contact.service,
  }, { status: delivered ? 200 : 202 });
};

const scheduleDelivery = (contact: Contact, outboxEnqueued: boolean) => {
  try {
    after(async () => {
      // Both work items are already durable. A stopped callback leaves them
      // available to the cron worker; no claim is taken before the response.
      await Promise.allSettled([
        deliverWebsiteLead(contact),
        ...(outboxEnqueued ? [processOutboxBatch()] : []),
      ]);
    });
  } catch {
    // Scheduling is best effort. Keep the saved receipt honest and let the
    // existing failed-row retry worker recover the delivery.
    console.error("website_lead_background_schedule_failed");
  }
};

export async function persistAndNotifyWebsiteLead(args: {
  canonical: WebsiteLeadCanonical;
  fallbackMessage: string;
}): Promise<NextResponse> {
  const { canonical } = args;
  let contact = await storage.getContactBySubmissionId(canonical.submissionId!);
  if (contact && !matchesCanonicalPayload(contact, canonical)) return conflictResponse();
  if (contact?.formspreeStatus === "delivered") return receipt(contact, false);

  let created = false;
  let outboxEnqueued = false;
  if (!contact) {
    try {
      const inserted = await storage.createContactWithOutbox({
        ...canonical,
        formspreeStatus: "failed",
        ingestedVia: "website-form",
        leadStatus: "new",
      });
      contact = inserted.contact ?? undefined;
      created = Boolean(contact);
      outboxEnqueued = inserted.outboxEnqueued;
    } catch (insertError) {
      contact = await storage.getContactBySubmissionId(canonical.submissionId!);
      if (!contact) throw insertError;
    }
    if (!contact) contact = await storage.getContactBySubmissionId(canonical.submissionId!);
    if (!contact) throw new Error("website_lead_insert_failed");
    if (!matchesCanonicalPayload(contact, canonical)) return conflictResponse();
  }

  if (!outboxEnqueued) {
    try {
      outboxEnqueued = await storage.enqueueLeadOutbox(contact);
    } catch {
      // The lead is durable even if repairing an old outbox entry fails.
      console.error("website_lead_outbox_repair_failed");
    }
  }
  if (contact.formspreeStatus !== "delivered") scheduleDelivery(contact, outboxEnqueued);
  return receipt(contact, created);
}
