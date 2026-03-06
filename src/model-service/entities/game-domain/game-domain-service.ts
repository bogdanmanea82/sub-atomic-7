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
  updateEntityWorkflow,
  type UpdateWorkflowResult,
} from "../../molecules/workflows/update-entity-workflow";
import {
  deleteEntityWorkflow,
  type DeleteWorkflowResult,
} from "../../molecules/workflows/delete-entity-workflow";

export const GameDomainService = {
  async create(
    input: Record<string, unknown>,
  ): Promise<CreateWorkflowResult<GameDomain>> {
    const db = getConnection();

    // Business rule: name must be unique across all GameDomain records
    const name = input["name"];
    if (typeof name === "string" && name.trim() !== "") {
      const existing = await selectManyWorkflow(db, GameDomainModel, { name });
      if (existing.success && existing.data.length > 0) {
        return {
          success: false,
          stage: "validation",
          errors: { name: "A Game Domain with this name already exists." },
        };
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

  async update(
    id: string,
    data: Record<string, unknown>,
  ): Promise<UpdateWorkflowResult<GameDomain>> {
    const db = getConnection();

    // Business rule: name must be unique — exclude the record being updated
    const name = data["name"];
    if (typeof name === "string" && name.trim() !== "") {
      const existing = await selectManyWorkflow(db, GameDomainModel, { name });
      if (existing.success && existing.data.some((d) => d.id !== id)) {
        return {
          success: false,
          stage: "validation",
          errors: { name: "A Game Domain with this name already exists." },
        };
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
