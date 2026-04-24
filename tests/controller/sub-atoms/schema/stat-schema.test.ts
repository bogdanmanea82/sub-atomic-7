// tests/controller/sub-atoms/schema/stat-schema.test.ts
// Verifies that deriveBodySchema(STAT_CONFIG.fields) produces a schema
// that includes all Stat-specific fields. Inspects the TypeBox schema object
// directly — no server, no DB needed.

import { describe, it, expect } from "bun:test";
import { deriveBodySchema } from "../../../../src/controller/sub-atoms/schema/derive-body-schema";
import { STAT_CONFIG } from "../../../../src/config/entities/stat";

const schema = deriveBodySchema(STAT_CONFIG.fields);
const updateSchema = deriveBodySchema(STAT_CONFIG.fields, "update");

describe("Stat body schema (create mode)", () => {
  // ── Required fields present in schema ─────────────────────────────────

  it("includes machine_name in schema properties", () => {
    expect(schema.properties).toHaveProperty("machine_name");
  });

  it("includes name in schema properties", () => {
    expect(schema.properties).toHaveProperty("name");
  });

  it("includes data_type in schema properties", () => {
    expect(schema.properties).toHaveProperty("data_type");
  });

  it("includes category in schema properties", () => {
    expect(schema.properties).toHaveProperty("category");
  });

  it("includes value_min in schema properties", () => {
    expect(schema.properties).toHaveProperty("value_min");
  });

  it("includes value_max in schema properties", () => {
    expect(schema.properties).toHaveProperty("value_max");
  });

  it("includes default_value in schema properties", () => {
    expect(schema.properties).toHaveProperty("default_value");
  });

  // ── Auto-managed fields excluded ───────────────────────────────────────

  it("does NOT include id in schema properties (auto-generated)", () => {
    expect(schema.properties).not.toHaveProperty("id");
  });

  it("does NOT include created_at in create schema (auto-set)", () => {
    expect(schema.properties).not.toHaveProperty("created_at");
  });

  it("does NOT include updated_at in create schema (auto-set)", () => {
    expect(schema.properties).not.toHaveProperty("updated_at");
  });
});

describe("Stat body schema (update mode)", () => {
  it("includes machine_name in update schema", () => {
    expect(updateSchema.properties).toHaveProperty("machine_name");
  });

  it("does NOT include created_at in update schema", () => {
    expect(updateSchema.properties).not.toHaveProperty("created_at");
  });
});
