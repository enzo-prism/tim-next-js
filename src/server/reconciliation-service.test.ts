import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
  select: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
}));

const mockDb = {
  execute: mocks.execute,
  select: mocks.select,
  update: mocks.update,
  insert: mocks.insert,
} as never;

const setupUpdateChain = () => {
  const chain = {
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
  };
  mocks.update.mockReturnValue(chain);
  return chain;
};

import {
  DatabaseReconciliationService,
  computeTimeWindow,
  deduplicateAndValidateIds,
  sanitizeErrorCode,
} from "@/server/reconciliation-service";
import type { IReconciliationProvider, ReconciliationTimeWindow } from "@/server/reconciliation-providers";

const makeProvider = (
  name: "google_ads" | "formspree",
  ids: string[] | Error,
): IReconciliationProvider => ({
  name,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fetchExternalLeadIds: async (window: ReconciliationTimeWindow, signal: AbortSignal) => {
    if (ids instanceof Error) throw ids;
    return ids;
  },
});

describe("sanitizeErrorCode", () => {
  it("maps allowlisted error messages directly", () => {
    expect(sanitizeErrorCode(new Error("provider_not_configured"))).toBe("provider_not_configured");
    expect(sanitizeErrorCode(new Error("provider_timeout"))).toBe("provider_timeout");
    expect(sanitizeErrorCode(new Error("database_error"))).toBe("database_error");
  });

  it("maps timeout-related errors to provider_timeout", () => {
    expect(sanitizeErrorCode(new Error("request timeout after 30s"))).toBe("provider_timeout");
    expect(sanitizeErrorCode(new Error("ETIMEDOUT"))).toBe("provider_timeout");
  });

  it("maps network errors to provider_api_error", () => {
    expect(sanitizeErrorCode(new Error("fetch failed"))).toBe("provider_api_error");
    expect(sanitizeErrorCode(new Error("ECONNREFUSED 127.0.0.1:443"))).toBe("provider_api_error");
  });

  it("maps unknown errors to unknown_error", () => {
    expect(sanitizeErrorCode(new Error("some random error"))).toBe("unknown_error");
    expect(sanitizeErrorCode("not an error")).toBe("unknown_error");
    expect(sanitizeErrorCode(null)).toBe("unknown_error");
  });

  it("never exposes raw error messages with sensitive data", () => {
    const malicious = new Error("https://api.google.com/v1/leads?key=SECRET123 user@email.com");
    const code = sanitizeErrorCode(malicious);
    expect(code).toBe("unknown_error");
    expect(code).not.toContain("SECRET");
    expect(code).not.toContain("email");
    expect(code).not.toContain("http");
  });
});

describe("deduplicateAndValidateIds", () => {
  it("removes duplicate IDs", () => {
    expect(deduplicateAndValidateIds(["a", "b", "a", "c"])).toEqual(["a", "b", "c"]);
  });

  it("trims whitespace", () => {
    expect(deduplicateAndValidateIds(["  a  ", "b"])).toEqual(["a", "b"]);
  });

  it("filters empty and null-ish values", () => {
    expect(deduplicateAndValidateIds(["", "  ", "a"])).toEqual(["a"]);
  });

  it("filters IDs exceeding 500 characters", () => {
    const longId = "x".repeat(501);
    expect(deduplicateAndValidateIds([longId, "valid"])).toEqual(["valid"]);
  });
});

describe("computeTimeWindow", () => {
  it("am run reconciles [21:00 prev, 09:00 today)", () => {
    const now = new Date("2026-08-04T09:00:00Z");
    const window = computeTimeWindow(now);
    expect(window.since.toISOString()).toBe("2026-08-03T21:00:00.000Z");
    expect(window.until.toISOString()).toBe("2026-08-04T09:00:00.000Z");
  });

  it("pm run reconciles [09:00, 21:00)", () => {
    const now = new Date("2026-08-04T21:00:00Z");
    const window = computeTimeWindow(now);
    expect(window.since.toISOString()).toBe("2026-08-04T09:00:00.000Z");
    expect(window.until.toISOString()).toBe("2026-08-04T21:00:00.000Z");
  });
});

