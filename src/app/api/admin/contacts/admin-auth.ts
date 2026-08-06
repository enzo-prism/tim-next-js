import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/server/admin-session";

// Middleware already gates these paths. This is the second line of defence for
// the admin JSON APIs, so a routing change can never quietly expose patient
// contact details.
export const requireAdminSession = async (request: NextRequest) => {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (await isValidSessionToken(token)) return null;

  const response = NextResponse.json(
    { ok: false, error: "unauthorized", message: "Unauthorized" },
    { status: 401 },
  );
  response.headers.set("Cache-Control", "no-store");
  return response;
};
