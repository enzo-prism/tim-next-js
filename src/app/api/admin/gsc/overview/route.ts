import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getAdminDateRange } from "@/server/admin/dates";
import { buildMissingConfigPayload, getGoogleAuth } from "@/server/admin/google";
import { getFromCache, setCache } from "@/server/admin/cache";
import {
  buildSearchOpportunityCandidates,
  mapQueryPageRows,
  OPPORTUNITY_LIMIT,
  OPPORTUNITY_MAX_POSITION,
  OPPORTUNITY_MIN_POSITION,
} from "@/app/api/admin/gsc/overview/opportunities";
import {
  fetchBoundedQueryPageRows,
  GSC_QUERY_PAGE_ROW_CAP,
} from "@/app/api/admin/gsc/overview/pagination";

export const runtime = "nodejs";

const jsonResponse = (payload: unknown, init?: ResponseInit) => {
  const response = NextResponse.json(payload, init);
  response.headers.set("Cache-Control", "no-store");
  return response;
};

export async function GET(req: NextRequest) {
  const rawSiteUrl = process.env.GSC_SITE_URL?.trim();

  const normalizeGscSiteUrl = (value: string) => {
    if (!value) return value;
    if (value.startsWith("sc-domain:")) return value;
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return value.endsWith("/") ? value : `${value}/`;
    }
    return `sc-domain:${value.replace(/\/+$/, "")}`;
  };

  const siteUrl = rawSiteUrl ? normalizeGscSiteUrl(rawSiteUrl) : "";
  if (!siteUrl) {
    return jsonResponse(
      buildMissingConfigPayload(
        ["GSC_SITE_URL"],
        "Set GSC_SITE_URL to sc-domain:famfirstsmile.com (domain property) or https://famfirstsmile.com/ (URL-prefix property).",
      ),
      { status: 503 },
    );
  }

  const authResult = getGoogleAuth();
  if ("error" in authResult) {
    return jsonResponse(authResult.error, { status: 503 });
  }

  const range = getAdminDateRange(req.nextUrl.searchParams.get("days"));
  const cacheKey = `gsc:${range.days}`;
  const cached = getFromCache(cacheKey);
  if (cached) return jsonResponse(cached);

  try {
    const searchconsole = google.searchconsole({
      version: "v1",
      auth: authResult.auth,
    });

    const requestBase = {
      startDate: range.startDate,
      endDate: range.endDate,
      searchType: "web",
    } as const;

    const [seriesRes, queriesResult, pagesResult, queryPagesResult] = await Promise.all([
      searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: { ...requestBase, dimensions: ["date"], rowLimit: 1000 },
      }),
      searchconsole.searchanalytics
        .query({
          siteUrl,
          requestBody: { ...requestBase, dimensions: ["query"], rowLimit: 10 },
        })
        .then((response) => ({ status: "available" as const, response }))
        .catch(() => {
          console.warn("GSC top queries query failed.");
          return { status: "unavailable" as const, response: null };
        }),
      searchconsole.searchanalytics
        .query({
          siteUrl,
          requestBody: { ...requestBase, dimensions: ["page"], rowLimit: 10 },
        })
        .then((response) => ({ status: "available" as const, response }))
        .catch(() => {
          console.warn("GSC top pages query failed.");
          return { status: "unavailable" as const, response: null };
        }),
      fetchBoundedQueryPageRows(async (startRow, rowLimit) => {
        const response = await searchconsole.searchanalytics.query({
          siteUrl,
          requestBody: {
            ...requestBase,
            dimensions: ["page", "query"],
            startRow,
            rowLimit,
          },
        });
        return response.data.rows ?? [];
      })
        .then((result) => ({
          status: "available" as const,
          ...result,
        }))
        .catch(() => {
          console.warn("GSC query-by-page query failed.");
          return {
            status: "unavailable" as const,
            rows: [],
            truncated: false,
            rowsScanned: 0,
            rowCap: GSC_QUERY_PAGE_ROW_CAP,
          };
        }),
    ]);

    const series = (seriesRes.data.rows ?? []).map((row) => {
      const date = row.keys?.[0] ?? "";
      const clicks = row.clicks ?? 0;
      const impressions = row.impressions ?? 0;
      const ctr = row.ctr ?? 0;
      const position = row.position ?? 0;
      return { date, clicks, impressions, ctr, position };
    });

    const totalsRaw = series.reduce(
      (acc, point) => ({
        clicks: acc.clicks + point.clicks,
        impressions: acc.impressions + point.impressions,
        weightedPosition: acc.weightedPosition + point.position * point.impressions,
      }),
      { clicks: 0, impressions: 0, weightedPosition: 0 },
    );

    const totals = {
      clicks: totalsRaw.clicks,
      impressions: totalsRaw.impressions,
      ctr: totalsRaw.impressions > 0 ? totalsRaw.clicks / totalsRaw.impressions : 0,
      position:
        totalsRaw.impressions > 0 ? totalsRaw.weightedPosition / totalsRaw.impressions : 0,
    };

    const topQueries =
      queriesResult.status === "available"
        ? (queriesResult.response.data.rows ?? []).map((row) => ({
            query: row.keys?.[0] ?? "",
            clicks: row.clicks ?? 0,
            impressions: row.impressions ?? 0,
            ctr: row.ctr ?? 0,
            position: row.position ?? 0,
          }))
        : null;

    const topPages =
      pagesResult.status === "available"
        ? (pagesResult.response.data.rows ?? []).map((row) => ({
            page: row.keys?.[0] ?? "",
            clicks: row.clicks ?? 0,
            impressions: row.impressions ?? 0,
            ctr: row.ctr ?? 0,
            position: row.position ?? 0,
          }))
        : null;

    const queryPageRows =
      queryPagesResult.status === "available"
        ? mapQueryPageRows(queryPagesResult.rows)
        : null;
    const searchOpportunities = queryPageRows
      ? buildSearchOpportunityCandidates(queryPageRows)
      : null;
    const partial =
      queriesResult.status === "unavailable" ||
      pagesResult.status === "unavailable" ||
      queryPagesResult.status === "unavailable";

    const payload = {
      range,
      totals,
      series,
      topQueries,
      topPages,
      searchOpportunities,
      partial,
      sections: {
        overview: { status: "available" as const },
        topQueries:
          queriesResult.status === "available"
            ? { status: "available" as const }
            : {
                status: "unavailable" as const,
                message: "Top-query reporting is temporarily unavailable.",
              },
        topPages:
          pagesResult.status === "available"
            ? { status: "available" as const }
            : {
                status: "unavailable" as const,
                message: "Top-page reporting is temporarily unavailable.",
              },
        searchOpportunities:
          queryPagesResult.status === "available"
            ? {
                status: "available" as const,
                truncated: queryPagesResult.truncated,
                rowsScanned: queryPagesResult.rowsScanned,
                rowCap: queryPagesResult.rowCap,
              }
            : {
                status: "unavailable" as const,
                message: "Search-opportunity reporting is temporarily unavailable.",
                truncated: false,
                rowsScanned: 0,
                rowCap: GSC_QUERY_PAGE_ROW_CAP,
              },
      },
      opportunityCriteria: {
        minPosition: OPPORTUNITY_MIN_POSITION,
        maxPosition: OPPORTUNITY_MAX_POSITION,
        limit: OPPORTUNITY_LIMIT,
        score:
          "Impressions weighted by proximity to position 4 and remaining CTR headroom; use for prioritization, not traffic forecasting.",
      },
    };

    setCache(cacheKey, payload, 10 * 60_000);
    return jsonResponse(payload);
  } catch {
    console.error("GSC overview query failed.");
    return jsonResponse(
      {
        ok: false,
        error: "upstream_error",
        message: "Search Console data is temporarily unavailable.",
      },
      { status: 502 },
    );
  }
}
