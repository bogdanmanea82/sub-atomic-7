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

  it("has exactly 9 fields (id + machine_name + standard entity fields + archive fields + audit)", () => {
    expect(GAME_DOMAIN_CONFIG.fields).toHaveLength(9);
  });

  // ── Field order and names ──────────────────────────────────────────────

  it("has fields in correct order: id, machine_name, name, description, is_active, archived_at, archived_reason, created_at, updated_at", () => {
    const names = GAME_DOMAIN_CONFIG.fields.map((f) => f.name);
    expect(names).toEqual(["id", "machine_name", "name", "description", "is_active", "archived_at", "archived_reason", "created_at", "updated_at"]);
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

  // ── is_active field ─────────────────────────────────────────────────────

  it("is_active is a required boolean with default true", () => {
    const is_active = GAME_DOMAIN_CONFIG.fields.find((f) => f.name === "is_active");
    expect(is_active).toBeDefined();
    expect(is_active!.type).toBe("boolean");
    expect(is_active!.required).toBe(true);
    if (is_active!.type === "boolean") {
      expect(is_active!.defaultValue).toBe(true);
    }
  });

  // ── Timestamp fields ──────────────────────────────────────────────────

  it("created_at is auto-set on create", () => {
    const created_at = GAME_DOMAIN_CONFIG.fields.find((f) => f.name === "created_at");
    expect(created_at).toBeDefined();
    expect(created_at!.type).toBe("timestamp");
    if (created_at!.type === "timestamp") {
      expect(created_at!.autoSet).toBe("create");
    }
  });

  it("updated_at is auto-set on update", () => {
    const updated_at = GAME_DOMAIN_CONFIG.fields.find((f) => f.name === "updated_at");
    expect(updated_at).toBeDefined();
    expect(updated_at!.type).toBe("timestamp");
    if (updated_at!.type === "timestamp") {
      expect(updated_at!.autoSet).toBe("update");
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
