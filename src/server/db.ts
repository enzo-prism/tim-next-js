import { sql } from "@vercel/postgres";
import { drizzle, type VercelPgDatabase } from "drizzle-orm/vercel-postgres";
import * as schema from "@/server/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  if (process.env.NODE_ENV === "production") {
    console.error("DATABASE_URL is not set. Production data persistence is unavailable.");
  } else {
    console.warn("DATABASE_URL not set. Using in-memory storage in development.");
  }
}

export const db: VercelPgDatabase<typeof schema> | undefined = connectionString
  ? drizzle(sql, { schema })
  : undefined;

export const hasDatabase = Boolean(db);
