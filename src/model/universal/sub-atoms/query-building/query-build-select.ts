// src/model/universal/sub-atoms/query-building/query-build-select.ts
// Builds SELECT clause with field list

export function queryBuildSelect(tableName: string, fields: string[]): string {
  const fieldList = fields.length > 0 ? fields.join(", ") : "*";
  return `SELECT ${fieldList} FROM ${tableName}`;
}
