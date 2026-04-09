// src/model/entities/modifier-binding/modifier-binding-model.ts
// ModifierBinding model organism — Layer 1 public interface for binding validation/serialization/queries.
// Unlike tiers, bindings support individual CRUD (not bulk save), so includes prepareUpdate.

import { MODIFIER_BINDING_CONFIG } from "@config/entities/modifier-binding";
import type { PreparedQuery } from "../../universal/sub-atoms/types/prepared-query";
import type { ValidatedData } from "../../universal/atoms/validate-entity";
import type { SerializedData } from "../../universal/atoms/serialize-entity";
import { validateEntity } from "../../universal/atoms/validate-entity";
import { serializeEntity } from "../../universal/atoms/serialize-entity";
import { deserializeEntity } from "../../universal/atoms/deserialize-entity";
import { createEntity } from "../../universal/molecules/create-entity";
import { buildSelectQuery } from "../../universal/atoms/build-select-query";
import { buildUpdateQuery } from "../../universal/atoms/build-update-query";
import { buildDeleteQuery } from "../../universal/atoms/build-delete-query";

export type ModifierBinding = {
  readonly id: string;
  readonly modifier_id: string;
  readonly target_type: "category" | "subcategory";
  readonly target_id: string;
  readonly is_included: boolean;
  readonly weight_override: number | null;
  readonly min_tier_index: number | null;
  readonly max_tier_index: number | null;
  readonly level_req_override: number | null;
  readonly is_active: boolean;
  readonly created_at: Date;
  readonly updated_at: Date;
};

export const ModifierBindingModel = {
  validate(input: Record<string, unknown>): ValidatedData {
    return validateEntity(MODIFIER_BINDING_CONFIG, input);
  },

  serialize(data: Record<string, unknown>, operation: "create" | "update"): SerializedData {
    return serializeEntity(MODIFIER_BINDING_CONFIG, data, operation);
  },

  deserialize(row: Record<string, unknown>): ModifierBinding {
    return deserializeEntity(MODIFIER_BINDING_CONFIG, row) as ModifierBinding;
  },

  prepareCreate(input: Record<string, unknown>): PreparedQuery {
    return createEntity(MODIFIER_BINDING_CONFIG, input);
  },

  prepareSelect(conditions?: Record<string, unknown>): PreparedQuery {
    return buildSelectQuery(MODIFIER_BINDING_CONFIG, conditions);
  },

  prepareUpdate(data: Record<string, unknown>, conditions: Record<string, unknown>): PreparedQuery {
    return buildUpdateQuery(MODIFIER_BINDING_CONFIG, data, conditions);
  },

  prepareDelete(conditions: Record<string, unknown>): PreparedQuery {
    return buildDeleteQuery(MODIFIER_BINDING_CONFIG, conditions);
  },
};
