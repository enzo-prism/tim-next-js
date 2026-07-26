import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error("DATABASE_URL is required to verify the lead schema.");
  process.exit(1);
}

const expectedColumns = [
  { name: "id", type: "character varying", nullable: false, defaultIncludes: "gen_random_uuid" },
  { name: "submission_id", type: "character varying", nullable: true, maxLength: 36 },
  { name: "first_name", type: "text", nullable: false },
  { name: "last_name", type: "text", nullable: false },
  { name: "email", type: "text", nullable: false },
  { name: "phone", type: "text", nullable: true },
  { name: "service", type: "text", nullable: true },
  { name: "message", type: "text", nullable: true },
  { name: "request_type", type: "text", nullable: false, defaultIncludes: "contact" },
  { name: "preferred_date", type: "text", nullable: true },
  { name: "preferred_time", type: "text", nullable: true },
  { name: "formspree_status", type: "text", nullable: true },
  { name: "landing_page", type: "text", nullable: true },
  { name: "referrer", type: "text", nullable: true },
  { name: "cta_source", type: "text", nullable: true },
  { name: "utm_source", type: "text", nullable: true },
  { name: "utm_medium", type: "text", nullable: true },
  { name: "utm_campaign", type: "text", nullable: true },
  { name: "utm_term", type: "text", nullable: true },
  { name: "utm_content", type: "text", nullable: true },
  { name: "gclid", type: "text", nullable: true },
  { name: "gbraid", type: "text", nullable: true },
  { name: "wbraid", type: "text", nullable: true },
  { name: "consent_to_contact", type: "boolean", nullable: false, defaultIncludes: "false" },
  { name: "consent_version", type: "text", nullable: true },
  { name: "lead_status", type: "text", nullable: false, defaultIncludes: "new" },
  { name: "contacted_at", type: "timestamp without time zone", nullable: true },
  { name: "booked_at", type: "timestamp without time zone", nullable: true },
  { name: "arrived_at", type: "timestamp without time zone", nullable: true },
  { name: "lost_reason", type: "text", nullable: true },
  { name: "staff_notes", type: "text", nullable: true },
  {
    name: "created_at",
    type: "timestamp without time zone",
    nullable: false,
    defaultIncludes: "now()",
  },
  {
    name: "updated_at",
    type: "timestamp without time zone",
    nullable: false,
    defaultIncludes: "now()",
  },
];

const sql = neon(databaseUrl);
const columns = await sql`
  SELECT
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'contacts'
`;
const available = new Map(columns.map((row) => [row.column_name, row]));
const columnProblems = [];

for (const expected of expectedColumns) {
  const actual = available.get(expected.name);
  if (!actual) {
    columnProblems.push(`${expected.name}: missing`);
    continue;
  }
  if (actual.data_type !== expected.type) {
    columnProblems.push(
      `${expected.name}: expected type ${expected.type}, found ${actual.data_type}`,
    );
  }
  const actualNullable = actual.is_nullable === "YES";
  if (actualNullable !== expected.nullable) {
    columnProblems.push(
      `${expected.name}: expected ${expected.nullable ? "nullable" : "NOT NULL"}`,
    );
  }
  if (
    expected.maxLength !== undefined &&
    Number(actual.character_maximum_length) !== expected.maxLength
  ) {
    columnProblems.push(
      `${expected.name}: expected length ${expected.maxLength}, found ${actual.character_maximum_length}`,
    );
  }
  if (
    expected.defaultIncludes &&
    !String(actual.column_default ?? "").includes(expected.defaultIncludes)
  ) {
    columnProblems.push(
      `${expected.name}: expected default containing ${expected.defaultIncludes}`,
    );
  }
}

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

const constraints = await sql`
  SELECT conname, pg_get_constraintdef(oid) AS definition, convalidated
  FROM pg_constraint
  WHERE conrelid = 'contacts'::regclass
    AND conname IN (
      'contacts_pkey',
      'contacts_lead_status_check',
      'contacts_request_type_check',
      'contacts_formspree_status_check'
    )
`;
const constraintsByName = new Map(constraints.map((row) => [row.conname, row]));
const constraintProblems = [];

const expectedConstraintValues = new Map([
  [
    "contacts_lead_status_check",
    ["new", "contacted", "booked", "arrived", "no-show", "lost"],
  ],
  ["contacts_request_type_check", ["contact", "appointment"]],
  ["contacts_formspree_status_check", ["failed", "sending", "delivered"]],
]);

if (!constraintsByName.has("contacts_pkey")) {
  constraintProblems.push("contacts_pkey: missing");
}
for (const [name, values] of expectedConstraintValues) {
  const constraint = constraintsByName.get(name);
  if (!constraint) {
    constraintProblems.push(`${name}: missing`);
    continue;
  }
  if (!constraint.convalidated) {
    constraintProblems.push(`${name}: not validated`);
  }
  const definition = String(constraint.definition ?? "");
  const missingValues = values.filter((value) => !definition.includes(`'${value}'`));
  if (missingValues.length > 0) {
    constraintProblems.push(`${name}: missing values ${missingValues.join(", ")}`);
  }
}

if (
  columnProblems.length > 0 ||
  uniqueIndexes.length === 0 ||
  lifecycleIndexes.length < 2 ||
  constraintProblems.length > 0
) {
  for (const problem of columnProblems) console.error(`Column mismatch: ${problem}`);
  if (uniqueIndexes.length === 0) console.error("Missing unique submission_id index.");
  if (lifecycleIndexes.length < 2) console.error("Missing lifecycle status or created-at index.");
  for (const problem of constraintProblems) console.error(`Constraint mismatch: ${problem}`);
  process.exit(1);
}

console.log(
  "Lead schema verified: runtime columns, defaults, constraints, and indexes are present.",
);
