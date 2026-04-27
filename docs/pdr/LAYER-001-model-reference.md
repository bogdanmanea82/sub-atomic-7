# LAYER-001: Layer 1 — Model Reference

**Status:** Active  
**Last updated:** 2026-04-27

---

## Layer 1 at a Glance

Layer 1 (Model) owns framework-agnostic domain logic. It is the translation layer between
raw data and the database: it validates input, serializes TypeScript types to database-ready
formats, deserializes database rows back to TypeScript, and builds parameterized SQL queries.

> **Key rules:**
> - L1 imports from L0 (config) only. Never imports from L2, L3, L4, L5, or L6.
> - No HTTP, no HTML, no ElysiaJS — zero framework coupling.
> - All SQL is parameterized. `PreparedQuery { sql, params }` is the output contract.
> - Entity models are the public API. L2 calls model methods; never calls atoms directly.

The internal composition hierarchy within L1:

```
Sub-atoms  — single-value transformers (validate one value, serialize one type)
    ↓
Atoms      — config-driven field iterators (validate/serialize/query-build one entity)
    ↓
Molecules  — atom pipelines (validate → serialize → build INSERT in one call)
    ↓
Organisms  — entity models (pre-bind config + expose named methods to Layer 2)
```

---

## Directory Map

```
src/model/
├── universal/
│   ├── sub-atoms/
│   │   ├── types/           — shared types: PreparedQuery, PaginationParams
│   │   ├── validation/      — single-value validators (required, length, range, enum, etc.)
│   │   ├── serialization/   — TypeScript → DB format converters (string trim, decimal→string, etc.)
│   │   ├── deserialization/ — DB format → TypeScript converters (NUMERIC string→number, etc.)
│   │   └── query-building/  — SQL fragment builders (SELECT, INSERT, UPDATE, WHERE, LIMIT, etc.)
│   ├── atoms/               — config-driven entity processors (validate/serialize/deserialize/build)
│   └── molecules/           — atom pipelines (full create workflow)
│
└── entities/                — entity-specific organisms (pre-bind config, expose typed API)
    ├── game-domain/
    ├── game-subdomain/
    ├── game-category/
    ├── game-subcategory/
    ├── stat/
    ├── modifier/
    ├── modifier-tier/
    ├── item-modifier-binding/
    └── enemy-modifier-binding/
```

**Why `universal/` and `entities/` are separated:**
Universal components know nothing about specific entities — they work with any `EntityConfig`.
Entity organisms close the loop: they import both the universal atoms and the specific config,
then pre-bind them into a named API so L2 works with `GameDomainModel.prepareCreate(input)`
rather than `createEntity(GAME_DOMAIN_CONFIG, input)`.

---

## Types Sub-Atoms — `src/model/universal/sub-atoms/types/`

These two files define the output contracts that flow upward through L2 and beyond.

### `prepared-query.ts`

```typescript
export type PreparedQuery = {
  sql: string
  params: unknown[]
}
```

The universal handoff type. Every query builder in L1 returns a `PreparedQuery`. L2 passes
it directly to the database executor — no SQL string manipulation happens outside L1.
Parameterized queries make SQL injection architecturally impossible.

### `pagination-params.ts`

```typescript
export type PaginationParams = {
  readonly page: number      // 1-based page number
  readonly pageSize: number  // records per page
}

export const DEFAULT_PAGE_SIZE = 15
```

Immutable pagination input type. `DEFAULT_PAGE_SIZE = 15` is the project-wide default —
sized for a 1080p display without vertical scrolling. L3 Controller reads this constant
when no `pageSize` query param is provided.

---

## Validation Sub-Atoms — `src/model/universal/sub-atoms/validation/`

Each function validates exactly one value of one type. Throws a descriptive `Error` on
failure; returns the original value (possibly coerced) on success. All are pure functions
with no side effects.

| File | Export | Signature | What it validates |
|---|---|---|---|
| `validate-required.ts` | `validateRequired<T>` | `(value: T \| null \| undefined, fieldName: string): T` | Not null and not undefined |
| `validate-string-length.ts` | `validateStringLength` | `(value: string, minLength: number, maxLength: number, fieldName: string): string` | String length in [minLength, maxLength] |
| `validate-integer-range.ts` | `validateIntegerRange` | `(value: number, min: number, max: number, fieldName: string): number` | Integer in [min, max] |
| `validate-decimal.ts` | `validateDecimal` | `(value: number, fieldName: string, min?: number, max?: number): number` | Finite number; optional [min, max] |
| `validate-boolean.ts` | `validateBoolean` | `(value: string \| number \| boolean, fieldName: string): boolean` | Coerces to boolean from native bool, 1/0, "true"/"false"/"1"/"0" |
| `validate-datetime.ts` | `validateDatetime` | `(value: Date \| string \| number, fieldName: string): Date` | Produces a valid `Date` from Date, ISO string, or Unix timestamp |
| `validate-enum.ts` | `validateEnum` | `(value: string, allowedValues: readonly string[], fieldName: string): string` | Value is a member of `allowedValues` |

