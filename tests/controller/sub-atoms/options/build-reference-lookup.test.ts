// tests/controller/sub-atoms/options/build-reference-lookup.test.ts
// Verifies that UUID arrays are converted to { fieldName: { uuid → label } } maps
// used by detail and list pages to display human-readable FK names.

import { describe, it, expect } from "bun:test";
import { buildReferenceLookup } from "../../../../src/controller/sub-atoms/options/build-reference-lookup";
import type { SelectOption } from "../../../../src/view-service/types";

const domainOpts: SelectOption[] = [
  { value: "d-111", label: "Items" },
  { value: "d-222", label: "Enemies" },
];

const subdomainOpts: SelectOption[] = [
  { value: "s-111", label: "Weapons" },
  { value: "s-222", label: "Armour" },
];

describe("buildReferenceLookup", () => {
  // ── Structure ──────────────────────────────────────────────────────────────

  it("returns an empty object for an empty entries array", () => {
    const result = buildReferenceLookup([]);
    expect(result).toEqual({});
  });

  it("creates one nested map per entry", () => {
    const result = buildReferenceLookup([
      { fieldName: "game_domain_id", options: domainOpts },
    ]);
    expect("game_domain_id" in result).toBe(true);
  });

  it("creates a nested map for each field name when multiple entries are provided", () => {
    const result = buildReferenceLookup([
      { fieldName: "game_domain_id",    options: domainOpts },
      { fieldName: "game_subdomain_id", options: subdomainOpts },
    ]);
    expect("game_domain_id"    in result).toBe(true);
    expect("game_subdomain_id" in result).toBe(true);
  });

  // ── Value → label mapping ──────────────────────────────────────────────────

  it("maps each option's value to its label", () => {
    const result = buildReferenceLookup([
      { fieldName: "game_domain_id", options: domainOpts },
    ]);
    expect(result["game_domain_id"]!["d-111"]).toBe("Items");
    expect(result["game_domain_id"]!["d-222"]).toBe("Enemies");
  });

  it("handles multiple field maps independently", () => {
    const result = buildReferenceLookup([
      { fieldName: "game_domain_id",    options: domainOpts },
      { fieldName: "game_subdomain_id", options: subdomainOpts },
    ]);
    expect(result["game_domain_id"]!["d-111"]).toBe("Items");
    expect(result["game_subdomain_id"]!["s-222"]).toBe("Armour");
    // Cross-contamination check: domain map should not contain subdomain keys
    expect(result["game_domain_id"]!["s-111"]).toBeUndefined();
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────

  it("produces an empty nested map for an entry with no options", () => {
    const result = buildReferenceLookup([
      { fieldName: "game_domain_id", options: [] },
    ]);
    expect(result["game_domain_id"]).toEqual({});
  });

  it("last label wins if the same value appears twice in one field's options", () => {
    const dupes: SelectOption[] = [
      { value: "x", label: "First" },
      { value: "x", label: "Second" },
    ];
    const result = buildReferenceLookup([{ fieldName: "field", options: dupes }]);
    expect(result["field"]!["x"]).toBe("Second");
  });
});
