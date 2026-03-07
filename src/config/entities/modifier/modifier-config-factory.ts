// src/config/entities/modifier/modifier-config-factory.ts
// Factory for Modifier entity configuration.
// Modifier belongs to the full hierarchy (domain > subdomain > category > subcategory),
// carries dual type classification (affix_type + semantic_cat), and has archive lifecycle fields.

import { BaseEntityConfigFactory } from "../../factories/base-entity-config-factory";
import type { FieldConfig, PermissionConfig, RelationshipConfig } from "../../types";
import {
  GAME_DOMAIN_REF_FIELD_ATOM,
  GAME_SUBDOMAIN_REF_FIELD_ATOM,
  GAME_CATEGORY_REF_FIELD_ATOM,
  GAME_SUBCATEGORY_REF_FIELD_ATOM,
} from "../../universal/atoms";
import { AUDIT_FIELDS, STANDARD_ENTITY_FIELDS } from "../../universal/molecules";

export class ModifierConfigFactory extends BaseEntityConfigFactory {
  protected getEntityName(): string {
    return "Modifier";
  }

  protected getDisplayName(): string {
    return "Modifier";
  }

  protected getPluralDisplayName(): string {
    return "Modifiers";
  }

  protected getPermissions(): PermissionConfig {
    return {
      create: "admin",
      read: "public",
      update: "admin",
      delete: "admin",
    };
  }

  /**
   * Four FK fields in hierarchy order, plus code and two enum classification fields.
   */
  protected override getEntitySpecificFields(): readonly FieldConfig[] {
    return [
      GAME_DOMAIN_REF_FIELD_ATOM,
      GAME_SUBDOMAIN_REF_FIELD_ATOM,
      GAME_CATEGORY_REF_FIELD_ATOM,
      GAME_SUBCATEGORY_REF_FIELD_ATOM,
      {
        type: "string",
        name: "code",
        label: "Code",
        minLength: 3,
        maxLength: 100,
        pattern: "^[a-z0-9_]+$",
        required: true,
        displayFormat: "text",
      },
      {
        type: "enum",
        name: "affix_type",
        label: "Affix Type",
        values: ["prefix", "suffix"],
        required: true,
        displayFormat: "select",
      },
      {
        type: "enum",
        name: "semantic_cat",
        label: "Semantic Category",
        values: ["offensive", "defensive", "utility", "resource"],
        required: true,
        displayFormat: "select",
      },
    ] as const;
  }

  /**
   * Override buildFields to insert archive fields between is_active and audit timestamps.
   * Base ordering: [id, ...entitySpecific, name, description, is_active, ...audit]
   * Modifier ordering: [id, ...entitySpecific, name, description, is_active, archived_at, archived_reason, ...audit]
   */
  protected override buildFields(): readonly FieldConfig[] {
    const [idField, ...restStandard] = STANDARD_ENTITY_FIELDS;
    const entityFields = this.getEntitySpecificFields();

    const archiveFields: readonly FieldConfig[] = [
      {
        type: "timestamp",
        name: "archived_at",
        label: "Archived At",
        autoSet: "none",
        required: false,
        displayFormat: "datetime",
      },
      {
        type: "string",
        name: "archived_reason",
        label: "Archived Reason",
        minLength: 0,
        maxLength: 500,
        required: false,
        displayFormat: "textarea",
      },
    ] as const;

    return [
      idField,
      ...entityFields,
      ...restStandard,
      ...archiveFields,
      ...AUDIT_FIELDS,
    ] as const;
  }

  protected override getRelationships(): readonly RelationshipConfig[] {
    return [
      {
        name: "gameDomain",
        type: "belongsTo",
        targetEntity: "GameDomain",
        foreignKey: "game_domain_id",
        inverseRelationship: "modifiers",
      },
      {
        name: "gameSubdomain",
        type: "belongsTo",
        targetEntity: "GameSubdomain",
        foreignKey: "game_subdomain_id",
        inverseRelationship: "modifiers",
      },
      {
        name: "gameCategory",
        type: "belongsTo",
        targetEntity: "GameCategory",
        foreignKey: "game_category_id",
        inverseRelationship: "modifiers",
      },
      {
        name: "gameSubcategory",
        type: "belongsTo",
        targetEntity: "GameSubcategory",
        foreignKey: "game_subcategory_id",
        inverseRelationship: "modifiers",
      },
    ];
  }
}

export const MODIFIER_CONFIG = new ModifierConfigFactory().create();
