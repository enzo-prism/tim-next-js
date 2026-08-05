import type { Page } from "@playwright/test";
import type {
  AdminContactItem,
  AdminContactsResponse,
  UpdateAdminContactInput,
  UpdateAdminContactResponse,
} from "../../src/app/api/admin/contacts/types";

/**
 * SYNTHETIC QA fixture for the admin Leads dashboard.
 * ALL DATA IS FAKE — names, emails, phones, and IDs are invented for testing
 * only (adapted from seed-leads.json, all "Test Patient *"). Never replace
 * with real lead data.
 *
 * Mirrors backend behavior at HEAD: the list response includes test leads
 * (the UI hides them by default), while countsByStatus and sourceSummary
 * exclude them. Fresh leads get timestamps relative to "now" so the < 24h
 * NEW-marker logic is deterministic regardless of when the suite runs.
 */

type LeadSeed = {
  id: string;
  ageMinutes: number;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  service?: string | null;
  message?: string | null;
  requestType?: string;
  preferredDate?: string | null;
  preferredTime?: string | null;
  source: string;
  leadStatus: AdminContactItem["leadStatus"];
  googleAdsLeadId?: string | null;
  campaignName?: string | null;
  ingestedVia?: AdminContactItem["ingestedVia"];
  landingPage?: string | null;
  referrer?: string | null;
  ctaSource?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  contactedAt?: string | null;
  bookedAt?: string | null;
  arrivedAt?: string | null;
  lostReason?: string | null;
  staffNotes?: string | null;
  updatedBy?: string | null;
  isTest?: boolean;
};

