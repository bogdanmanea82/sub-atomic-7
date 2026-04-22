// tests/controller/sub-atoms/request/extract-request.test.ts
// Tests extractId, extractQueryConditions, and parseBody together — all three
// are small guards that translate raw Elysia input into the shapes Layer 2 expects.

import { describe, it, expect } from "bun:test";
import { extractId } from "../../../../src/controller/sub-atoms/request/extract-params";
import { extractQueryConditions } from "../../../../src/controller/sub-atoms/request/extract-query";
import { parseBody } from "../../../../src/controller/sub-atoms/request/parse-body";

// ── extractId ──────────────────────────────────────────────────────────────────

describe("extractId", () => {
  it("returns the id when present", () => {
    expect(extractId({ id: "abc-123" })).toBe("abc-123");
  });

  it("throws when id key is absent from params", () => {
    expect(() => extractId({})).toThrow("Missing required path parameter: id");
  });

  it("throws when id is an empty string (falsy)", () => {
    expect(() => extractId({ id: "" })).toThrow();
  });
});

// ── extractQueryConditions ─────────────────────────────────────────────────────

describe("extractQueryConditions", () => {
  it("returns undefined when the query object is empty", () => {
    expect(extractQueryConditions({})).toBeUndefined();
  });

  it("returns the query object as conditions when it has at least one key", () => {
    const query = { game_domain_id: "d-111" };
    const result = extractQueryConditions(query);
    expect(result).toEqual({ game_domain_id: "d-111" });
  });

  it("returns all keys when multiple filter params are present", () => {
    const query = { game_domain_id: "d-111", game_subdomain_id: "s-222" };
    const result = extractQueryConditions(query);
    expect(result).toEqual(query);
  });
});

// ── parseBody ──────────────────────────────────────────────────────────────────

describe("parseBody", () => {
  it("returns a plain object unchanged", () => {
    const body = { name: "Fire Sword", code: "fs_001" };
    expect(parseBody(body)).toBe(body); // same reference
  });

  it("throws when body is null", () => {
    expect(() => parseBody(null)).toThrow("Request body must be a JSON object");
  });

  it("throws when body is an array", () => {
    expect(() => parseBody([1, 2, 3])).toThrow("Request body must be a JSON object");
  });

  it("throws when body is a string primitive", () => {
    expect(() => parseBody("raw string")).toThrow("Request body must be a JSON object");
  });

  it("throws when body is a number primitive", () => {
    expect(() => parseBody(42)).toThrow("Request body must be a JSON object");
  });

  it("throws when body is undefined", () => {
    expect(() => parseBody(undefined)).toThrow("Request body must be a JSON object");
  });
});
