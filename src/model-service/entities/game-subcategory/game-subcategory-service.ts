// src/model-service/entities/game-subcategory/game-subcategory-service.ts
// Layer 2 organism — public API for all GameSubcategory database operations.
// Name uniqueness is scoped to the parent GameCategory.

import type { GameSubcategory } from "@model/entities/game-subcategory/game-subcategory-model";
import type { PaginationParams } from "@model/universal/sub-atoms/types/pagination-params";
import { GameSubcategoryModel } from "@model/entities/game-subcategory/game-subcategory-model";
import { GAME_SUBCATEGORY_CONFIG } from "@config/entities/game-subcategory";
import { getConnection } from "../../sub-atoms/database";
import {
  createEntityWorkflow,
  type CreateWorkflowResult,
} from "../../molecules/workflows/create-entity-workflow";
import {
  selectEntityWorkflow,
  type SelectWorkflowResult,
} from "../../molecules/workflows/select-entity-workflow";
import {
  selectManyWorkflow,
  type SelectManyWorkflowResult,
} from "../../molecules/workflows/select-many-workflow";
import {
  selectManyPaginatedWorkflow,
  type SelectManyPaginatedResult,
} from "../../molecules/workflows/select-many-paginated-workflow";
import {
  updateEntityWorkflow,
  type UpdateWorkflowResult,
} from "../../molecules/workflows/update-entity-workflow";
import {
  deleteEntityWorkflow,
  type DeleteWorkflowResult,
} from "../../molecules/workflows/delete-entity-workflow";
import { checkNameUniqueness, checkFieldUniqueness, checkNameAndMachineNameUniqueness } from "../../atoms/uniqueness";
import { applyStatusAction } from "../../sub-atoms/apply-status-action";

const NAME_ERROR = "A Game Subcategory with this name already exists in this category.";
const MACHINE_NAME_ERROR = "A Game Subcategory with this machine_name already exists.";

export const GameSubcategoryService = {
  async create(
    input: Record<string, unknown>,
  ): Promise<CreateWorkflowResult<GameSubcategory>> {
    applyStatusAction(input);
    const db = getConnection();

    const gameCategoryId = input["game_category_id"];
    const nameScope = typeof gameCategoryId === "string" ? { game_category_id: gameCategoryId } : false;
    const conflict = await checkNameAndMachineNameUniqueness(db, GameSubcategoryModel, input, NAME_ERROR, MACHINE_NAME_ERROR, nameScope);
    if (conflict) return conflict;

    return createEntityWorkflow(db, GameSubcategoryModel, input);
  },

  async findById(id: string): Promise<SelectWorkflowResult<GameSubcategory>> {
    const db = getConnection();
    return selectEntityWorkflow(db, GAME_SUBCATEGORY_CONFIG, GameSubcategoryModel, id);
  },

  async findMany(
    conditions?: Record<string, unknown>,
  ): Promise<SelectManyWorkflowResult<GameSubcategory>> {
    const db = getConnection();
    return selectManyWorkflow(db, GameSubcategoryModel, conditions);
  },

  async findManyPaginated(
    pagination: PaginationParams,
    conditions?: Record<string, unknown>,
  ): Promise<SelectManyPaginatedResult<GameSubcategory>> {
    const db = getConnection();
    return selectManyPaginatedWorkflow(db, GameSubcategoryModel, pagination, conditions);
  },

  async update(
    id: string,
    data: Record<string, unknown>,
  ): Promise<UpdateWorkflowResult<GameSubcategory>> {
    applyStatusAction(data);
    const db = getConnection();

    const gameCategoryId = data["game_category_id"];
    const nameScope = typeof gameCategoryId === "string" ? { game_category_id: gameCategoryId } : false;
    const conflict = await checkNameAndMachineNameUniqueness(db, GameSubcategoryModel, data, NAME_ERROR, MACHINE_NAME_ERROR, nameScope, id);
    if (conflict) return conflict;

    return updateEntityWorkflow(db, GameSubcategoryModel, id, data, GAME_SUBCATEGORY_CONFIG.nonColumnKeys);
  },

  async delete(id: string): Promise<DeleteWorkflowResult> {
    const db = getConnection();
    return deleteEntityWorkflow(db, GameSubcategoryModel, id);
  },

  async checkNameAvailable(
    name: string,
    scope?: Record<string, unknown>,
    excludeId?: string,
  ): Promise<{ available: boolean }> {
    if (name.trim() === "") return { available: false };
    const db = getConnection();
    const check = await checkNameUniqueness(db, GameSubcategoryModel, name, "", scope, excludeId);
    return { available: check.available };
  },

  async checkMachineNameAvailable(
    machineName: string,
    excludeId?: string,
  ): Promise<{ available: boolean }> {
    if (machineName.trim() === "") return { available: false };
    const db = getConnection();
    const check = await checkFieldUniqueness(db, GameSubcategoryModel, "machine_name", machineName, "", undefined, excludeId);
    return { available: check.available };
  },
};