**Notes:**
- `validateBoolean` normalizes input — accepts the browser form's `"1"/"0"` strings, not just native booleans
- `validateDecimal` has optional bounds — used for decimal fields that don't define min/max in config
- `validateEnum` receives the `values` array directly from the `EnumFieldConfig` atom in L0
- Errors include `fieldName` so L1 can aggregate multiple field errors before throwing once

### `index.ts`

Barrel re-export of all 7 validation functions.

---

## Serialization Sub-Atoms — `src/model/universal/sub-atoms/serialization/`

Each function converts one TypeScript value to its database-ready equivalent. All preserve
`null` (optional fields stay null). All are pure functions.

| File | Export | Signature | What it does |
|---|---|---|---|
| `serialize-string.ts` | `serializeString` | `(value: string \| null): string \| null` | Trims leading/trailing whitespace |
| `serialize-integer.ts` | `serializeInteger` | `(value: number \| null): number \| null` | Pass-through (integers need no conversion) |
| `serialize-boolean.ts` | `serializeBoolean` | `(value: boolean \| null): boolean \| null` | Pass-through (PostgreSQL accepts native `bool`) |
| `serialize-datetime.ts` | `serializeDatetime` | `(value: Date \| null): string \| null` | Converts `Date` → ISO 8601 string for `TIMESTAMPTZ` |
| `serialize-decimal.ts` | `serializeDecimal` | `(value: number \| null): string \| null` | Converts `number` → `string` for PostgreSQL `NUMERIC` |

**Why `serializeDecimal` converts to string:**
PostgreSQL's `NUMERIC` type loses floating-point precision if a JavaScript `number` is passed
directly (e.g., `1.15` becomes `1.1499999...`). Sending the value as a string forces
PostgreSQL to parse it exactly, preserving the precision the user entered.

### `index.ts`

Barrel re-export of all 5 serialization functions.

---

## Deserialization Sub-Atoms — `src/model/universal/sub-atoms/deserialization/`

Each function converts one database value back to its TypeScript equivalent. Mirrors the
serialization sub-atoms in shape. All preserve `null`.

| File | Export | Signature | What it does |
|---|---|---|---|
| `deserialize-string.ts` | `deserializeString` | `(value: string \| null): string \| null` | Pass-through |
| `deserialize-integer.ts` | `deserializeInteger` | `(value: number \| null): number \| null` | Pass-through |
| `deserialize-boolean.ts` | `deserializeBoolean` | `(value: boolean \| number \| null): boolean \| null` | Handles PostgreSQL native `bool` AND legacy SQLite `1`/`0` integers |
| `deserialize-datetime.ts` | `deserializeDatetime` | `(value: Date \| null): Date \| null` | Wraps in `new Date()` — driver may return string or Date depending on context |
| `deserialize-decimal.ts` | `deserializeDecimal` | `(value: unknown): number` | Parses PostgreSQL `NUMERIC` string → `number`; returns `0` if `NaN` (safe fallback) |

**Why `deserializeBoolean` handles both native bool and integer:**
The codebase migrated from SQLite (which stores booleans as `1`/`0`) to PostgreSQL (which
stores native `boolean`). The dual-path handles any remaining data or test fixtures that
arrive as integers.

**Why `deserializeDecimal` returns `number` (not `number | null`):**
Decimal fields (tier min/max values) are required in the DB schema — a null would indicate
data corruption. Returning `0` on `NaN` ensures the application stays usable while making
the problem visible as a suspicious value, not a crash.

### `index.ts`

Barrel re-export of all 5 deserialization functions.

---

## Query-Building Sub-Atoms — `src/model/universal/sub-atoms/query-building/`

Each function builds one SQL fragment. All return either a plain `string` (non-parameterized
fragments) or a `PreparedQuery` (fragments with bound values). Fragments are composed by
atoms into complete statements.

