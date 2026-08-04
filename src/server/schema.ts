import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const LEAD_STATUS_VALUES = [
  "new",
  "contacted",
  "booked",
  "arrived",
  "no-show",
  "lost",
] as const;

export type LeadStatus = (typeof LEAD_STATUS_VALUES)[number];

export const INGESTED_VIA_VALUES = [
  "webhook",
  "reconciliation",
  "website-form",
  "backfill",
] as const;

export type IngestedVia = (typeof INGESTED_VIA_VALUES)[number];

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const contacts = pgTable(
  "contacts",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    submissionId: varchar("submission_id", { length: 36 }).unique(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email"),
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
    leadStatus: text("lead_status").$type<LeadStatus>().notNull().default("new"),
    contactedAt: timestamp("contacted_at"),
    bookedAt: timestamp("booked_at"),
    arrivedAt: timestamp("arrived_at"),
    lostReason: text("lost_reason"),
    staffNotes: text("staff_notes"),
    googleAdsLeadId: text("google_ads_lead_id"),
    campaignId: text("campaign_id"),
    campaignName: text("campaign_name"),
    ingestedVia: text("ingested_via").$type<IngestedVia>(),
    updatedBy: text("updated_by"),
    isTest: boolean("is_test").notNull().default(false),
    rawPayload: jsonb("raw_payload"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("contacts_lead_status_idx").on(table.leadStatus),
    index("contacts_created_at_idx").on(table.createdAt.desc()),
    uniqueIndex("contacts_google_ads_lead_id_idx")
      .on(table.googleAdsLeadId)
      .where(sql`${table.googleAdsLeadId} IS NOT NULL`),
    check(
      "contacts_lead_status_check",
      sql`${table.leadStatus} in ('new', 'contacted', 'booked', 'arrived', 'no-show', 'lost')`,
    ),
    check(
      "contacts_request_type_check",
      sql`${table.requestType} in ('contact', 'appointment', 'google_ads_lead')`,
    ),
    check(
      "contacts_formspree_status_check",
      sql`${table.formspreeStatus} is null or ${table.formspreeStatus} in ('failed', 'sending', 'delivered')`,
    ),
    check(
      "contacts_ingested_via_check",
      sql`${table.ingestedVia} is null or ${table.ingestedVia} in ('webhook', 'reconciliation', 'website-form', 'backfill')`,
    ),
  ],
);

export const OUTBOX_STATUS_VALUES = [
  "pending",
  "sending",
  "sent",
  "failed",
] as const;

export type OutboxStatus = (typeof OUTBOX_STATUS_VALUES)[number];

export const notificationOutbox = pgTable(
  "notification_outbox",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    eventKey: text("event_key").notNull(),
    eventType: text("event_type").notNull().default("new_lead"),
    contactId: varchar("contact_id")
      .notNull()
      .references(() => contacts.id),
    status: text("status").$type<OutboxStatus>().notNull().default("pending"),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    sentAt: timestamp("sent_at"),
  },
  (table) => [
    uniqueIndex("notification_outbox_event_key_idx").on(table.eventKey),
    index("notification_outbox_status_idx").on(table.status),
    check(
      "notification_outbox_status_check",
      sql`${table.status} in ('pending', 'sending', 'sent', 'failed')`,
    ),
    check(
      "notification_outbox_event_type_check",
      sql`${table.eventType} in ('new_lead')`,
    ),
  ],
);

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
