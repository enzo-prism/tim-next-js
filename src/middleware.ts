import { NextResponse, type NextRequest } from "next/server";
import { InMemoryRateLimiter } from "@/server/in-memory-rate-limit";

const DEFAULT_ADMIN_PASSWORD = "tim";
const DEFAULT_ADMIN_USERNAME = "admin";
const ADMIN_AUTH_WINDOW_MS = 15 * 60 * 1000;
const ADMIN_AUTH_MAX_ATTEMPTS = 5;
const adminAuthAttempts = new InMemoryRateLimiter({
  maxAttempts: ADMIN_AUTH_MAX_ATTEMPTS,
  maxEntries: 2_000,
  windowMs: ADMIN_AUTH_WINDOW_MS,
});

const safeTimingEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
};

const isProtectedPath = (pathname: string) =>
  pathname === "/admin" || pathname.startsWith("/api/admin");

const getCanonicalHost = () => {
  const raw = process.env.CANONICAL_HOST?.trim() || "https://www.famfirstsmile.com";
  try {
    const host = new URL(raw).host;
    return host === "famfirstsmile.com" ? "www.famfirstsmile.com" : host;
  } catch {
    return "";
  }
};

const getClientAddress = (req: NextRequest) =>
  (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    "unknown"
  ).slice(0, 100);

const getAdminRateLimitKey = (req: NextRequest) => {
  const userAgent = (req.headers.get("user-agent") || "unknown").slice(0, 160);
  const scope = req.nextUrl.pathname.startsWith("/api/admin") ? "api-admin" : "admin";
  return `${scope}:${getClientAddress(req)}:${userAgent}`;
};

function unauthorizedResponse() {
  return new NextResponse(
    JSON.stringify({ ok: false, error: "unauthorized", message: "Unauthorized" }),
    {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin"',
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    },
  );
}

function rateLimitedResponse(retryAfterSeconds: number) {
  return new NextResponse(
    JSON.stringify({
      ok: false,
      error: "too_many_attempts",
      message: "Too many failed sign-in attempts. Please try again later.",
    }),
    {
      status: 429,
      headers: {
        // Browsers only reopen the Basic-auth dialog on a challenge. Without
        // this, staff who mistyped once keep auto-resending cached bad
        // credentials and cannot enter the correct ones until the window ends.
        "WWW-Authenticate": 'Basic realm="Admin"',
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "Retry-After": String(retryAfterSeconds),
      },
    },
  );
}

function missingAdminCredentialsResponse() {
  return new NextResponse(
    JSON.stringify({
      ok: false,
      error: "missing_config",
      message: "ADMIN_USERNAME and ADMIN_PASSWORD are required in production.",
    }),
    {
      status: 503,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    },
  );
}

export function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const host = req.headers.get("host") || nextUrl.host || "";
  const canonicalHost = getCanonicalHost();
  const isNonCanonicalHost =
    Boolean(canonicalHost) &&
    host !== canonicalHost &&
    !host.endsWith(".vercel.app") &&
    !host.endsWith(".vercel.sh") &&
    !host.startsWith("localhost") &&
    !host.startsWith("127.0.0.1");

  if (isNonCanonicalHost) {
    const redirectUrl = new URL(req.url);
    redirectUrl.host = canonicalHost;
    return NextResponse.redirect(redirectUrl, 301);
  }

  if (nextUrl.pathname === "/" && nextUrl.searchParams.get("page_id") === "1073") {
    const redirectUrl = new URL("/patient-info", req.url);
    return NextResponse.redirect(redirectUrl, 301);
  }

  if (isProtectedPath(nextUrl.pathname)) {
    const rateLimitKey = getAdminRateLimitKey(req);

    if (
      process.env.NODE_ENV === "production" &&
      (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD)
    ) {
      return missingAdminCredentialsResponse();
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return unauthorizedResponse();
    }

    let decoded = "";
    try {
      decoded = atob(authHeader.slice("Basic ".length));
    } catch {
      return unauthorizedResponse();
    }

    const separator = decoded.indexOf(":");
    if (separator < 0) {
      return unauthorizedResponse();
    }

    const providedUsername = decoded.slice(0, separator);
    const providedPassword = decoded.slice(separator + 1);
    const expectedUsername =
      process.env.ADMIN_USERNAME ||
      (process.env.NODE_ENV === "production" ? "" : DEFAULT_ADMIN_USERNAME);
    const expectedPassword =
      process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === "production" ? "" : DEFAULT_ADMIN_PASSWORD);

    if (
      !safeTimingEqual(providedUsername, expectedUsername) ||
      !safeTimingEqual(providedPassword, expectedPassword)
    ) {
      const attempt = adminAuthAttempts.consume(rateLimitKey);
      return attempt.ok ? unauthorizedResponse() : rateLimitedResponse(attempt.retryAfterSeconds);
    }

    adminAuthAttempts.reset(rateLimitKey);
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

export function resetAdminAuthRateLimiterForTests() {
  adminAuthAttempts.resetAll();
}
