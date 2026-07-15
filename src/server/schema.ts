import { sql } from "drizzle-orm";
import { boolean, pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  submissionId: varchar("submission_id", { length: 36 }).unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  service: text("service"),
  message: text("message"),
  requestType: text("request_type").notNull().default("contact"),
  preferredDate: text("preferred_date"),
  preferredTime: text("preferred_time"),
  formspreeStatus: text("formspree_status"),
  landingPage: text("landing_page"),
  referrer: text("referrer"),
  ctaSource: text("cta_source"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  utmTerm: text("utm_term"),
  utmContent: text("utm_content"),
  gclid: text("gclid"),
  gbraid: text("gbraid"),
  wbraid: text("wbraid"),
  consentToContact: boolean("consent_to_contact").notNull().default(false),
  consentVersion: text("consent_version"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export {
  insertContactSchema,
  insertAppointmentSchema,
  type InsertContact,
  type InsertAppointment,
} from "@/content/form-schemas";

export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertContactRecord = typeof contacts.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