const SEEDS: LeadSeed[] = [
  {
    id: "seed-0031", ageMinutes: 8, firstName: "Test", lastName: "Patient Phoneonly",
    email: null, phone: "+15550001031", service: "emergency",
    message: "Phone only — no email provided. Tooth pain.",
    source: "google-ads", leadStatus: "new", googleAdsLeadId: "gads-lead-AAA031",
    campaignName: "Emergency - Search", ingestedVia: "webhook",
  },
  {
    id: "seed-0021", ageMinutes: 12, firstName: "Test", lastName: "Patient Upsilon",
    email: "test.upsilon@example.test", phone: "+15550001021", service: "emergency",
    message: "Fresh lead — arrived minutes ago, should show NEW marker.",
    source: "google-ads", leadStatus: "new", googleAdsLeadId: "gads-lead-AAA021",
    campaignName: "Emergency - Search", ingestedVia: "webhook",
  },
  {
    id: "seed-0001", ageMinutes: 120, firstName: "Test", lastName: "Patient Alpha",
    email: "test.alpha@example.test", phone: "+15550001001", service: "dental-implants",
    message: "Saw the ad for implants. Looking for a consultation this week.",
    source: "google-ads", leadStatus: "new", googleAdsLeadId: "gads-lead-AAA001",
    campaignName: "Implants - Search - Aug", ingestedVia: "webhook",
    utmSource: "google", utmMedium: "cpc", utmCampaign: "implants-aug",
  },
  {
    id: "seed-0002", ageMinutes: 130, firstName: "Test", lastName: "Patient Beta",
    email: "test.beta@example.test", phone: "+15550001002", service: "invisalign",
    message: null, source: "google-ads", leadStatus: "new",
    googleAdsLeadId: "gads-lead-AAA002", campaignName: "Invisalign - Search",
    ingestedVia: "webhook", isTest: true,
  },
  {
    id: "seed-0022", ageMinutes: 190, firstName: "Test", lastName: "Patient Phi",
    email: "test.phi@example.test", phone: "+15550001022", service: "cleaning",
    message: null, requestType: "appointment", preferredDate: "2026-08-10",
    preferredTime: "morning", source: "website", leadStatus: "new",
    ingestedVia: "website-form", landingPage: "/book-appointment",
  },
  {
    id: "seed-0003", ageMinutes: 300, firstName: "Test", lastName: "Patient Gamma",
    email: "test.gamma@example.test", phone: "+15550001003", service: "cleaning",
    message: "New patient exam + cleaning.", requestType: "appointment",
    preferredDate: "2026-08-11", preferredTime: "morning", source: "website",
    leadStatus: "new", ingestedVia: "website-form", landingPage: "/book-appointment",
    ctaSource: "hero",
  },
  {
    id: "seed-0004", ageMinutes: 2600, firstName: "Test", lastName: "Patient Delta",
    email: "test.delta@example.test", phone: "+15550001004", service: "tmj",
    message: "Jaw pain for two months, getting worse.",
    source: "website", leadStatus: "contacted", ingestedVia: "website-form",
    landingPage: "/tmj", contactedAt: "2026-08-04T09:12:00Z", updatedBy: "Staff Test User",
  },
  {
    id: "seed-0005", ageMinutes: 3000, firstName: "Test", lastName: "Patient Epsilon",
    email: "test.epsilon@example.test", phone: null, service: "veneers",
    message: "Email only please.", source: "google-ads", leadStatus: "new",
    googleAdsLeadId: "gads-lead-AAA005", campaignName: "Veneers - Search",
    ingestedVia: "webhook",
  },
  {
    id: "seed-0006", ageMinutes: 3300, firstName: "Test", lastName: "Patient Zeta",
    email: "test.zeta@example.test", phone: "+15550001006", service: "dental-implants",
    message: "Duplicate webhook delivery test — same lead_id as seed-0007.",
    source: "google-ads", leadStatus: "contacted", googleAdsLeadId: "gads-lead-DUP001",
    campaignName: "Implants - Search - Aug", ingestedVia: "webhook",
    contactedAt: "2026-08-02T16:40:00Z",
  },
  {
    id: "seed-0007", ageMinutes: 3301, firstName: "Test", lastName: "Patient Zeta",
    email: "test.zeta@example.test", phone: "+15550001006", service: "dental-implants",
    message: "Duplicate webhook delivery test — same lead_id as seed-0006.",
    source: "google-ads", leadStatus: "contacted", googleAdsLeadId: "gads-lead-DUP001",
    campaignName: "Implants - Search - Aug", ingestedVia: "webhook",
  },
  {
    id: "seed-0023", ageMinutes: 3400, firstName: "Test", lastName: "Patient Chi",
    email: "test.chi@example.test", phone: "+15550001023", service: "dentures",
    message: "Partial denture repair.", source: "formspree-historical",
    leadStatus: "contacted", ingestedVia: "backfill", contactedAt: "2026-08-03T09:00:00Z",
  },
  {
    id: "seed-0008", ageMinutes: 4300, firstName: "Test", lastName: "Patient Eta",
    email: "test.eta@example.test", phone: "+15550001008", service: "emergency",
    message: "Broken tooth, severe pain.", requestType: "appointment",
    preferredDate: "2026-08-05", preferredTime: "afternoon", source: "website",
    leadStatus: "booked", ingestedVia: "website-form",
    contactedAt: "2026-08-01T20:05:00Z", bookedAt: "2026-08-01T20:20:00Z",
  },
  {
    id: "seed-0024", ageMinutes: 4400, firstName: "Test", lastName: "Patient Psi",
    email: "test.psi@example.test", phone: "+15550001024", service: "whitening",
    message: "Wedding in September.", source: "google-ads", leadStatus: "booked",
    googleAdsLeadId: "gads-lead-AAA024", campaignName: "Whitening - Search",
    ingestedVia: "webhook", contactedAt: "2026-08-01T14:00:00Z",
    bookedAt: "2026-08-01T14:25:00Z",
  },
  {
    id: "seed-0009", ageMinutes: 7300, firstName: "Test", lastName: "Patient Theta",
    email: "test.theta@example.test", phone: "+15550001009", service: "whitening",
    message: null, source: "formspree-historical", leadStatus: "arrived",
    ingestedVia: "backfill", contactedAt: "2026-07-30T11:00:00Z",
    bookedAt: "2026-07-30T11:15:00Z", arrivedAt: "2026-08-03T15:00:00Z",
  },
  {
    id: "seed-0025", ageMinutes: 8600, firstName: "Test", lastName: "Patient Omega",
    email: "test.omega@example.test", phone: "+15550001025", service: "crowns",
    message: null, source: "website", leadStatus: "no-show", ingestedVia: "website-form",
    contactedAt: "2026-07-29T19:30:00Z", bookedAt: "2026-07-30T09:00:00Z",
  },
  {
    id: "seed-0010", ageMinutes: 11500, firstName: "Test", lastName: "Patient Iota",
    email: "test.iota@example.test", phone: "+15550001010", service: "cleaning",
    message: "Moving to the area, need a new dentist.", source: "google-ads",
    leadStatus: "no-show", googleAdsLeadId: "gads-lead-AAA010",
    campaignName: "New Patients - Broad", ingestedVia: "webhook",
    contactedAt: "2026-07-28T17:00:00Z", bookedAt: "2026-07-29T09:30:00Z",
  },
  {
    id: "seed-0012", ageMinutes: 19000, firstName: "Test",
    lastName: "Patient Lambda WithAnExtremelyLongLastNameToCheckTruncation",
    email: "test.lambda.longname@example.test", phone: "+15550001012",
    service: "invisalign", message: "Long name truncation check.",
    source: "google-ads", leadStatus: "contacted", googleAdsLeadId: "gads-lead-AAA012",
    campaignName: "Invisalign - Search", ingestedVia: "webhook",
    contactedAt: "2026-07-22T15:00:00Z",
  },
  {
    id: "seed-0014", ageMinutes: 21000, firstName: "Test", lastName: "Patient Nu",
    email: "test.nu@example.test", phone: "+15550001014", service: "dental-implants",
    message: "Reconciliation-caught lead: webhook missed, found by twice-daily check.",
    source: "google-ads", leadStatus: "new", googleAdsLeadId: "gads-lead-AAA014",
    campaignName: "Implants - Search - Aug", ingestedVia: "reconciliation",
  },
  {
    id: "seed-0013", ageMinutes: 22000, firstName: "Tëst", lastName: "Patiënt Mü — 患者",
    email: "test.mu.unicode@example.test", phone: "+15550001013", service: null,
    message: "Unicode name rendering check.", source: "website", leadStatus: "new",
    ingestedVia: "website-form",
  },
  {
    id: "seed-0015", ageMinutes: 29000, firstName: "Test", lastName: "Patient Xi",
    email: "test.xi@example.test", phone: "+15550001015", service: "crowns",
    message: "Crown came loose.", requestType: "appointment",
    preferredDate: "2026-07-21", preferredTime: "morning", source: "website",
    leadStatus: "arrived", ingestedVia: "website-form",
    contactedAt: "2026-07-15T18:00:00Z", bookedAt: "2026-07-15T18:10:00Z",
    arrivedAt: "2026-07-21T14:00:00Z",
  },
  {
    id: "seed-0017", ageMinutes: 39000, firstName: "Test", lastName: "Patient Pi",
    email: "test.pi@example.test", phone: "+15550001017", service: "invisalign",
    message: null, source: "google-ads", leadStatus: "lost",
    googleAdsLeadId: "gads-lead-AAA017", campaignName: "Invisalign - Search",
    ingestedVia: "webhook", lostReason: "No response after 4 attempts",
  },
  {
    id: "seed-0018", ageMinutes: 43000, firstName: "Test", lastName: "Patient Rho",
    email: "test.rho@example.test", phone: "+15550001018", service: "cleaning",
    message: "Long message wrapping check.\n\nSecond paragraph must keep its line break.",
    source: "website", leadStatus: "contacted", ingestedVia: "website-form",
    contactedAt: "2026-07-05T10:00:00Z",
    staffNotes: "Prefers afternoon calls. Referred by existing patient.",
  },
  {
    id: "seed-0019", ageMinutes: 54000, firstName: "Test", lastName: "Patient Sigma",
    email: "test.sigma@example.test", phone: "+15550001019", service: "tmj",
    message: "Night guard question.", source: "google-ads", leadStatus: "arrived",
    googleAdsLeadId: "gads-lead-AAA019", campaignName: "TMJ - Search",
    ingestedVia: "webhook", contactedAt: "2026-06-28T15:00:00Z",
    bookedAt: "2026-06-28T15:30:00Z", arrivedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "seed-0020", ageMinutes: 65000, firstName: "Test", lastName: "Patient Tau",
    email: "test.tau@example.test", phone: "+15550001020", service: "veneers",
    message: "Wants a smile makeover consult.", source: "formspree-historical",
    leadStatus: "lost", ingestedVia: "backfill", lostReason: "Price shopping",
  },
  {
    id: "seed-0011", ageMinutes: 58000, firstName: "Test", lastName: "Patient Kappa",
    email: "test.kappa@example.test", phone: "+15550001011", service: "dentures",
    message: "Asking about insurance coverage.", source: "formspree-historical",
    leadStatus: "lost", ingestedVia: "backfill",
    lostReason: "Went with in-network provider", contactedAt: "2026-07-25T10:00:00Z",
  },
  {
    id: "seed-0016", ageMinutes: 80000, firstName: "Test", lastName: "Patient Omicron",
    email: "test.omicron@example.test", phone: "+15550001016", service: "pediatric",
    message: "First visit for my 6-year-old.", source: "formspree-historical",
    leadStatus: "booked", ingestedVia: "backfill",
    contactedAt: "2026-07-12T11:00:00Z", bookedAt: "2026-07-12T11:20:00Z",
    isTest: true,
  },
  {
    id: "seed-0027", ageMinutes: 73000, firstName: "Test", lastName: "Patient TwoSeven",
    email: "test.twoseven@example.test", phone: "+15550001027", service: "invisalign",
    message: "Finished treatment elsewhere, wants retainer.", source: "google-ads",
    leadStatus: "contacted", googleAdsLeadId: "gads-lead-AAA027",
    campaignName: "Invisalign - Search", ingestedVia: "reconciliation",
    contactedAt: "2026-06-15T17:00:00Z",
  },
  {
    id: "seed-0028", ageMinutes: 91000, firstName: "Test", lastName: "Patient TwoEight",
    email: "test.twoeight@example.test", phone: "+15550001028",
    service: "dental-implants", message: "Full arch question.", source: "google-ads",
    leadStatus: "booked", googleAdsLeadId: "gads-lead-AAA028",
    campaignName: "Implants - Search - Jun", ingestedVia: "webhook",
    contactedAt: "2026-06-02T13:00:00Z", bookedAt: "2026-06-02T13:45:00Z",
  },
  {
    id: "seed-0029", ageMinutes: 108000, firstName: "Test", lastName: "Patient TwoNine",
    email: "test.twonine@example.test", phone: "+15550001029", service: "cleaning",
    message: null, source: "formspree-historical", leadStatus: "lost",
    ingestedVia: "backfill", lostReason: "Moved out of state", isTest: true,
  },
  {
    id: "seed-0026", ageMinutes: 37000, firstName: "Test", lastName: "Patient TwoSix",
    email: "test.twosix@example.test", phone: "+15550001026", service: "pediatric",
    message: "Two kids, back-to-back appointments.", requestType: "appointment",
    preferredDate: "2026-07-14", preferredTime: "afternoon", source: "website",
    leadStatus: "arrived", ingestedVia: "website-form",
    contactedAt: "2026-07-10T08:00:00Z", bookedAt: "2026-07-10T08:15:00Z",
    arrivedAt: "2026-07-14T14:30:00Z",
  },
  {
    id: "seed-0030", ageMinutes: 131000, firstName: "Test", lastName: "Patient Thirty",
    email: "test.thirty@example.test", phone: "+15550001030", service: "tmj",
    message: "Oldest record — pagination boundary check.", source: "formspree-historical",
    leadStatus: "arrived", ingestedVia: "backfill",
    contactedAt: "2026-05-05T10:00:00Z", bookedAt: "2026-05-05T10:20:00Z",
    arrivedAt: "2026-05-08T11:00:00Z",
  },
];

