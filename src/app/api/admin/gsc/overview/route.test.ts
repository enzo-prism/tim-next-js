import { describe, expect, it } from "vitest";

import {
  buildSearchOpportunityCandidates,
  mapQueryPageRows,
} from "@/app/api/admin/gsc/overview/opportunities";
import { fetchBoundedQueryPageRows } from "@/app/api/admin/gsc/overview/pagination";

describe("GSC query-by-page opportunities", () => {
  it("maps page and query dimensions in Search Console order", () => {
    expect(
      mapQueryPageRows([
        {
          keys: [
            "https://www.famfirstsmile.com/services/invisalign",
            "invisalign dentist los gatos",
          ],
          clicks: 7,
          impressions: 140,
          ctr: 0.05,
          position: 8.4,
        },
      ]),
    ).toEqual([
      {
        page: "https://www.famfirstsmile.com/services/invisalign",
        query: "invisalign dentist los gatos",
        clicks: 7,
        impressions: 140,
        ctr: 0.05,
        position: 8.4,
      },
    ]);
  });

  it("keeps positions 4 through 20 and ranks meaningful opportunities first", () => {
    const candidates = buildSearchOpportunityCandidates([
      {
        page: "https://www.famfirstsmile.com/services/invisalign",
        query: "invisalign los gatos",
        clicks: 4,
        impressions: 300,
        ctr: 0.013,
        position: 8,
      },
      {
        page: "https://www.famfirstsmile.com/services/teeth-whitening",
        query: "teeth whitening los gatos",
        clicks: 3,
        impressions: 80,
        ctr: 0.038,
        position: 4,
      },
      {
        page: "https://www.famfirstsmile.com/services/dental-exams",
        query: "dentist los gatos",
        clicks: 60,
        impressions: 200,
        ctr: 0.3,
        position: 3.9,
      },
      {
        page: "https://www.famfirstsmile.com/services/night-guards",
        query: "night guard dentist",
        clicks: 0,
        impressions: 900,
        ctr: 0,
        position: 20.1,
      },
      {
        page: "",
        query: "missing page",
        clicks: 0,
        impressions: 1000,
        ctr: 0,
        position: 10,
      },
    ]);

    expect(candidates).toHaveLength(2);
    expect(candidates.map((candidate) => candidate.query)).toEqual([
      "invisalign los gatos",
      "teeth whitening los gatos",
    ]);
    expect(candidates[0].opportunityScore).toBeGreaterThan(
      candidates[1].opportunityScore,
    );
  });
});

describe("GSC query-page pagination", () => {
  it("paginates until a short page without marking the result truncated", async () => {
    const calls: Array<{ startRow: number; rowLimit: number }> = [];
    const allRows = Array.from({ length: 7 }, (_, index) => ({
      keys: [`https://example.com/${index}`, `query ${index}`],
    }));

    const result = await fetchBoundedQueryPageRows(
      async (startRow, rowLimit) => {
        calls.push({ startRow, rowLimit });
        return allRows.slice(startRow, startRow + rowLimit);
      },
      10,
      3,
    );

    expect(calls).toEqual([
      { startRow: 0, rowLimit: 3 },
      { startRow: 3, rowLimit: 3 },
      { startRow: 6, rowLimit: 3 },
    ]);
    expect(result.rows).toHaveLength(7);
    expect(result.truncated).toBe(false);
    expect(result.rowsScanned).toBe(7);
  });

  it("uses one extra row to report when the bounded cap truncates results", async () => {
    const allRows = Array.from({ length: 12 }, (_, index) => ({
      keys: [`https://example.com/${index}`, `query ${index}`],
    }));

    const result = await fetchBoundedQueryPageRows(
      async (startRow, rowLimit) => allRows.slice(startRow, startRow + rowLimit),
      10,
      4,
    );

    expect(result.rows).toHaveLength(10);
    expect(result.truncated).toBe(true);
    expect(result.rowCap).toBe(10);
  });
});
