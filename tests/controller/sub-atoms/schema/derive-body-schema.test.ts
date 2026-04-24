// tests/controller/sub-atoms/schema/derive-body-schema.test.ts
// Verifies that deriveBodySchema correctly maps Layer 0 FieldConfig types to
// TypeBox schema properties, skips auto-managed fields, and respects create/update modes.
//
// TypeBox schemas are plain JSON Schema-compatible objects at runtime.
// Tests inspect .properties and .required directly — no server or DB needed.

import { describe, it, expect } from "bun:test";
import { deriveBodySchema } from "../../../../src/controller/sub-atoms/schema/derive-body-schema";
import type {
  StringFieldConfig,
  IntegerFieldConfig,
  DecimalFieldConfig,
  BooleanFieldConfig,
  ReferenceFieldConfig,
  EnumFieldConfig,
  UuidFieldConfig,
  TimestampFieldConfig,
} from "../../../../src/config/types";

// ── Field config fixtures ───────────────────────────────────────────────────

const nameField: StringFieldConfig = {
  name: "name", type: "string", label: "Name", required: true,
  displayFormat: "text", minLength: 2, maxLength: 80,
};

const descriptionField: StringFieldConfig = {
  name: "description", type: "string", label: "Description", required: false,
  displayFormat: "textarea", minLength: 0, maxLength: 500,
};

const levelField: IntegerFieldConfig = {
  name: "level", type: "integer", label: "Level", required: true,
  displayFormat: "number", min: 1, max: 99,
};

const weightField: DecimalFieldConfig = {
  name: "weight", type: "decimal", label: "Weight", required: false,
  displayFormat: "number", precision: 5, scale: 2, min: 0.01, max: 999.99,
};

const decimalNoRange: DecimalFieldConfig = {
  name: "ratio", type: "decimal", label: "Ratio", required: true,
  displayFormat: "number", precision: 4, scale: 2,
};

const activeField: BooleanFieldConfig = {
  name: "isActive", type: "boolean", label: "Active", required: true,
  displayFormat: "toggle", defaultValue: true,
};

const parentField: ReferenceFieldConfig = {
  name: "gameDomainId", type: "reference", label: "Game Domain", required: true,
  displayFormat: "select", targetEntity: "GameDomain",
  targetTable: "game_domains", targetDisplayField: "name",
};

const rarityField: EnumFieldConfig = {
  name: "rarity", type: "enum", label: "Rarity", required: true,
  displayFormat: "select", values: ["common", "rare", "epic", "legendary"],
};

const autoUuidField: UuidFieldConfig = {
  name: "id", type: "uuid", label: "ID", required: false,
  displayFormat: "hidden", autoGenerate: true,
};

const manualUuidField: UuidFieldConfig = {
  name: "externalId", type: "uuid", label: "External ID", required: false,
  displayFormat: "hidden", autoGenerate: false,
};

const autoCreatedAt: TimestampFieldConfig = {
  name: "createdAt", type: "timestamp", label: "Created At", required: false,
  displayFormat: "datetime", autoSet: "create",
};

const autoUpdatedAt: TimestampFieldConfig = {
  name: "updatedAt", type: "timestamp", label: "Updated At", required: false,
  displayFormat: "datetime", autoSet: "update",
};

const manualTimestamp: TimestampFieldConfig = {
  name: "publishedAt", type: "timestamp", label: "Published At", required: false,
  displayFormat: "datetime", autoSet: "none",
};

// Helper: access TypeBox schema as plain JSON Schema object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asJson = (schema: ReturnType<typeof deriveBodySchema>) => schema as any;

// ── Auto-skip auto-managed fields ───────────────────────────────────────────

describe("auto-skip: uuid(autoGenerate:true)", () => {
  it("excludes the field from properties", () => {
    const schema = asJson(deriveBodySchema([autoUuidField]));
    expect("id" in schema.properties).toBe(false);
  });

  it("includes the field when autoGenerate is false", () => {
    const schema = asJson(deriveBodySchema([manualUuidField]));
    expect("externalId" in schema.properties).toBe(true);
  });
});

describe("auto-skip: timestamp with autoSet != 'none'", () => {
  it("excludes createdAt (autoSet:'create')", () => {
    const schema = asJson(deriveBodySchema([autoCreatedAt]));
    expect("createdAt" in schema.properties).toBe(false);
  });

  it("excludes updatedAt (autoSet:'update')", () => {
    const schema = asJson(deriveBodySchema([autoUpdatedAt]));
    expect("updatedAt" in schema.properties).toBe(false);
  });

  it("includes a manual timestamp (autoSet:'none')", () => {
    const schema = asJson(deriveBodySchema([manualTimestamp]));
    expect("publishedAt" in schema.properties).toBe(true);
  });
});

// ── Field type mapping ──────────────────────────────────────────────────────

