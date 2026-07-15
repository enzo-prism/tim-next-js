import { NextResponse } from "next/server";
import { z } from "zod";
import { insertContactSchema } from "@/server/schema";
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
    const existing = await storage.getContactBySubmissionId(data.submissionId);
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
        formspreeStatus: "failed",
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
      });
      created = true;
      } catch (insertError) {
        const concurrent = await storage.getContactBySubmissionId(data.submissionId);
        if (!concurrent) throw insertError;

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

    try {
      await relayLeadNotification({
        requestType: "contact",
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        service: data.service,
        message: data.message,
        landingPage: data.landingPage,
        referrer: data.referrer,
        ctaSource: data.ctaSource,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        utmTerm: data.utmTerm,
        utmContent: data.utmContent,
        gclid: data.gclid,
        gbraid: data.gbraid,
        wbraid: data.wbraid,
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
