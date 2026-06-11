import { z } from "zod";

/**
 * Plain Zod schemas shared by the public forms (client) and API routes
 * (server). Keeping these free of drizzle-orm imports keeps the database
 * toolchain out of the browser bundle. `src/server/schema.ts` re-exports
 * them so the persistence layer stays aligned with form validation.
 */

export const insertContactSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string().nullable().optional(),
  service: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
});

export const insertAppointmentSchema = insertContactSchema.extend({
  phone: z.string().min(1, "Phone number is required"),
  service: z.string().min(1, "Please select a service"),
  preferredDate: z.string().min(1, "Preferred date is required"),
  preferredTime: z.string().min(1, "Preferred time is required"),
  requestType: z.literal("appointment").default("appointment"),
  formspreeStatus: z.enum(["delivered", "failed"]).optional(),
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
