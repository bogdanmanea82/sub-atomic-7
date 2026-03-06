// src/model-service/entities/game-subcategory/game-subcategory-service.ts
// Layer 2 organism — public API for all GameSubcategory database operations.
// Name uniqueness is scoped to the parent GameCategory.

import type { GameSubcategory } from "@model/entities/game-subcategory/game-subcategory-model";
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
import type { PaginationParams } from "@model/universal/sub-atoms/types/pagination-params";
import {
  updateEntityWorkflow,
  type UpdateWorkflowResult,
} from "../../molecules/workflows/update-entity-workflow";
import {
  deleteEntityWorkflow,
  type DeleteWorkflowResult,
} from "../../molecules/workflows/delete-entity-workflow";
import { checkNameUniqueness } from "../../atoms/uniqueness";

const NAME_ERROR = "A Game Subcategory with this name already exists in this category.";

export const GameSubcategoryService = {
  async create(
    input: Record<string, unknown>,
  ): Promise<CreateWorkflowResult<GameSubcategory>> {
    const db = getConnection();

    const name = input["name"];
    const gameCategoryId = input["game_category_id"];
    if (typeof name === "string" && name.trim() !== "" && typeof gameCategoryId === "string") {
      const check = await checkNameUniqueness(db, GameSubcategoryModel, name, NAME_ERROR, { game_category_id: gameCategoryId });
      if (!check.available) {
        return { success: false, stage: "validation", errors: { name: check.error } };
      }
    }

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
    const db = getConnection();

    const name = data["name"];
    const gameCategoryId = data["game_category_id"];
    if (typeof name === "string" && name.trim() !== "" && typeof gameCategoryId === "string") {
      const check = await checkNameUniqueness(db, GameSubcategoryModel, name, NAME_ERROR, { game_category_id: gameCategoryId }, id);
      if (!check.available) {
        return { success: false, stage: "validation", errors: { name: check.error } };
      }
    }

    return updateEntityWorkflow(db, GameSubcategoryModel, id, data);
  },

  async delete(id: string): Promise<DeleteWorkflowResult> {
    const db = getConnection();
    return deleteEntityWorkflow(db, GameSubcategoryModel, id);
  },
};