| File | Export | Signature | Output |
|---|---|---|---|
| `query-build-select.ts` | `queryBuildSelect` | `(tableName: string, fields: string[]): string` | `SELECT "f1","f2" FROM table` or `SELECT * FROM table` |
| `query-build-count.ts` | `queryBuildCount` | `(tableName: string): string` | `SELECT COUNT(*)::integer AS total FROM table` |
| `query-build-insert.ts` | `queryBuildInsert` | `(tableName: string, data: Record<string, unknown>): PreparedQuery` | `INSERT INTO table ("f1","f2") VALUES ($1,$2)` + params |
| `query-build-update.ts` | `queryBuildUpdate` | `(tableName: string, data: Record<string, unknown>): PreparedQuery` | `UPDATE table SET "f1"=$1, "f2"=$2` + params |
| `query-build-where.ts` | `queryBuildWhere` | `(conditions: Record<string, unknown>): PreparedQuery` | `WHERE "f1"=$1 AND "f2"=$2` + params, or empty if no conditions |
| `query-build-values.ts` | `queryBuildValues` | `(rows: Record<string, unknown>[]): PreparedQuery` | `VALUES ($1,$2), ($3,$4)` + params (batch insert) |
| `query-build-order-by.ts` | `queryBuildOrderBy` | `(field?: string, direction?: "ASC" \| "DESC"): string` | `ORDER BY "created_at" DESC` (defaults) |
| `query-build-pagination.ts` | `queryBuildPagination` | `(page: number, pageSize: number): PreparedQuery` | `LIMIT $1 OFFSET $2` + params |

**Field name quoting:** All field names are wrapped in double-quotes (e.g., `"isActive"`).
This is required for PostgreSQL because camelCase identifiers are case-sensitive only when
quoted. Field names come from `config.fields[].name` — the quoting happens here, once, so
no upstream code needs to think about it.

**`queryBuildCount` casts to `::integer`:** PostgreSQL's `COUNT(*)` returns `bigint` by
default. The `::integer` cast avoids a type mismatch when the result is consumed as a
JavaScript number.

### `index.ts`

Barrel re-export of all 8 query-building functions.

---

## Atoms — `src/model/universal/atoms/`

Atoms are config-driven. Each iterates `config.fields[]`, switches on `field.type`, and
dispatches to the appropriate sub-atom. Atoms know nothing about specific entities — they
work with any `EntityConfig`.

### Entity-Processing Atoms

#### `validate-entity.ts`

```typescript
export function validateEntity(
  config: EntityConfig,
  input: Record<string, unknown>
): ValidatedData

export type ValidationErrors = { field: string; message: string }[]
export type ValidatedData = Record<string, unknown>
```

Iterates `config.fields`. For each field:
1. **Skips** auto-managed fields: uuid fields with `autoGenerate: true`; timestamp fields with `autoSet !== "none"`
2. Gets `value = input[field.name]`
3. If `field.required` → calls `validateRequired(value, field.name)`
4. If optional and value is null/undefined → passes through unchanged
5. Switches on `field.type` → dispatches to matching validation sub-atom:
   - `"string"` → `validateStringLength(value, field.minLength, field.maxLength, field.name)`
   - `"integer"` → `validateIntegerRange(value, field.min, field.max, field.name)`
   - `"decimal"` → `validateDecimal(value, field.name, field.min, field.max)`
   - `"boolean"` → `validateBoolean(value, field.name)`
   - `"timestamp"` → `validateDatetime(value, field.name)`
   - `"enum"` → `validateEnum(value, field.values, field.name)`
   - `"uuid"` or `"reference"` → passes through (required check above is sufficient)
6. Collects all errors before throwing — user sees all field errors at once, not just the first

**Why error collection matters:** A form with 5 invalid fields should show all 5 errors
in one response, not force 5 round-trips. `validateEntity` collects errors in an array,
then throws once with the full array attached as `.errors`.

#### `serialize-entity.ts`

```typescript
export function serializeEntity(
  config: EntityConfig,
  data: Record<string, unknown>,
  operation: "create" | "update"
): SerializedData

export type SerializedData = Record<string, unknown>
```

Iterates `config.fields` and handles auto-timestamps before delegating to sub-atoms:

- **Auto-UUID:** if `field.type === "uuid"` and `field.autoGenerate === true` and no value provided → skips field (DB generates it, or caller supplies an ID)
- **Auto-timestamps:**
  - `autoSet === "create"` and `operation === "create"` → injects `new Date()`
  - `autoSet === "update"` → always injects `new Date()` (both create and update)
  - `autoSet === "create"` and `operation === "update"` → **skips field** (preserves `created_at`)
- All other fields → dispatches to matching serialization sub-atom by `field.type`

#### `deserialize-entity.ts`

```typescript
export function deserializeEntity(
  config: EntityConfig,
  row: Record<string, unknown>
): DeserializedData

export type DeserializedData = Record<string, unknown>
```

