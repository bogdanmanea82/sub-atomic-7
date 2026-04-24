# ADR-004: Why PostgreSQL (not SQLite / MySQL)

**Status:** Accepted  
**Date:** 2026-04-23

---

## Decision

Use **PostgreSQL** as the database.

---

## Context

The project stores hierarchical, relational game data. The database needed to:
- Enforce referential integrity through FK constraints with CASCADE behaviour
- Support native boolean types (not integer 0/1 workarounds)
- Handle NUMERIC/DECIMAL types for modifier value precision without floating-point loss
- Be compatible with the planned GraphQL game runtime API
- Run locally in a WSL2 development environment

---

## Rationale

**Relational integrity.** The five-level taxonomy (Domain → Subdomain → Category →
Subcategory → Modifier) is enforced by FK constraints. PostgreSQL's FK CASCADE DELETE
ensures that when a game domain is deleted, all downstream entities are removed automatically.
SQLite supports FK constraints but its enforcement is disabled by default and historically
less reliable.

**Native boolean type.** PostgreSQL `BOOLEAN` maps directly to TypeScript `boolean`. SQLite
stores booleans as integers (0/1), requiring an additional deserialization layer. The
universal deserialization sub-atoms check `typeof value === "boolean"` first precisely
because PostgreSQL returns native booleans — this is simpler than the SQLite workaround.

**NUMERIC precision.** Modifier tier values (`min_value`, `max_value`, `spawn_weight`) are
`NUMERIC` columns. PostgreSQL preserves exact decimal precision. SQLite stores these as
IEEE 754 floats, which introduces precision errors for values like `0.1 + 0.2`. The
serialization layer converts TypeScript `number` to `string` before writing to PostgreSQL
NUMERIC columns — this is a PostgreSQL-specific but correct approach.

**GraphQL DataLoader compatibility.** PostgreSQL's query planner handles `IN (id1, id2, ...)`
batched lookups efficiently — exactly the query pattern DataLoader generates for N+1 batching.
This makes PostgreSQL a natural fit for the planned GraphQL game runtime layer.

---

## Trade-offs

| Trade-off | Assessment |
|---|---|
| Heavier setup than SQLite (requires a running PostgreSQL server) | Acceptable for a CMS prototype; developer setup is documented |
| camelCase column names must be double-quoted in SQL | Documented pattern; all query builders quote consistently |
| Boolean deserialization requires a `typeof` check | Minor complexity; centralised in the universal deserialization sub-atom |

---

## Consequences

- All SQL query builders quote camelCase column names: `"isActive"`, not `isActive`
- Boolean values are passed as native `true`/`false`, not `1`/`0`
- NUMERIC columns (decimal field type) are serialized as strings; deserialized with `Number()`
- Migrations are plain SQL files in `migrations/` — no ORM migration tool
- The `postgres` npm package is used directly (no ORM); query builders produce parameterised SQL
