// src/model-service/entities/item-modifier/item-modifier-binding-service.ts
// Layer 2 organism — public API for modifier binding CRUD operations.
// Individual add/update/remove (not bulk like tiers).
// All operations validate that the parent modifier exists first.

import { ItemModifierBindingModel } from "@model/entities/item-modifier-binding/item-modifier-binding-model";
import type { ItemModifierBinding } from "@model/entities/item-modifier-binding/item-modifier-binding-model";
import { ItemModifierModel } from "@model/entities/item-modifier/item-modifier-model";
import type {
  CreateWorkflowResult,
} from "../../molecules/workflows/create-entity-workflow";
import type {
  UpdateWorkflowResult,
} from "../../molecules/workflows/update-entity-workflow";
import type {
  DeleteWorkflowResult,
} from "../../molecules/workflows/delete-entity-workflow";
import { getConnection, executeWrite } from "../../sub-atoms/database";
import { insertRecord, selectMany, verifyEntityExists } from "../../atoms/crud";
import { checkCompositeUniqueness } from "../../atoms/uniqueness";

const DUPLICATE_ERROR = "This modifier already has a binding for this target. Edit the existing binding instead.";

/**
 * Cross-field validation: min_tier_index <= max_tier_index when both are set.
 */
function validateTierRange(
  input: Record<string, unknown>,
): Record<string, string> | null {
  const minTier = input["min_tier_index"];
  const maxTier = input["max_tier_index"];

  if (minTier !== null && minTier !== undefined && minTier !== "" &&
      maxTier !== null && maxTier !== undefined && maxTier !== "") {
    if (Number(minTier) > Number(maxTier)) {
      return { min_tier_index: "Min Tier must be less than or equal to Max Tier" };
    }
  }

  return null;
}

export const ItemModifierBindingService = {
  /**
   * Fetches all bindings for a modifier, organized by target type.
   */
  async findByModifier(modifierId: string): Promise<{
    readonly category: readonly ItemModifierBinding[];
    readonly subcategory: readonly ItemModifierBinding[];
  }> {
    const db = getConnection();
    const query = ItemModifierBindingModel.prepareSelect({ modifier_id: modifierId });
    const rows = await selectMany(db, query);
    const bindings = rows.map((row) => ItemModifierBindingModel.deserialize(row));

    return {
      category: bindings.filter((b) => b.target_type === "category"),
      subcategory: bindings.filter((b) => b.target_type === "subcategory"),
    };
  },

  /**
   * Creates a new binding for a modifier.
   */
  async create(
    modifierId: string,
    input: Record<string, unknown>,
  ): Promise<CreateWorkflowResult<ItemModifierBinding>> {
    const db = getConnection();

    // Verify parent modifier exists
    const modifierExists = await verifyEntityExists(db, ItemModifierModel, modifierId);
    if (!modifierExists) {
      return { success: false, stage: "database", error: `ItemModifier ${modifierId} not found` };
    }

    // Cross-field validation
    const tierRangeErrors = validateTierRange(input);
    if (tierRangeErrors) {
      return { success: false, stage: "validation", errors: tierRangeErrors };
    }

    const targetType = input["target_type"];
    const targetId = input["target_id"];

    // Composite uniqueness check: (modifier_id, target_type, target_id) must be unique
    if (typeof targetType === "string" && typeof targetId === "string") {
      const isDuplicate = await checkCompositeUniqueness(db, ItemModifierBindingModel, {
        modifier_id: modifierId,
        target_type: targetType,
        target_id: targetId,
      });
      if (isDuplicate) {
        return { success: false, stage: "validation", errors: { target_id: DUPLICATE_ERROR } };
      }
    }

    // Prepare full input with generated id, modifier_id, and defaults
    const bindingId = crypto.randomUUID();
    const fullInput: Record<string, unknown> = {
      is_active: true,
      is_included: true,
      ...input,
      id: bindingId,
      modifier_id: modifierId,
    };

    // Validate and prepare query (Layer 1)
    let query;
    try {
      query = ItemModifierBindingModel.prepareCreate(fullInput);
    } catch (error) {
      const err = error as Error & { errors?: Record<string, string> };
      return { success: false, stage: "validation", errors: err.errors ?? { general: err.message } };
    }

    // Insert
    try {
      await insertRecord(db, query);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";
      return { success: false, stage: "database", error: message };
    }

    // Fetch and return created record
    const selectQuery = ItemModifierBindingModel.prepareSelect({ id: bindingId });
    const rows = await selectMany(db, selectQuery);
    if (rows.length === 0) {
      return { success: false, stage: "database", error: "Failed to retrieve created binding" };
    }

    return { success: true, data: ItemModifierBindingModel.deserialize(rows[0]!) };
  },

  /**
   * Updates an existing binding.
   */
  async update(
    modifierId: string,
    bindingId: string,
    data: Record<string, unknown>,
  ): Promise<UpdateWorkflowResult<ItemModifierBinding>> {
    const db = getConnection();

    // Verify parent modifier exists
    const modifierExists = await verifyEntityExists(db, ItemModifierModel, modifierId);
    if (!modifierExists) {
      return { success: false, stage: "not_found", error: `ItemModifier ${modifierId} not found` };
    }

    // Cross-field validation
    const tierRangeErrors = validateTierRange(data);
    if (tierRangeErrors) {
      return { success: false, stage: "validation", errors: tierRangeErrors };
    }

    const targetType = data["target_type"];
    const targetId = data["target_id"];

    // Composite uniqueness check (exclude self)
    if (typeof targetType === "string" && typeof targetId === "string") {
      const isDuplicate = await checkCompositeUniqueness(db, ItemModifierBindingModel, {
        modifier_id: modifierId,
        target_type: targetType,
        target_id: targetId,
      }, bindingId);
      if (isDuplicate) {
        return { success: false, stage: "validation", errors: { target_id: DUPLICATE_ERROR } };
      }
    }

    // Validate and prepare update query (Layer 1)
    const updateData: Record<string, unknown> = { is_active: true, ...data, modifier_id: modifierId };
    let query;
    try {
      query = ItemModifierBindingModel.prepareUpdate(updateData, { id: bindingId, modifier_id: modifierId });
    } catch (error) {
      const err = error as Error & { errors?: Record<string, string> };
      return { success: false, stage: "validation", errors: err.errors ?? { general: err.message } };
    }

    // Execute update
    try {
      await executeWrite(db, query);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";
      return { success: false, stage: "database", error: message };
    }

    // Fetch and return updated record
    const selectQuery = ItemModifierBindingModel.prepareSelect({ id: bindingId });
    const rows = await selectMany(db, selectQuery);
    if (rows.length === 0) {
      return { success: false, stage: "not_found", error: `Binding ${bindingId} not found after update` };
    }

    return { success: true, data: ItemModifierBindingModel.deserialize(rows[0]!) };
  },

  /**
   * Removes a binding by id, scoped to the parent modifier.
   */
  async remove(
    modifierId: string,
    bindingId: string,
  ): Promise<DeleteWorkflowResult> {
    const db = getConnection();

    // Verify binding exists and belongs to this modifier
    const selectQuery = ItemModifierBindingModel.prepareSelect({ id: bindingId, modifier_id: modifierId });
    const rows = await selectMany(db, selectQuery);
    if (rows.length === 0) {
      return { success: false, stage: "not_found", error: `Binding ${bindingId} not found` };
    }

    // Delete
    const deleteQuery = ItemModifierBindingModel.prepareDelete({ id: bindingId });
    try {
      await executeWrite(db, deleteQuery);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";
      return { success: false, stage: "database", error: message };
    }

    return { success: true };
  },
};
