import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { outcomeAuthorizationStatus } from "@/server/outcome-reporting";
export const outcomeJson = (payload: unknown, status = 200) => {
  const response = NextResponse.json(payload, { status });
  response.headers.set("Cache-Control", "no-store, private");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
};
export const requireOutcomeAccess = (request: Request) => {
  const status = outcomeAuthorizationStatus(request.headers.get("authorization"), process.env.LEAD_OUTCOMES_SECRET);
  if (status !== 200) return outcomeJson({ ok: false, error: status === 503 ? "outcomes_not_configured" : "unauthorized" }, status);
  if (!db) return outcomeJson({ ok: false, error: "database_unavailable" }, 503);
  return null;
};
export async function readOutcomeBody(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new Error("invalid_body");
  if (Number(request.headers.get("content-length")) > 8192 || !request.body) throw new Error("invalid_body");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 8192) { await reader.cancel(); throw new Error("invalid_body"); }
      chunks.push(chunk.value);
    }
  } finally { reader.releaseLock(); }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
