import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error("DATABASE_URL is required to verify the lead schema.");
  process.exit(1);
}

const expectedColumns = [
  "submission_id",
  "landing_page",
  "referrer",
  "cta_source",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
  "consent_to_contact",
  "consent_version",
  "updated_at",
];

const sql = neon(databaseUrl);
const columns = await sql`
  SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'contacts'
`;
const available = new Set(columns.map((row) => row.column_name));
const missing = expectedColumns.filter((column) => !available.has(column));

const uniqueIndexes = await sql`
  SELECT indexdef
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND tablename = 'contacts'
    AND indexdef ILIKE '%UNIQUE%'
    AND indexdef ILIKE '%submission_id%'
`;

if (missing.length > 0 || uniqueIndexes.length === 0) {
  if (missing.length > 0) console.error(`Missing contacts columns: ${missing.join(", ")}`);
  if (uniqueIndexes.length === 0) console.error("Missing unique submission_id index.");
  process.exit(1);
}

console.log("Lead schema verified: required columns and submission id uniqueness are present.");
