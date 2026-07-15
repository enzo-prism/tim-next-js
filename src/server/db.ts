import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "@/server/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  if (process.env.NODE_ENV === "production") {
    console.error("DATABASE_URL is not set. Production data persistence is unavailable.");
  } else {
    console.warn("DATABASE_URL not set. Using in-memory storage in development.");
  }
}

export const db: NeonHttpDatabase<typeof schema> | undefined = connectionString
  ? drizzle(neon(connectionString), { schema })
  : undefined;

export const hasDatabase = Boolean(db);