describe("DatabaseReconciliationService", () => {
  let service: DatabaseReconciliationService;

  beforeEach(() => {
    vi.clearAllMocks();
    setupUpdateChain();
    service = new DatabaseReconciliationService();
  });

  describe("acquireRunLock", () => {
    it("returns run id and lease token when insert succeeds", async () => {
      mocks.execute.mockResolvedValueOnce({ rows: [{ id: "run-1" }] });

      const result = await service.acquireRunLock(mockDb, "key-1", "google_ads");

      expect(result).not.toBeNull();
      expect(result!.runId).toBe("run-1");
      expect(result!.leaseToken).toBeDefined();
      expect(mocks.execute).toHaveBeenCalledTimes(1);
    });

    it("returns null when run already exists and is not failed", async () => {
      mocks.execute
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await service.acquireRunLock(mockDb, "key-1", "google_ads");

      expect(result).toBeNull();
      expect(mocks.execute).toHaveBeenCalledTimes(2);
    });

    it("retries a failed run by resetting it to running", async () => {
      mocks.execute
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: "run-failed" }] });

      const result = await service.acquireRunLock(mockDb, "key-1", "google_ads");

      expect(result).not.toBeNull();
      expect(result!.runId).toBe("run-failed");
      expect(mocks.execute).toHaveBeenCalledTimes(2);
    });
  });

  describe("runReconciliation", () => {
    const now = new Date("2026-08-04T09:00:00Z");

    it("returns skipped when lock cannot be acquired", async () => {
      mocks.execute
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const provider = makeProvider("google_ads", []);
      const result = await service.runReconciliation(mockDb, provider, now);

      expect(result).toEqual({
        status: "skipped",
        runKey: "reconciliation:google_ads:2026-08-04:am",
        reason: "lock_contention",
      });
    });

    it("returns completed with correct counts when no discrepancies", async () => {
      mocks.execute
        .mockResolvedValueOnce({ rows: [{ id: "run-1" }] })
        .mockResolvedValueOnce({ rows: [{ id: "run-1" }] })
        .mockResolvedValueOnce({ rows: [{ id: "run-1" }] })
        .mockResolvedValueOnce({ rows: [{ success: true }] });

      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ id: "lead-1" }, { id: "lead-2" }]),
      };
      mocks.select.mockReturnValue(selectChain);

      const provider = makeProvider("google_ads", ["lead-1", "lead-2"]);
      const result = await service.runReconciliation(mockDb, provider, now);

      expect(result).toEqual({
        status: "completed",
        runKey: "reconciliation:google_ads:2026-08-04:am",
        totalExternal: 2,
        totalStored: 2,
        missingInStored: 0,
      });
    });

    it("returns failed with sanitized error code when provider throws", async () => {
      mocks.execute
        .mockResolvedValueOnce({ rows: [{ id: "run-1" }] })
        .mockResolvedValueOnce({ rows: [{ id: "run-1" }] });

      const provider = makeProvider("google_ads", new Error("provider_not_configured"));
      const result = await service.runReconciliation(mockDb, provider, now);

      expect(result).toEqual({
        status: "failed",
        runKey: "reconciliation:google_ads:2026-08-04:am",
        errorCode: "provider_not_configured",
      });
    });

    it("maps malicious error messages to safe codes", async () => {
      mocks.execute
        .mockResolvedValueOnce({ rows: [{ id: "run-1" }] })
        .mockResolvedValueOnce({ rows: [{ id: "run-1" }] });

      const provider = makeProvider(
        "google_ads",
        new Error("https://secret-api.com/key=ABC123 patient@email.com"),
      );
      const result = await service.runReconciliation(mockDb, provider, now);

      expect(result.status).toBe("failed");
      if (result.status === "failed") {
        expect(result.errorCode).toBe("unknown_error");
        expect(result.errorCode).not.toContain("secret");
        expect(result.errorCode).not.toContain("email");
        expect(result.errorCode).not.toContain("http");
      }
    });

    it("deduplicates external IDs before comparison", async () => {
      mocks.execute
        .mockResolvedValueOnce({ rows: [{ id: "run-1" }] })
        .mockResolvedValueOnce({ rows: [{ id: "run-1" }] })
        .mockResolvedValueOnce({ rows: [{ id: "run-1" }] })
        .mockResolvedValueOnce({ rows: [{ success: true }] });

      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ id: "lead-1" }]),
      };
      mocks.select.mockReturnValue(selectChain);

      const provider = makeProvider("google_ads", ["lead-1", "lead-1", "lead-1"]);
      const result = await service.runReconciliation(mockDb, provider, now);

      expect(result.status).toBe("completed");
      if (result.status === "completed") {
        expect(result.totalExternal).toBe(1);
        expect(result.missingInStored).toBe(0);
      }
    });

    it("does not include patient fields in the outcome", async () => {
      mocks.execute
        .mockResolvedValueOnce({ rows: [{ id: "run-1" }] })
        .mockResolvedValueOnce({ rows: [{ id: "run-1" }] })
        .mockResolvedValueOnce({ rows: [{ id: "run-1" }] })
        .mockResolvedValueOnce({ rows: [{ success: true }] });

      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ id: "lead-1" }]),
      };
      mocks.select.mockReturnValue(selectChain);

      const provider = makeProvider("google_ads", ["lead-1"]);
      const result = await service.runReconciliation(mockDb, provider, now);

      const serialized = JSON.stringify(result);
      expect(serialized).not.toContain("firstName");
      expect(serialized).not.toContain("lastName");
      expect(serialized).not.toContain("email");
      expect(serialized).not.toContain("phone");
    });
  });

  describe("checkStoredMembership", () => {
    it("returns found IDs for google_ads provider", async () => {
      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ id: "ga-1" }, { id: null }]),
      };
      mocks.select.mockReturnValue(selectChain);

      const result = await service.checkStoredMembership(mockDb, "google_ads", ["ga-1", "ga-2"]);

      expect(result).toEqual(new Set(["ga-1"]));
    });

    it("returns found IDs for formspree provider", async () => {
      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ id: "fs-1" }]),
      };
      mocks.select.mockReturnValue(selectChain);

      const result = await service.checkStoredMembership(mockDb, "formspree", ["fs-1", "fs-2"]);

      expect(result).toEqual(new Set(["fs-1"]));
    });

    it("returns empty set for empty input", async () => {
      const result = await service.checkStoredMembership(mockDb, "google_ads", []);
      expect(result).toEqual(new Set());
      expect(mocks.select).not.toHaveBeenCalled();
    });
  });

  describe("AbortSignal and timeout", () => {
    const now = new Date("2026-08-04T09:00:00Z");

    it("provider receives AbortSignal parameter", async () => {
      let receivedSignal: AbortSignal | undefined;
      const provider: IReconciliationProvider = {
        name: "google_ads",
        fetchExternalLeadIds: async (_window, signal) => {
          receivedSignal = signal;
          return ["lead-1"];
        },
      };

      mocks.execute
        .mockResolvedValueOnce({ rows: [{ id: "run-1" }] })
        .mockResolvedValueOnce({ rows: [{ id: "run-1" }] })
        .mockResolvedValueOnce({ rows: [{ id: "run-1" }] })
        .mockResolvedValueOnce({ rows: [{ success: true }] });

      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ id: "lead-1" }]),
      };
      mocks.select.mockReturnValue(selectChain);

      await service.runReconciliation(mockDb, provider, now);

      expect(receivedSignal).toBeDefined();
      expect(receivedSignal).toBeInstanceOf(AbortSignal);
    });

    it("timeout error maps to provider_timeout via sanitizeErrorCode", () => {
      expect(sanitizeErrorCode(new Error("provider_timeout"))).toBe("provider_timeout");
      expect(sanitizeErrorCode(new Error("AbortError: signal aborted"))).toBe("provider_timeout");
      expect(sanitizeErrorCode(new Error("request timeout after 180s"))).toBe("provider_timeout");
    });

    it("fast path leaves no dangling timer", async () => {
      vi.useFakeTimers();

      mocks.execute
        .mockResolvedValueOnce({ rows: [{ id: "run-1" }] })
        .mockResolvedValueOnce({ rows: [{ id: "run-1" }] })
        .mockResolvedValueOnce({ rows: [{ id: "run-1" }] })
        .mockResolvedValueOnce({ rows: [{ success: true }] });

      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      mocks.select.mockReturnValue(selectChain);

      const provider = makeProvider("google_ads", []);
      const result = await service.runReconciliation(mockDb, provider, now);

      expect(result.status).toBe("completed");

      const timerCount = vi.getTimerCount();
      expect(timerCount).toBe(0);

      vi.useRealTimers();
    });
  });
});
