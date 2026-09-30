import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import { applyTestMigrations } from "@/server/test-migrations";
import * as schema from "@/server/schema";
import { DatabaseStorage } from "@/server/storage";
import { getOutcomeReport, recordCallOutcome as recordActualCallOutcome, recordLeadOutcome } from "@/server/outcome-reporting";

const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl || !new URL(testUrl).pathname.endsWith("_test")) throw new Error("TEST_DATABASE_URL must point to a database whose name ends with '_test'.");
const testSchema = `outcome_test_${Date.now()}`;
const pool = new pg.Pool({ connectionString: testUrl });
let client: pg.PoolClient;
let database: NodePgDatabase<typeof schema>;
let storage: DatabaseStorage;
beforeAll(async () => {
  client = await pool.connect();
  await client.query(`CREATE SCHEMA ${testSchema}`);
  await client.query(`SET search_path TO ${testSchema}`);
  await client.query("SET TIME ZONE 'UTC'");
  await applyTestMigrations(client);
  database = drizzle(client, { schema });
  storage = new DatabaseStorage(database);
});
beforeEach(async () => { await client.query("TRUNCATE call_outcomes, contacts CASCADE"); });
afterAll(async () => {
  try { if (client) await client.query(`DROP SCHEMA ${testSchema} CASCADE`); }
  finally { client?.release(); await pool.end(); }
});
const recordCallOutcome = (db: NodePgDatabase<typeof schema>, input: Parameters<typeof recordActualCallOutcome>[1]) => recordActualCallOutcome(db, input, new Date("2027-01-01T00:00:00Z"));
const sampleCall = { provider: "test-office", callId: "opaque-1", occurredAt: "2026-09-30T16:00:00Z", sourceObservedAt: "2026-09-30T16:05:00Z", status: "booked" as const, source: "google-ads" as const };
const makeLead = (extra: Partial<typeof schema.contacts.$inferInsert> = {}) => storage.createContact({ firstName: "Private", lastName: "Patient", email: "private@example.com", ...extra });
describe("Postgres operational outcomes", () => {
  it("updates lead lifecycle with optimistic concurrency and preserves milestones", async () => {
    const lead = await makeLead();
    const result = await recordLeadOutcome(storage, { leadId: lead.id, status: "arrived", expectedUpdatedAt: lead.updatedAt.toISOString() });
    expect(result.status).toBe("updated");
    expect(await recordLeadOutcome(storage, { leadId: lead.id, status: "lost", lostReason: "other", expectedUpdatedAt: lead.updatedAt.toISOString() })).toEqual({ status: "conflict" });
    const updated = await storage.getContact(lead.id);
    expect(updated?.bookedAt).not.toBeNull();
    expect(updated?.arrivedAt).not.toBeNull();
  });
  it("allows exactly one concurrent update against the same optimistic lead token", async () => {
    const lead = await makeLead();
    const results = await Promise.all([
      recordLeadOutcome(storage, { leadId: lead.id, status: "booked", expectedUpdatedAt: lead.updatedAt.toISOString() }),
      recordLeadOutcome(storage, { leadId: lead.id, status: "contacted", expectedUpdatedAt: lead.updatedAt.toISOString() }),
    ]);
    expect(results.map((result) => result.status).sort()).toEqual(["conflict", "updated"]);
    expect((await storage.getContact(lead.id))!.updatedAt.getTime()).toBeGreaterThan(lead.updatedAt.getTime());
  });
  it("handles retries idempotently, rejects stale/conflicting call updates, and keeps attained milestones", async () => {
    expect(await recordCallOutcome(database, sampleCall)).toEqual({ status: "recorded" });
    expect(await recordCallOutcome(database, sampleCall)).toEqual({ status: "duplicate" });
    expect(await recordCallOutcome(database, { ...sampleCall, status: "new", sourceObservedAt: "2026-09-30T16:01:00Z" })).toEqual({ status: "stale_or_conflicting" });
    expect(await recordCallOutcome(database, { ...sampleCall, status: "lost" })).toEqual({ status: "stale_or_conflicting" });
    expect(await recordCallOutcome(database, { ...sampleCall, occurredAt: "2026-09-30T15:59:00Z", sourceObservedAt: "2026-09-30T16:06:00Z" })).toEqual({ status: "stale_or_conflicting" });
    expect(await recordCallOutcome(database, { ...sampleCall, status: "arrived", sourceObservedAt: "2026-09-30T16:10:00Z" })).toEqual({ status: "recorded" });
    expect(await recordCallOutcome(database, { ...sampleCall, status: "lost", sourceObservedAt: "2026-09-30T16:11:00Z" })).toEqual({ status: "recorded" });
    const report = await getOutcomeReport(database, { start: "2026-09-30", end: "2026-09-30" });
    expect(report.unlinkedCalls.totals).toMatchObject({ total: 1, everBooked: 1, everArrived: 1, currentStatuses: { lost: 1 } });
  });
  it("validates lead links, allows a later link, and excludes linked calls and test leads", async () => {
    const lead = await makeLead({ createdAt: new Date("2026-09-30T16:00:00Z"), leadStatus: "arrived", bookedAt: new Date(), arrivedAt: new Date(), landingPage: "/contact?email=private@example.com", utmCampaign: "Private Patient Campaign" });
    const testLead = await makeLead({ isTest: true, createdAt: new Date("2026-09-30T16:00:00Z") });
    expect(await recordCallOutcome(database, { ...sampleCall, linkedLeadId: testLead.id })).toEqual({ status: "lead_not_found" });
    expect(await recordCallOutcome(database, { ...sampleCall, linkedLeadId: "11111111-1111-4111-8111-111111111111" })).toEqual({ status: "lead_not_found" });
    await recordCallOutcome(database, sampleCall);
    expect(await recordCallOutcome(database, { ...sampleCall, linkedLeadId: lead.id, sourceObservedAt: "2026-09-30T16:06:00Z" })).toEqual({ status: "recorded" });
    await recordCallOutcome(database, { ...sampleCall, callId: "opaque-2" });
    const report = await getOutcomeReport(database, { start: "2026-09-30", end: "2026-09-30" });
    expect(report.leads.totals.total).toBe(1);
    expect(report.unlinkedCalls.totals.total).toBe(1);
    expect(report.linkedCallsExcluded).toBe(1);
    expect(JSON.stringify(report)).not.toMatch(/Private|private@example/);
  });
  it("counts linked call milestones once even while the staff-owned lead status is still new", async () => {
    const lead = await makeLead({ createdAt: new Date("2026-09-30T16:00:00Z"), utmSource: "google", utmMedium: "organic" });
    await recordCallOutcome(database, { ...sampleCall, linkedLeadId: lead.id, status: "arrived" });
    await recordCallOutcome(database, { ...sampleCall, callId: "second-linked-call", linkedLeadId: lead.id, status: "arrived" });
    const report = await getOutcomeReport(database, { start: "2026-09-30", end: "2026-09-30" });
    expect(report.leads.totals).toMatchObject({ total: 1, everBooked: 1, everArrived: 1, outcomeUpdated: 1, currentStatuses: { new: 1 } });
    expect(report.leads.byAttribution[0].source).toBe("Google organic");
    expect(report.unlinkedCalls.totals.total).toBe(0);
    expect(report.linkedCallsExcluded).toBe(2);
  });
  it("uses Los Angeles cohort days across UTC midnight and DST boundaries", async () => {
    for (const createdAt of ["2026-03-08T07:59:59Z", "2026-03-08T08:00:00Z", "2026-03-09T06:59:59Z", "2026-03-09T07:00:00Z"]) await makeLead({ createdAt: new Date(createdAt) });
    for (const [index, occurredAt] of ["2026-03-08T07:59:59Z", "2026-03-08T08:00:00Z", "2026-03-09T06:59:59Z", "2026-03-09T07:00:00Z"].entries()) await recordCallOutcome(database, { ...sampleCall, callId: `dst-${index}`, occurredAt, sourceObservedAt: occurredAt });
    const report = await getOutcomeReport(database, { start: "2026-03-08", end: "2026-03-08" });
    expect(report.leads.totals.total).toBe(2);
    expect(report.unlinkedCalls.totals.total).toBe(2);
  });
});
