import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_REPORT_BYTES = 32_000;

type CspReportEntry = {
  "blocked-uri"?: unknown;
  "document-uri"?: unknown;
  disposition?: unknown;
  "effective-directive"?: unknown;
  "violated-directive"?: unknown;
};

const safeHost = (value: unknown) => {
  if (typeof value !== "string" || !value) return null;
  if (value === "inline" || value === "eval" || value === "self") return value;

  try {
    return new URL(value).host;
  } catch {
    return value.slice(0, 120);
  }
};

const normalizeEntry = (entry: CspReportEntry) => ({
  blockedHost: safeHost(entry["blocked-uri"]),
  disposition:
    typeof entry.disposition === "string" ? entry.disposition.slice(0, 80) : "unknown",
  documentHost: safeHost(entry["document-uri"]),
  effectiveDirective:
    typeof entry["effective-directive"] === "string"
      ? entry["effective-directive"].slice(0, 120)
      : "unknown",
  violatedDirective:
    typeof entry["violated-directive"] === "string"
      ? entry["violated-directive"].slice(0, 120)
      : "unknown",
});

const jsonResponse = (status = 204) =>
  new NextResponse(null, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });

export async function POST(request: Request) {
  const bodyText = await request.text();
  if (bodyText.length > MAX_REPORT_BYTES) {
    return jsonResponse(204);
  }

  if (!bodyText) {
    return jsonResponse(204);
  }

  try {
    const parsed = JSON.parse(bodyText) as unknown;
    const reports = Array.isArray(parsed)
      ? parsed
      : typeof parsed === "object" && parsed !== null
        ? [parsed]
        : [];

    const normalized = reports
      .map((entry) => {
        if (
          typeof entry === "object" &&
          entry !== null &&
          "body" in entry &&
          typeof (entry as { body?: unknown }).body === "object"
        ) {
          return normalizeEntry((entry as { body: CspReportEntry }).body);
        }

        if (
          typeof entry === "object" &&
          entry !== null &&
          "csp-report" in entry &&
          typeof (entry as { "csp-report"?: unknown })["csp-report"] === "object"
        ) {
          return normalizeEntry((entry as { "csp-report": CspReportEntry })["csp-report"]);
        }

        return normalizeEntry(entry as CspReportEntry);
      })
      .slice(0, 10);

    if (normalized.length > 0) {
      console.warn(
        "CSP report-only violation observed:",
        JSON.stringify({
          count: normalized.length,
          reports: normalized,
        }),
      );
    }
  } catch (error) {
    console.warn("Failed to parse CSP report payload:", error);
  }

  return jsonResponse(204);
}
