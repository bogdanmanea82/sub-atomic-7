// src/controller/sub-atoms/schema/derive-body-schema.ts
// Derives a TypeBox t.Object() schema from Layer 0 FieldConfig[].
// Used at Layer 3 route definitions for Elysia body validation and OpenAPI generation.

import { t } from "elysia";
import type { FieldConfig } from "@config/types";

/**
 * Converts a FieldConfig[] into a TypeBox schema for use in Elysia route definitions.
 *
 * mode 'create' — required fields are non-optional.
 * mode 'update' — all fields are optional (PUT semantics allow partial payloads).
 *
 * Auto-managed fields are always skipped:
 *   - uuid with autoGenerate:true  (server-generated)
 *   - timestamp with autoSet!='none' (server-managed)
 */
export function deriveBodySchema(
  fields: readonly FieldConfig[],
  mode: "create" | "update" = "create",
) {
  const shape: Record<string, unknown> = {};

  for (const field of fields) {
    if (field.type === "uuid" && field.autoGenerate) continue;
    if (field.type === "timestamp" && field.autoSet !== "none") continue;

    const base = buildBaseType(field);
    shape[field.name] = !field.required || mode === "update"
      ? t.Optional(base)
      : base;
  }

  return t.Object(shape as Parameters<typeof t.Object>[0]);
}

function buildBaseType(field: FieldConfig) {
  switch (field.type) {
    case "string":
      return t.String({ minLength: field.minLength, maxLength: field.maxLength });

    case "integer":
      return t.Number({ minimum: field.min, maximum: field.max });

    case "decimal":
      return t.Number({
        ...(field.min !== undefined && { minimum: field.min }),
        ...(field.max !== undefined && { maximum: field.max }),
      });

    case "boolean":
      return t.Boolean();

    case "reference":
      return t.String();

    case "enum":
      return t.Union(field.values.map((v) => t.Literal(v)));

    case "uuid":
      return t.String();

    case "timestamp":
      return t.String();
  }
}
