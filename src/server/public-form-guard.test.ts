import { afterEach, describe, expect, it } from "vitest";
import {
  guardPublicFormRequest,
  PublicFormPayloadTooLargeError,
  readPublicFormJson,
  resetPublicFormRateLimiterForTests,
} from "@/server/public-form-guard";

const request = (headers: Record<string, string>) =>
  new Request("https://www.famfirstsmile.com/api/contacts", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
  });

describe("public form request guard", () => {
  afterEach(() => {
    resetPublicFormRateLimiterForTests();
  });

  it("rejects an untrusted origin", () => {
    expect(
      guardPublicFormRequest(
        request({ origin: "https://example.test", "x-forwarded-for": "203.0.113.10" }),
      ),
    ).toEqual({ ok: false, status: 403, message: "Invalid submission origin" });
  });

  it("rejects an unrelated Vercel origin", () => {
    expect(
      guardPublicFormRequest(
        request({
          origin: "https://unrelated-project.vercel.app",
          "x-forwarded-for": "203.0.113.14",
        }),
      ),
    ).toEqual({ ok: false, status: 403, message: "Invalid submission origin" });
  });

  it("requires JSON requests", () => {
    expect(
      guardPublicFormRequest(
        new Request("https://www.famfirstsmile.com/api/contacts", {
          method: "POST",
          headers: {
            origin: "https://www.famfirstsmile.com",
            "content-type": "text/plain",
            "x-forwarded-for": "203.0.113.13",
          },
        }),
      ),
    ).toEqual({ ok: false, status: 415, message: "Content-Type must be application/json" });
  });

  it("rejects an oversized request before JSON parsing", () => {
    expect(
      guardPublicFormRequest(
        request({
          origin: "https://www.famfirstsmile.com",
          "content-length": "50000",
          "x-forwarded-for": "203.0.113.11",
        }),
      ),
    ).toEqual({ ok: false, status: 413, message: "Submission is too large" });
  });

  it("rejects an oversized streamed body without relying on content-length", async () => {
    const oversized = new Request("https://www.famfirstsmile.com/api/contacts", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://www.famfirstsmile.com",
        "x-forwarded-for": "203.0.113.15",
      },
      body: JSON.stringify({ message: "x".repeat(33_000) }),
    });

    await expect(readPublicFormJson(oversized)).rejects.toBeInstanceOf(
      PublicFormPayloadTooLargeError,
    );
  });

  it("rate limits repeated requests from one address", () => {
    const headers = {
      origin: "https://www.famfirstsmile.com",
      "x-forwarded-for": "203.0.113.12",
    };
    for (let index = 0; index < 10; index += 1) {
      expect(guardPublicFormRequest(request(headers))).toEqual({ ok: true });
    }
    expect(guardPublicFormRequest(request(headers))).toEqual({
      ok: false,
      status: 429,
      message: "Too many submissions. Please try again later.",
    });
  });
});
