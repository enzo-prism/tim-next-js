import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

const baseInsertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const insertContactSchema = baseInsertContactSchema.omit({
  requestType: true,
  preferredDate: true,
  preferredTime: true,
  formspreeStatus: true,
});

export const insertAppointmentSchema = insertContactSchema.extend({
  phone: z.string().min(1, "Phone number is required"),
  service: z.string().min(1, "Please select a service"),
  preferredDate: z.string().min(1, "Preferred date is required"),
  preferredTime: z.string().min(1, "Preferred time is required"),
  requestType: z.literal("appointment").default("appointment"),
  formspreeStatus: z.enum(["delivered", "failed"]).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type InsertContactRecord = typeof contacts.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
