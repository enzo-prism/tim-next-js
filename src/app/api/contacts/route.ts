import { NextResponse } from "next/server";
import { z } from "zod";
import { insertContactSchema, type Contact } from "@/server/schema";
import { relayLeadNotification } from "@/server/lead-notifications";
import {
  guardPublicFormRequest,
  PublicFormPayloadTooLargeError,
  readPublicFormJson,
} from "@/server/public-form-guard";
import { storage } from "@/server/storage";

export const runtime = "nodejs";

const fallbackMessage =
  "Your message was saved, but our online notification is delayed. Please call (408) 358-8100 if you need a quick response.";

const duplicateConflictMessage =
  "This submission ID is already associated with different form data.";

const canonicalFields = [
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

const matchesCanonicalPayload = (
  contact: Contact,
  expected: Pick<Contact, (typeof canonicalFields)[number]>,
) => canonicalFields.every((field) => contact[field] === expected[field]);

const conflictResponse = () =>
  NextResponse.json(
    { success: false, message: duplicateConflictMessage },
    { status: 409 },
  );

export async function POST(request: Request) {
  const guard = guardPublicFormRequest(request);
  if (!guard.ok) {
    return NextResponse.json({ success: false, message: guard.message }, { status: guard.status });
  }

  try {
    const body = await readPublicFormJson(request);
    const honeypot = typeof body.company === "string" ? body.company.trim() : "";
    if (honeypot) {
      return NextResponse.json({ success: false, message: "Invalid submission" }, { status: 400 });
    }

    const data = insertContactSchema.parse(body);
    const canonicalContact = {
      submissionId: data.submissionId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || null,
      service: data.service || null,
      message: data.message || null,
      requestType: "contact",
      preferredDate: null,
      preferredTime: null,
      landingPage: data.landingPage || null,
      referrer: data.referrer || null,
      ctaSource: data.ctaSource || null,
      utmSource: data.utmSource || null,
      utmMedium: data.utmMedium || null,
      utmCampaign: data.utmCampaign || null,
      utmTerm: data.utmTerm || null,
      utmContent: data.utmContent || null,
      gclid: data.gclid || null,
      gbraid: data.gbraid || null,
      wbraid: data.wbraid || null,
      consentToContact: data.consentToContact,
      consentVersion: data.consentVersion,
    } satisfies Pick<Contact, (typeof canonicalFields)[number]>;

    const existing = await storage.getContactBySubmissionId(data.submissionId);
    if (existing && !matchesCanonicalPayload(existing, canonicalContact)) {
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
    if (!contact) {
      try {
        contact = await storage.createContact({
          ...canonicalContact,
          formspreeStatus: "failed",
        });
        created = true;
      } catch (insertError) {
        const concurrent = await storage.getContactBySubmissionId(data.submissionId);
        if (!concurrent) throw insertError;
        if (!matchesCanonicalPayload(concurrent, canonicalContact)) {
          return conflictResponse();
        }

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
    }

    let claimed: Contact | undefined;
    try {
      claimed = await storage.claimContactNotification(contact.id);
    } catch (claimError) {
      console.error("Contact notification claim failed:", claimError);
      return NextResponse.json(
        {
          success: true,
          created,
          delivered: false,
          leadId: contact.id,
          serviceId: contact.service,
          fallbackMessage,
        },
        { status: 202 },
      );
    }

    if (!claimed) {
      const latest = await storage.getContactBySubmissionId(data.submissionId);
      const delivered = latest?.formspreeStatus === "delivered";
      return NextResponse.json(
        {
          success: true,
          created,
          delivered,
          leadId: contact.id,
          serviceId: contact.service,
          ...(!delivered ? { fallbackMessage } : {}),
        },
        { status: delivered ? 200 : 202 },
      );
    }

    try {
      await relayLeadNotification({
        leadId: claimed.id,
        submissionId: claimed.submissionId!,
        requestType: "contact",
        firstName: claimed.firstName,
        lastName: claimed.lastName,
        email: claimed.email!,
        phone: claimed.phone,
        service: claimed.service,
        message: claimed.message,
        landingPage: claimed.landingPage,
        referrer: claimed.referrer,
        ctaSource: claimed.ctaSource,
        utmSource: claimed.utmSource,
        utmMedium: claimed.utmMedium,
        utmCampaign: claimed.utmCampaign,
        utmTerm: claimed.utmTerm,
        utmContent: claimed.utmContent,
        gclid: claimed.gclid,
        gbraid: claimed.gbraid,
        wbraid: claimed.wbraid,
        consentToContact: claimed.consentToContact,
        consentVersion: claimed.consentVersion,
      });

      try {
        await storage.updateContactFormspreeStatus(contact.id, "delivered");
      } catch (statusError) {
        console.error("Contact notification status update failed:", statusError);
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
      console.error("Contact notification warning:", notificationError);
      try {
        await storage.updateContactFormspreeStatus(contact.id, "failed");
      } catch (statusError) {
        console.error("Contact notification failure status update failed:", statusError);
      }
      return NextResponse.json(
        {
          success: true,
          created,
          delivered: false,
          leadId: contact.id,
          serviceId: contact.service,
          fallbackMessage,
        },
        { status: 202 },
      );
    }
  } catch (error) {
    if (error instanceof PublicFormPayloadTooLargeError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 413 },
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON request" },
        { status: 400 },
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid form data", errors: error.issues },
        { status: 400 },
      );
    }

    console.error("Contact form error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit contact form" },
      { status: 500 },
    );
  }
}
