// tests/config/factories/base-entity-config-factory.test.ts
// Verifies the getNonColumnKeys() hook and its conditional inclusion in create() output.
// Pure unit tests — no database, no imports from other layers.

import { describe, it, expect } from "bun:test";
import { BaseEntityConfigFactory } from "../../../src/config/factories/base-entity-config-factory";
import type { FieldConfig, PermissionConfig } from "../../../src/config/types";

// ── Minimal concrete subclass with default getNonColumnKeys() ──────────────────
class MinimalFactory extends BaseEntityConfigFactory {
  protected getEntityName(): string { return "TestEntity"; }
  protected getDisplayName(): string { return "Test Entity"; }
  protected getPluralDisplayName(): string { return "Test Entities"; }
  protected getPermissions(): PermissionConfig {
    return { create: "admin", read: "public", update: "admin", delete: "admin" };
  }
  protected buildFields(): readonly FieldConfig[] { return []; }
  // getNonColumnKeys() NOT overridden — uses the base default
}

// ── Subclass that does override getNonColumnKeys() ─────────────────────────────
class FactoryWithKeys extends BaseEntityConfigFactory {
  protected getEntityName(): string { return "RichEntity"; }
  protected getDisplayName(): string { return "Rich Entity"; }
  protected getPluralDisplayName(): string { return "Rich Entities"; }
  protected getPermissions(): PermissionConfig {
    return { create: "admin", read: "public", update: "admin", delete: "admin" };
  }
  protected buildFields(): readonly FieldConfig[] { return []; }
  protected override getNonColumnKeys(): readonly string[] {
    return ["virtual_field", "form_only_flag"];
  }
}

describe("BaseEntityConfigFactory", () => {
  // ── getNonColumnKeys() default ─────────────────────────────────────────────

  describe("getNonColumnKeys()", () => {
    it("returns empty array by default", () => {
      const factory = new MinimalFactory();
      // Access via create() — the method itself is protected, but the result flows into the config
      const config = factory.create();
      // When empty, the key is omitted entirely — so undefined means the default is []
      expect(config.nonColumnKeys).toBeUndefined();
    });
  });

  // ── create() — conditional inclusion ──────────────────────────────────────

  describe("create()", () => {
    it("omits the nonColumnKeys key entirely when getNonColumnKeys() returns []", () => {
      const config = new MinimalFactory().create();
      // The key must not appear at all — "in" operator checks own + prototype
      expect("nonColumnKeys" in config).toBe(false);
    });

    it("includes the nonColumnKeys key when the subclass overrides getNonColumnKeys()", () => {
      const config = new FactoryWithKeys().create();
      expect("nonColumnKeys" in config).toBe(true);
      expect(config.nonColumnKeys).toBeDefined();
    });

    it("nonColumnKeys value matches the overridden return value exactly", () => {
      const config = new FactoryWithKeys().create();
      expect(config.nonColumnKeys).toEqual(["virtual_field", "form_only_flag"]);
    });

    it("derives tableName correctly from getEntityName() via snake_case", () => {
      expect(new MinimalFactory().create().tableName).toBe("test_entity");
      expect(new FactoryWithKeys().create().tableName).toBe("rich_entity");
    });
  });
});
