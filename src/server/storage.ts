import { randomUUID } from "crypto";
import { and, desc, eq, ilike, or, sql as dsql } from "drizzle-orm";
import {
  contacts,
  users,
  type Contact,
  type InsertContactRecord,
  type InsertUser,
  type LeadStatus,
  type User,
} from "@/server/schema";
import { db } from "@/server/db";
import { normalizeLeadSource } from "@/app/api/admin/contacts/lead-source";

export { normalizeLeadSource } from "@/app/api/admin/contacts/lead-source";

type ListContactsOptions = {
  limit: number;
  offset: number;
  q?: string;
  status?: LeadStatus;
  source?: string;
};

export type ListContactsResult = {
  total: number;
  items: Contact[];
};

export type LeadSourceSummary = {
  source: string;
  leads: number;
  booked: number;
  arrived: number;
  bookingRate: number;
  arrivalRate: number;
};

export type UpdateContactLifecycleInput = {
  leadStatus?: LeadStatus;
  lostReason?: string | null;
  staffNotes?: string | null;
  expectedUpdatedAt: Date;
};

export type UpdateContactLifecycleResult =
  | { status: "updated"; contact: Contact }
  | { status: "not_found" }
  | { status: "conflict" }
  | { status: "invalid_lost_reason" };

type ContactLifecycleFields = Pick<
  Contact,
  "leadStatus" | "contactedAt" | "bookedAt" | "arrivedAt" | "lostReason" | "staffNotes"
>;

export const buildContactLifecycleUpdate = (
  existing: ContactLifecycleFields,
  update: Omit<UpdateContactLifecycleInput, "expectedUpdatedAt">,
  now: Date,
): ContactLifecycleFields => {
  const leadStatus = update.leadStatus ?? existing.leadStatus;
  const reachedContacted = ["contacted", "booked", "arrived", "no-show"].includes(
    leadStatus,
  );
  const reachedBooked = ["booked", "arrived", "no-show"].includes(leadStatus);
  const reachedArrived = leadStatus === "arrived";

  return {
    leadStatus,
    contactedAt: existing.contactedAt ?? (reachedContacted ? now : null),
    bookedAt: existing.bookedAt ?? (reachedBooked ? now : null),
    arrivedAt: existing.arrivedAt ?? (reachedArrived ? now : null),
    lostReason:
      leadStatus === "lost"
        ? update.lostReason === undefined
          ? existing.lostReason
          : update.lostReason
        : null,
    staffNotes:
      update.staffNotes === undefined ? existing.staffNotes : update.staffNotes,
  };
};

const leadSourceSql = dsql<string>`CASE
  WHEN LOWER(BTRIM(${contacts.utmSource})) IN ('google', 'google ads', 'googleads', 'adwords')
    THEN 'Google Ads'
  WHEN LOWER(BTRIM(${contacts.utmSource})) IN ('facebook', 'fb', 'instagram', 'meta')
    THEN 'Meta'
  WHEN LOWER(BTRIM(${contacts.utmSource})) IN ('bing', 'microsoft', 'microsoft ads')
    THEN 'Microsoft Ads'
  WHEN NULLIF(BTRIM(${contacts.utmSource}), '') IS NOT NULL
    THEN INITCAP(LOWER(REGEXP_REPLACE(BTRIM(${contacts.utmSource}), '[[:space:]]+', ' ', 'g')))
  WHEN COALESCE(
    NULLIF(BTRIM(${contacts.gclid}), ''),
    NULLIF(BTRIM(${contacts.gbraid}), ''),
    NULLIF(BTRIM(${contacts.wbraid}), '')
  ) IS NOT NULL THEN 'Google Ads'
  WHEN NULLIF(BTRIM(${contacts.referrer}), '') IS NOT NULL THEN 'Referral'
  ELSE 'Direct / unknown'
END`;

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getContact(id: string): Promise<Contact | undefined>;
  getContactBySubmissionId(submissionId: string): Promise<Contact | undefined>;
  getContactByGoogleAdsLeadId(leadId: string): Promise<Contact | undefined>;
  createContact(contact: InsertContactRecord): Promise<Contact>;
  createContactIgnoreDuplicate(contact: InsertContactRecord): Promise<Contact | null>;
  claimContactNotification(id: string): Promise<Contact | undefined>;
  updateContactFormspreeStatus(
    id: string,
    status: "delivered" | "failed",
  ): Promise<Contact | undefined>;
  listContacts(options: ListContactsOptions): Promise<ListContactsResult>;
  getLeadSourceSummary(): Promise<LeadSourceSummary[]>;
  getCountsByStatus(): Promise<Record<string, number>>;
  updateContactLifecycle(
    id: string,
    update: UpdateContactLifecycleInput,
  ): Promise<UpdateContactLifecycleResult>;
}

