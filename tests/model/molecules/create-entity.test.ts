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
      isActive: true,
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
      isActive: true,
    };
    const query = createEntity(GAME_DOMAIN_CONFIG, input);
    expect(query.params).toContain("my-custom-uuid");
  });

  it("trims name whitespace before inserting", () => {
    const input = {
      id: "uuid",
      name: "  Trimmed Name  ",
      isActive: true,
    };
    const query = createEntity(GAME_DOMAIN_CONFIG, input);
    expect(query.params).toContain("Trimmed Name");
    expect(query.params).not.toContain("  Trimmed Name  ");
  });

  it("auto-generates timestamp strings for createdAt and updatedAt", () => {
    const input = {
      id: "uuid",
      name: "Test",
      isActive: true,
    };
    const query = createEntity(GAME_DOMAIN_CONFIG, input);

    // Timestamps should be ISO strings in the params
    const isoStrings = query.params.filter(
      (p) => typeof p === "string" && /^\d{4}-\d{2}-\d{2}T/.test(p)
    );
    expect(isoStrings.length).toBe(2); // createdAt + updatedAt
  });

  it("includes null for optional description when omitted", () => {
    const input = {
      id: "uuid",
      name: "No Description",
      isActive: false,
    };
    const query = createEntity(GAME_DOMAIN_CONFIG, input);
    expect(query.params).toContain(null); // null description
  });

  // ── Validation failures (pipeline short-circuits) ──────────────────────

  it("throws validation error for missing required name", () => {
    const input = { id: "uuid", isActive: true };
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
    const input = { id: "uuid", name: "ab", isActive: true };
    try {
      createEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors?: Record<string, string> };
      expect(err.errors!["name"]).toContain("at least 3");
    }
  });

  it("throws validation error for name too long", () => {
    const input = { id: "uuid", name: "a".repeat(256), isActive: true };
    try {
      createEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors?: Record<string, string> };
      expect(err.errors!["name"]).toContain("no more than 255");
    }
  });

  it("throws validation error for missing required isActive", () => {
    const input = { id: "uuid", name: "Valid Name" };
    try {
      createEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors?: Record<string, string> };
      expect(err.errors!["isActive"]).toBe("isActive is required");
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
    const input = { id: "uuid", name: "Valid", isActive: true };
    expect(() => createEntity(GAME_DOMAIN_CONFIG, input)).not.toThrow();
  });

  it("throws for description too short (1-2 chars)", () => {
    const input = { id: "uuid", name: "Valid", description: "ab", isActive: true };
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
    const input = { id: "uuid", name: "Test", isActive: true };
    const query = createEntity(GAME_DOMAIN_CONFIG, input);
    expect(query.sql).toContain('"name"');
    expect(query.sql).toContain('"isActive"');
    expect(query.sql).toContain('"createdAt"');
    expect(query.sql).toContain('"updatedAt"');
  });

  it("uses ? placeholders (not $n — Layer 2 converts later)", () => {
    const input = { id: "uuid", name: "Test", isActive: true };
    const query = createEntity(GAME_DOMAIN_CONFIG, input);
    expect(query.sql).toContain("?");
    expect(query.sql).not.toContain("$1");
  });

  it("has matching placeholder count and params count", () => {
    const input = { id: "uuid", name: "Test", description: "Desc", isActive: true };
    const query = createEntity(GAME_DOMAIN_CONFIG, input);
    const placeholderCount = (query.sql.match(/\?/g) ?? []).length;
    expect(placeholderCount).toBe(query.params.length);
  });
});
