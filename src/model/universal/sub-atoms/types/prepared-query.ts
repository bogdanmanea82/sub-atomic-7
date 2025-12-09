// src/model/types/prepared-query.ts
// Represents a parameterized SQL query with separate sql and params

export type PreparedQuery = {
  sql: string;
  params: unknown[];
};
