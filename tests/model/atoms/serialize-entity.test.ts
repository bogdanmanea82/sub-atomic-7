// tests/model/atoms/serialize-entity.test.ts
import { describe, it, expect } from "bun:test";
import { serializeEntity } from "@model/universal/atoms/serialize-entity";
import { GAME_DOMAIN_CONFIG } from "@config/entities/game-domain";

describe("serializeEntity (GameDomain)", () => {
  // ── Create operation ───────────────────────────────────────────────────

  it("serializes a valid create input with all fields", () => {
    const input = {
      id: "abc-123",
      name: "  Fantasy World  ",
      description: "A rich fantasy world",
      is_active: true,
    };
    const result = serializeEntity(GAME_DOMAIN_CONFIG, input, "create") as Record<string, unknown>;
    expect(result["id"]).toBe("abc-123");
    expect(result["name"]).toBe("Fantasy World"); // trimmed
    expect(result["description"]).toBe("A rich fantasy world");
    expect(result["is_active"]).toBe(true);
  });

  it("auto-generates created_at and updated_at on create", () => {
    const before = new Date();
    const input = { id: "abc", name: "Test", is_active: true };
    const result = serializeEntity(GAME_DOMAIN_CONFIG, input, "create") as Record<string, unknown>;

    // Both timestamps should be ISO strings set to approximately now
    expect(typeof result["created_at"]).toBe("string");
    expect(typeof result["updated_at"]).toBe("string");

    const created_at = new Date(result["created_at"] as string);
    const updated_at = new Date(result["updated_at"] as string);
    expect(created_at.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(updated_at.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it("skips UUID when no value provided", () => {
    const input = { name: "No ID", is_active: true };
    const result = serializeEntity(GAME_DOMAIN_CONFIG, input, "create") as Record<string, unknown>;
    // UUID field should not appear in serialized output
    expect(result["id"]).toBeUndefined();
  });

  it("includes UUID when value is provided", () => {
    const input = { id: "my-uuid", name: "With ID", is_active: true };
    const result = serializeEntity(GAME_DOMAIN_CONFIG, input, "create") as Record<string, unknown>;
    expect(result["id"]).toBe("my-uuid");
  });

  it("serializes null description", () => {
    const input = { id: "abc", name: "Test", description: null, is_active: true };
    const result = serializeEntity(GAME_DOMAIN_CONFIG, input, "create") as Record<string, unknown>;
    expect(result["description"]).toBeNull();
  });

  it("serializes undefined description as null", () => {
    const input = { id: "abc", name: "Test", is_active: true };
    const result = serializeEntity(GAME_DOMAIN_CONFIG, input, "create") as Record<string, unknown>;
    expect(result["description"]).toBeNull();
  });

  // ── Update operation ───────────────────────────────────────────────────

  it("auto-generates updated_at on update", () => {
    const before = new Date();
    const input = { name: "Updated", is_active: false };
    const result = serializeEntity(GAME_DOMAIN_CONFIG, input, "update") as Record<string, unknown>;

    expect(typeof result["updated_at"]).toBe("string");
    const updated_at = new Date(result["updated_at"] as string);
    expect(updated_at.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it("does NOT include created_at on update (preserves original)", () => {
    const input = { name: "Updated", is_active: false };
    const result = serializeEntity(GAME_DOMAIN_CONFIG, input, "update") as Record<string, unknown>;
    expect(result["created_at"]).toBeUndefined();
  });

  // ── Trimming behavior ─────────────────────────────────────────────────

  it("trims whitespace from name", () => {
    const input = { id: "abc", name: "\t  spaced  \n", is_active: true };
    const result = serializeEntity(GAME_DOMAIN_CONFIG, input, "create") as Record<string, unknown>;
    expect(result["name"]).toBe("spaced");
  });

  it("trims whitespace from description", () => {
    const input = { id: "abc", name: "Test", description: "  padded  ", is_active: true };
    const result = serializeEntity(GAME_DOMAIN_CONFIG, input, "create") as Record<string, unknown>;
    expect(result["description"]).toBe("padded");
  });

  // ── Boolean passthrough ────────────────────────────────────────────────

  it("passes boolean true through for PostgreSQL", () => {
    const input = { id: "abc", name: "Test", is_active: true };
    const result = serializeEntity(GAME_DOMAIN_CONFIG, input, "create") as Record<string, unknown>;
    expect(result["is_active"]).toBe(true);
  });

  it("passes boolean false through for PostgreSQL", () => {
    const input = { id: "abc", name: "Test", is_active: false };
    const result = serializeEntity(GAME_DOMAIN_CONFIG, input, "create") as Record<string, unknown>;
    expect(result["is_active"]).toBe(false);
  });
});
