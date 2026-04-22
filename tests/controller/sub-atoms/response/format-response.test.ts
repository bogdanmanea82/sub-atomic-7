// tests/controller/sub-atoms/response/format-response.test.ts
// Verifies the three response envelope constructors: formatError, formatSuccess, formatPaginated.
// All are pure functions — no DB, no HTTP.

import { describe, it, expect } from "bun:test";
import { formatError } from "../../../../src/controller/sub-atoms/response/format-error";
import { formatSuccess } from "../../../../src/controller/sub-atoms/response/format-success";
import { formatPaginated } from "../../../../src/controller/sub-atoms/response/format-paginated";

// ── formatError ────────────────────────────────────────────────────────────────

describe("formatError", () => {
  it("returns success: false and the error message", () => {
    const result = formatError("Something went wrong");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Something went wrong");
  });

  it("omits the details key when no details are provided", () => {
    const result = formatError("oops");
    expect("details" in result).toBe(false);
  });

  it("includes details when provided", () => {
    const details = { name: "Name is required", code: "Code is too short" };
    const result = formatError("Validation failed", details);
    expect(result.details).toEqual(details);
  });

  it("details map is preserved exactly as passed", () => {
    const details = { field_one: "msg A", field_two: "msg B" };
    const result = formatError("err", details);
    expect(Object.keys(result.details!)).toHaveLength(2);
    expect(result.details!["field_one"]).toBe("msg A");
  });
});

// ── formatSuccess ──────────────────────────────────────────────────────────────

describe("formatSuccess", () => {
  it("returns success: true and the data", () => {
    const result = formatSuccess({ id: "abc", name: "Sword" });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: "abc", name: "Sword" });
  });

  it("works with primitive data", () => {
    expect(formatSuccess(42).data).toBe(42);
    expect(formatSuccess("ok").data).toBe("ok");
  });

  it("works with null data", () => {
    expect(formatSuccess(null).data).toBeNull();
  });

  it("preserves array data by reference", () => {
    const arr = [1, 2, 3];
    expect(formatSuccess(arr).data).toBe(arr);
  });
});

// ── formatPaginated ────────────────────────────────────────────────────────────

describe("formatPaginated", () => {
  const items = ["a", "b", "c"];

  it("returns success: true, data array, and count equal to data.length", () => {
    const result = formatPaginated(items);
    expect(result.success).toBe(true);
    expect(result.data).toBe(items);
    expect(result.count).toBe(3);
  });

  it("omits pagination keys when totalCount is not provided", () => {
    const result = formatPaginated(items);
    expect("totalCount" in result).toBe(false);
    expect("page" in result).toBe(false);
    expect("totalPages" in result).toBe(false);
  });

  it("includes full pagination metadata when totalCount is provided", () => {
    const result = formatPaginated(items, 45, 2, 15);
    expect(result.totalCount).toBe(45);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(15);
  });

  it("calculates totalPages correctly: Math.ceil(totalCount / pageSize)", () => {
    expect(formatPaginated(items, 45, 1, 15).totalPages).toBe(3);  // 45 / 15 = 3
    expect(formatPaginated(items, 46, 1, 15).totalPages).toBe(4);  // 46 / 15 = 3.06... → 4
    expect(formatPaginated(items, 1,  1, 15).totalPages).toBe(1);  // 1 item = 1 page
  });

  it("totalPages is undefined when pageSize is not provided (cannot compute pages)", () => {
    const result = formatPaginated(items, 45, 1, undefined);
    expect(result.totalPages).toBeUndefined();
  });

  it("count reflects the actual items returned, not totalCount", () => {
    // page 3 of 45 items with pageSize 15 returns the last 15, count = 3 (our stub slice)
    const result = formatPaginated(items, 45, 3, 15);
    expect(result.count).toBe(3);   // items.length
    expect(result.totalCount).toBe(45);
  });

  it("handles an empty data array", () => {
    const result = formatPaginated([], 0, 1, 15);
    expect(result.count).toBe(0);
    expect(result.totalCount).toBe(0);
    expect(result.totalPages).toBe(0);
  });
});
