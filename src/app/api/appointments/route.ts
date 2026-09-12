import { NextResponse } from "next/server";
import { z } from "zod";
import { insertAppointmentSchema } from "@/server/schema";
import {
  guardPublicFormRequest,
  PublicFormPayloadTooLargeError,
  readPublicFormJson,
} from "@/server/public-form-guard";
import { persistAndNotifyWebsiteLead } from "@/server/website-lead-submit";

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
    return persistAndNotifyWebsiteLead({
      fallbackMessage,
      canonical: {
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
      },
    });
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
