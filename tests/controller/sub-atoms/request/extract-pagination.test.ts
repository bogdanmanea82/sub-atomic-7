// tests/controller/sub-atoms/request/extract-pagination.test.ts
// Verifies page/pageSize parsing, defaults, and the 1–100 clamp that prevents
// client-driven over-fetching.

import { describe, it, expect } from "bun:test";
import { extractPagination } from "../../../../src/controller/sub-atoms/request/extract-pagination";
import { DEFAULT_PAGE_SIZE } from "../../../../src/model/universal/sub-atoms/types/pagination-params";

describe("extractPagination", () => {
  // ── Defaults ──────────────────────────────────────────────────────────────

  it("returns page 1 and DEFAULT_PAGE_SIZE when query is empty", () => {
    const result = extractPagination({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(DEFAULT_PAGE_SIZE);
  });

  it("returns page 1 when page key is absent", () => {
    expect(extractPagination({ pageSize: "10" }).page).toBe(1);
  });

  it("returns DEFAULT_PAGE_SIZE when pageSize key is absent", () => {
    expect(extractPagination({ page: "2" }).pageSize).toBe(DEFAULT_PAGE_SIZE);
  });

  // ── Valid values ───────────────────────────────────────────────────────────

  it("parses a valid page number", () => {
    expect(extractPagination({ page: "3" }).page).toBe(3);
  });

  it("parses a valid pageSize", () => {
    expect(extractPagination({ pageSize: "25" }).pageSize).toBe(25);
  });

  it("accepts page=1 (minimum valid page)", () => {
    expect(extractPagination({ page: "1" }).page).toBe(1);
  });

  it("accepts pageSize=1 (minimum valid pageSize)", () => {
    expect(extractPagination({ pageSize: "1" }).pageSize).toBe(1);
  });

  // ── Upper clamp — pageSize cannot exceed 100 ──────────────────────────────

  it("clamps pageSize of exactly 100 to 100", () => {
    expect(extractPagination({ pageSize: "100" }).pageSize).toBe(100);
  });

  it("clamps pageSize of 101 down to 100", () => {
    expect(extractPagination({ pageSize: "101" }).pageSize).toBe(100);
  });

  it("clamps arbitrarily large pageSize down to 100", () => {
    expect(extractPagination({ pageSize: "99999" }).pageSize).toBe(100);
  });

  // ── Invalid inputs fall back to defaults ──────────────────────────────────

  it("falls back to page 1 for non-numeric page", () => {
    expect(extractPagination({ page: "abc" }).page).toBe(1);
  });

  it("falls back to DEFAULT_PAGE_SIZE for non-numeric pageSize", () => {
    expect(extractPagination({ pageSize: "abc" }).pageSize).toBe(DEFAULT_PAGE_SIZE);
  });

  it("falls back to page 1 for page=0 (below minimum)", () => {
    expect(extractPagination({ page: "0" }).page).toBe(1);
  });

  it("falls back to DEFAULT_PAGE_SIZE for pageSize=0 (below minimum)", () => {
    expect(extractPagination({ pageSize: "0" }).pageSize).toBe(DEFAULT_PAGE_SIZE);
  });

  it("falls back to page 1 for a negative page", () => {
    expect(extractPagination({ page: "-5" }).page).toBe(1);
  });

  it("falls back to DEFAULT_PAGE_SIZE for a negative pageSize", () => {
    expect(extractPagination({ pageSize: "-1" }).pageSize).toBe(DEFAULT_PAGE_SIZE);
  });

  it("falls back for a float page value (not an integer)", () => {
    expect(extractPagination({ page: "1.5" }).page).toBe(1);
  });
});
