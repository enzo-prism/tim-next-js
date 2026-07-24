import { NextResponse } from "next/server";
import { z } from "zod";
import { insertAppointmentSchema, type Contact } from "@/server/schema";
import { relayLeadNotification } from "@/server/lead-notifications";
import {
  guardPublicFormRequest,
  PublicFormPayloadTooLargeError,
  readPublicFormJson,
} from "@/server/public-form-guard";
import { storage } from "@/server/storage";

export const runtime = "nodejs";

const fallbackMessage =
  "Your request was saved, but our online notification is delayed. Please call (408) 358-8100 so we can prioritize your appointment.";

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

    const data = insertAppointmentSchema.parse({ ...body, requestType: "appointment" });
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
    let appointment = existing;
    if (!appointment) {
      try {
        appointment = await storage.createContact({
        submissionId: data.submissionId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        service: data.service,
        message: data.message || null,
        requestType: "appointment",
        preferredDate: data.preferredDate || null,
        preferredTime: data.preferredTime || null,
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

    let claimed: Contact | undefined;
    try {
      claimed = await storage.claimContactNotification(appointment.id);
    } catch (claimError) {
      console.error("Appointment notification claim failed:", claimError);
      return NextResponse.json(
        {
          success: true,
          created,
          delivered: false,
          leadId: appointment.id,
          serviceId: appointment.service,
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
          leadId: appointment.id,
          serviceId: appointment.service,
          ...(!delivered ? { fallbackMessage } : {}),
        },
        { status: delivered ? 200 : 202 },
      );
    }

    try {
      await relayLeadNotification({
        requestType: "appointment",
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        service: data.service,
        message: data.message,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
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
        await storage.updateContactFormspreeStatus(appointment.id, "delivered");
      } catch (statusError) {
        console.error("Appointment notification status update failed:", statusError);
      }

      return NextResponse.json(
        {
          success: true,
          created,
          delivered: true,
          leadId: appointment.id,
          serviceId: appointment.service,
        },
        { status: created ? 201 : 200 },
      );
    } catch (notificationError) {
      console.error("Appointment notification warning:", notificationError);
      try {
        await storage.updateContactFormspreeStatus(appointment.id, "failed");
      } catch (statusError) {
        console.error("Appointment notification failure status update failed:", statusError);
      }
      return NextResponse.json(
        {
          success: true,
          created,
          delivered: false,
          leadId: appointment.id,
          serviceId: appointment.service,
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
        { success: false, message: "Invalid appointment data", errors: error.issues },
        { status: 400 },
      );
    }

    console.error("Appointment form error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit appointment request" },
      { status: 500 },
    );
  }
}
