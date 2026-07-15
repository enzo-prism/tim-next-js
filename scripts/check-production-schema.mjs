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
  "lead_status",
  "contacted_at",
  "booked_at",
  "arrived_at",
  "lost_reason",
  "staff_notes",
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

const lifecycleIndexes = await sql`
  SELECT indexname
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND tablename = 'contacts'
    AND indexname IN ('contacts_lead_status_idx', 'contacts_created_at_idx')
`;

const lifecycleConstraints = await sql`
  SELECT pg_get_constraintdef(oid) AS definition
  FROM pg_constraint
  WHERE conname = 'contacts_lead_status_check'
    AND conrelid = 'contacts'::regclass
`;

const lifecycleConstraint = String(lifecycleConstraints[0]?.definition ?? "");
const lifecycleStatuses = ["new", "contacted", "booked", "arrived", "no-show", "lost"];
const missingLifecycleStatuses = lifecycleStatuses.filter(
  (status) => !lifecycleConstraint.includes(`'${status}'`),
);

if (
  missing.length > 0 ||
  uniqueIndexes.length === 0 ||
  lifecycleIndexes.length < 2 ||
  lifecycleConstraints.length === 0 ||
  missingLifecycleStatuses.length > 0
) {
  if (missing.length > 0) console.error(`Missing contacts columns: ${missing.join(", ")}`);
  if (uniqueIndexes.length === 0) console.error("Missing unique submission_id index.");
  if (lifecycleIndexes.length < 2) console.error("Missing lifecycle status or created-at index.");
  if (lifecycleConstraints.length === 0) console.error("Missing lead-status check constraint.");
  if (missingLifecycleStatuses.length > 0) {
    console.error(`Lead-status constraint is missing: ${missingLifecycleStatuses.join(", ")}`);
  }
  process.exit(1);
}

console.log(
  "Lead schema verified: attribution, lifecycle fields, constraints, and indexes are present.",
);