Iterates `config.fields`. For each field, gets `row[field.name]` and dispatches to the
matching deserialization sub-atom by `field.type`. Null values pass through. Returns a
record with TypeScript-native types (native booleans, Date objects, parsed decimals).

---

### Query-Building Atoms

These atoms read `config.tableName` and `config.fields` to build complete statements from
sub-atom fragments.

#### `build-select-query.ts`

```typescript
export function buildSelectQuery(
  config: EntityConfig,
  conditions?: Record<string, unknown>
): PreparedQuery
```

Extracts `fieldNames` from `config.fields`, calls `queryBuildSelect(config.tableName, fieldNames)`.
Optionally appends a WHERE clause via `queryBuildWhere(conditions)`.

#### `build-count-query.ts`

```typescript
export function buildCountQuery(
  config: EntityConfig,
  conditions?: Record<string, unknown>
): PreparedQuery
```

Calls `queryBuildCount(config.tableName)`. Optionally appends WHERE clause. Used alongside
`buildPaginatedSelectQuery` to return both the current page's records and the total count.

#### `build-insert-query.ts`

```typescript
export function buildInsertQuery(
  config: EntityConfig,
  data: Record<string, unknown>
): PreparedQuery
```

Thin wrapper — delegates to `queryBuildInsert(config.tableName, data)`. The atom exists
so L2 passes `EntityConfig` rather than needing to know the table name directly.

#### `build-update-query.ts`

```typescript
export function buildUpdateQuery(
  config: EntityConfig,
  data: Record<string, unknown>,
  conditions: Record<string, unknown>
): PreparedQuery
```

Composes `queryBuildUpdate(config.tableName, data)` + `queryBuildWhere(conditions)`.
Merges both `params` arrays in order: `[...updateParams, ...whereParams]`.

#### `build-delete-query.ts`

```typescript
export function buildDeleteQuery(
  config: EntityConfig,
  conditions: Record<string, unknown>
): PreparedQuery
```

Builds `DELETE FROM {tableName} WHERE ... RETURNING "id"`. The `RETURNING "id"` clause
lets L2 confirm which record was deleted without an extra SELECT.

#### `build-paginated-select-query.ts`

```typescript
export function buildPaginatedSelectQuery(
  config: EntityConfig,
  pagination: PaginationParams,
  conditions?: Record<string, unknown>
): PreparedQuery
```

Composes: `queryBuildSelect` + optional `queryBuildWhere` + `queryBuildOrderBy("created_at", "DESC")`
+ `queryBuildPagination(pagination.page, pagination.pageSize)`. The default sort is
`created_at DESC` (most recently created first). Params arrays are merged in order:
`[...whereParams, ...paginationParams]`.

---

## Molecules — `src/model/universal/molecules/`

The single molecule currently in L1 covers entity creation. Update/delete workflows involve
more L2-side logic (e.g., fetching the existing record, archive logic, tier transactions)
and are therefore orchestrated in L2, not L1.

### `create-entity.ts`

```typescript
export function createEntity(
  config: EntityConfig,
  input: Record<string, unknown>
): PreparedQuery
```

The complete create pipeline in three steps:

```
Step 1: validateEntity(config, input)
        → throws ValidationErrors if any field fails
        → returns ValidatedData if all fields pass

Step 2: serializeEntity(config, validatedData, "create")
        → converts to database format
        → injects auto-timestamps for created_at and updated_at
        → returns SerializedData

Step 3: buildInsertQuery(config, serializedData)
        → builds parameterized INSERT statement
        → returns PreparedQuery
```

L2 calls `createEntity(config, input)` and receives a `PreparedQuery` ready to execute.
L2 never calls validate/serialize/build separately for create operations.

---

## Entity Organisms — `src/model/entities/`

Each organism pre-binds one entity config to the universal atoms. L2 imports the model
and calls named methods — it never imports atoms or molecules directly.

**Standard method set** (9 methods — all hierarchy entities + stat + modifier):

