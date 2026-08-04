import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
  select: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
  fetchExternalLeadIds: vi.fn(),
}));

const mockDb = {
  execute: mocks.execute,
  select: mocks.select,
  update: mocks.update,
  insert: mocks.insert,
} as never;

vi.mock("@/server/reconciliation-providers", () => ({
  getReconciliationProvider: vi.fn(),
  ALL_RECONCILIATION_PROVIDERS: ["google_ads", "formspree"],
}));

import { DatabaseReconciliationService } from "@/server/reconciliation-service";
import type { IReconciliationProvider } from "@/server/reconciliation-providers";

const makeProvider = (
  name: "google_ads" | "formspree",
  ids: string[] | Error,
): IReconciliationProvider => ({
  name,
  fetchExternalLeadIds: async () => {
    if (ids instanceof Error) throw ids;
    return ids;
  },
});

describe("DatabaseReconciliationService", () => {
  let service: DatabaseReconciliationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DatabaseReconciliationService();
  });

  describe("acquireRunLock", () => {
    it("returns run id when insert succeeds", async () => {
      mocks.execute.mockResolvedValueOnce({ rows: [{ id: "run-1" }] });

      const result = await service.acquireRunLock(mockDb, "key-1", "google_ads");

      expect(result).toBe("run-1");
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

      expect(result).toBe("run-failed");
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
      mocks.execute.mockResolvedValueOnce({ rows: [{ id: "run-1" }] });

      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ id: "lead-1" }, { id: "lead-2" }]),
      };
      mocks.select.mockReturnValue(selectChain);

      const updateChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      mocks.update.mockReturnValue(updateChain);

      const insertChain = {
        values: vi.fn().mockResolvedValue([]),
      };
      mocks.insert.mockReturnValue(insertChain);

      const provider = makeProvider("google_ads", ["lead-1", "lead-2"]);
      const result = await service.runReconciliation(mockDb, provider, now);

      expect(result).toEqual({
        status: "completed",
        runKey: "reconciliation:google_ads:2026-08-04:am",
        totalExternal: 2,
        totalStored: 2,
        missingInStored: 0,
        missingInExternal: 0,
      });
    });

    it("detects leads missing in stored and missing in external", async () => {
      mocks.execute.mockResolvedValueOnce({ rows: [{ id: "run-1" }] });

      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ id: "stored-1" }]),
      };
      mocks.select.mockReturnValue(selectChain);

      const updateChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      mocks.update.mockReturnValue(updateChain);

      const valuesMock = vi.fn().mockResolvedValue([]);
      mocks.insert.mockReturnValue({ values: valuesMock });

      const provider = makeProvider("google_ads", ["external-1"]);
      const result = await service.runReconciliation(mockDb, provider, now);

      expect(result).toEqual({
        status: "completed",
        runKey: "reconciliation:google_ads:2026-08-04:am",
        totalExternal: 1,
        totalStored: 1,
        missingInStored: 1,
        missingInExternal: 1,
      });

      expect(mocks.insert).toHaveBeenCalled();
      const insertedRows = valuesMock.mock.calls[0][0];
      expect(insertedRows).toHaveLength(2);
      expect(insertedRows).toContainEqual(
        expect.objectContaining({
          externalId: "external-1",
          discrepancyType: "missing_in_stored",
        }),
      );
      expect(insertedRows).toContainEqual(
        expect.objectContaining({
          externalId: "stored-1",
          discrepancyType: "missing_in_external",
        }),
      );
    });

    it("returns failed with error code when provider throws", async () => {
      mocks.execute.mockResolvedValueOnce({ rows: [{ id: "run-1" }] });

      const updateChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      mocks.update.mockReturnValue(updateChain);

      const provider = makeProvider("google_ads", new Error("provider_not_configured"));
      const result = await service.runReconciliation(mockDb, provider, now);

      expect(result).toEqual({
        status: "failed",
        runKey: "reconciliation:google_ads:2026-08-04:am",
        errorCode: "provider_not_configured",
      });
    });

    it("does not include patient fields in the outcome", async () => {
      mocks.execute.mockResolvedValueOnce({ rows: [{ id: "run-1" }] });

      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ id: "lead-1" }]),
      };
      mocks.select.mockReturnValue(selectChain);

      const updateChain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      mocks.update.mockReturnValue(updateChain);

      const insertChain = {
        values: vi.fn().mockResolvedValue([]),
      };
      mocks.insert.mockReturnValue(insertChain);

      const provider = makeProvider("google_ads", ["lead-1"]);
      const result = await service.runReconciliation(mockDb, provider, now);

      const serialized = JSON.stringify(result);
      expect(serialized).not.toContain("firstName");
      expect(serialized).not.toContain("lastName");
      expect(serialized).not.toContain("email");
      expect(serialized).not.toContain("phone");
    });
  });

  describe("getStoredLeadIds", () => {
    it("queries googleAdsLeadId for google_ads provider", async () => {
      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ id: "ga-1" }, { id: null }]),
      };
      mocks.select.mockReturnValue(selectChain);

      const result = await service.getStoredLeadIds(mockDb, "google_ads");

      expect(result).toEqual(["ga-1"]);
    });

    it("queries submissionId for formspree provider", async () => {
      const selectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ id: "fs-1" }]),
      };
      mocks.select.mockReturnValue(selectChain);

      const result = await service.getStoredLeadIds(mockDb, "formspree");

      expect(result).toEqual(["fs-1"]);
    });
  });
});
