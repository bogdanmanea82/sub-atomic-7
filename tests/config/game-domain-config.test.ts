// tests/config/game-domain-config.test.ts
// Verifies GAME_DOMAIN_CONFIG is assembled correctly from Layer 0 building blocks
import { describe, it, expect } from "bun:test";
import { GAME_DOMAIN_CONFIG } from "@config/entities/game-domain";

describe("GAME_DOMAIN_CONFIG", () => {
  // ── Entity metadata ────────────────────────────────────────────────────

  it("has correct entity name", () => {
    expect(GAME_DOMAIN_CONFIG.name).toBe("GameDomain");
  });

  it("has correct table name (snake_case)", () => {
    expect(GAME_DOMAIN_CONFIG.tableName).toBe("game_domain");
  });

  it("has correct display names", () => {
    expect(GAME_DOMAIN_CONFIG.displayName).toBe("Game Domain");
    expect(GAME_DOMAIN_CONFIG.pluralDisplayName).toBe("Game Domains");
  });

  // ── Field count ────────────────────────────────────────────────────────

  it("has exactly 6 fields (standard + audit)", () => {
    expect(GAME_DOMAIN_CONFIG.fields).toHaveLength(6);
  });

  // ── Field order and names ──────────────────────────────────────────────

  it("has fields in correct order: id, name, description, isActive, createdAt, updatedAt", () => {
    const names = GAME_DOMAIN_CONFIG.fields.map((f) => f.name);
    expect(names).toEqual(["id", "name", "description", "isActive", "createdAt", "updatedAt"]);
  });

  // ── ID field ───────────────────────────────────────────────────────────

  it("id is a UUID with autoGenerate", () => {
    const id = GAME_DOMAIN_CONFIG.fields.find((f) => f.name === "id");
    expect(id).toBeDefined();
    expect(id!.type).toBe("uuid");
    if (id!.type === "uuid") {
      expect(id!.autoGenerate).toBe(true);
    }
  });

  // ── Name field ─────────────────────────────────────────────────────────

  it("name is a required string with 3-255 length", () => {
    const name = GAME_DOMAIN_CONFIG.fields.find((f) => f.name === "name");
    expect(name).toBeDefined();
    expect(name!.type).toBe("string");
    expect(name!.required).toBe(true);
    if (name!.type === "string") {
      expect(name!.minLength).toBe(3);
      expect(name!.maxLength).toBe(255);
    }
  });

  // ── Description field ──────────────────────────────────────────────────

  it("description is an optional string with 3-5000 length", () => {
    const desc = GAME_DOMAIN_CONFIG.fields.find((f) => f.name === "description");
    expect(desc).toBeDefined();
    expect(desc!.type).toBe("string");
    expect(desc!.required).toBe(false);
    if (desc!.type === "string") {
      expect(desc!.minLength).toBe(3);
      expect(desc!.maxLength).toBe(5000);
    }
  });

  // ── isActive field ─────────────────────────────────────────────────────

  it("isActive is a required boolean with default true", () => {
    const isActive = GAME_DOMAIN_CONFIG.fields.find((f) => f.name === "isActive");
    expect(isActive).toBeDefined();
    expect(isActive!.type).toBe("boolean");
    expect(isActive!.required).toBe(true);
    if (isActive!.type === "boolean") {
      expect(isActive!.defaultValue).toBe(true);
    }
  });

  // ── Timestamp fields ──────────────────────────────────────────────────

  it("createdAt is auto-set on create", () => {
    const createdAt = GAME_DOMAIN_CONFIG.fields.find((f) => f.name === "createdAt");
    expect(createdAt).toBeDefined();
    expect(createdAt!.type).toBe("timestamp");
    if (createdAt!.type === "timestamp") {
      expect(createdAt!.autoSet).toBe("create");
    }
  });

  it("updatedAt is auto-set on update", () => {
    const updatedAt = GAME_DOMAIN_CONFIG.fields.find((f) => f.name === "updatedAt");
    expect(updatedAt).toBeDefined();
    expect(updatedAt!.type).toBe("timestamp");
    if (updatedAt!.type === "timestamp") {
      expect(updatedAt!.autoSet).toBe("update");
    }
  });

  // ── Permissions ────────────────────────────────────────────────────────

  it("read is public, write operations require admin", () => {
    expect(GAME_DOMAIN_CONFIG.permissions.read).toBe("public");
    expect(GAME_DOMAIN_CONFIG.permissions.create).toBe("admin");
    expect(GAME_DOMAIN_CONFIG.permissions.update).toBe("admin");
    expect(GAME_DOMAIN_CONFIG.permissions.delete).toBe("admin");
  });
});
