// src/config/factories/modifier-binding-config-factory.ts
// Generic factory for modifier binding sub-entity configuration.
// Parameterized by parent entity name, table, and optional asset-type-specific fields.
// The third parameter lets each asset-type binding add its own fields without subclassing.
// Usage: new ModifierBindingConfigFactory("Modifier", "modifier", [AFFIX_TYPE_FIELD_ATOM]).create()

import { BaseEntityConfigFactory } from "./base-entity-config-factory";
import type { FieldConfig, PermissionConfig, ReferenceFieldConfig } from "../types";
import { ID_FIELD_ATOM } from "../universal/atoms";
import { STANDARD_PERMISSIONS, AUDIT_FIELDS } from "../universal/molecules";
import { MODIFIER_BINDING_FIELDS } from "../molecules/modifier";

export class ModifierBindingConfigFactory extends BaseEntityConfigFactory {
  constructor(
    private readonly parentEntityName: string,
    private readonly parentTableName: string,
    private readonly additionalFields: readonly FieldConfig[] = [],
  ) {
    super();
  }

  protected getEntityName(): string {
    return `${this.parentEntityName}Binding`;
  }

  protected getDisplayName(): string {
    return `${this.parentEntityName} Binding`;
  }

  protected getPluralDisplayName(): string {
    return `${this.parentEntityName} Bindings`;
  }

  protected getPermissions(): PermissionConfig {
    return STANDARD_PERMISSIONS;
  }

  protected override buildFields(): readonly FieldConfig[] {
    const fkField: ReferenceFieldConfig = {
      type: "reference",
      name: "modifier_id",
      label: this.parentEntityName,
      targetEntity: this.parentEntityName,
      targetTable: this.parentTableName,
      targetDisplayField: "name",
      required: true,
      displayFormat: "hidden",
    };
    return [ID_FIELD_ATOM, fkField, ...MODIFIER_BINDING_FIELDS, ...this.additionalFields, ...AUDIT_FIELDS];
  }
}
