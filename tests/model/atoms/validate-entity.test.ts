// tests/model/atoms/validate-entity.test.ts
import { describe, it, expect } from "bun:test";
import { validateEntity } from "@model/universal/atoms/validate-entity";
import { GAME_DOMAIN_CONFIG } from "@config/entities/game-domain";

describe("validateEntity (GameDomain)", () => {
  // ── Valid input ─────────────────────────────────────────────────────────

  it("validates a complete valid input", () => {
    const input = { name: "Fantasy World", description: "A fantasy setting", isActive: true };
    const result = validateEntity(GAME_DOMAIN_CONFIG, input);
    expect(result["name"]).toBe("Fantasy World");
    expect(result["description"]).toBe("A fantasy setting");
    expect(result["isActive"]).toBe(true);
  });

  it("accepts input with optional description omitted (null)", () => {
    const input = { name: "Minimal Domain", description: null, isActive: false };
    const result = validateEntity(GAME_DOMAIN_CONFIG, input);
    expect(result["name"]).toBe("Minimal Domain");
    expect(result["description"]).toBeNull();
  });

  it("accepts input with description undefined", () => {
    const input = { name: "No Description", isActive: true };
    const result = validateEntity(GAME_DOMAIN_CONFIG, input);
    expect(result["name"]).toBe("No Description");
    expect(result["description"]).toBeUndefined();
  });

  it("normalizes boolean strings from form submissions", () => {
    const input = { name: "Form Submit", description: null, isActive: "true" };
    const result = validateEntity(GAME_DOMAIN_CONFIG, input);
    expect(result["isActive"]).toBe(true);
  });

  it("accepts name at minimum length (3 characters)", () => {
    const input = { name: "abc", isActive: true };
    expect(() => validateEntity(GAME_DOMAIN_CONFIG, input)).not.toThrow();
  });

  it("accepts name at maximum length (255 characters)", () => {
    const input = { name: "a".repeat(255), isActive: true };
    expect(() => validateEntity(GAME_DOMAIN_CONFIG, input)).not.toThrow();
  });

  // ── Skips auto-managed fields ──────────────────────────────────────────

  it("does not require id (auto-generated UUID)", () => {
    const input = { name: "No ID Needed", isActive: true };
    expect(() => validateEntity(GAME_DOMAIN_CONFIG, input)).not.toThrow();
  });

  it("does not require createdAt or updatedAt (auto-set timestamps)", () => {
    const input = { name: "No Timestamps", isActive: true };
    expect(() => validateEntity(GAME_DOMAIN_CONFIG, input)).not.toThrow();
  });

  // ── Missing required fields ─────────────────────────────────────────────

  it("throws when name is missing (null)", () => {
    const input = { name: null, isActive: true };
    try {
      validateEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false); // should not reach here
    } catch (error) {
      const err = error as Error & { errors: Record<string, string> };
      expect(err.errors["name"]).toBe("name is required");
    }
  });

  it("throws when name is undefined", () => {
    const input = { isActive: true };
    try {
      validateEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors: Record<string, string> };
      expect(err.errors["name"]).toBe("name is required");
    }
  });

  it("throws when isActive is missing", () => {
    const input = { name: "Valid Name" };
    try {
      validateEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors: Record<string, string> };
      expect(err.errors["isActive"]).toBe("isActive is required");
    }
  });

  // ── Aggregates multiple errors ─────────────────────────────────────────

  it("collects all validation errors before throwing", () => {
    const input = {}; // missing both name and isActive
    try {
      validateEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors: Record<string, string> };
      expect(Object.keys(err.errors).length).toBeGreaterThanOrEqual(2);
      expect(err.errors["name"]).toBeDefined();
      expect(err.errors["isActive"]).toBeDefined();
    }
  });

  it("reports errors for both missing and invalid fields", () => {
    const input = { name: "ab", isActive: null }; // name too short, isActive missing
    try {
      validateEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors: Record<string, string> };
      expect(err.errors["name"]).toContain("at least 3");
      expect(err.errors["isActive"]).toBe("isActive is required");
    }
  });

  // ── String length violations ───────────────────────────────────────────

  it("throws when name is too short", () => {
    const input = { name: "ab", isActive: true };
    try {
      validateEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors: Record<string, string> };
      expect(err.errors["name"]).toContain("at least 3");
    }
  });

  it("throws when name is too long", () => {
    const input = { name: "a".repeat(256), isActive: true };
    try {
      validateEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors: Record<string, string> };
      expect(err.errors["name"]).toContain("no more than 255");
    }
  });

  it("throws when description is too short (under 3)", () => {
    const input = { name: "Valid", description: "ab", isActive: true };
    try {
      validateEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors: Record<string, string> };
      expect(err.errors["description"]).toContain("at least 3");
    }
  });

  it("throws when description is too long (over 5000)", () => {
    const input = { name: "Valid", description: "a".repeat(5001), isActive: true };
    try {
      validateEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors: Record<string, string> };
      expect(err.errors["description"]).toContain("no more than 5000");
    }
  });

  // ── Boolean validation edge cases ──────────────────────────────────────

  it("throws when isActive is an invalid boolean string", () => {
    const input = { name: "Valid Name", isActive: "yes" };
    try {
      validateEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors: Record<string, string> };
      expect(err.errors["isActive"]).toContain("valid boolean");
    }
  });

  // ── Browser bypass simulation ──────────────────────────────────────────
  // These simulate what happens when browser validation is skipped entirely

  it("catches empty string name (browser bypass)", () => {
    // Browser validates minLength=3, but attacker could send empty string
    const input = { name: "", isActive: true };
    try {
      validateEntity(GAME_DOMAIN_CONFIG, input);
      expect(true).toBe(false);
    } catch (error) {
      const err = error as Error & { errors: Record<string, string> };
      expect(err.errors["name"]).toBeDefined();
    }
  });

  it("catches single character name (browser bypass)", () => {
    const input = { name: "x", isActive: true };
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
      expect(err.errors["isActive"]).toBeDefined();
    }
  });
});
