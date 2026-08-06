// Single-password gate for the leads dashboard.
//
// This replaced HTTP Basic auth. Basic auth put a native browser dialog in
// front of the practice, needed a username nobody could remember, and gave no
// way to sign out. The dashboard holds patient contact details, so it still
// needs a gate — it just needs the simplest one that works: one password, one
// cookie, one sign-out link.
//
// The cookie stores a hash of the password rather than the password itself, so
// a stolen cookie cannot be read back into the shared secret.

export const ADMIN_SESSION_COOKIE = "ffsc_admin_session";

// Long enough that the front desk signs in once and stays signed in.
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const DEFAULT_ADMIN_PASSWORD = "Tim";

export const getExpectedAdminPassword = () =>
  process.env.ADMIN_PASSWORD?.trim() || DEFAULT_ADMIN_PASSWORD;

const encoder = new TextEncoder();

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

// Web Crypto works in both the Edge middleware and the Node route handlers, so
// the token is derived identically on either side.
export const createSessionToken = async (password: string) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(`famfirstsmile-admin:${password}`),
  );
  return toHex(digest);
};

export const safeCompare = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
};

export const isValidSessionToken = async (token: string | undefined) => {
  if (!token) return false;
  const expected = await createSessionToken(getExpectedAdminPassword());
  return safeCompare(token, expected);
};

export const buildSessionCookie = (token: string, secure: boolean) =>
  [
    `${ADMIN_SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${ADMIN_SESSION_MAX_AGE_SECONDS}`,
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");

export const buildClearedSessionCookie = (secure: boolean) =>
  [
    `${ADMIN_SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
