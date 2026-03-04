import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getAdminDateRange } from "@/server/admin/dates";
import { buildMissingConfigPayload, getGoogleAuth } from "@/server/admin/google";
import { getFromCache, setCache } from "@/server/admin/cache";

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

    const seriesRes = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: { ...requestBase, dimensions: ["date"], rowLimit: 1000 },
    });

    const [queriesRes, pagesRes] = await Promise.all([
      searchconsole.searchanalytics
        .query({
          siteUrl,
          requestBody: { ...requestBase, dimensions: ["query"], rowLimit: 10 },
        })
        .catch((error: any) => {
          console.warn("GSC top queries query failed; continuing without it.", error?.message);
          return null;
        }),
      searchconsole.searchanalytics
        .query({
          siteUrl,
          requestBody: { ...requestBase, dimensions: ["page"], rowLimit: 10 },
        })
        .catch((error: any) => {
          console.warn("GSC top pages query failed; continuing without it.", error?.message);
          return null;
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

    const topQueries = (queriesRes?.data?.rows ?? []).map((row) => ({
      query: row.keys?.[0] ?? "",
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    }));

    const topPages = (pagesRes?.data?.rows ?? []).map((row) => ({
      page: row.keys?.[0] ?? "",
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    }));

    const payload = {
      range,
      totals,
      series,
      topQueries,
      topPages,
    };

    setCache(cacheKey, payload, 10 * 60_000);
    return jsonResponse(payload);
  } catch (error: any) {
    console.error("GSC overview error:", error);
    const message =
      typeof error?.message === "string" && error.message
        ? `Search Console API error: ${error.message}`
        : "Failed to fetch Search Console data.";
    return jsonResponse(
      {
        ok: false,
        error: "server_error",
        message,
      },
      { status: 500 },
    );
  }
}
