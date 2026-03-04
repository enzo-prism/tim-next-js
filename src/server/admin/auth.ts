import crypto from "node:crypto";

const DEFAULT_ADMIN_PASSWORD = "tim";

const safeTimingEqual = (a: string, b: string) => {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
};

export function isAuthorized(authorizationHeader: string | null): boolean {
  if (!authorizationHeader || !authorizationHeader.startsWith("Basic ")) {
    return false;
  }

  let decoded = "";
  try {
    decoded = Buffer.from(authorizationHeader.slice("Basic ".length), "base64").toString(
      "utf8",
    );
  } catch {
    return false;
  }

  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex < 0) {
    return false;
  }

  const password = decoded.slice(separatorIndex + 1);
  const expectedPassword = process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;

  return safeTimingEqual(password, expectedPassword);
}
