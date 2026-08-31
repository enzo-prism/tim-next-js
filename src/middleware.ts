import { NextResponse, type NextRequest } from "next/server";

const exactCaseRedirects: Record<string, string> = {
  "/Book-Appointment": "/book-appointment",
  "/Services/Invisalign": "/services/invisalign",
};

const getCanonicalHost = () => {
  const raw = process.env.CANONICAL_HOST?.trim() || "https://www.famfirstsmile.com";
  try {
    const host = new URL(raw).host;
    // Vercel currently 308s apex → www. Forcing www here keeps one tagged
    // host and avoids a middleware 301 / Vercel 308 redirect loop.
    return host === "famfirstsmile.com" ? "www.famfirstsmile.com" : host;
  } catch {
    return "";
  }
};

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
