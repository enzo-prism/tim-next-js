import { NextResponse } from "next/server";
import { z } from "zod";
import { insertAppointmentSchema } from "@/server/schema";
import { storage } from "@/server/storage";

export const runtime = "nodejs";

const fallbackMessage =
  "Your request was saved, but online scheduling delivery is delayed. Please call (408) 358-8100 and we will prioritize your appointment.";

const FORMSPREE_OPS_SITE = "tim";
const FORMSPREE_OPS_FORM_KEY = "appointments";
const FORMSPREE_OPS_QA_FIELD = "_codex_test";

const relayToFormspree = async (payload: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  service: string;
  preferredDate: string;
  preferredTime: string;
  message?: string;
  codexTest?: string;
}) => {
  const endpoint =
    process.env.FORMSPREE_APPOINTMENT_ENDPOINT?.trim() ||
    "https://formspree.io/f/mojngolr";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      ...payload,
      source: "famfirstsmile.com",
      requestType: "appointment",
      site: FORMSPREE_OPS_SITE,
      form_key: FORMSPREE_OPS_FORM_KEY,
      page_path: "/book-appointment",
      referrer: "",
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "production",
      [FORMSPREE_OPS_QA_FIELD]: payload.codexTest === "true" ? "true" : "false",
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Formspree relay failed (${res.status}): ${text || res.statusText}`);
  }
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const codexTest =
      String(body[FORMSPREE_OPS_QA_FIELD] ?? body.codex_test ?? "").toLowerCase() === "true"
        ? "true"
        : "false";
    const honeypot = typeof body.company === "string" ? body.company.trim() : "";
    if (honeypot) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid submission",
        },
        { status: 400 },
      );
    }

    const validatedData = insertAppointmentSchema.parse({
      ...body,
      requestType: "appointment",
    });

    const appointment = await storage.createContact({
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      phone: validatedData.phone,
      service: validatedData.service,
      message: validatedData.message ?? null,
      requestType: "appointment",
      preferredDate: validatedData.preferredDate,
      preferredTime: validatedData.preferredTime,
      formspreeStatus: "failed",
    });

    try {
      await relayToFormspree({
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        service: validatedData.service,
        preferredDate: validatedData.preferredDate,
        preferredTime: validatedData.preferredTime,
        message: validatedData.message ?? undefined,
        codexTest,
      });

      const deliveredAppointment = await storage.updateContactFormspreeStatus(
        appointment.id,
        "delivered",
      );

      return NextResponse.json(
        {
          success: true,
          delivered: true,
          appointment: deliveredAppointment || {
            ...appointment,
            formspreeStatus: "delivered",
          },
        },
        { status: 201 },
      );
    } catch (relayError) {
      console.error("Appointment relay warning:", relayError);
      return NextResponse.json(
        {
          success: true,
          delivered: false,
          appointment,
          fallbackMessage,
        },
        { status: 202 },
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid appointment data",
          errors: error.issues,
        },
        { status: 400 },
      );
    }

    console.error("Appointment form error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit appointment request",
      },
      { status: 500 },
    );
  }
}
