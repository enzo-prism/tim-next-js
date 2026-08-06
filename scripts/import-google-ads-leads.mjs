// Import Google Ads lead-form responses into the leads table.
//
// Google Ads has been emailing every lead-form response to the agency inbox
// since March 2026, but the webhook that writes them into this database was
// never switched on, so none of that history is in the dashboard. This script
// imports records extracted from those emails.
//
// It is deliberately separate from the webhook path in
// `src/server/storage.ts`:
//
//   - it preserves the original response time as `created_at`, where the
//     webhook path relies on the `now()` default; and
//   - it enqueues nothing in `notification_outbox`, because notifying the
//     practice about months-old leads would be noise, not news.
//
// Usage:
//   DATABASE_URL=... node scripts/import-google-ads-leads.mjs <leads.json> [--commit]
//
// Without --commit it reports what it would insert and changes nothing.
//
// Input is a JSON array of:
//   {
//     "gmailMessageId": "19fd840bf008c4bf",   // stable per-response id
//     "internalDate": "1786039549000",        // ms since epoch
//     "fullName": "...",
//     "email": "..." | null,
//     "phone": "..." | null,
//     "campaignName": "..." | null,
//     "campaignId": "..." | null
//   }

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const [inputPath] = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const commit = process.argv.includes("--commit");

if (!inputPath) {
  console.error("Usage: node scripts/import-google-ads-leads.mjs <leads.json> [--commit]");
  process.exit(1);
}

const sql = neon(databaseUrl);

// Google Ads lead forms return one "Full name" field. Everything before the
// last space is the first name, so "MARY JO SMITH" keeps "MARY JO" together.
const splitName = (fullName) => {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "Unknown", lastName: "Lead" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
};

const leads = JSON.parse(readFileSync(inputPath, "utf8"));
if (!Array.isArray(leads) || leads.length === 0) {
  console.error("Input must be a non-empty JSON array.");
  process.exit(1);
}

let inserted = 0;
let skippedExistingId = 0;
let skippedLikelyDuplicate = 0;
const failures = [];

for (const lead of leads) {
  const { gmailMessageId, internalDate, fullName, email, phone } = lead;
  if (!gmailMessageId || !internalDate || !fullName) {
    failures.push({ gmailMessageId, reason: "missing required field" });
    continue;
  }

  const receivedAt = new Date(Number(internalDate));
  if (Number.isNaN(receivedAt.getTime())) {
    failures.push({ gmailMessageId, reason: "unparseable internalDate" });
    continue;
  }

  const existingById = await sql`
    SELECT id FROM contacts WHERE google_ads_lead_id = ${gmailMessageId} LIMIT 1
  `;
  if (existingById.length > 0) {
    skippedExistingId += 1;
    continue;
  }

  // A lead that already arrived through the webhook or the website form would
  // carry a different id, so match on the person and the clock instead. Ten
  // minutes is wider than any observed webhook delay and far narrower than the
  // gap between two real leads from the same person.
  const near = await sql`
    SELECT id FROM contacts
    WHERE (
        (${email}::text IS NOT NULL AND lower(email) = lower(${email}))
        OR (${phone}::text IS NOT NULL AND phone = ${phone})
      )
      AND created_at BETWEEN ${receivedAt.toISOString()}::timestamp - interval '10 minutes'
                         AND ${receivedAt.toISOString()}::timestamp + interval '10 minutes'
    LIMIT 1
  `;
  if (near.length > 0) {
    skippedLikelyDuplicate += 1;
    continue;
  }

  if (!commit) {
    inserted += 1;
    continue;
  }

  const { firstName, lastName } = splitName(fullName);
  const rawPayload = {
    source: "google-ads-lead-email",
    gmail_message_id: gmailMessageId,
    received_at: receivedAt.toISOString(),
  };

  const rows = await sql`
    INSERT INTO contacts (
      first_name, last_name, email, phone,
      request_type, utm_source, utm_medium, utm_campaign,
      lead_status, google_ads_lead_id, campaign_id, campaign_name,
      ingested_via, is_test, raw_payload, created_at, updated_at
    ) VALUES (
      ${firstName}, ${lastName}, ${email ?? null}, ${phone ?? null},
      'google_ads_lead', 'google', 'cpc', ${lead.campaignName ?? null},
      'new', ${gmailMessageId}, ${lead.campaignId ?? null}, ${lead.campaignName ?? null},
      'backfill', false, ${JSON.stringify(rawPayload)}::jsonb,
      ${receivedAt.toISOString()}, ${receivedAt.toISOString()}
    )
    ON CONFLICT DO NOTHING
    RETURNING id
  `;

  if (rows.length === 0) {
    skippedExistingId += 1;
  } else {
    inserted += 1;
  }
}

console.log(
  JSON.stringify(
    {
      mode: commit ? "commit" : "dry-run",
      input: leads.length,
      inserted,
      skippedExistingId,
      skippedLikelyDuplicate,
      failures,
    },
    null,
    2,
  ),
);

process.exit(failures.length > 0 ? 1 : 0);
