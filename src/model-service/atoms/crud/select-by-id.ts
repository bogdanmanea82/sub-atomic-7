// src/model-service/atoms/crud/select-by-id.ts
  // Fetches a single record from the database by its ID

  import type { SQL } from "bun";
  import { executeSelect } from "../../sub-atoms/database";

  /**
   * Fetches a single database row by ID.
   * Returns null if no record with that ID exists.
   * Table name comes from entity config — never from user input.
   */
  export async function selectById(
    db: SQL,
    tableName: string,
    id: string
  ): Promise<Record<string, unknown> | null> {
    try {
      const rows = await executeSelect(db, {
        sql: `SELECT * FROM ${tableName} WHERE id = ?`,
        params: [id],
      });
      return rows[0] ?? null;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown database error";
      throw new Error(`Select by ID failed: ${message}`);
    }
  }