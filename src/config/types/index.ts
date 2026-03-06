// src/config/types/index.ts
// Barrel file - re-exports all configuration types

export type {
  BaseFieldConfig,
  BooleanFieldConfig,
  DisplayFormat,
  FieldConfig,
  FieldType,
  IntegerFieldConfig,
  ReferenceFieldConfig,
  StringFieldConfig,
  TimestampFieldConfig,
  UuidFieldConfig,
} from "./field-config";

export type {
  CrudOperations,
  EntityConfig,
  PermissionConfig,
  PermissionLevel,
} from "./entity-config";

export type {
  RelationshipConfig,
  RelationshipType,
} from "./relationship-config";

export type { BrowserFieldConfig } from "./browser-field-config";
