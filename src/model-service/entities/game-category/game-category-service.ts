// src/model-service/entities/game-category/game-category-service.ts
// Layer 2 organism — public API for all GameCategory database operations.
// Name uniqueness is scoped to the parent GameSubdomain — two different subdomains
// can each have a category called "Weapons", but within one subdomain names are unique.

import type { GameCategory } from "@model/entities/game-category/game-category-model";
import type { PaginationParams } from "@model/universal/sub-atoms/types/pagination-params";
import { GameCategoryModel } from "@model/entities/game-category/game-category-model";
import { GAME_CATEGORY_CONFIG } from "@config/entities/game-category";
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
import { checkNameUniqueness, checkFieldUniqueness } from "../../atoms/uniqueness";
import { applyStatusAction } from "../../sub-atoms/apply-status-action";

const NAME_ERROR = "A Game Category with this name already exists in this subdomain.";
const MACHINE_NAME_ERROR = "A Game Category with this machine_name already exists.";

export const GameCategoryService = {
  async create(
    input: Record<string, unknown>,
  ): Promise<CreateWorkflowResult<GameCategory>> {
    applyStatusAction(input);
    const db = getConnection();

    const name = input["name"];
    const gameSubdomainId = input["game_subdomain_id"];
    if (typeof name === "string" && name.trim() !== "" && typeof gameSubdomainId === "string") {
      const check = await checkNameUniqueness(db, GameCategoryModel, name, NAME_ERROR, { game_subdomain_id: gameSubdomainId });
      if (!check.available) {
        return { success: false, stage: "validation", errors: { name: check.error } };
      }
    }

    const machineName = input["machine_name"];
    if (typeof machineName === "string" && machineName.trim() !== "") {
      const check = await checkFieldUniqueness(db, GameCategoryModel, "machine_name", machineName, MACHINE_NAME_ERROR);
      if (!check.available) {
        return { success: false, stage: "validation", errors: { machine_name: check.error } };
      }
    }

    return createEntityWorkflow(db, GameCategoryModel, input);
  },

  async findById(id: string): Promise<SelectWorkflowResult<GameCategory>> {
    const db = getConnection();
    return selectEntityWorkflow(db, GAME_CATEGORY_CONFIG, GameCategoryModel, id);
  },

  async findMany(
    conditions?: Record<string, unknown>,
  ): Promise<SelectManyWorkflowResult<GameCategory>> {
    const db = getConnection();
    return selectManyWorkflow(db, GameCategoryModel, conditions);
  },

  async findManyPaginated(
    pagination: PaginationParams,
    conditions?: Record<string, unknown>,
  ): Promise<SelectManyPaginatedResult<GameCategory>> {
    const db = getConnection();
    return selectManyPaginatedWorkflow(db, GameCategoryModel, pagination, conditions);
  },

  async update(
    id: string,
    data: Record<string, unknown>,
  ): Promise<UpdateWorkflowResult<GameCategory>> {
    applyStatusAction(data);
    const db = getConnection();

    const name = data["name"];
    const gameSubdomainId = data["game_subdomain_id"];
    if (typeof name === "string" && name.trim() !== "" && typeof gameSubdomainId === "string") {
      const check = await checkNameUniqueness(db, GameCategoryModel, name, NAME_ERROR, { game_subdomain_id: gameSubdomainId }, id);
      if (!check.available) {
        return { success: false, stage: "validation", errors: { name: check.error } };
      }
    }

    const machineName = data["machine_name"];
    if (typeof machineName === "string" && machineName.trim() !== "") {
      const check = await checkFieldUniqueness(db, GameCategoryModel, "machine_name", machineName, MACHINE_NAME_ERROR, undefined, id);
      if (!check.available) {
        return { success: false, stage: "validation", errors: { machine_name: check.error } };
      }
    }

    return updateEntityWorkflow(db, GameCategoryModel, id, data, GAME_CATEGORY_CONFIG.nonColumnKeys);
  },

  async delete(id: string): Promise<DeleteWorkflowResult> {
    const db = getConnection();
    return deleteEntityWorkflow(db, GameCategoryModel, id);
  },

  async checkNameAvailable(
    name: string,
    scope?: Record<string, unknown>,
    excludeId?: string,
  ): Promise<{ available: boolean }> {
    if (name.trim() === "") return { available: false };
    const db = getConnection();
    const check = await checkNameUniqueness(db, GameCategoryModel, name, "", scope, excludeId);
    return { available: check.available };
  },

  async checkMachineNameAvailable(
    machineName: string,
    excludeId?: string,
  ): Promise<{ available: boolean }> {
    if (machineName.trim() === "") return { available: false };
    const db = getConnection();
    const check = await checkFieldUniqueness(db, GameCategoryModel, "machine_name", machineName, "", undefined, excludeId);
    return { available: check.available };
  },
};