| Method | Delegates to | Returns |
|---|---|---|
| `validate(input)` | `validateEntity(CONFIG, input)` | `ValidatedData` or throws |
| `serialize(data, operation)` | `serializeEntity(CONFIG, data, operation)` | `SerializedData` |
| `deserialize(row)` | `deserializeEntity(CONFIG, row)` cast to entity type | Typed entity |
| `prepareCreate(input)` | `createEntity(CONFIG, input)` | `PreparedQuery` |
| `prepareSelect(conditions?)` | `buildSelectQuery(CONFIG, conditions)` | `PreparedQuery` |
| `preparePaginatedSelect(pagination, conditions?)` | `buildPaginatedSelectQuery(CONFIG, pagination, conditions)` | `PreparedQuery` |
| `prepareCount(conditions?)` | `buildCountQuery(CONFIG, conditions)` | `PreparedQuery` |
| `prepareUpdate(data, conditions)` | `buildUpdateQuery(CONFIG, data, conditions)` | `PreparedQuery` |
| `prepareDelete(conditions)` | `buildDeleteQuery(CONFIG, conditions)` | `PreparedQuery` |

**ModifierTier** has a reduced method set (6 methods — no pagination, no update):
Tiers are managed in bulk (delete-all-then-reinsert) by the parent Modifier service in L2.
Individual tier updates and pagination are not needed.

**ItemModifierBinding** and **EnemyModifierBinding** each have 7 methods (no pagination,
but includes update): Bindings support individual CRUD via fetchJson in L6. They need
`prepareUpdate` but not pagination.

### Entity Type Exports

Each organism also exports a TypeScript type reflecting the fully deserialized entity shape.
These types flow into L2 service return values and L4 view service inputs.

| Entity | Type | Field count | Notable fields |
|---|---|---|---|
| `GameDomain` | `GameDomain` | 9 | `archived_at: Date \| null`, `archived_reason: string \| null` |
| `GameSubdomain` | `GameSubdomain` | 10 | + `game_domain_id: string` |
| `GameCategory` | `GameCategory` | 11 | + `game_domain_id`, `game_subdomain_id` |
| `GameSubcategory` | `GameSubcategory` | 12 | + `game_domain_id`, `game_subdomain_id`, `game_category_id` |
| `Stat` | `Stat` | 14 | `data_type: string`, `value_min/max/default_value: number`, `category: string` |
| `Modifier` | `Modifier` | 20 | 4 hierarchy FKs, `target_stat_id: string \| null`, `combination_type`, `roll_shape`, `value_min/max: number`, `modifier_group`, `display_template` |
| `ModifierTier` | `ModifierTier` | 9 | `modifier_id: string`, `tier_index: number`, `min_value/max_value: number` (deserialized from NUMERIC string) |
| `ItemModifierBinding` | `ItemModifierBinding` | 12 | `modifier_id`, `target_type: "category" \| "subcategory"`, `is_included: boolean`, nullable overrides; note: `affix_type` is in the L0 config but not yet in the TypeScript type |
| `EnemyModifierBinding` | `EnemyModifierBinding` | 12 | `modifier_id`, `target_type: "category" \| "subcategory"`, `is_included: boolean`, nullable overrides |

All fields are `readonly` — entities from L1 are immutable value objects.

---

## Cross-Layer Dependency Map

```
L0 Configuration (src/config/)
        │
        │  EntityConfig, FieldConfig       — read by atoms to iterate fields + switch on type
        │  Entity config singletons        — imported by organisms to pre-bind config
        ▼
L1 Model (src/model/)
        │
        │  PreparedQuery                   — handoff type: every query builder returns this
        │  PaginationParams, DEFAULT_PAGE_SIZE — pagination contract
        │  Entity model singletons         — GameDomainModel, StatModel, ModifierModel, etc.
        │  Entity types                    — GameDomain, Stat, Modifier, etc.
        ▼
L2 Model Service (src/model-service/)
  • Imports entity models → calls model.prepareCreate(), model.prepareSelect(), etc.
  • Imports PreparedQuery → passes to database executor sub-atom
  • Imports PaginationParams → used in service method signatures
  • Imports DEFAULT_PAGE_SIZE → used as fallback in extract-pagination (L3 sub-atom)
        │
        ▼
L3 Controller (src/controller/)
  • Imports PreparedQuery type indirectly (via model-service return values)
  • Imports PaginationParams, DEFAULT_PAGE_SIZE via extract-pagination sub-atom
  • Never imports entity models or atoms directly
```

**Important:** L3 Controller never imports from `src/model/` directly. The only L1 imports
at L3 are `PaginationParams` and `DEFAULT_PAGE_SIZE` in the `extract-pagination` sub-atom.
All entity operations flow through L2 Model Service.

---

## Test Coverage

L1 is the most thoroughly tested layer in the codebase — 225+ test cases across 18 files.

### Sub-atom tests

