import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  buildClearedSessionCookie,
  buildSessionCookie,
  createSessionToken,
  getExpectedAdminPassword,
  safeCompare,
} from "@/server/admin-session";
import { InMemoryRateLimiter } from "@/server/in-memory-rate-limit";

export const runtime = "nodejs";

const SIGN_IN_WINDOW_MS = 15 * 60 * 1000;
const SIGN_IN_MAX_ATTEMPTS = 10;

const signInAttempts = new InMemoryRateLimiter({
  maxAttempts: SIGN_IN_MAX_ATTEMPTS,
  maxEntries: 2_000,
  windowMs: SIGN_IN_WINDOW_MS,
});

const signInSchema = z.object({
  password: z.string().min(1).max(200),
});

const getClientAddress = (request: NextRequest) =>
  (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  ).slice(0, 100);

const isSecureRequest = (request: NextRequest) =>
  request.nextUrl.protocol === "https:" ||
  request.headers.get("x-forwarded-proto") === "https";

const noStore = (response: NextResponse) => {
  response.headers.set("Cache-Control", "no-store");
  return response;
};

export async function POST(request: NextRequest) {
  const rateLimitKey = `admin-sign-in:${getClientAddress(request)}`;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return noStore(
      NextResponse.json(
        { ok: false, error: "invalid_request", message: "Enter a password." },
        { status: 400 },
      ),
    );
  }

  const parsed = signInSchema.safeParse(payload);
  if (!parsed.success) {
    return noStore(
      NextResponse.json(
        { ok: false, error: "invalid_request", message: "Enter a password." },
        { status: 400 },
      ),
    );
  }

  const expectedPassword = getExpectedAdminPassword();
  if (!expectedPassword) {
    return noStore(
      NextResponse.json(
        {
          ok: false,
          error: "missing_config",
          message: "Admin sign-in is not configured.",
        },
        { status: 503 },
      ),
    );
  }

  if (!safeCompare(parsed.data.password, expectedPassword)) {
    const attempt = signInAttempts.consume(rateLimitKey);
    if (!attempt.ok) {
      return noStore(
        NextResponse.json(
          {
            ok: false,
            error: "too_many_attempts",
            message: "Too many attempts. Try again in a few minutes.",
          },
          {
            status: 429,
            headers: { "Retry-After": String(attempt.retryAfterSeconds) },
          },
        ),
      );
    }

    return noStore(
      NextResponse.json(
        {
          ok: false,
          error: "invalid_password",
          message: "That password is not right.",
        },
        { status: 401 },
      ),
    );
  }

  signInAttempts.reset(rateLimitKey);

  const token = await createSessionToken(expectedPassword);
  const response = noStore(NextResponse.json({ ok: true }));
  response.headers.set(
    "Set-Cookie",
    buildSessionCookie(token, isSecureRequest(request)),
  );
  return response;
}

export async function DELETE(request: NextRequest) {
  const response = noStore(NextResponse.json({ ok: true }));
  response.headers.set(
    "Set-Cookie",
    buildClearedSessionCookie(isSecureRequest(request)),
  );
  return response;
}
