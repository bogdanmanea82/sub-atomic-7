// src/config/factories/modifier-binding-config-factory.ts
// Generic factory for modifier binding sub-entity configuration.
//
// Parameters:
//   parentEntityName  — the universal parent entity ("Modifier"). Used for FK label and targetEntity.
//   parentTableName   — the universal parent table ("modifier"). Used for FK targetTable.
//   additionalFields  — asset-type-specific fields appended after shared binding fields.
//   bindingEntityName — explicit entity name for the binding (e.g. "ItemModifierBinding").
//                       When provided, overrides the default `${parentEntityName}Binding` derivation.
//                       This decouples the FK parent name from the binding's own entity/table name.
//                       Required when the parent entity name does not match the binding table prefix.
//
// Usage:
//   new ModifierBindingConfigFactory("Modifier", "modifier", [AFFIX_TYPE_FIELD_ATOM], "ItemModifierBinding").create()
//   new ModifierBindingConfigFactory("Modifier", "modifier", [], "EnemyModifierBinding").create()

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
    private readonly bindingEntityName?: string,
  ) {
    super();
  }

  protected getEntityName(): string {
    return this.bindingEntityName ?? `${this.parentEntityName}Binding`;
  }

  protected getDisplayName(): string {
    if (this.bindingEntityName) {
      // "ItemModifierBinding" → "Item Modifier Binding"
      return this.bindingEntityName.replace(/([A-Z])/g, " $1").trim();
    }
    return `${this.parentEntityName} Binding`;
  }

  protected getPluralDisplayName(): string {
    if (this.bindingEntityName) {
      return this.bindingEntityName.replace(/([A-Z])/g, " $1").trim() + "s";
    }
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
