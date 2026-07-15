import { NextRequest, NextResponse } from "next/server";

const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD = "tim";

const safeTimingEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
};

const jsonError = (status: number, error: string, message: string) => {
  const response = NextResponse.json({ ok: false, error, message }, { status });
  response.headers.set("Cache-Control", "no-store");
  if (status === 401) response.headers.set("WWW-Authenticate", 'Basic realm="Admin"');
  return response;
};

export const requireAdminBasicAuth = (request: NextRequest) => {
  const isProduction = process.env.NODE_ENV === "production";
  const expectedUsername =
    process.env.ADMIN_USERNAME || (isProduction ? "" : DEFAULT_ADMIN_USERNAME);
  const expectedPassword =
    process.env.ADMIN_PASSWORD || (isProduction ? "" : DEFAULT_ADMIN_PASSWORD);

  if (!expectedUsername || !expectedPassword) {
    return jsonError(
      503,
      "missing_config",
      "ADMIN_USERNAME and ADMIN_PASSWORD are required in production.",
    );
  }

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) {
    return jsonError(401, "unauthorized", "Unauthorized");
  }

  let decoded = "";
  try {
    decoded = Buffer.from(header.slice("Basic ".length), "base64").toString("utf8");
  } catch {
    return jsonError(401, "unauthorized", "Unauthorized");
  }

  const separator = decoded.indexOf(":");
  if (separator < 0) return jsonError(401, "unauthorized", "Unauthorized");

  const username = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);
  if (
    !safeTimingEqual(username, expectedUsername) ||
    !safeTimingEqual(password, expectedPassword)
  ) {
    return jsonError(401, "unauthorized", "Unauthorized");
  }

  return null;
};
