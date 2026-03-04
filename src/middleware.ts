import { NextResponse, type NextRequest } from "next/server";

const DEFAULT_ADMIN_PASSWORD = "tim";

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
  const raw = process.env.CANONICAL_HOST?.trim();
  if (!raw) return "";
  try {
    return new URL(raw).host;
  } catch {
    return "";
  }
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

function missingAdminPasswordResponse() {
  return new NextResponse(
    JSON.stringify({
      ok: false,
      error: "missing_config",
      message: "ADMIN_PASSWORD is required in production.",
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
  const host = req.headers.get("host") || "";
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
    if (process.env.NODE_ENV === "production" && !process.env.ADMIN_PASSWORD) {
      return missingAdminPasswordResponse();
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

    const providedPassword = decoded.slice(separator + 1);
    const expectedPassword =
      process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === "production" ? "" : DEFAULT_ADMIN_PASSWORD);

    if (!safeTimingEqual(providedPassword, expectedPassword)) {
      return unauthorizedResponse();
    }

    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