| Suite | File | Cases | What is tested |
|---|---|---|---|
| Validation | `validate-required.test.ts` | 6 | Passes non-null, rejects null/undefined |
| Validation | `validate-string-length.test.ts` | 10 | Min/max bounds, boundary conditions, 5000-char strings |
| Validation | `validate-integer-range.test.ts` | 9 | Min/max range, negative ranges, boundary off-by-one |
| Validation | `validate-boolean.test.ts` | 11 | Native bool, 1/0 integers, "true"/"false" strings, case-insensitive, rejects invalid |
| Validation | `validate-datetime.test.ts` | 8 | Date objects, ISO strings, Unix timestamps, invalid dates |
| Validation | `validate-decimal.test.ts` | 9 | Valid numbers, NaN rejection, min/max constraints, optional bounds |
| Serialization | `serialize.test.ts` | 21 | String trimming, integer passthrough, boolean passthrough, datetime ISO conversion |
| Serialization | `serialize-decimal.test.ts` | 6 | Number→string, precision preservation |
| Deserialization | `deserialize.test.ts` | 18 | All types, PostgreSQL bool + SQLite integer fallback, datetime parsing |
| Deserialization | `deserialize-decimal.test.ts` | 7 | NUMERIC string→number, passthrough, NaN→0 |
| Query-building | `query-building.test.ts` | 20 | SELECT (fields/wildcard), INSERT placeholders, UPDATE SET, WHERE AND, VALUES batch |

### Atom tests

| Suite | File | Cases | What is tested |
|---|---|---|---|
| Validate entity | `validate-entity.test.ts` | 28 | Full entity validation, skips auto-managed fields, aggregates all errors, optional fields |
| Serialize entity | `serialize-entity.test.ts` | 17 | Whitespace trimming, auto-timestamps on create vs update, UUID skip |
| Deserialize entity | `deserialize-entity.test.ts` | 11 | Full row deserialization, null handling, UUID passthrough |
| Build query | `build-query.test.ts` | 9 | SELECT+WHERE, INSERT quoted columns, UPDATE+WHERE, DELETE+RETURNING |

### Molecule tests

| Suite | File | Cases | What is tested |
|---|---|---|---|
| Create entity | `create-entity.test.ts` | 20 | Full pipeline, auto-UUID/timestamps, validation failure short-circuits, SQL structure, placeholder count == param count |

### Entity-specific tests

| Suite | File | Cases | What is tested |
|---|---|---|---|
| Stat model | `stat-model.test.ts` | 42+ | Enum validation (data_type, category), negative value_min for resistances, full CRUD query shapes |
| Modifier tier model | `modifier-tier-model.test.ts` | 21 | Decimal serialization/deserialization for tier values, tier_index/level_req/spawn_weight bounds |

Run all L1 tests:
```bash
bun test src/model/
```

Run sub-atom tests only:
```bash
bun test src/model/universal/sub-atoms/
```

Run a single entity model test:
```bash
bun test src/model/entities/stat/
```

---

## Workflows

### Feature Development: Adding a New Entity Model

When a new entity config exists in L0, this workflow adds its L1 organism.

1. Create `src/model/entities/{entity-name}/{entity-name}-model.ts`

2. Import the entity config:
   ```typescript
   import { ENTITY_CONFIG } from "@config/entities/{entity-name}"
   ```

3. Define the TypeScript type matching the deserialized shape. Field types follow the
   deserialized form of each `FieldConfig` type:
   - `string` / `enum` / `uuid` / `reference` → `string` (or `string | null` if optional)
   - `integer` / `decimal` → `number` (or `number | null` if optional)
   - `boolean` → `boolean`
   - `timestamp` → `Date`
   All fields should be `readonly`.

4. Import the atoms and molecules needed for the entity's method set:
   ```typescript
   import { validateEntity, serializeEntity, deserializeEntity } from "@model/universal/atoms/validate-entity"
   // ... etc.
   import { createEntity } from "@model/universal/molecules/create-entity"
   ```

5. Export the model object with pre-bound methods:
   ```typescript
   export const EntityNameModel = {
     validate: (input: Record<string, unknown>) => validateEntity(ENTITY_CONFIG, input),
     serialize: (data: Record<string, unknown>, op: "create" | "update") =>
       serializeEntity(ENTITY_CONFIG, data, op),
     deserialize: (row: Record<string, unknown>): EntityName =>
       deserializeEntity(ENTITY_CONFIG, row) as EntityName,
     prepareCreate: (input: Record<string, unknown>) => createEntity(ENTITY_CONFIG, input),
     prepareSelect: (conditions?: Record<string, unknown>) =>
       buildSelectQuery(ENTITY_CONFIG, conditions),
     preparePaginatedSelect: (pagination: PaginationParams, conditions?: Record<string, unknown>) =>
       buildPaginatedSelectQuery(ENTITY_CONFIG, pagination, conditions),
     prepareCount: (conditions?: Record<string, unknown>) =>
       buildCountQuery(ENTITY_CONFIG, conditions),
     prepareUpdate: (data: Record<string, unknown>, conditions: Record<string, unknown>) =>
       buildUpdateQuery(ENTITY_CONFIG, data, conditions),
     prepareDelete: (conditions: Record<string, unknown>) =>
       buildDeleteQuery(ENTITY_CONFIG, conditions),
   }
   ```