const toContactItem = (seed: LeadSeed, now: number): AdminContactItem => {
  const createdAt = new Date(now - seed.ageMinutes * 60_000).toISOString();
  const milestones = [seed.contactedAt, seed.bookedAt, seed.arrivedAt]
    .filter((value): value is string => Boolean(value))
    .sort();
  const updatedAt = milestones.length
    ? new Date(
        Math.max(new Date(milestones[milestones.length - 1]).getTime(), now - seed.ageMinutes * 60_000),
      ).toISOString()
    : createdAt;

  return {
    id: seed.id,
    createdAt,
    updatedAt,
    firstName: seed.firstName,
    lastName: seed.lastName,
    email: seed.email ?? null,
    phone: seed.phone ?? null,
    service: seed.service ?? null,
    message: seed.message ?? null,
    requestType: seed.requestType ?? "contact",
    preferredDate: seed.preferredDate ?? null,
    preferredTime: seed.preferredTime ?? null,
    formspreeStatus:
      seed.source === "formspree-historical" || seed.source === "website"
        ? "delivered"
        : null,
    landingPage: seed.landingPage ?? null,
    referrer: seed.referrer ?? null,
    ctaSource: seed.ctaSource ?? null,
    utmSource: seed.utmSource ?? null,
    utmMedium: seed.utmMedium ?? null,
    utmCampaign: seed.utmCampaign ?? null,
    source: seed.source,
    leadSource: seed.source,
    leadStatus: seed.leadStatus,
    contactedAt: seed.contactedAt ?? null,
    bookedAt: seed.bookedAt ?? null,
    arrivedAt: seed.arrivedAt ?? null,
    lostReason: seed.lostReason ?? null,
    staffNotes: seed.staffNotes ?? null,
    googleAdsLeadId: seed.googleAdsLeadId ?? null,
    campaignId: seed.googleAdsLeadId ? "camp-synthetic-01" : null,
    campaignName: seed.campaignName ?? null,
    ingestedVia: seed.ingestedVia ?? null,
    updatedBy: seed.updatedBy ?? null,
    isTest: seed.isTest ?? false,
  };
};

