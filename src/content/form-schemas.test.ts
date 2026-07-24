import { describe, expect, it } from "vitest";
import {
  appointmentDetailsStepSchema,
  appointmentFormSchema,
  appointmentPreferencesStepSchema,
  contactFormSchema,
  insertAppointmentSchema,
  leadServiceIds,
  LEAD_CONSENT_VERSION,
} from "@/content/form-schemas";

describe("public lead schemas", () => {
  it("requires explicit contact consent", () => {
    const result = contactFormSchema.safeParse({
      company: "",
      firstName: "Jamie",
      lastName: "Lee",
      email: "jamie@example.com",
      phone: "",
      service: "",
      message: "",
      consentToContact: false,
    });

    expect(result.success).toBe(false);
  });

  it("accepts Other as a contact-only service choice", () => {
    const contact = contactFormSchema.safeParse({
      company: "",
      firstName: "Jamie",
      lastName: "Lee",
      email: "jamie@example.com",
      phone: "",
      service: "other",
      message: "I have a general question.",
      consentToContact: true,
    });

    const appointment = appointmentFormSchema.safeParse({
      company: "",
      firstName: "Jamie",
      lastName: "Lee",
      email: "jamie@example.com",
      phone: "(408) 555-1212",
      service: "other",
      preferredDate: "",
      preferredTime: "",
      message: "",
      consentToContact: true,
    });

    expect(contact.success).toBe(true);
    expect(appointment.success).toBe(false);
  });

  it("requires a plausible phone and selected service for appointments", () => {
    const result = appointmentFormSchema.safeParse({
      company: "",
      firstName: "Jamie",
      lastName: "Lee",
      email: "jamie@example.com",
      phone: "123",
      service: "",
      preferredDate: "",
      preferredTime: "",
      message: "",
      consentToContact: true,
    });

    expect(result.success).toBe(false);
  });

  it("accepts bounded attribution and a valid idempotency key", () => {
    const result = insertAppointmentSchema.safeParse({
      company: "",
      firstName: "Jamie",
      lastName: "Lee",
      email: "jamie@example.com",
      phone: "(408) 555-1212",
      service: "invisalign",
      preferredDate: "2026-08-10",
      preferredTime: "morning",
      message: "Please call after 3.",
      consentToContact: true,
      consentVersion: LEAD_CONSENT_VERSION,
      submissionId: "0d9f6471-7120-4b5a-a1af-e1f77b0dcacf",
      landingPage: "/services/invisalign",
      ctaSource: "service_detail_hero",
      utmSource: "google",
      utmCampaign: "los-gatos-invisalign",
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.requestType).toBe("appointment");
  });

  it("keeps the service catalog closed and rejects past dates", () => {
    expect(leadServiceIds).toContain("childrens-dentistry/babys-first-visit");
    const base = {
      company: "",
      firstName: "Jamie",
      lastName: "Lee",
      email: "jamie@example.com",
      phone: "(408) 555-1212",
      preferredTime: "morning" as const,
      message: "",
      consentToContact: true,
    };

    expect(
      appointmentFormSchema.safeParse({ ...base, service: "made-up-service", preferredDate: "" }).success,
    ).toBe(false);
    expect(
      appointmentFormSchema.safeParse({ ...base, service: "invisalign", preferredDate: "2020-01-01" }).success,
    ).toBe(false);
  });

  it("validates required details before optional appointment preferences", () => {
    expect(
      appointmentDetailsStepSchema.safeParse({
        firstName: "Jamie",
        lastName: "Lee",
        email: "jamie@example.com",
        phone: "(408) 555-1212",
        service: "invisalign",
      }).success,
    ).toBe(true);
    expect(
      appointmentDetailsStepSchema.safeParse({
        firstName: "Jamie",
        lastName: "Lee",
        email: "not-an-email",
        phone: "123",
        service: "",
      }).success,
    ).toBe(false);

    expect(
      appointmentPreferencesStepSchema.safeParse({
        preferredDate: "",
        preferredTime: "",
        message: "",
        consentToContact: true,
      }).success,
    ).toBe(true);
    expect(
      appointmentPreferencesStepSchema.safeParse({
        preferredDate: "",
        preferredTime: "",
        message: "",
        consentToContact: false,
      }).success,
    ).toBe(false);
  });
});
