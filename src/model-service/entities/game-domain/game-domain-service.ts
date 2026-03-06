// src/model-service/entities/game-domain/game-domain-service.ts
// Layer 2 organism — public API for all GameDomain database operations

import type { GameDomain } from "@model/entities/game-domain/game-domain-model";
import { GameDomainModel } from "@model/entities/game-domain/game-domain-model";
import { GAME_DOMAIN_CONFIG } from "@config/entities/game-domain";
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

const NAME_ERROR = "A Game Domain with this name already exists.";

export const GameDomainService = {
  async create(
    input: Record<string, unknown>,
  ): Promise<CreateWorkflowResult<GameDomain>> {
    const db = getConnection();

    const name = input["name"];
    if (typeof name === "string" && name.trim() !== "") {
      const check = await checkNameUniqueness(db, GameDomainModel, name, NAME_ERROR);
      if (!check.available) {
        return { success: false, stage: "validation", errors: { name: check.error } };
      }
    }

    return createEntityWorkflow(db, GameDomainModel, input);
  },

  async findById(id: string): Promise<SelectWorkflowResult<GameDomain>> {
    const db = getConnection();
    return selectEntityWorkflow(db, GAME_DOMAIN_CONFIG, GameDomainModel, id);
  },

  async findMany(
    conditions?: Record<string, unknown>,
  ): Promise<SelectManyWorkflowResult<GameDomain>> {
    const db = getConnection();
    return selectManyWorkflow(db, GameDomainModel, conditions);
  },

  async findManyPaginated(
    pagination: PaginationParams,
    conditions?: Record<string, unknown>,
  ): Promise<SelectManyPaginatedResult<GameDomain>> {
    const db = getConnection();
    return selectManyPaginatedWorkflow(db, GameDomainModel, pagination, conditions);
  },

  async update(
    id: string,
    data: Record<string, unknown>,
  ): Promise<UpdateWorkflowResult<GameDomain>> {
    const db = getConnection();

    const name = data["name"];
    if (typeof name === "string" && name.trim() !== "") {
      const check = await checkNameUniqueness(db, GameDomainModel, name, NAME_ERROR, undefined, id);
      if (!check.available) {
        return { success: false, stage: "validation", errors: { name: check.error } };
      }
    }

    return updateEntityWorkflow(
      db,
      GameDomainModel,
      id,
      data,
    );
  },

  async delete(id: string): Promise<DeleteWorkflowResult> {
    const db = getConnection();
    return deleteEntityWorkflow(db, GameDomainModel, id);
  },
};