export type ContactsListRequest = {
  limit?: number;
  offset?: number;
  q?: string;
  status?: string;
  source?: string;
};

const summarize = (items: AdminContactItem[]): AdminContactsResponse["sourceSummary"] => {
  const operational = items.filter((item) => !item.isTest);
  const bySource = new Map<string, AdminContactItem[]>();
  for (const item of operational) {
    const bucket = bySource.get(item.source) ?? [];
    bucket.push(item);
    bySource.set(item.source, bucket);
  }
  return [...bySource.entries()].map(([source, rows]) => {
    const leads = rows.length;
    const booked = rows.filter((row) => row.bookedAt).length;
    const arrived = rows.filter((row) => row.arrivedAt).length;
    return {
      source,
      leads,
      booked,
      arrived,
      bookingRate: leads ? booked / leads : 0,
      arrivalRate: leads ? arrived / leads : 0,
    };
  });
};

const countByStatus = (items: AdminContactItem[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const item of items) {
    if (item.isTest) continue;
    counts[item.leadStatus] = (counts[item.leadStatus] ?? 0) + 1;
  }
  return counts;
};

export type AdminContactsMock = {
  items: () => AdminContactItem[];
  patchLog: Array<{ id: string; input: UpdateAdminContactInput }>;
};

/**
 * Intercepts POST /api/admin/contacts (list) and PATCH /api/admin/contacts/:id
 * with the synthetic fixture. Returns a handle to inspect PATCH calls.
 */