type DrizzleDatabase = NonNullable<typeof db>;

export class DatabaseStorage implements IStorage {
  constructor(private readonly database: DrizzleDatabase) {}

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await this.database.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.database
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.database.insert(users).values(insertUser).returning();
    return user;
  }

  async createContact(insertContact: InsertContactRecord): Promise<Contact> {
    const [contact] = await this.database
      .insert(contacts)
      .values(insertContact)
      .returning();
    return contact;
  }

  async createContactIgnoreDuplicate(
    insertContact: InsertContactRecord,
  ): Promise<Contact | null> {
    const [contact] = await this.database
      .insert(contacts)
      .values(insertContact)
      .onConflictDoNothing()
      .returning();
    return contact || null;
  }

  async getContact(id: string): Promise<Contact | undefined> {
    const [contact] = await this.database
      .select()
      .from(contacts)
      .where(eq(contacts.id, id))
      .limit(1);
    return contact || undefined;
  }

  async getContactBySubmissionId(submissionId: string): Promise<Contact | undefined> {
    const [contact] = await this.database
      .select()
      .from(contacts)
      .where(eq(contacts.submissionId, submissionId))
      .limit(1);
    return contact || undefined;
  }

  async getContactByGoogleAdsLeadId(leadId: string): Promise<Contact | undefined> {
    const [contact] = await this.database
      .select()
      .from(contacts)
      .where(eq(contacts.googleAdsLeadId, leadId))
      .limit(1);
    return contact || undefined;
  }

  async claimContactNotification(id: string): Promise<Contact | undefined> {
    // Formspree has no verified idempotency key. A sending claim is therefore
    // never auto-reclaimed: interrupted sends require manual reconciliation.
    const [contact] = await this.database
      .update(contacts)
      .set({ formspreeStatus: "sending", updatedAt: new Date() })
      .where(and(eq(contacts.id, id), eq(contacts.formspreeStatus, "failed")))
      .returning();
    return contact || undefined;
  }

  async updateContactFormspreeStatus(
    id: string,
    status: "delivered" | "failed",
  ): Promise<Contact | undefined> {
    const [contact] = await this.database
      .update(contacts)
      .set({ formspreeStatus: status, updatedAt: new Date() })
      .where(eq(contacts.id, id))
      .returning();
    return contact;
  }

  async listContacts(options: ListContactsOptions): Promise<ListContactsResult> {
    const q = options.q?.trim();
    const escapedQuery = q?.replace(/[\\%_]/g, "\\$&");
    const pattern = escapedQuery ? `%${escapedQuery}%` : null;
    const searchWhere = pattern
      ? or(
          ilike(contacts.firstName, pattern),
          ilike(contacts.lastName, pattern),
          ilike(contacts.email, pattern),
          ilike(contacts.phone, pattern),
          ilike(contacts.service, pattern),
          ilike(contacts.message, pattern),
          ilike(contacts.requestType, pattern),
          ilike(contacts.preferredDate, pattern),
          ilike(contacts.preferredTime, pattern),
          ilike(contacts.formspreeStatus, pattern),
          ilike(contacts.utmSource, pattern),
          ilike(contacts.utmCampaign, pattern),
          ilike(contacts.landingPage, pattern),
          ilike(contacts.leadStatus, pattern),
          ilike(contacts.lostReason, pattern),
          ilike(contacts.staffNotes, pattern),
        )
      : undefined;
    const where = and(
      searchWhere,
      options.status ? eq(contacts.leadStatus, options.status) : undefined,
      options.source ? eq(leadSourceSql, options.source) : undefined,
    );

    const [countRow] = await this.database
      .select({ count: dsql<number>`count(*)` })
      .from(contacts)
      .where(where);

    const items = await this.database
      .select()
      .from(contacts)
      .where(where)
      .orderBy(desc(contacts.createdAt), desc(contacts.id))
      .limit(options.limit)
      .offset(options.offset);

    return {
      total: Number(countRow?.count ?? 0),
      items,
    };
  }

  async getLeadSourceSummary(): Promise<LeadSourceSummary[]> {
    const rows = await this.database
      .select({
        source: leadSourceSql,
        leads: dsql<number>`count(*)::int`,
        booked: dsql<number>`count(*) FILTER (WHERE ${contacts.bookedAt} IS NOT NULL)::int`,
        arrived: dsql<number>`count(*) FILTER (WHERE ${contacts.arrivedAt} IS NOT NULL)::int`,
      })
      .from(contacts)
      .where(eq(contacts.isTest, false))
      .groupBy(leadSourceSql)
      .orderBy(desc(dsql`count(*)`));

    return rows.map((row) => {
      const leads = Number(row.leads);
      const booked = Number(row.booked);
      const arrived = Number(row.arrived);
      return {
        source: row.source,
        leads,
        booked,
        arrived,
        bookingRate: leads ? booked / leads : 0,
        arrivalRate: leads ? arrived / leads : 0,
      };
    });
  }

  async getCountsByStatus(): Promise<Record<string, number>> {
    const rows = await this.database
      .select({
        status: contacts.leadStatus,
        count: dsql<number>`count(*)::int`,
      })
      .from(contacts)
      .where(eq(contacts.isTest, false))
      .groupBy(contacts.leadStatus);

    const result: Record<string, number> = {};
    for (const row of rows) {
      result[row.status] = Number(row.count);
    }
    return result;
  }

  async updateContactLifecycle(
    id: string,
    update: UpdateContactLifecycleInput,
  ): Promise<UpdateContactLifecycleResult> {
    const existing = await this.getContact(id);
    if (!existing) return { status: "not_found" };
    if (existing.updatedAt.getTime() !== update.expectedUpdatedAt.getTime()) {
      return { status: "conflict" };
    }

    const now = new Date(
      Math.max(Date.now(), existing.updatedAt.getTime() + 1),
    );
    const lifecycle = buildContactLifecycleUpdate(existing, update, now);
    if (lifecycle.leadStatus === "lost" && !lifecycle.lostReason?.trim()) {
      return { status: "invalid_lost_reason" };
    }

    const [contact] = await this.database
      .update(contacts)
      .set({
        ...lifecycle,
        updatedAt: now,
      })
      .where(
        and(
          eq(contacts.id, id),
          eq(contacts.updatedAt, update.expectedUpdatedAt),
        ),
      )
      .returning();
    return contact ? { status: "updated", contact } : { status: "conflict" };
  }
}

