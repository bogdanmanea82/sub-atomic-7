// tests/model/atoms/deserialize-entity.test.ts
import { describe, it, expect } from "bun:test";
import { deserializeEntity } from "@model/universal/atoms/deserialize-entity";
import { GAME_DOMAIN_CONFIG } from "@config/entities/game-domain";

describe("deserializeEntity (GameDomain)", () => {
  // ── Full record from PostgreSQL ────────────────────────────────────────

  it("deserializes a complete database row", () => {
    const row = {
      id: "abc-123",
      name: "Fantasy World",
      description: "A fantasy setting",
      is_active: true,
      created_at: new Date("2025-06-15T10:30:00.000Z"),
      updated_at: new Date("2025-06-15T10:30:00.000Z"),
    };
    const result = deserializeEntity(GAME_DOMAIN_CONFIG, row) as Record<string, unknown>;

    expect(result["id"]).toBe("abc-123");
    expect(result["name"]).toBe("Fantasy World");
    expect(result["description"]).toBe("A fantasy setting");
    expect(result["is_active"]).toBe(true);
    expect(result["created_at"]).toBeInstanceOf(Date);
    expect(result["updated_at"]).toBeInstanceOf(Date);
  });

  // ── Null handling ──────────────────────────────────────────────────────

  it("deserializes null description", () => {
    const row = {
      id: "abc-123",
      name: "Minimal",
      description: null,
      is_active: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const result = deserializeEntity(GAME_DOMAIN_CONFIG, row) as Record<string, unknown>;
    expect(result["description"]).toBeNull();
  });

  // ── Boolean from PostgreSQL (native boolean) ──────────────────────────

  it("handles PostgreSQL native true", () => {
    const row = {
      id: "abc",
      name: "Test",
      description: null,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const result = deserializeEntity(GAME_DOMAIN_CONFIG, row) as Record<string, unknown>;
    expect(result["is_active"]).toBe(true);
  });

  it("handles PostgreSQL native false", () => {
    const row = {
      id: "abc",
      name: "Test",
      description: null,
      is_active: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const result = deserializeEntity(GAME_DOMAIN_CONFIG, row) as Record<string, unknown>;
    expect(result["is_active"]).toBe(false);
  });

  // ── Boolean from SQLite fallback (integer) ─────────────────────────────

  it("handles SQLite integer 1 as true", () => {
    const row = {
      id: "abc",
      name: "Test",
      description: null,
      is_active: 1,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const result = deserializeEntity(GAME_DOMAIN_CONFIG, row) as Record<string, unknown>;
    expect(result["is_active"]).toBe(true);
  });

  it("handles SQLite integer 0 as false", () => {
    const row = {
      id: "abc",
      name: "Test",
      description: null,
      is_active: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const result = deserializeEntity(GAME_DOMAIN_CONFIG, row) as Record<string, unknown>;
    expect(result["is_active"]).toBe(false);
  });

  // ── Timestamp deserialization ──────────────────────────────────────────

  it("converts database Date objects to TypeScript Date instances", () => {
    const dbDate = new Date("2025-01-15T08:00:00.000Z");
    const row = {
      id: "abc",
      name: "Test",
      description: null,
      is_active: true,
      created_at: dbDate,
      updated_at: dbDate,
    };
    const result = deserializeEntity(GAME_DOMAIN_CONFIG, row) as Record<string, unknown>;
    expect(result["created_at"]).toBeInstanceOf(Date);
    expect((result["created_at"] as Date).toISOString()).toBe("2025-01-15T08:00:00.000Z");
  });

  // ── UUID passthrough ───────────────────────────────────────────────────

  it("passes UUID strings through unchanged", () => {
    const row = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Test",
      description: null,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const result = deserializeEntity(GAME_DOMAIN_CONFIG, row) as Record<string, unknown>;
    expect(result["id"]).toBe("550e8400-e29b-41d4-a716-446655440000");
  });
});