export async function installAdminContactsMock(page: Page): Promise<AdminContactsMock> {
  const store = new Map<string, AdminContactItem>();
  const patchLog: AdminContactsMock["patchLog"] = [];
  const now = Date.now();
  for (const seed of SEEDS) {
    const item = toContactItem(seed, now);
    store.set(item.id, item);
  }

  const sortedItems = () =>
    [...store.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  await page.route("**/api/admin/contacts/*", async (route) => {
    const request = route.request();
    if (request.method() !== "PATCH") {
      await route.fallback();
      return;
    }
    const id = decodeURIComponent(new URL(request.url()).pathname.split("/").pop() ?? "");
    const item = store.get(id);
    if (!item) {
      await route.fulfill({
        status: 404,
        json: { ok: false, error: "not_found", message: "Contact not found." },
      });
      return;
    }
    const input = request.postDataJSON() as UpdateAdminContactInput;
    patchLog.push({ id, input });

    const timestamp = new Date(Date.now() + 1000).toISOString();
    const updated: AdminContactItem = {
      ...item,
      leadStatus: input.leadStatus ?? item.leadStatus,
      lostReason: input.lostReason !== undefined ? input.lostReason : item.lostReason,
      staffNotes: input.staffNotes !== undefined ? input.staffNotes : item.staffNotes,
      updatedAt: timestamp,
      updatedBy: "Staff Test User",
      contactedAt:
        input.leadStatus && input.leadStatus !== "new" && !item.contactedAt
          ? timestamp
          : item.contactedAt,
      bookedAt:
        (input.leadStatus === "booked" || input.leadStatus === "arrived") && !item.bookedAt
          ? timestamp
          : item.bookedAt,
      arrivedAt: input.leadStatus === "arrived" && !item.arrivedAt ? timestamp : item.arrivedAt,
    };
    store.set(id, updated);
    const payload: UpdateAdminContactResponse = { ok: true, item: updated };
    await route.fulfill({ json: payload });
  });

  await page.route("**/api/admin/contacts", async (route) => {
    const request = route.request();
    if (request.method() !== "POST") {
      await route.fallback();
      return;
    }
    const body = (request.postDataJSON() ?? {}) as ContactsListRequest;
    const limit = Math.min(Math.max(body.limit ?? 50, 1), 200);
    const offset = Math.max(body.offset ?? 0, 0);

    let filtered = sortedItems();
    if (body.status) {
      filtered = filtered.filter((item) => item.leadStatus === body.status);
    }
    if (body.source) {
      filtered = filtered.filter((item) => item.source === body.source);
    }
    if (body.q) {
      const q = body.q.toLowerCase();
      filtered = filtered.filter((item) =>
        [item.firstName, item.lastName, item.service, item.campaignName]
          .filter((value): value is string => Boolean(value))
          .some((value) => value.toLowerCase().includes(q)),
      );
    }

    const all = sortedItems();
    const payload: AdminContactsResponse = {
      total: filtered.length,
      items: filtered.slice(offset, offset + limit),
      sourceSummary: summarize(all),
      countsByStatus: countByStatus(all),
    };
    await route.fulfill({ json: payload });
  });

  return { items: sortedItems, patchLog };
}