export class InMemoryStorage implements IStorage {
  private readonly users = new Map<string, User>();
  private readonly contacts = new Map<string, Contact>();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: randomUUID(),
      ...insertUser,
    };
    this.users.set(user.id, user);
    return user;
  }

  async createContact(insertContact: InsertContactRecord): Promise<Contact> {
    const contact: Contact = {
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      submissionId: insertContact.submissionId ?? null,
      firstName: insertContact.firstName,
      lastName: insertContact.lastName,
      email: insertContact.email ?? null,
      phone: insertContact.phone ?? null,
      service: insertContact.service ?? null,
      message: insertContact.message ?? null,
      requestType: insertContact.requestType ?? "contact",
      preferredDate: insertContact.preferredDate ?? null,
      preferredTime: insertContact.preferredTime ?? null,
      formspreeStatus: insertContact.formspreeStatus ?? null,
      landingPage: insertContact.landingPage ?? null,
      referrer: insertContact.referrer ?? null,
      ctaSource: insertContact.ctaSource ?? null,
      utmSource: insertContact.utmSource ?? null,
      utmMedium: insertContact.utmMedium ?? null,
      utmCampaign: insertContact.utmCampaign ?? null,
      utmTerm: insertContact.utmTerm ?? null,
      utmContent: insertContact.utmContent ?? null,
      gclid: insertContact.gclid ?? null,
      gbraid: insertContact.gbraid ?? null,
      wbraid: insertContact.wbraid ?? null,
      consentToContact: insertContact.consentToContact ?? false,
      consentVersion: insertContact.consentVersion ?? null,
      leadStatus: insertContact.leadStatus ?? "new",
      contactedAt: insertContact.contactedAt ?? null,
      bookedAt: insertContact.bookedAt ?? null,
      arrivedAt: insertContact.arrivedAt ?? null,
      lostReason: insertContact.lostReason ?? null,
      staffNotes: insertContact.staffNotes ?? null,
      googleAdsLeadId: insertContact.googleAdsLeadId ?? null,
      campaignId: insertContact.campaignId ?? null,
      campaignName: insertContact.campaignName ?? null,
      ingestedVia: insertContact.ingestedVia ?? null,
      updatedBy: insertContact.updatedBy ?? null,
      isTest: insertContact.isTest ?? false,
      rawPayload: insertContact.rawPayload ?? null,
    };
    this.contacts.set(contact.id, contact);
    return contact;
  }

  async createContactIgnoreDuplicate(
    insertContact: InsertContactRecord,
  ): Promise<Contact | null> {
    if (insertContact.googleAdsLeadId) {
      const existing = await this.getContactByGoogleAdsLeadId(
        insertContact.googleAdsLeadId,
      );
      if (existing) return null;
    }
    return this.createContact(insertContact);
  }

  async getContact(id: string): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async getContactBySubmissionId(submissionId: string): Promise<Contact | undefined> {
    return Array.from(this.contacts.values()).find(
      (contact) => contact.submissionId === submissionId,
    );
  }

  async getContactByGoogleAdsLeadId(leadId: string): Promise<Contact | undefined> {
    return Array.from(this.contacts.values()).find(
      (contact) => contact.googleAdsLeadId === leadId,
    );
  }

  async claimContactNotification(id: string): Promise<Contact | undefined> {
    const existing = this.contacts.get(id);
    if (!existing || existing.formspreeStatus !== "failed") return undefined;

    const claimed: Contact = {
      ...existing,
      formspreeStatus: "sending",
      updatedAt: new Date(),
    };
    this.contacts.set(id, claimed);
    return claimed;
  }

  async updateContactFormspreeStatus(
    id: string,
    status: "delivered" | "failed",
  ): Promise<Contact | undefined> {
    const existing = this.contacts.get(id);
    if (!existing) return undefined;
    const updated: Contact = {
      ...existing,
      formspreeStatus: status,
      updatedAt: new Date(),
    };
    this.contacts.set(id, updated);
    return updated;
  }

  async listContacts(options: ListContactsOptions): Promise<ListContactsResult> {
    const q = options.q?.trim().toLowerCase() || "";
    const matches = (contact: Contact) => {
      if (!q) return true;
      const haystack = [
        contact.firstName,
        contact.lastName,
        contact.email,
        contact.phone,
        contact.service,
        contact.message,
        contact.requestType,
        contact.preferredDate,
        contact.preferredTime,
        contact.formspreeStatus,
        contact.utmSource,
        contact.utmCampaign,
        contact.landingPage,
        contact.leadStatus,
        contact.lostReason,
        contact.staffNotes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    };

    const all = Array.from(this.contacts.values())
      .filter(
        (contact) =>
          matches(contact) &&
          (!options.status || contact.leadStatus === options.status) &&
          (!options.source || normalizeLeadSource(contact) === options.source),
      )
      .sort(
        (a, b) =>
          b.createdAt.getTime() - a.createdAt.getTime() ||
          b.id.localeCompare(a.id),
      );

    const items = all.slice(options.offset, options.offset + options.limit);
    return { total: all.length, items };
  }

  async getLeadSourceSummary(): Promise<LeadSourceSummary[]> {
    const buckets = new Map<string, { leads: number; booked: number; arrived: number }>();
    for (const contact of this.contacts.values()) {
      if (contact.isTest) continue;
      const source = normalizeLeadSource(contact);
      const bucket = buckets.get(source) ?? { leads: 0, booked: 0, arrived: 0 };
      bucket.leads += 1;
      if (contact.bookedAt) bucket.booked += 1;
      if (contact.arrivedAt) bucket.arrived += 1;
      buckets.set(source, bucket);
    }

    return Array.from(buckets, ([source, value]) => ({
      source,
      ...value,
      bookingRate: value.leads ? value.booked / value.leads : 0,
      arrivalRate: value.leads ? value.arrived / value.leads : 0,
    })).sort((a, b) => b.leads - a.leads || a.source.localeCompare(b.source));
  }

  async getCountsByStatus(): Promise<Record<string, number>> {
    const result: Record<string, number> = {};
    for (const contact of this.contacts.values()) {
      if (contact.isTest) continue;
      result[contact.leadStatus] = (result[contact.leadStatus] ?? 0) + 1;
    }
    return result;
  }

  async updateContactLifecycle(
    id: string,
    update: UpdateContactLifecycleInput,
  ): Promise<UpdateContactLifecycleResult> {
    const existing = this.contacts.get(id);
    if (!existing) return { status: "not_found" };
    if (existing.updatedAt.getTime() !== update.expectedUpdatedAt.getTime()) {
      return { status: "conflict" };
    }

    const now = new Date(
      Math.max(Date.now(), existing.updatedAt.getTime() + 1),
    );
    const lifecycle = buildContactLifecycleUpdate(existing, update, now);
    if (lifecycle.leadStatus === "lost" && !lifecycle.lostReason?.trim()) {
      return { status: "invalid_lost_reason" };
    }
    const updated: Contact = {
      ...existing,
      ...lifecycle,
      updatedAt: now,
    };
    this.contacts.set(id, updated);
    return { status: "updated", contact: updated };
  }
}

