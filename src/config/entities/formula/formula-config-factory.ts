// src/config/entities/formula/formula-config-factory.ts
// Factory for Formula entity configuration.
//
// Formula describes a derivation from input stats to one output stat.
// The output_stat_id FK declares what stat is produced; the expression
// string references input stats by machine_name (e.g. "strength * 0.5").
// Multi-input formulas like "dexterity * 2 + level * 2" are supported
// without a junction table — the expression is parsed by a Layer 2 evaluator.

import { BaseEntityConfigFactory } from "../../factories/base-entity-config-factory";
import type { FieldConfig, PermissionConfig } from "../../types";
import {
  ID_FIELD_ATOM,
  NAME_FIELD_ATOM,
  DESCRIPTION_FIELD_ATOM,
} from "../../universal/atoms";
import { STANDARD_PERMISSIONS, AUDIT_FIELDS } from "../../universal/molecules";
import { DISPLAY_FORMATS, FIELD_MARKERS } from "../../universal/sub-atoms";

export class FormulaConfigFactory extends BaseEntityConfigFactory {
  protected getEntityName(): string {
    return "Formula";
  }

  protected getDisplayName(): string {
    return "Formula";
  }

  protected getPluralDisplayName(): string {
    return "Formulas";
  }

  protected getPermissions(): PermissionConfig {
    return STANDARD_PERMISSIONS;
  }

  protected override buildFields(): readonly FieldConfig[] {
    return [
      ID_FIELD_ATOM,
      NAME_FIELD_ATOM,
      {
        name: "output_stat_id",
        type: "reference",
        label: "Output Stat",
        targetEntity: "Stat",
        targetTable: "stat",
        targetDisplayField: "name",
        ...FIELD_MARKERS.required,
        ...DISPLAY_FORMATS.select,
      },
      {
        name: "expression",
        type: "string",
        label: "Expression",
        minLength: 1,
        maxLength: 500,
        ...FIELD_MARKERS.required,
        ...DISPLAY_FORMATS.textarea,
      },
      DESCRIPTION_FIELD_ATOM,
      ...AUDIT_FIELDS,
    ] as const;
  }
}

export const FORMULA_CONFIG = new FormulaConfigFactory().create();
