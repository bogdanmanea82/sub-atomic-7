// tests/model/atoms/validate-entity.test.ts
import { describe, it, expect } from "bun:test";
import { validateEntity } from "@model/universal/atoms/validate-entity";
import { GAME_DOMAIN_CONFIG } from "@config/entities/game-domain";

describe("validateEntity (GameDomain)", () => {
  // ── Valid input ─────────────────────────────────────────────────────────

  it("validates a complete valid input", () => {
    const input = { name: "Fantasy World", description: "A fantasy setting", sort_order: 1000, is_active: true };
    const result = validateEntity(GAME_DOMAIN_CONFIG, input);
    expect(result["name"]).toBe("Fantasy World");
    expect(result["description"]).toBe("A fantasy setting");
    expect(result["is_active"]).toBe(true);
  });

  it("accepts input with optional description omitted (null)", () => {
    const input = { name: "Minimal Domain", description: null, sort_order: 1000, is_active: false };
    const result = validateEntity(GAME_DOMAIN_CONFIG, input);
    expect(result["name"]).toBe("Minimal Domain");
    expect(result["description"]).toBeNull();
  });

  it("accepts input with description undefined", () => {
    const input = { name: "No Description", sort_order: 1000, is_active: true };
    const result = validateEntity(GAME_DOMAIN_CONFIG, input);
    expect(result["name"]).toBe("No Description");
    expect(result["description"]).toBeUndefined();
  });

  it("normalizes boolean strings from form submissions", () => {
    const input = { name: "Form Submit", description: null, sort_order: 1000, is_active: "true" };
    const result = validateEntity(GAME_DOMAIN_CONFIG, input);
    expect(result["is_active"]).toBe(true);
  });

  it("accepts name at minimum length (3 characters)", () => {
    const input = { name: "abc", sort_order: 1000, is_active: true };
    expect(() => validateEntity(GAME_DOMAIN_CONFIG, input)).not.toThrow();
  });

  it("accepts name at maximum length (255 characters)", () => {
    const input = { name: "a".repeat(255), sort_order: 1000, is_active: true };
    expect(() => validateEntity(GAME_DOMAIN_CONFIG, input)).not.toThrow();
  });

  // ── Skips auto-managed fields ──────────────────────────────────────────

  it("does not require id (auto-generated UUID)", () => {
    const input = { name: "No ID Needed", sort_order: 1000, is_active: true };
    expect(() => validateEntity(GAME_DOMAIN_CONFIG, input)).not.toThrow();
  });

  it("does not require created_at or updated_at (auto-set timestamps)", () => {
    const input = { name: "No Timestamps", sort_order: 1000, is_active: true };
    expect(() => validateEntity(GAME_DOMAIN_CONFIG, input)).not.toThrow();
  });

  // ── Missing required fields ─────────────────────────────────────────────

  it("throws when name is missing (null)", () => {
    const input = { name: null, sort_order: 1000, is_active: true };
    try {
      validateEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false); // should not reach here
    } catch (error) {
      const err = error as Error & { errors: Record<string, string> };
      expect(err.errors["name"]).toBe("name is required");
    }
  });

  it("throws when name is undefined", () => {
    const input = { sort_order: 1000, is_active: true };
    try {
      validateEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors: Record<string, string> };
      expect(err.errors["name"]).toBe("name is required");
    }
  });

  it("throws when is_active is missing", () => {
    const input = { name: "Valid Name", sort_order: 1000 };
    try {
      validateEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors: Record<string, string> };
      expect(err.errors["is_active"]).toBe("is_active is required");
    }
  });

  // ── Aggregates multiple errors ─────────────────────────────────────────

  it("collects all validation errors before throwing", () => {
    const input = {}; // missing both name and is_active
    try {
      validateEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors: Record<string, string> };
      expect(Object.keys(err.errors).length).toBeGreaterThanOrEqual(2);
      expect(err.errors["name"]).toBeDefined();
      expect(err.errors["is_active"]).toBeDefined();
    }
  });

  it("reports errors for both missing and invalid fields", () => {
    const input = { name: "ab", sort_order: 1000, is_active: null }; // name too short, is_active missing
    try {
      validateEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors: Record<string, string> };
      expect(err.errors["name"]).toContain("at least 3");
      expect(err.errors["is_active"]).toBe("is_active is required");
    }
  });

  // ── String length violations ───────────────────────────────────────────

  it("throws when name is too short", () => {
    const input = { name: "ab", sort_order: 1000, is_active: true };
    try {
      validateEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors: Record<string, string> };
      expect(err.errors["name"]).toContain("at least 3");
    }
  });

  it("throws when name is too long", () => {
    const input = { name: "a".repeat(256), sort_order: 1000, is_active: true };
    try {
      validateEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors: Record<string, string> };
      expect(err.errors["name"]).toContain("no more than 255");
    }
  });

  it("throws when description is too short (under 3)", () => {
    const input = { name: "Valid", description: "ab", sort_order: 1000, is_active: true };
    try {
      validateEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors: Record<string, string> };
      expect(err.errors["description"]).toContain("at least 3");
    }
  });

  it("throws when description is too long (over 5000)", () => {
    const input = { name: "Valid", description: "a".repeat(5001), sort_order: 1000, is_active: true };
    try {
      validateEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors: Record<string, string> };
      expect(err.errors["description"]).toContain("no more than 5000");
    }
  });

  // ── Boolean validation edge cases ──────────────────────────────────────

  it("throws when is_active is an invalid boolean string", () => {
    const input = { name: "Valid Name", sort_order: 1000, is_active: "yes" };
    try {
      validateEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors: Record<string, string> };
      expect(err.errors["is_active"]).toContain("valid boolean");
    }
  });

  // ── Browser bypass simulation ──────────────────────────────────────────
  // These simulate what happens when browser validation is skipped entirely

  it("catches empty string name (browser bypass)", () => {
    // Browser validates minLength=3, but attacker could send empty string
    const input = { name: "", sort_order: 1000, is_active: true };
    try {
      validateEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors: Record<string, string> };
      expect(err.errors["name"]).toBeDefined();
    }
  });

  it("catches single character name (browser bypass)", () => {
    const input = { name: "x", sort_order: 1000, is_active: true };
    try {
      validateEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors: Record<string, string> };
      expect(err.errors["name"]).toContain("at least 3");
    }
  });

  it("catches completely empty body (browser bypass)", () => {
    try {
      validateEntity(GAME_DOMAIN_CONFIG, {});
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors: Record<string, string> };
      expect(err.errors["name"]).toBeDefined();
      expect(err.errors["is_active"]).toBeDefined();
    }
  });
});