describe("field type mapping", () => {
  it("maps string field to type:'string'", () => {
    const schema = asJson(deriveBodySchema([nameField]));
    expect(schema.properties.name.type).toBe("string");
  });

  it("maps integer field to type:'number'", () => {
    const schema = asJson(deriveBodySchema([levelField]));
    expect(schema.properties.level.type).toBe("number");
  });

  it("maps decimal field to type:'number'", () => {
    const schema = asJson(deriveBodySchema([weightField]));
    expect(schema.properties.weight.type).toBe("number");
  });

  it("maps boolean field to type:'boolean'", () => {
    const schema = asJson(deriveBodySchema([activeField]));
    expect(schema.properties.isActive.type).toBe("boolean");
  });

  it("maps reference field to type:'string' (FK UUID sent as string)", () => {
    const schema = asJson(deriveBodySchema([parentField]));
    expect(schema.properties.gameDomainId.type).toBe("string");
  });

  it("maps manual uuid to type:'string'", () => {
    const schema = asJson(deriveBodySchema([manualUuidField]));
    expect(schema.properties.externalId.type).toBe("string");
  });

  it("maps manual timestamp to type:'string'", () => {
    const schema = asJson(deriveBodySchema([manualTimestamp]));
    expect(schema.properties.publishedAt.type).toBe("string");
  });

  it("maps enum field to a union (anyOf) of literal values", () => {
    const schema = asJson(deriveBodySchema([rarityField]));
    const prop = schema.properties.rarity;
    expect(Array.isArray(prop.anyOf)).toBe(true);
    expect(prop.anyOf).toHaveLength(4);
    const consts = prop.anyOf.map((v: { const: string }) => v.const);
    expect(consts).toContain("common");
    expect(consts).toContain("legendary");
  });
});

// ── Numeric constraints ─────────────────────────────────────────────────────

describe("numeric constraints", () => {
  it("preserves min and max for integer fields as minimum/maximum", () => {
    const schema = asJson(deriveBodySchema([levelField]));
    expect(schema.properties.level.minimum).toBe(1);
    expect(schema.properties.level.maximum).toBe(99);
  });

  it("preserves min and max for decimal fields when provided", () => {
    const schema = asJson(deriveBodySchema([weightField]));
    expect(schema.properties.weight.minimum).toBe(0.01);
    expect(schema.properties.weight.maximum).toBe(999.99);
  });

  it("omits minimum/maximum for decimal fields with no range config", () => {
    const schema = asJson(deriveBodySchema([decimalNoRange]));
    expect("minimum" in schema.properties.ratio).toBe(false);
    expect("maximum" in schema.properties.ratio).toBe(false);
  });
});

// ── String constraints ──────────────────────────────────────────────────────

describe("string constraints", () => {
  it("preserves minLength and maxLength on string fields", () => {
    const schema = asJson(deriveBodySchema([nameField]));
    expect(schema.properties.name.minLength).toBe(2);
    expect(schema.properties.name.maxLength).toBe(80);
  });
});

// ── Required / optional in create mode ─────────────────────────────────────

describe("create mode: required fields", () => {
  it("puts a required:true field in the required array", () => {
    const schema = asJson(deriveBodySchema([nameField]));
    expect(schema.required).toContain("name");
  });

  it("omits a required:false field from the required array", () => {
    const schema = asJson(deriveBodySchema([descriptionField]));
    expect(schema.required ?? []).not.toContain("description");
  });

  it("handles a mix: required fields present, optional fields absent from required", () => {
    const schema = asJson(deriveBodySchema([nameField, descriptionField, levelField]));
    expect(schema.required).toContain("name");
    expect(schema.required).toContain("level");
    expect(schema.required ?? []).not.toContain("description");
  });
});

// ── Update mode ─────────────────────────────────────────────────────────────

describe("update mode", () => {
  it("makes all fields optional — required array is absent or empty", () => {
    const schema = asJson(deriveBodySchema([nameField, levelField], "update"));
    const required: string[] = schema.required ?? [];
    expect(required).not.toContain("name");
    expect(required).not.toContain("level");
  });

  it("still includes all non-auto-managed fields in properties", () => {
    const schema = asJson(deriveBodySchema(
      [nameField, autoUuidField, autoCreatedAt, levelField],
      "update",
    ));
    expect("name" in schema.properties).toBe(true);
    expect("level" in schema.properties).toBe(true);
    expect("id" in schema.properties).toBe(false);
    expect("createdAt" in schema.properties).toBe(false);
  });

  it("produces same property set as create mode, only required array differs", () => {
    const fields = [nameField, descriptionField, levelField];
    const create = asJson(deriveBodySchema(fields, "create"));
    const update = asJson(deriveBodySchema(fields, "update"));
    expect(Object.keys(create.properties)).toEqual(Object.keys(update.properties));
  });
});

// ── Empty input edge case ───────────────────────────────────────────────────

describe("edge cases", () => {
  it("returns a valid empty object schema when all fields are auto-managed", () => {
    const schema = asJson(deriveBodySchema([autoUuidField, autoCreatedAt, autoUpdatedAt]));
    expect(schema.type).toBe("object");
    expect(Object.keys(schema.properties)).toHaveLength(0);
  });

  it("default mode is 'create' when no mode argument is passed", () => {
    const explicit = asJson(deriveBodySchema([nameField], "create"));
    const implicit = asJson(deriveBodySchema([nameField]));
    expect(explicit.required).toEqual(implicit.required);
  });
});
