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
      isActive: true,
      createdAt: new Date("2025-06-15T10:30:00.000Z"),
      updatedAt: new Date("2025-06-15T10:30:00.000Z"),
    };
    const result = deserializeEntity(GAME_DOMAIN_CONFIG, row) as Record<string, unknown>;

    expect(result["id"]).toBe("abc-123");
    expect(result["name"]).toBe("Fantasy World");
    expect(result["description"]).toBe("A fantasy setting");
    expect(result["isActive"]).toBe(true);
    expect(result["createdAt"]).toBeInstanceOf(Date);
    expect(result["updatedAt"]).toBeInstanceOf(Date);
  });

  // ── Null handling ──────────────────────────────────────────────────────

  it("deserializes null description", () => {
    const row = {
      id: "abc-123",
      name: "Minimal",
      description: null,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
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
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = deserializeEntity(GAME_DOMAIN_CONFIG, row) as Record<string, unknown>;
    expect(result["isActive"]).toBe(true);
  });

  it("handles PostgreSQL native false", () => {
    const row = {
      id: "abc",
      name: "Test",
      description: null,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = deserializeEntity(GAME_DOMAIN_CONFIG, row) as Record<string, unknown>;
    expect(result["isActive"]).toBe(false);
  });

  // ── Boolean from SQLite fallback (integer) ─────────────────────────────

  it("handles SQLite integer 1 as true", () => {
    const row = {
      id: "abc",
      name: "Test",
      description: null,
      isActive: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = deserializeEntity(GAME_DOMAIN_CONFIG, row) as Record<string, unknown>;
    expect(result["isActive"]).toBe(true);
  });

  it("handles SQLite integer 0 as false", () => {
    const row = {
      id: "abc",
      name: "Test",
      description: null,
      isActive: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = deserializeEntity(GAME_DOMAIN_CONFIG, row) as Record<string, unknown>;
    expect(result["isActive"]).toBe(false);
  });

  // ── Timestamp deserialization ──────────────────────────────────────────

  it("converts database Date objects to TypeScript Date instances", () => {
    const dbDate = new Date("2025-01-15T08:00:00.000Z");
    const row = {
      id: "abc",
      name: "Test",
      description: null,
      isActive: true,
      createdAt: dbDate,
      updatedAt: dbDate,
    };
    const result = deserializeEntity(GAME_DOMAIN_CONFIG, row) as Record<string, unknown>;
    expect(result["createdAt"]).toBeInstanceOf(Date);
    expect((result["createdAt"] as Date).toISOString()).toBe("2025-01-15T08:00:00.000Z");
  });

  // ── UUID passthrough ───────────────────────────────────────────────────

  it("passes UUID strings through unchanged", () => {
    const row = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Test",
      description: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = deserializeEntity(GAME_DOMAIN_CONFIG, row) as Record<string, unknown>;
    expect(result["id"]).toBe("550e8400-e29b-41d4-a716-446655440000");
  });
});
