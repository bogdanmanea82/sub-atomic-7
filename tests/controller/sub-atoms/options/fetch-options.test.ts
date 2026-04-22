// tests/controller/sub-atoms/options/fetch-options.test.ts
// Verifies the service → SelectOption[] conversion and the failure fallback.
// Uses inline mock service objects — no real database connection.

import { describe, it, expect } from "bun:test";
import { fetchOptions } from "../../../../src/controller/sub-atoms/options/fetch-options";

// ── Mock service factory ───────────────────────────────────────────────────────

type MockRow = { id: string; name: string; [k: string]: unknown };

function mockSuccess(rows: MockRow[]) {
  return {
    findMany: async (_conditions?: Record<string, unknown>) =>
      ({ success: true as const, data: rows }),
  };
}

const mockFailure = {
  findMany: async (_conditions?: Record<string, unknown>) =>
    ({ success: false as const, stage: "database", error: "DB offline" }),
};

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("fetchOptions", () => {
  // ── Successful result ─────────────────────────────────────────────────────

  it("maps id → value and name → label for each row", async () => {
    const rows: MockRow[] = [
      { id: "d-111", name: "Items" },
      { id: "d-222", name: "Enemies" },
    ];
    const result = await fetchOptions(mockSuccess(rows));
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ value: "d-111", label: "Items" });
    expect(result[1]).toEqual({ value: "d-222", label: "Enemies" });
  });

  it("returns an empty array when the service returns no rows", async () => {
    const result = await fetchOptions(mockSuccess([]));
    expect(result).toHaveLength(0);
  });

  // ── Failure result ─────────────────────────────────────────────────────────

  it("returns an empty array when the service returns success=false", async () => {
    const result = await fetchOptions(mockFailure);
    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  // ── Conditions forwarding ──────────────────────────────────────────────────
  // Verifies that conditions are passed through to findMany, not dropped.

  it("passes conditions to the service's findMany call", async () => {
    let capturedConditions: Record<string, unknown> | undefined;
    const capturingService = {
      findMany: async (conditions?: Record<string, unknown>) => {
        capturedConditions = conditions;
        return { success: true as const, data: [] };
      },
    };
    await fetchOptions(capturingService, { game_domain_id: "d-123" });
    expect(capturedConditions).toEqual({ game_domain_id: "d-123" });
  });

  it("passes undefined to findMany when no conditions are given", async () => {
    let capturedConditions: Record<string, unknown> | undefined = { sentinel: true };
    const capturingService = {
      findMany: async (conditions?: Record<string, unknown>) => {
        capturedConditions = conditions;
        return { success: true as const, data: [] };
      },
    };
    await fetchOptions(capturingService);
    expect(capturedConditions).toBeUndefined();
  });
});
