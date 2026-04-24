// src/controller/sub-atoms/schema/pagination-query-schema.ts
// Shared query schema for all entity list routes.
// t.Numeric() coerces query string values to numbers automatically —
// replaces manual Number() calls in extractPagination.

import { t } from "elysia";

export const paginationQuerySchema = t.Object({
  page: t.Optional(t.Numeric()),
  pageSize: t.Optional(t.Numeric()),
});
