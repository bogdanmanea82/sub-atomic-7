// src/config/factories/modifier-tier-config-factory.ts
// Generic factory for modifier tier sub-entity configuration.
// Parameterized by parent entity name and table — eliminates hardcoded FK references.
// Usage: new ModifierTierConfigFactory("Modifier", "modifier").create()

import { BaseEntityConfigFactory } from "./base-entity-config-factory";
import type { FieldConfig, PermissionConfig, ReferenceFieldConfig } from "../types";
import { ID_FIELD_ATOM } from "../universal/atoms";
import { STANDARD_PERMISSIONS, AUDIT_FIELDS } from "../universal/molecules";
import { MODIFIER_TIERS_FIELDS } from "../molecules/modifier";

export class ModifierTierConfigFactory extends BaseEntityConfigFactory {
  constructor(
    private readonly parentEntityName: string,
    private readonly parentTableName: string,
  ) {
    super();
  }

  protected getEntityName(): string {
    return `${this.parentEntityName}Tier`;
  }

  protected getDisplayName(): string {
    return `${this.splitPascalCase(this.parentEntityName)} Tier`;
  }

  protected getPluralDisplayName(): string {
    return `${this.splitPascalCase(this.parentEntityName)} Tiers`;
  }

  private splitPascalCase(name: string): string {
    return name.replace(/([A-Z])/g, " $1").trim();
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
    return [ID_FIELD_ATOM, fkField, ...MODIFIER_TIERS_FIELDS, ...AUDIT_FIELDS];
  }
}