6. Create `index.ts` barrel re-exporting the model and type

7. Run `bun run typecheck` — zero errors before touching L2

**For subordinate entities** (tier-like, binding-like): omit `preparePaginatedSelect`,
`prepareCount` for bulk-managed subordinates. Include `prepareUpdate` only if the entity
supports individual record edits.

---

### Feature Development: Adding a New FieldType to L1

When a new `FieldType` discriminant is added to L0 `field-config.ts`, L1 requires updates
in four places:

1. **Add validation sub-atom:** `src/model/universal/sub-atoms/validation/validate-{type}.ts`
   — implement the type-specific validation logic; export from `validation/index.ts`

2. **Add serialization sub-atom:** `src/model/universal/sub-atoms/serialization/serialize-{type}.ts`
   — implement TypeScript → DB format conversion; export from `serialization/index.ts`

3. **Add deserialization sub-atom:** `src/model/universal/sub-atoms/deserialization/deserialize-{type}.ts`
   — implement DB format → TypeScript conversion; export from `deserialization/index.ts`

4. **Update atoms** — add the new `case "{type}":` to the switch statements in:
   - `validate-entity.ts` → `validateField()` inner function
   - `serialize-entity.ts` → `serializeField()` inner function
   - `deserialize-entity.ts` → `deserializeField()` inner function

5. Write tests for each new sub-atom before updating the atoms

6. Run `bun run typecheck` after each file

**Note:** Query-building sub-atoms do not need updating for new field types — they work
with field names and values, not field types.

---

### Debugging: Tracing a Data Problem Through L1

Use this trace when a value looks wrong after a read or write:

```
SYMPTOM: Validation rejects a value the user entered
→ L0: Is the constraint correct? (e.g., INTEGER_CONSTRAINTS_SIGNED for negative fields)
→ L1 validate-entity: Is the right sub-atom being called for this field.type?
→ L1 validation sub-atom: Is the min/max/allowedValues being passed correctly?
   - Add console.log(field.name, field.type, value) in validateField() temporarily

SYMPTOM: Value is saved but reads back wrong
→ L1 serialize-entity: Is the field.type branch correct?
   - Decimal fields: is serializeDecimal (number→string) being called?
   - Boolean fields: is serializeBoolean returning native bool (not 1/0)?
→ L1 deserialize-entity: Is the reverse conversion correct?
   - Decimal fields: is deserializeDecimal (string→number) being called?
   - Boolean fields: is deserializeBoolean handling both native bool AND integer?

SYMPTOM: SQL error from the database
→ L1 query-building sub-atoms: Are field names quoted? (Should be "fieldName" not fieldName)
→ L1 build-update-query: Are param arrays merged in correct order?
   ([...updateParams, ...whereParams] — WHERE params come after SET params)

SYMPTOM: created_at being overwritten on update
→ L1 serialize-entity: Check autoSet logic
   - autoSet === "create" && operation === "update" → should SKIP the field
   - If it's being set, the operation param may be wrong ("create" passed for an update)

SYMPTOM: Validation skips a field that should be validated
→ L1 validate-entity: Check skip conditions
   - field.type === "uuid" && field.autoGenerate === true → correctly skipped
   - field.type === "timestamp" && field.autoSet !== "none" → correctly skipped
   - If a non-auto field is being skipped, check the field config in L0
```

---

### Debugging: Inspecting PreparedQuery Output

Insert a temporary log in the model method or L2 caller:

```typescript
const query = EntityModel.prepareCreate(input)
console.log("SQL:", query.sql)
console.log("Params:", query.params)
// Verify: placeholder count in sql === params.length
// Verify: quoted field names (SELECT "name" not SELECT name)
// Verify: WHERE conditions reference the right fields
```

If placeholder count doesn't match param count, a query-building sub-atom is building
mismatched fragments — check the `queryBuildWhere` or `queryBuildUpdate` sub-atom for the
affected statement type.

---

### Testing: Writing L1 Sub-Atom Tests

Pattern from existing test files:

