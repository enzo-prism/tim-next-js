import { z } from "zod";

/**
 * Plain Zod schemas shared by the public forms (client) and API routes
 * (server). Keeping these free of drizzle-orm imports keeps the database
 * toolchain out of the browser bundle. `src/server/schema.ts` re-exports
 * them so the persistence layer stays aligned with form validation.
 */

export const LEAD_CONSENT_VERSION = "2026-07-15";

const requiredName = (label: string) =>
  z.string().trim().min(1, `${label} is required`).max(80, `${label} is too long`);

const phoneSchema = z
  .string()
  .trim()
  .max(30, "Phone number is too long")
  .refine(
    (value) => !value || (value.replace(/\D/g, "").length >= 7 && value.replace(/\D/g, "").length <= 15),
    "Enter a valid phone number",
  );

const consentSchema = z.boolean().refine(Boolean, "Please confirm that we may contact you");

export const leadServiceIds = [
  "children-dentistry",
  "childrens-dentistry/babys-first-visit",
  "dental-exams",
  "dental-hygiene",
  "family-dentistry",
  "night-guards",
  "restorative-dentistry",
  "invisalign",
  "teeth-whitening",
  "dental-crowns",
  "tmj",
] as const;

const serviceIdSchema = z.enum(leadServiceIds);
const contactServiceIdSchema = z.union([serviceIdSchema, z.literal("other")]);

const getPracticeToday = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
};

const leadAttributionSchema = z.object({
  submissionId: z.string().uuid("Invalid submission ID"),
  landingPage: z.string().trim().max(300).optional(),
  referrer: z.string().trim().max(200).optional(),
  ctaSource: z.string().trim().max(100).optional(),
  utmSource: z.string().trim().max(120).optional(),
  utmMedium: z.string().trim().max(120).optional(),
  utmCampaign: z.string().trim().max(180).optional(),
  utmTerm: z.string().trim().max(180).optional(),
  utmContent: z.string().trim().max(180).optional(),
  gclid: z.string().trim().max(200).optional(),
  gbraid: z.string().trim().max(200).optional(),
  wbraid: z.string().trim().max(200).optional(),
  consentVersion: z.literal(LEAD_CONSENT_VERSION),
});

export const contactFormSchema = z.object({
  company: z.string().trim().max(200).optional(),
  firstName: requiredName("First name"),
  lastName: requiredName("Last name"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address").max(254),
  phone: phoneSchema.nullable().optional(),
  service: z.union([z.literal(""), contactServiceIdSchema]).nullable().optional(),
  message: z.string().trim().max(2000, "Message is too long").nullable().optional(),
  consentToContact: consentSchema,
});

export const appointmentFormSchema = contactFormSchema.extend({
  phone: phoneSchema.refine((value) => value.length > 0, "Phone number is required"),
  service: z
    .union([z.literal(""), serviceIdSchema])
    .refine((value): boolean => value !== "", "Select a service"),
  preferredDate: z
    .string()
    .trim()
    .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), "Enter a valid preferred date")
    .refine((value) => !value || value >= getPracticeToday(), "Preferred date cannot be in the past")
    .optional(),
  preferredTime: z.enum(["", "morning", "afternoon", "flexible"]).optional(),
});

/**
 * Step-level schemas keep the client flow aligned with the final API contract.
 * The API still validates the complete `appointmentFormSchema` in one pass.
 */
export const appointmentDetailsStepSchema = appointmentFormSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  service: true,
});

export const appointmentPreferencesStepSchema = appointmentFormSchema.pick({
  preferredDate: true,
  preferredTime: true,
  message: true,
  consentToContact: true,
});

export const insertContactSchema = contactFormSchema.merge(leadAttributionSchema);

export const insertAppointmentSchema = appointmentFormSchema.merge(leadAttributionSchema).extend({
  requestType: z.literal("appointment").default("appointment"),
  formspreeStatus: z.enum(["delivered", "failed"]).optional(),
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;
