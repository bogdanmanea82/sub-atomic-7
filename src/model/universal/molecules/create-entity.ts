// src/model/universal/molecules/create-entity.ts
  // Orchestrates the entity creation preparation workflow
  // Coordinates: validate → serialize → build query
  // Layer 2 executes the returned query against the database

  import type { EntityConfig } from "@config/types";
  import type { PreparedQuery } from "../sub-atoms/types/prepared-query";
  import { validateEntity } from "../atoms/validate-entity";
  import { serializeEntity } from "../atoms/serialize-entity";
  import { buildInsertQuery } from "../atoms/build-query";

  /**
   * Prepares a complete INSERT operation for an entity.
   * Orchestrates three atoms in sequence: validate → serialize → build query.
   * Returns a PreparedQuery that Layer 2 will execute against the database.
   */
  export function createEntity(
    config: EntityConfig,
    input: Record<string, unknown>
  ): PreparedQuery {
    // Step 1: Validate — throws ValidationErrors if any field is invalid
    validateEntity(config, input);

    // Step 2: Serialize — converts TypeScript types to database-ready format
    // Uses original input (not validated subset) so system fields like id are included
    const serialized = serializeEntity(
      config,
      input,
      "create"
    );

    // Step 3: Build query — produces parameterized SQL ready for execution
    return buildInsertQuery(config, serialized as Record<string, unknown>);
  }