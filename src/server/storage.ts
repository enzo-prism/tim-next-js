import { randomUUID } from "crypto";
import { desc, eq, ilike, or, sql as dsql } from "drizzle-orm";
import {
  contacts,
  users,
  type Contact,
  type InsertContactRecord,
  type InsertUser,
  type User,
} from "@/server/schema";
import { db } from "@/server/db";

type ListContactsOptions = {
  limit: number;
  offset: number;
  q?: string;
};

export type ListContactsResult = {
  total: number;
  items: Contact[];
};

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContact(contact: InsertContactRecord): Promise<Contact>;
  updateContactFormspreeStatus(
    id: string,
    status: "delivered" | "failed",
  ): Promise<Contact | undefined>;
  listContacts(options: ListContactsOptions): Promise<ListContactsResult>;
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

  async updateContactFormspreeStatus(
    id: string,
    status: "delivered" | "failed",
  ): Promise<Contact | undefined> {
    const [contact] = await this.database
      .update(contacts)
      .set({ formspreeStatus: status })
      .where(eq(contacts.id, id))
      .returning();
    return contact;
  }

  async listContacts(options: ListContactsOptions): Promise<ListContactsResult> {
    const q = options.q?.trim();
    const pattern = q ? `%${q}%` : null;
    const where = pattern
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
        )
      : undefined;

    const [countRow] = await this.database
      .select({ count: dsql<number>`count(*)` })
      .from(contacts)
      .where(where);

    const items = await this.database
      .select()
      .from(contacts)
      .where(where)
      .orderBy(desc(contacts.createdAt))
      .limit(options.limit)
      .offset(options.offset);

    return {
      total: Number(countRow?.count ?? 0),
      items,
    };
  }
}

class InMemoryStorage implements IStorage {
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
      firstName: insertContact.firstName,
      lastName: insertContact.lastName,
      email: insertContact.email,
      phone: insertContact.phone ?? null,
      service: insertContact.service ?? null,
      message: insertContact.message ?? null,
      requestType: insertContact.requestType ?? "contact",
      preferredDate: insertContact.preferredDate ?? null,
      preferredTime: insertContact.preferredTime ?? null,
      formspreeStatus: insertContact.formspreeStatus ?? null,
    };
    this.contacts.set(contact.id, contact);
    return contact;
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
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    };

    const all = Array.from(this.contacts.values())
      .filter(matches)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const items = all.slice(options.offset, options.offset + options.limit);
    return { total: all.length, items };
  }
}

class UnavailableStorage implements IStorage {
  private readonly message =
    "DATABASE_URL is required in production. Contact storage is unavailable.";

  async getUser(_id: string): Promise<User | undefined> {
    return undefined;
  }

  async getUserByUsername(_username: string): Promise<User | undefined> {
    return undefined;
  }

  async createUser(_insertUser: InsertUser): Promise<User> {
    throw new Error(this.message);
  }

  async createContact(_insertContact: InsertContactRecord): Promise<Contact> {
    throw new Error(this.message);
  }

  async updateContactFormspreeStatus(
    _id: string,
    _status: "delivered" | "failed",
  ): Promise<Contact | undefined> {
    throw new Error(this.message);
  }

  async listContacts(_options: ListContactsOptions): Promise<ListContactsResult> {
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
