import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/server/admin-session";

const CRON_EXEMPT_PATHS = [
  "/api/admin/notifications/process",
  "/api/admin/reconciliation/run",
];

// The sign-in surface itself cannot sit behind the gate it feeds.
const AUTH_EXEMPT_PATHS = ["/admin/login", "/api/admin/session"];

const isProtectedPath = (pathname: string) =>
  pathname === "/admin" ||
  pathname.startsWith("/admin/") ||
  pathname.startsWith("/api/admin");

const isCronExemptPath = (pathname: string) =>
  CRON_EXEMPT_PATHS.includes(pathname);

const isAuthExemptPath = (pathname: string) =>
  AUTH_EXEMPT_PATHS.includes(pathname);

const exactCaseRedirects: Record<string, string> = {
  "/Book-Appointment": "/book-appointment",
  "/Services/Invisalign": "/services/invisalign",
};

const getCanonicalHost = () => {
  const raw = process.env.CANONICAL_HOST?.trim() || "https://www.famfirstsmile.com";
  try {
    const host = new URL(raw).host;
    return host === "famfirstsmile.com" ? "www.famfirstsmile.com" : host;
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
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    },
  );
}

function signInRedirect(req: NextRequest) {
  const url = new URL("/admin/login", req.url);
  const target = `${req.nextUrl.pathname}${req.nextUrl.search}`;
  if (target && target !== "/admin") {
    url.searchParams.set("next", target);
  }
  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function middleware(req: NextRequest) {
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

  const exactCaseDestination = exactCaseRedirects[nextUrl.pathname];
  if (exactCaseDestination) {
    const redirectUrl = new URL(req.url);
    redirectUrl.pathname = exactCaseDestination;
    return NextResponse.redirect(redirectUrl, 301);
  }

  if (nextUrl.pathname === "/" && nextUrl.searchParams.get("page_id") === "1073") {
    const redirectUrl = new URL("/patient-info", req.url);
    return NextResponse.redirect(redirectUrl, 301);
  }

  if (
    isProtectedPath(nextUrl.pathname) &&
    !isCronExemptPath(nextUrl.pathname) &&
    !isAuthExemptPath(nextUrl.pathname)
  ) {
    const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!(await isValidSessionToken(token))) {
      // API callers need a status code they can branch on; a browser landing on
      // the dashboard needs the sign-in form.
      return nextUrl.pathname.startsWith("/api/admin")
        ? unauthorizedResponse()
        : signInRedirect(req);
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
