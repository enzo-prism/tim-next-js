import { google } from "googleapis";
import fs from "node:fs";

const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/webmasters.readonly",
];

type CredentialsJson = Record<string, unknown> & {
  client_email?: string;
  private_key?: string;
};

export type MissingConfigPayload = {
  ok: false;
  error: "missing_config";
  message: string;
  missing: string[];
};

export const buildMissingConfigPayload = (
  missing: string[],
  message?: string,
): MissingConfigPayload => ({
  ok: false,
  error: "missing_config",
  message: message || "Missing required configuration for Google APIs.",
  missing,
});

const readCredentialsFile =
  (filePath: string): { text: string } | { error: MissingConfigPayload } => {
    try {
      const text = fs.readFileSync(filePath, "utf8");
      if (!text.trim()) {
        return {
          error: buildMissingConfigPayload(
            ["GOOGLE_APPLICATION_CREDENTIALS"],
            `Credentials file is empty: ${filePath}`,
          ),
        };
      }
      return { text };
    } catch {
      return {
        error: buildMissingConfigPayload(
          ["GOOGLE_APPLICATION_CREDENTIALS"],
          `Failed to read credentials file: ${filePath}`,
        ),
      };
    }
  };

const parseServiceAccountCredentials =
  (): { credentials: CredentialsJson } | { error: MissingConfigPayload } => {
    const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const rawBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;
    const credentialsFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (!rawJson && !rawBase64 && !credentialsFile) {
      return {
        error: buildMissingConfigPayload(
          [
            "GOOGLE_SERVICE_ACCOUNT_JSON",
            "GOOGLE_SERVICE_ACCOUNT_JSON_BASE64",
            "GOOGLE_APPLICATION_CREDENTIALS",
          ],
          "Missing Google service account credentials. Provide GOOGLE_SERVICE_ACCOUNT_JSON(_BASE64) or set GOOGLE_APPLICATION_CREDENTIALS to a JSON key file path.",
        ),
      };
    }

    let text = rawJson;
    if (!text && !rawBase64 && credentialsFile) {
      const readResult = readCredentialsFile(credentialsFile);
      if ("error" in readResult) return readResult;
      text = readResult.text;
    }
    if (!text && rawBase64) {
      try {
        text = Buffer.from(rawBase64, "base64").toString("utf8");
      } catch {
        return {
          error: buildMissingConfigPayload(
            ["GOOGLE_SERVICE_ACCOUNT_JSON_BASE64"],
            "Invalid base64 for GOOGLE_SERVICE_ACCOUNT_JSON_BASE64.",
          ),
        };
      }
    }

    if (!text) {
      return {
        error: buildMissingConfigPayload(
          [
            "GOOGLE_SERVICE_ACCOUNT_JSON",
            "GOOGLE_SERVICE_ACCOUNT_JSON_BASE64",
            "GOOGLE_APPLICATION_CREDENTIALS",
          ],
          "Missing Google service account credentials. Provide GOOGLE_SERVICE_ACCOUNT_JSON(_BASE64) or set GOOGLE_APPLICATION_CREDENTIALS to a JSON key file path.",
        ),
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return {
        error: buildMissingConfigPayload(
          ["GOOGLE_SERVICE_ACCOUNT_JSON"],
          "Invalid JSON for GOOGLE_SERVICE_ACCOUNT_JSON.",
        ),
      };
    }

    if (!parsed || typeof parsed !== "object") {
      return {
        error: buildMissingConfigPayload(
          ["GOOGLE_SERVICE_ACCOUNT_JSON"],
          "Service account JSON must be an object.",
        ),
      };
    }

    const credentials = parsed as CredentialsJson;
    if (!credentials.client_email || !credentials.private_key) {
      return {
        error: buildMissingConfigPayload(
          ["client_email", "private_key"],
          "Service account JSON is missing client_email/private_key.",
        ),
      };
    }

    if (typeof credentials.private_key === "string") {
      credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
    }

    return { credentials };
  };

export const getGoogleAuth = ():
  | { auth: InstanceType<typeof google.auth.GoogleAuth> }
  | { error: MissingConfigPayload } => {
  const parsed = parseServiceAccountCredentials();
  if ("error" in parsed) return parsed;

  const auth = new google.auth.GoogleAuth({
    credentials: parsed.credentials,
    scopes: GOOGLE_SCOPES,
  });

  return { auth };
};
