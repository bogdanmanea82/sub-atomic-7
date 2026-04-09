// tests/model/molecules/create-entity.test.ts
// Tests the full create pipeline: validate -> serialize -> build query
import { describe, it, expect } from "bun:test";
import { createEntity } from "@model/universal/molecules/create-entity";
import { GAME_DOMAIN_CONFIG } from "@config/entities/game-domain";

describe("createEntity (full pipeline)", () => {
  // ── Happy path: complete valid input ───────────────────────────────────

  it("produces a PreparedQuery for valid input", () => {
    const input = {
      id: "test-uuid",
      name: "Fantasy World",
      description: "A rich fantasy setting",
      sort_order: 1000,
      is_active: true,
    };
    const query = createEntity(GAME_DOMAIN_CONFIG, input);

    expect(query.sql).toContain("INSERT INTO game_domain");
    expect(query.sql).toContain("VALUES");
    expect(query.params.length).toBeGreaterThan(0);
  });

  it("includes the provided UUID in params", () => {
    const input = {
      id: "my-custom-uuid",
      name: "Test Domain",
      sort_order: 1000,
      is_active: true,
    };
    const query = createEntity(GAME_DOMAIN_CONFIG, input);
    expect(query.params).toContain("my-custom-uuid");
  });

  it("trims name whitespace before inserting", () => {
    const input = {
      id: "uuid",
      name: "  Trimmed Name  ",
      sort_order: 1000,
      is_active: true,
    };
    const query = createEntity(GAME_DOMAIN_CONFIG, input);
    expect(query.params).toContain("Trimmed Name");
    expect(query.params).not.toContain("  Trimmed Name  ");
  });

  it("auto-generates timestamp strings for created_at and updated_at", () => {
    const input = {
      id: "uuid",
      name: "Test",
      sort_order: 1000,
      is_active: true,
    };
    const query = createEntity(GAME_DOMAIN_CONFIG, input);

    // Timestamps should be ISO strings in the params
    const isoStrings = query.params.filter(
      (p) => typeof p === "string" && /^\d{4}-\d{2}-\d{2}T/.test(p)
    );
    expect(isoStrings.length).toBe(2); // created_at + updated_at
  });

  it("includes null for optional description when omitted", () => {
    const input = {
      id: "uuid",
      name: "No Description",
      sort_order: 1000,
      is_active: false,
    };
    const query = createEntity(GAME_DOMAIN_CONFIG, input);
    expect(query.params).toContain(null); // null description
  });

  // ── Validation failures (pipeline short-circuits) ──────────────────────

  it("throws validation error for missing required name", () => {
    const input = { id: "uuid", sort_order: 1000, is_active: true };
    try {
      createEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors?: Record<string, string> };
      expect(err.errors).toBeDefined();
      expect(err.errors!["name"]).toBe("name is required");
    }
  });

  it("throws validation error for name too short", () => {
    const input = { id: "uuid", name: "ab", sort_order: 1000, is_active: true };
    try {
      createEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors?: Record<string, string> };
      expect(err.errors!["name"]).toContain("at least 3");
    }
  });

  it("throws validation error for name too long", () => {
    const input = { id: "uuid", name: "a".repeat(256), sort_order: 1000, is_active: true };
    try {
      createEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors?: Record<string, string> };
      expect(err.errors!["name"]).toContain("no more than 255");
    }
  });

  it("throws validation error for missing required is_active", () => {
    const input = { id: "uuid", name: "Valid Name", sort_order: 1000 };
    try {
      createEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors?: Record<string, string> };
      expect(err.errors!["is_active"]).toBe("is_active is required");
    }
  });

  it("throws aggregated errors for completely empty input", () => {
    try {
      createEntity(GAME_DOMAIN_CONFIG, {});
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors?: Record<string, string> };
      expect(Object.keys(err.errors!).length).toBeGreaterThanOrEqual(2);
    }
  });

  // ── Description edge cases ─────────────────────────────────────────────

  it("accepts valid input without description", () => {
    const input = { id: "uuid", name: "Valid", sort_order: 1000, is_active: true };
    expect(() => createEntity(GAME_DOMAIN_CONFIG, input)).not.toThrow();
  });

  it("throws for description too short (1-2 chars)", () => {
    const input = { id: "uuid", name: "Valid", description: "ab", sort_order: 1000, is_active: true };
    try {
      createEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors?: Record<string, string> };
      expect(err.errors!["description"]).toContain("at least 3");
    }
  });

  // ── SQL structure verification ─────────────────────────────────────────

  it("generates quoted column names in SQL", () => {
    const input = { id: "uuid", name: "Test", sort_order: 1000, is_active: true };
    const query = createEntity(GAME_DOMAIN_CONFIG, input);
    expect(query.sql).toContain('"name"');
    expect(query.sql).toContain('"is_active"');
    expect(query.sql).toContain('"created_at"');
    expect(query.sql).toContain('"updated_at"');
  });

  it("uses ? placeholders (not $n — Layer 2 converts later)", () => {
    const input = { id: "uuid", name: "Test", sort_order: 1000, is_active: true };
    const query = createEntity(GAME_DOMAIN_CONFIG, input);
    expect(query.sql).toContain("?");
    expect(query.sql).not.toContain("$1");
  });

  it("has matching placeholder count and params count", () => {
    const input = { id: "uuid", name: "Test", description: "Desc", sort_order: 1000, is_active: true };
    const query = createEntity(GAME_DOMAIN_CONFIG, input);
    const placeholderCount = (query.sql.match(/\?/g) ?? []).length;
    expect(placeholderCount).toBe(query.params.length);
  });
});