class UnavailableStorage implements IStorage {
  private readonly message =
    "DATABASE_URL is required in production. Contact storage is unavailable.";

  async getUser(): Promise<User | undefined> {
    return undefined;
  }

  async getUserByUsername(): Promise<User | undefined> {
    return undefined;
  }

  async createUser(): Promise<User> {
    throw new Error(this.message);
  }

  async createContact(): Promise<Contact> {
    throw new Error(this.message);
  }

  async createContactIgnoreDuplicate(): Promise<Contact | null> {
    throw new Error(this.message);
  }

  async getContact(): Promise<Contact | undefined> {
    throw new Error(this.message);
  }

  async getContactBySubmissionId(): Promise<Contact | undefined> {
    throw new Error(this.message);
  }

  async getContactByGoogleAdsLeadId(): Promise<Contact | undefined> {
    throw new Error(this.message);
  }

  async claimContactNotification(): Promise<Contact | undefined> {
    throw new Error(this.message);
  }

  async updateContactFormspreeStatus(): Promise<Contact | undefined> {
    throw new Error(this.message);
  }

  async listContacts(): Promise<ListContactsResult> {
    throw new Error(this.message);
  }

  async getLeadSourceSummary(): Promise<LeadSourceSummary[]> {
    throw new Error(this.message);
  }

  async getCountsByStatus(): Promise<Record<string, number>> {
    throw new Error(this.message);
  }

  async updateContactLifecycle(): Promise<UpdateContactLifecycleResult> {
    throw new Error(this.message);
  }
}

const drizzleDb = db;
const useInMemory = !drizzleDb && process.env.NODE_ENV !== "production";

if (!drizzleDb && !useInMemory) {
  console.error("DATABASE_URL missing in production mode; contact storage is disabled.");
}

export const storage: IStorage = drizzleDb
  ? new DatabaseStorage(drizzleDb)
  : useInMemory
    ? new InMemoryStorage()
    : new UnavailableStorage();
