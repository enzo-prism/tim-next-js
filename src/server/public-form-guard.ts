import { InMemoryRateLimiter } from "@/server/in-memory-rate-limit";

type GuardResult =
  | { ok: true }
  | { ok: false; status: 403 | 413 | 415 | 429; message: string };

const MAX_BODY_BYTES = 32_000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 10;

const attempts = new InMemoryRateLimiter({
  maxAttempts: RATE_LIMIT_MAX,
  maxEntries: 5_000,
  windowMs: RATE_LIMIT_WINDOW_MS,
});

export class PublicFormPayloadTooLargeError extends Error {
  constructor() {
    super("Submission is too large");
    this.name = "PublicFormPayloadTooLargeError";
  }
}

const getRequestKey = (request: Request) => {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientIp = (
    forwarded ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    "unknown"
  ).slice(0, 100);
  const userAgent = (request.headers.get("user-agent") || "unknown").slice(0, 160);
  const pathname = (() => {
    try {
      return new URL(request.url).pathname;
    } catch {
      return "unknown";
    }
  })();

  return `${pathname}:${clientIp}:${userAgent}`;
};

const hasAllowedOrigin = (request: Request) => {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const host = new URL(origin).hostname.toLowerCase();
    const requestHost = new URL(request.url).hostname.toLowerCase();
    return (
      host === requestHost ||
      host === "famfirstsmile.com" ||
      host === "www.famfirstsmile.com" ||
      host === "localhost" ||
      host === "127.0.0.1"
    );
  } catch {
    return false;
  }
};

export function guardPublicFormRequest(request: Request): GuardResult {
  const contentType = request.headers.get("content-type")?.toLowerCase() || "";
  if (!contentType.startsWith("application/json")) {
    return { ok: false, status: 415, message: "Content-Type must be application/json" };
  }

  const contentLength = Number.parseInt(request.headers.get("content-length") || "0", 10);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return { ok: false, status: 413, message: "Submission is too large" };
  }

  if (!hasAllowedOrigin(request)) {
    return { ok: false, status: 403, message: "Invalid submission origin" };
  }

  const key = getRequestKey(request);
  const current = attempts.consume(key);
  if (!current.ok) {
    return { ok: false, status: 429, message: "Too many submissions. Please try again later." };
  }

  return { ok: true };
}

export function resetPublicFormRateLimiterForTests() {
  attempts.resetAll();
}

export async function readPublicFormJson(request: Request): Promise<Record<string, unknown>> {
  const reader = request.body?.getReader();
  if (!reader) return JSON.parse("") as Record<string, unknown>;

  const decoder = new TextDecoder();
  let byteCount = 0;
  let body = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    byteCount += value.byteLength;
    if (byteCount > MAX_BODY_BYTES) {
      await reader.cancel().catch(() => undefined);
      throw new PublicFormPayloadTooLargeError();
    }
    body += decoder.decode(value, { stream: true });
  }

  body += decoder.decode();
  return JSON.parse(body) as Record<string, unknown>;
}
