import { after, NextResponse } from "next/server";
import type { Contact } from "@/server/schema";
import { relayLeadNotification, toFormspreePayload } from "@/server/lead-notifications";
import { processOutboxBatch } from "@/server/notification-processor";
import { storage } from "@/server/storage";

const duplicateConflictMessage =
  "This submission ID is already associated with different form data.";

export const websiteLeadCanonicalFields = [
  "submissionId",
  "firstName",
  "lastName",
  "email",
  "phone",
  "service",
  "message",
  "requestType",
  "preferredDate",
  "preferredTime",
  "landingPage",
  "referrer",
  "ctaSource",
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "utmTerm",
  "utmContent",
  "gclid",
  "gbraid",
  "wbraid",
  "consentToContact",
  "consentVersion",
] as const satisfies ReadonlyArray<keyof Contact>;

export type WebsiteLeadCanonical = Pick<Contact, (typeof websiteLeadCanonicalFields)[number]>;

export const matchesCanonicalPayload = (
  contact: Contact,
  expected: WebsiteLeadCanonical,
) => websiteLeadCanonicalFields.every((field) => contact[field] === expected[field]);

const conflictResponse = () =>
  NextResponse.json(
    { success: false, message: duplicateConflictMessage },
    { status: 409 },
  );

const savedLeadResponse = (
  contact: Contact,
  created: boolean,
  delivered: boolean,
  fallbackMessage: string,
) =>
  NextResponse.json(
    {
      success: true,
      created,
      delivered,
      leadId: contact.id,
      serviceId: contact.service,
      ...(!delivered ? { fallbackMessage } : {}),
    },
    { status: delivered ? (created ? 201 : 200) : 202 },
  );

const scheduleOutboxFlush = (enqueued: boolean) => {
  if (!enqueued) return;
  after(async () => {
    await processOutboxBatch().catch(() => undefined);
  });
};

export async function persistAndNotifyWebsiteLead(args: {
  canonical: WebsiteLeadCanonical;
  fallbackMessage: string;
}): Promise<NextResponse> {
  const { canonical, fallbackMessage } = args;

  const existing = await storage.getContactBySubmissionId(canonical.submissionId!);
  if (existing && !matchesCanonicalPayload(existing, canonical)) {
    return conflictResponse();
  }
  if (existing?.formspreeStatus === "delivered") {
    return NextResponse.json({
      success: true,
      created: false,
      delivered: true,
      leadId: existing.id,
      serviceId: existing.service,
    });
  }

  let created = false;
  let contact = existing;
  let outboxEnqueued = false;

  if (!contact) {
    try {
      const inserted = await storage.createContactWithOutbox({
        ...canonical,
        formspreeStatus: "failed",
        ingestedVia: "website-form",
        leadStatus: "new",
      });
      if (inserted.contact) {
        contact = inserted.contact;
        created = true;
        outboxEnqueued = inserted.outboxEnqueued;
      } else {
        const concurrent = await storage.getContactBySubmissionId(canonical.submissionId!);
        if (!concurrent) {
          throw new Error("website_lead_insert_failed");
        }
        if (!matchesCanonicalPayload(concurrent, canonical)) {
          return conflictResponse();
        }
        scheduleOutboxFlush(await storage.enqueueLeadOutbox(concurrent));
        const delivered = concurrent.formspreeStatus === "delivered";
        return NextResponse.json(
          {
            success: true,
            created: false,
            delivered,
            leadId: concurrent.id,
            serviceId: concurrent.service,
            ...(!delivered ? { fallbackMessage } : {}),
          },
          { status: delivered ? 200 : 202 },
        );
      }
    } catch (insertError) {
      const concurrent = await storage.getContactBySubmissionId(canonical.submissionId!);
      if (!concurrent) throw insertError;
      if (!matchesCanonicalPayload(concurrent, canonical)) {
        return conflictResponse();
      }

      scheduleOutboxFlush(await storage.enqueueLeadOutbox(concurrent));
      const delivered = concurrent.formspreeStatus === "delivered";
      return NextResponse.json(
        {
          success: true,
          created: false,
          delivered,
          leadId: concurrent.id,
          serviceId: concurrent.service,
          ...(!delivered ? { fallbackMessage } : {}),
        },
        { status: delivered ? 200 : 202 },
      );
    }
  } else {
    outboxEnqueued = await storage.enqueueLeadOutbox(contact);
  }

  scheduleOutboxFlush(outboxEnqueued);

  let claimed: Contact | undefined;
  try {
    claimed = await storage.claimContactNotification(contact.id);
  } catch (claimError) {
    console.error("Website lead notification claim failed:", claimError);
    return savedLeadResponse(contact, created, false, fallbackMessage);
  }

  if (!claimed) {
    const latest = await storage.getContactBySubmissionId(canonical.submissionId!);
    const delivered = latest?.formspreeStatus === "delivered";
    return savedLeadResponse(contact, created, Boolean(delivered), fallbackMessage);
  }

  const payload = toFormspreePayload(claimed);
  if (!payload) {
    try {
      await storage.updateContactFormspreeStatus(contact.id, "failed");
    } catch (statusError) {
      console.error("Website lead incomplete payload status update failed:", statusError);
    }
    return savedLeadResponse(contact, created, false, fallbackMessage);
  }

  try {
    await relayLeadNotification(payload);

    try {
      await storage.updateContactFormspreeStatus(contact.id, "delivered");
    } catch (statusError) {
      console.error("Website lead notification status update failed:", statusError);
    }

    return NextResponse.json(
      {
        success: true,
        created,
        delivered: true,
        leadId: contact.id,
        serviceId: contact.service,
      },
      { status: created ? 201 : 200 },
    );
  } catch (notificationError) {
    console.error("Website lead notification warning:", notificationError);
    try {
      await storage.updateContactFormspreeStatus(contact.id, "failed");
    } catch (statusError) {
      console.error("Website lead notification failure status update failed:", statusError);
    }
    return savedLeadResponse(contact, created, false, fallbackMessage);
  }
}
