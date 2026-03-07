// src/model-service/sub-atoms/database/with-transaction.ts
// Wraps Bun SQL's db.begin() for transactional operations.
// The transaction-scoped SQL object is passed through the same db: SQL parameter
// that executeWrite/executeSelect already accept, enabling transparent usage.

import type { SQL } from "bun";

export async function withTransaction<T>(
  db: SQL,
  fn: (txDb: SQL) => Promise<T>,
): Promise<T> {
  return db.begin(async (txSql) => fn(txSql as unknown as SQL));
}
