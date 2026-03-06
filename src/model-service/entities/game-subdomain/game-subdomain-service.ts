// src/model-service/entities/game-subdomain/game-subdomain-service.ts
// Layer 2 organism — public API for all GameSubdomain database operations.
// Name uniqueness is scoped to the parent GameDomain — two different domains
// can each have a subdomain called "Combat", but within one domain names are unique.

import type { GameSubdomain } from "@model/entities/game-subdomain/game-subdomain-model";
import { GameSubdomainModel } from "@model/entities/game-subdomain/game-subdomain-model";
import { GAME_SUBDOMAIN_CONFIG } from "@config/entities/game-subdomain";
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

export const GameSubdomainService = {
  async create(
    input: Record<string, unknown>,
  ): Promise<CreateWorkflowResult<GameSubdomain>> {
    const db = getConnection();

    // Business rule: name must be unique within the parent GameDomain
    const name = input["name"];
    const gameDomainId = input["game_domain_id"];
    if (typeof name === "string" && name.trim() !== "" && typeof gameDomainId === "string") {
      const existing = await selectManyWorkflow(db, GameSubdomainModel, {
        name,
        game_domain_id: gameDomainId,
      });
      if (existing.success && existing.data.length > 0) {
        return {
          success: false,
          stage: "validation",
          errors: { name: "A Game Subdomain with this name already exists in this domain." },
        };
      }
    }

    return createEntityWorkflow(db, GameSubdomainModel, input);
  },

  async findById(id: string): Promise<SelectWorkflowResult<GameSubdomain>> {
    const db = getConnection();
    return selectEntityWorkflow(db, GAME_SUBDOMAIN_CONFIG, GameSubdomainModel, id);
  },

  async findMany(
    conditions?: Record<string, unknown>,
  ): Promise<SelectManyWorkflowResult<GameSubdomain>> {
    const db = getConnection();
    return selectManyWorkflow(db, GameSubdomainModel, conditions);
  },

  async findManyPaginated(
    pagination: PaginationParams,
    conditions?: Record<string, unknown>,
  ): Promise<SelectManyPaginatedResult<GameSubdomain>> {
    const db = getConnection();
    return selectManyPaginatedWorkflow(db, GameSubdomainModel, pagination, conditions);
  },

  async update(
    id: string,
    data: Record<string, unknown>,
  ): Promise<UpdateWorkflowResult<GameSubdomain>> {
    const db = getConnection();

    // Business rule: name must be unique within the parent GameDomain,
    // excluding the record being updated
    const name = data["name"];
    const gameDomainId = data["game_domain_id"];
    if (typeof name === "string" && name.trim() !== "" && typeof gameDomainId === "string") {
      const existing = await selectManyWorkflow(db, GameSubdomainModel, {
        name,
        game_domain_id: gameDomainId,
      });
      if (existing.success && existing.data.some((d) => d.id !== id)) {
        return {
          success: false,
          stage: "validation",
          errors: { name: "A Game Subdomain with this name already exists in this domain." },
        };
      }
    }

    return updateEntityWorkflow(db, GameSubdomainModel, id, data);
  },

  async delete(id: string): Promise<DeleteWorkflowResult> {
    const db = getConnection();
    return deleteEntityWorkflow(db, GameSubdomainModel, id);
  },
};
