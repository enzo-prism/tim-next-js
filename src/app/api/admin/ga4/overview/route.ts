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
  const propertyIdRaw =
    process.env.GA4_PROPERTY_ID ?? process.env.GA_PROPERTY_ID ?? process.env.GA_PROPERTY;
  const propertyId = propertyIdRaw?.trim().replace(/^properties\//i, "");
  if (!propertyId) {
    return jsonResponse(
      buildMissingConfigPayload(
        ["GA4_PROPERTY_ID"],
        "Set GA4_PROPERTY_ID to your GA4 Property ID (for this site: 518867337).",
      ),
      { status: 503 },
    );
  }

  const authResult = getGoogleAuth();
  if ("error" in authResult) {
    return jsonResponse(authResult.error, { status: 503 });
  }

  const range = getAdminDateRange(req.nextUrl.searchParams.get("days"));
  const cacheKey = `ga4:${range.days}`;
  const cached = getFromCache(cacheKey);
  if (cached) return jsonResponse(cached);

  try {
    const analyticsdata = google.analyticsdata({
      version: "v1beta",
      auth: authResult.auth,
    });

    const property = `properties/${propertyId}`;
    const [seriesReport, totalsReport] = await Promise.all([
      analyticsdata.properties.runReport({
        property,
        requestBody: {
          dateRanges: [{ startDate: range.startDate, endDate: range.endDate }],
          dimensions: [{ name: "date" }],
          metrics: [
            { name: "activeUsers" },
            { name: "sessions" },
            { name: "screenPageViews" },
          ],
          orderBys: [{ dimension: { dimensionName: "date" } }],
        },
      }),
      analyticsdata.properties.runReport({
        property,
        requestBody: {
          dateRanges: [{ startDate: range.startDate, endDate: range.endDate }],
          metrics: [
            { name: "activeUsers" },
            { name: "sessions" },
            { name: "screenPageViews" },
          ],
        },
      }),
    ]);

    const toIsoDate = (gaDate: string) => {
      if (!gaDate || gaDate.length !== 8) return gaDate;
      return `${gaDate.slice(0, 4)}-${gaDate.slice(4, 6)}-${gaDate.slice(6, 8)}`;
    };

    const series = (seriesReport.data.rows ?? []).map((row) => {
      const date = toIsoDate(row.dimensionValues?.[0]?.value ?? "");
      const activeUsers = Number.parseInt(row.metricValues?.[0]?.value ?? "0", 10);
      const sessions = Number.parseInt(row.metricValues?.[1]?.value ?? "0", 10);
      const screenPageViews = Number.parseInt(row.metricValues?.[2]?.value ?? "0", 10);
      return { date, activeUsers, sessions, screenPageViews };
    });

    const totalsRow = totalsReport.data.rows?.[0];
    const totals = totalsRow
      ? {
          activeUsers: Number.parseInt(totalsRow.metricValues?.[0]?.value ?? "0", 10),
          sessions: Number.parseInt(totalsRow.metricValues?.[1]?.value ?? "0", 10),
          screenPageViews: Number.parseInt(totalsRow.metricValues?.[2]?.value ?? "0", 10),
        }
      : series.reduce(
          (acc, point) => ({
            activeUsers: acc.activeUsers + point.activeUsers,
            sessions: acc.sessions + point.sessions,
            screenPageViews: acc.screenPageViews + point.screenPageViews,
          }),
          { activeUsers: 0, sessions: 0, screenPageViews: 0 },
        );

    const fetchTopPages = async () => {
      const dimensionCandidates = [
        "unifiedPagePathScreen",
        "pagePathPlusQueryString",
        "pagePath",
      ];

      let lastError: unknown = null;

      for (const dimensionName of dimensionCandidates) {
        try {
          const report = await analyticsdata.properties.runReport({
            property,
            requestBody: {
              dateRanges: [{ startDate: range.startDate, endDate: range.endDate }],
              dimensions: [{ name: dimensionName }],
              metrics: [{ name: "screenPageViews" }],
              orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
              limit: "10",
            },
          });

          return (report.data.rows ?? []).map((row) => {
            const pagePath = row.dimensionValues?.[0]?.value ?? "";
            const screenPageViews = Number.parseInt(row.metricValues?.[0]?.value ?? "0", 10);
            return { pagePath, screenPageViews };
          });
        } catch (error: any) {
          lastError = error;
          const message = String(error?.message || "");
          const isInvalidDimension =
            message.includes("Unknown dimension") ||
            message.includes("unknown dimension") ||
            message.includes("dimensions") ||
            message.includes("dimension");
          if (!isInvalidDimension) break;
        }
      }

      if (lastError) {
        console.warn("GA4 top pages query failed; continuing without it.");
      }
      return [] as Array<{ pagePath: string; screenPageViews: number }>;
    };

    const topPages = await fetchTopPages();

    const payload = {
      range,
      totals,
      series,
      topPages,
    };

    setCache(cacheKey, payload, 10 * 60_000);
    return jsonResponse(payload);
  } catch (error: any) {
    console.error("GA4 overview error:", error);
    const message =
      typeof error?.message === "string" && error.message
        ? `GA4 API error: ${error.message}`
        : "Failed to fetch GA4 data.";
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