```typescript
import { describe, it, expect } from "bun:test"
import { validateStringLength } from "@model/universal/sub-atoms/validation/validate-string-length"

describe("validateStringLength", () => {
  it("passes value within bounds", () => {
    expect(validateStringLength("hello", 3, 255, "name")).toBe("hello")
  })

  it("rejects value below minLength", () => {
    expect(() => validateStringLength("ab", 3, 255, "name")).toThrow()
  })

  it("rejects value above maxLength", () => {
    expect(() => validateStringLength("a".repeat(256), 3, 255, "name")).toThrow()
  })

  it("accepts value exactly at boundary (min)", () => {
    expect(validateStringLength("abc", 3, 255, "name")).toBe("abc")
  })

  it("accepts value exactly at boundary (max)", () => {
    const str = "a".repeat(255)
    expect(validateStringLength(str, 3, 255, "name")).toBe(str)
  })
})
```

**Test naming convention:** `{function-name}.test.ts` in the same directory as the source.

Run sub-atom tests in watch mode during development:
```bash
bun test --watch src/model/universal/sub-atoms/validation/
```

---

### Testing: Writing Entity Model Tests

Pattern from `stat-model.test.ts`:

```typescript
import { describe, it, expect } from "bun:test"
import { StatModel } from "@model/entities/stat"

describe("StatModel.validate", () => {
  it("accepts valid stat input", () => {
    const result = StatModel.validate({
      machine_name: "fire_res",
      name: "Fire Resistance",
      data_type: "percentage",
      value_min: -100,
      value_max: 100,
      default_value: 0,
      category: "defensive",
      is_active: true,
    })
    expect(result.name).toBe("Fire Resistance")
  })

  it("rejects invalid data_type enum", () => {
    expect(() => StatModel.validate({ ...validInput, data_type: "invalid" })).toThrow()
  })

  it("allows negative value_min for resistance stats", () => {
    const result = StatModel.validate({ ...validInput, value_min: -100 })
    expect(result.value_min).toBe(-100)
  })
})

describe("StatModel.prepareCreate", () => {
  it("returns a PreparedQuery", () => {
    const query = StatModel.prepareCreate(validInput)
    expect(query.sql).toContain("INSERT INTO")
    expect(query.params.length).toBeGreaterThan(0)
  })

  it("placeholder count matches param count", () => {
    const query = StatModel.prepareCreate(validInput)
    const placeholders = (query.sql.match(/\$/g) || []).length
    expect(placeholders).toBe(query.params.length)
  })
})
```

---

### Git: Commit Conventions for L1 Changes

L1 commits use the `model` scope:

```bash
# New entity model organism
feat(model): add EnemyModifier L1 model organism and EnemyModifier type

# New sub-atom for a new field type
feat(model): add validate-decimal sub-atom for NUMERIC field type support

# New deserialization sub-atom
feat(model): add deserialize-decimal sub-atom — NUMERIC string to number conversion

# Bug fix in serialization
fix(model): deserialize-boolean handles both native bool and SQLite integer fallback

# New molecule
feat(model): add update-entity molecule for validate → serialize → build-update pipeline

# Consistency / alignment pass
refactor(model): align query-build-where field quoting with PostgreSQL camelCase requirement
```

**Rule:** L1-only changes get their own commit. When adding a new entity (L0 + L1 + L2 +
L3 + L4 + L5 + L6), commit each layer separately in order.

---

### Git: PR Checklist for L1 Changes

Before pushing a branch with L1 modifications:

- [ ] `bun run typecheck` — zero errors
- [ ] `bun test src/model/` — all model tests pass
- [ ] New sub-atoms exported from their category's `index.ts` barrel
- [ ] New entity model exported from its `entities/{name}/index.ts` barrel
- [ ] New FieldType additions: all four switch statements updated (validate, serialize, deserialize atoms + new sub-atoms)
- [ ] Placeholder count in SQL matches params array length (use placeholder count test)
- [ ] `readonly` on all entity type fields
- [ ] No imports from L2, L3, L4, L5, or L6 in any L1 file
- [ ] Commit message uses `feat(model):`, `fix(model):`, or `refactor(model):` scope

---

## Related Documents

- [LAYER-000: Configuration Reference](LAYER-000-configuration-reference.md) — L0 configs that drive all L1 behavior
- [PDR-002: Layer Architecture](PDR-002-layer-architecture.md) — where L1 sits in the full stack
- [PDR-003: Database Design](PDR-003-database-design.md) — PostgreSQL schema that L1 queries target
- [PDR-004: Entity & Configuration Model](PDR-004-entity-config-model.md) — how EntityConfig shapes L1 operations
