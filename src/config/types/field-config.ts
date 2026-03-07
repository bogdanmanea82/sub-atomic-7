// src/config/types/field-config.ts
// Type definitions for field configuration - the atomic unit of entity structure

/**
 * Supported field data types in the system.
 * These map to database column types and TypeScript types.
 */
export type FieldType = "string" | "integer" | "boolean" | "timestamp" | "uuid" | "reference" | "enum" | "decimal";

/**
 * Display format hints for the view layer.
 * These guide how fields are rendered in the UI.
 */
export type DisplayFormat =
  | "text"
  | "textarea"
  | "number"
  | "toggle"
  | "datetime"
  | "select"
  | "hidden";

/**
 * Base configuration shared by all field types.
 * Contains the minimum properties every field must have.
 */
export interface BaseFieldConfig {
  readonly name: string;
  readonly type: FieldType;
  readonly label: string;
  readonly required: boolean;
  readonly displayFormat: DisplayFormat;
}

/**
 * String field configuration with text-specific constraints.
 */
export interface StringFieldConfig extends BaseFieldConfig {
  readonly type: "string";
  readonly minLength: number;
  readonly maxLength: number;
  readonly pattern?: string;
  readonly defaultValue?: string;
}

/**
 * Integer field configuration with numeric constraints.
 */
export interface IntegerFieldConfig extends BaseFieldConfig {
  readonly type: "integer";
  readonly min: number;
  readonly max: number;
  readonly defaultValue?: number;
}

/**
 * Boolean field configuration.
 */
export interface BooleanFieldConfig extends BaseFieldConfig {
  readonly type: "boolean";
  readonly defaultValue: boolean;
}

/**
 * Timestamp field configuration for date/time values.
 */
export interface TimestampFieldConfig extends BaseFieldConfig {
  readonly type: "timestamp";
  readonly autoSet: "create" | "update" | "none";
}

/**
 * UUID field configuration for unique identifiers.
 */
export interface UuidFieldConfig extends BaseFieldConfig {
  readonly type: "uuid";
  readonly autoGenerate: boolean;
}

/**
 * Reference field configuration for foreign keys.
 * Points to another entity's ID — rendered as a dropdown in forms.
 */
export interface ReferenceFieldConfig extends BaseFieldConfig {
  readonly type: "reference";
  readonly targetEntity: string;
  readonly targetTable: string;
  readonly targetDisplayField: string;
}

/**
 * Enum field configuration for fields with a fixed set of allowed values.
 * Stored as strings in the database, rendered as <select> dropdowns in forms.
 */
export interface EnumFieldConfig extends BaseFieldConfig {
  readonly type: "enum";
  readonly values: readonly string[];
  readonly defaultValue?: string;
}

/**
 * Decimal field configuration for NUMERIC columns.
 * PostgreSQL returns NUMERIC as string — deserialization parses to number.
 */
export interface DecimalFieldConfig extends BaseFieldConfig {
  readonly type: "decimal";
  readonly precision: number;
  readonly scale: number;
  readonly min?: number;
  readonly max?: number;
  readonly defaultValue?: number;
}

/**
 * Union type representing any valid field configuration.
 * The discriminant is the `type` property.
 */
export type FieldConfig =
  | StringFieldConfig
  | IntegerFieldConfig
  | BooleanFieldConfig
  | TimestampFieldConfig
  | UuidFieldConfig
  | ReferenceFieldConfig
  | EnumFieldConfig
  | DecimalFieldConfig;
