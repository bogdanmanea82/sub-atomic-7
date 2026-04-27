# LAYER-002: Layer 2 — Model Service Reference

**Status:** Active  
**Last updated:** 2026-04-27

---

## Layer 2 at a Glance

Layer 2 (Model Service) owns business workflows and database execution. It is the only layer
that touches the database connection. It orchestrates L1 model operations (validation,
serialization, query building) into complete business operations and executes the resulting
`PreparedQuery` objects against PostgreSQL.

> **Key rules:**
> - L2 imports from L0 (config) and L1 (model) only. Never imports from L3, L4, L5, or L6.
> - L2 is the only layer that executes SQL. No layer above L2 touches the database.
> - L2 never validates individual fields — that belongs to L1. L2 validates cross-entity and cross-row concerns (uniqueness, tier set constraints, parent existence).
> - All SQL injection protection is guaranteed by L1's `PreparedQuery` — L2 only executes, never constructs raw SQL.
> - Transactions wrap only multi-record operations. Single-record operations need no transactions.

The internal composition hierarchy within L2:

```
Sub-atoms  — database primitives (execute, convert), form translators (applyStatusAction)
    ↓
Atoms      — single-operation wrappers with error context (insertRecord, selectById, etc.)
             + uniqueness checks + tier set validation
    ↓
Molecules  — universal entity workflows (create, update, delete, select, paginated select)
    ↓
Organisms  — entity services (pre-wire config + model + workflows into named APIs)
```

---

## Directory Map

```
src/model-service/
├── sub-atoms/
│   ├── database/           — PostgreSQL connection, execution, placeholder conversion, transactions
│   │   ├── get-connection.ts
│   │   ├── convert-placeholders.ts
│   │   ├── execute-select.ts
│   │   ├── execute-write.ts
│   │   ├── with-transaction.ts
│   │   └── index.ts
│   ├── tiers/              — tier form parsing, batch insert, fetch, individual mutation factory
│   │   ├── parse-tiers-from-input.ts
│   │   ├── tier-inputs-from-tiers.ts
│   │   ├── insert-tiers.ts
│   │   ├── fetch-tiers.ts
│   │   ├── create-tier-orchestration.ts
│   │   └── index.ts
│   └── apply-status-action.ts   — translates status_action radio → is_active/archived fields
│
├── atoms/
│   ├── crud/               — single-operation DB wrappers with error context
│   │   ├── insert-record.ts
│   │   ├── select-by-id.ts
│   │   ├── select-many.ts
│   │   ├── update-record.ts
│   │   ├── delete-record.ts
│   │   ├── verify-entity-exists.ts
│   │   └── index.ts
│   ├── uniqueness/         — field/name/composite uniqueness checks
│   │   ├── check-field-uniqueness.ts
│   │   ├── check-name-uniqueness.ts
│   │   ├── check-composite-uniqueness.ts
│   │   ├── check-name-and-machine-name-uniqueness.ts
│   │   └── index.ts
│   └── validation/
│       └── validate-tier-set.ts  — cross-row tier progression rules
│
├── molecules/
│   └── workflows/          — universal entity workflows (entity-agnostic orchestration)
│       ├── create-entity-workflow.ts
│       ├── update-entity-workflow.ts
│       ├── delete-entity-workflow.ts
│       ├── select-entity-workflow.ts
│       ├── select-many-workflow.ts
│       └── select-many-paginated-workflow.ts
│
└── entities/               — entity services (organisms)
    ├── game-domain/
    ├── game-subdomain/
    ├── game-category/
    ├── game-subcategory/
    ├── stat/
    └── modifier/           — complex entity: owns tiers + bindings + transactions
        ├── modifier-service.ts
        ├── modifier-binding-service.ts          — item modifier bindings (ItemModifierBindingService)
        └── enemy-modifier-binding-service.ts    — enemy modifier bindings (EnemyModifierBindingService)
```

---

## Database Sub-Atoms — `src/model-service/sub-atoms/database/`

These are the only files in the entire codebase that touch the PostgreSQL connection.
Everything else works with `PreparedQuery` objects and never calls the DB directly.

### `get-connection.ts`

```typescript
export function getConnection(): SQL
```

Singleton PostgreSQL connection pool via Bun SQL. Created on first call using the
`DATABASE_URL` environment variable. Throws immediately if `DATABASE_URL` is not set
(fail-fast at startup — no latent connection failures). Returns the same cached `SQL`
instance on every subsequent call.

**Why singleton:** Bun SQL manages the internal connection pool. Creating multiple `SQL`
instances would open multiple pools. One instance is sufficient and correct.

### `convert-placeholders.ts`

```typescript
export function convertPlaceholders(sql: string): string
```

Converts L1's portable `?` placeholders to PostgreSQL's `$n` positional format
(`?, ?, ?` → `$1, $2, $3`). Uses a stateful regex counter that increments for each
replacement.

**This is the dialect boundary.** L1 uses `?` so it remains database-agnostic.
This single sub-atom is the only place where PostgreSQL syntax enters the codebase.
Called by both `executeSelect` and `executeWrite` before every query execution.

### `execute-select.ts`

```typescript
export async function executeSelect(
  db: SQL,
  query: PreparedQuery
): Promise<Record<string, unknown>[]>
```

Converts placeholders, executes `db.unsafe(pgSql, query.params)`, returns all rows as
`Record<string, unknown>[]`. Empty array if no rows match. Used by `selectById`,
`selectMany`, and — notably — `deleteRecord` (because L1 DELETE queries include
`RETURNING "id"`, which produces rows).

### `execute-write.ts`

```typescript
export async function executeWrite(
  db: SQL,
  query: PreparedQuery
): Promise<void>
```

Converts placeholders, executes `db.unsafe(pgSql, query.params)`, returns `void`.
Used for INSERT and UPDATE operations where no rows are returned.

**`deleteRecord` uses `executeSelect`, not `executeWrite`** — because L1's
`buildDeleteQuery` appends `RETURNING "id"`. The CRUD atom naming reflects caller
intent, not SQL verb.

### `with-transaction.ts`

```typescript
export async function withTransaction<T>(
  db: SQL,
  fn: (txDb: SQL) => Promise<T>
): Promise<T>
```

Wraps Bun SQL's `db.begin()` with a clean async interface. The transaction-scoped SQL
object (`txDb`) is passed to the callback and is cast back to `SQL` — giving it the
same interface as the regular `db` parameter accepted by all CRUD atoms and sub-atoms.

**Transparent parameter pattern:** `insertRecord(txDb, query)` and
`insertRecord(db, query)` are identical call sites. No code inside the callback needs
to know it's inside a transaction.

```typescript
// All three operations succeed together or all rollback
await withTransaction(db, async (txDb) => {
  await insertRecord(txDb, modifierQuery)
  await insertTiers(txDb, ModifierTierModel, modifierId, tiers)
  await insertAutoBinding(txDb, modifierId, input)
})
```

### `index.ts`

Barrel re-export of all 5 database sub-atoms.

---

## Status Action Sub-Atom — `src/model-service/sub-atoms/apply-status-action.ts`

```typescript
export function applyStatusAction(data: Record<string, unknown>): void
```

Translates the `status_action` form radio field into persistent DB field mutations.
Mutates `data` in place before it reaches L1 validation.

| `status_action` value | `is_active` | `archived_reason` | `archived_at` |
|---|---|---|---|
| `"disabled"` | `false` | `null` | `null` |
| `"archived"` | `false` | value of `status_reason` | ISO timestamp (if reason present) |
| any other / absent | `true` | `null` | `null` |

**Why this exists at L2:** The form layer sends a UI concept (`status_action`) — a radio
button. The database stores three separate fields. This sub-atom is the single translation
point. L1 only sees `is_active`, `archived_at`, `archived_reason` — it never knows a radio
button exists. Decouples UI control from persistence design.

**Called by every entity service** in both `create()` and `update()` before any other logic.

---

## Tier Sub-Atoms — `src/model-service/sub-atoms/tiers/`

Tier management is a recurring pattern across modifier domains. All five sub-atoms are
generic over the tier model type — they work with any entity that owns tiers.

### `parse-tiers-from-input.ts`

```typescript
export function parseTiersFromInput(
  input: Record<string, unknown>
): TierInput[] | null
```

Extracts the `tiers_json` hidden form field and parses it from a JSON string into a
`TierInput[]`. Returns `null` if the field is absent, blank, or fails JSON parsing. Used
by ModifierService before tier validation.

**Why `tiers_json` is a string:** HTML forms cannot submit nested arrays. The browser
serializes the tier table to a JSON string in a hidden `<input>`. This sub-atom reverses
that serialization.

### `tier-inputs-from-tiers.ts`

```typescript
export type HasTierFields = {
  tier_index: number; min_value: number; max_value: number
  level_req: number; spawn_weight: number
}

export function tierInputsFromTiers<T extends HasTierFields>(
  tiers: readonly T[]
): TierInput[]
```

Strips DB-only fields (`id`, `modifier_id`, `created_at`, `updated_at`) from deserialized
tier records, returning only the five progression fields. Used by `createTierOrchestration`
to extract a mutable `TierInput[]` from the persisted tier array before individual
add/update/delete operations.

### `insert-tiers.ts`

```typescript
export type TierCreateModel = {
  prepareCreate(input: Record<string, unknown>): PreparedQuery
}

export async function insertTiers(
  txDb: SQL,
  model: TierCreateModel,
  modifierId: string,
  tiers: readonly TierInput[],
  fkFieldName = "modifier_id"
): Promise<void>
```

Batch-inserts all tiers for a parent entity inside an open transaction. For each tier:
generates a UUID for `id`, attaches `modifierId` under `fkFieldName`, then calls
`model.prepareCreate()` (L1) to build the INSERT and executes via `insertRecord`.

**Generic FK convention:** `fkFieldName` defaults to `"modifier_id"`. Pass
`"enemy_modifier_id"` when adding EnemyModifier tiers — no code changes to this sub-atom.

### `fetch-tiers.ts`

```typescript
export type TierSelectModel<T> = {
  prepareSelect(conditions: Record<string, unknown>): PreparedQuery
  deserialize(row: Record<string, unknown>): T
}

export async function fetchTiers<T extends { tier_index: number }>(
  db: SQL,
  model: TierSelectModel<T>,
  modifierId: string,
  fkFieldName = "modifier_id"
): Promise<T[]>
```

Fetches all tiers for a parent entity, deserializes each row via `model.deserialize()`,
and sorts the result by `tier_index` ascending. Sorting is done in application memory
(not SQL `ORDER BY`) to keep query-building logic in L1 atoms unchanged.

### `create-tier-orchestration.ts`

```typescript
export function createTierOrchestration<T extends HasTiers>(
  tierModel: TierOrchestrationModel,
  findById: (id: string) => Promise<FindByIdResult<T>>,
  fkFieldName = "modifier_id"
): { replaceTiers, addTier, updateTier, deleteTier }
```

Factory that returns four tier mutation methods. All four operations ultimately call
`replaceTiers` — the single source of truth for tier persistence.

| Method | Signature | What it does |
|---|---|---|
| `replaceTiers` | `(parentId, tiers: TierInput[]): Promise<ReplaceTiersResult>` | Validates tier set → delete-all → batch-insert inside transaction |
| `addTier` | `(parentId, input): Promise<TierMutationResult>` | Fetch parent → append new tier → call `replaceTiers` |
| `updateTier` | `(parentId, tierIndex, input): Promise<TierMutationResult>` | Fetch parent → replace tier at index → call `replaceTiers` |
| `deleteTier` | `(parentId, tierIndex): Promise<TierMutationResult>` | Fetch parent → filter out tier → re-index → call `replaceTiers` |

**Lazy closure pattern:** `findById` is passed in as a parameter. This allows the factory
to be called before the parent service is fully constructed — the closure captures the
reference and resolves it at call time. `ModifierService` passes its own `findById`
after being fully assembled: `createTierOrchestration(ModifierTierModel, (id) => _core.findById(id))`.

**Self-reference pattern:** The returned object holds a `self` reference so `addTier`,
`updateTier`, and `deleteTier` can call `self.replaceTiers` without circular import issues.

**Delete-all-then-reinsert:** No UPSERT or diff logic. Every mutation replaces the full
tier set atomically. Simpler to reason about and validates the entire set on every write.

### `index.ts`

Barrel re-export of all types and functions.

---

## CRUD Atoms — `src/model-service/atoms/crud/`

Thin wrappers that add operation-specific error context around database sub-atoms.
All accept `db: SQL` and `query: PreparedQuery` (or equivalent).

| File | Export | Returns | Delegates to | Error context added |
|---|---|---|---|---|
| `insert-record.ts` | `insertRecord(db, query)` | `Promise<void>` | `executeWrite` | `"Insert failed: ..."` |
| `select-by-id.ts` | `selectById(db, query)` | `Promise<Record \| null>` | `executeSelect` → `rows[0] ?? null` | `"Select by ID failed: ..."` |
| `select-many.ts` | `selectMany(db, query)` | `Promise<Record[]>` | `executeSelect` | `"Select many failed: ..."` |
| `update-record.ts` | `updateRecord(db, query)` | `Promise<void>` | `executeWrite` | `"Update failed: ..."` |
| `delete-record.ts` | `deleteRecord(db, query)` | `Promise<boolean>` | `executeSelect` → `rows.length > 0` | `"Delete failed: ..."` |
| `verify-entity-exists.ts` | `verifyEntityExists(db, model, id)` | `Promise<boolean>` | `model.prepareSelect({id})` → `selectMany` → length > 0 | (rethrows) |

**`deleteRecord` uses `executeSelect`** because L1's `buildDeleteQuery` appends
`RETURNING "id"`. The boolean return tells the caller whether a row was matched and
deleted — without a separate existence check.

**`verifyEntityExists`** is used by `ItemModifierBindingService` before any binding
operation to confirm the parent modifier still exists. Returns `false` (not an error)
when the parent is not found.

---

## Uniqueness Atoms — `src/model-service/atoms/uniqueness/`

### `check-field-uniqueness.ts`

```typescript
export async function checkFieldUniqueness(
  db: SQL,
  model: UniquenessModel,
  fieldName: string,
  value: string,
  errorMessage: string,
  scope?: Record<string, unknown>,
  excludeId?: string
): Promise<UniquenessResult>
```

Builds `{ [fieldName]: value, ...scope }` as SELECT conditions, fetches matching rows,
filters out `excludeId` (for updates), and returns `{ available: true }` or
`{ available: false, error: errorMessage }`.

**Fail-open design:** If the database query throws, the function returns
`{ available: true }`. This allows form submission to proceed even if the uniqueness
check fails — better to risk a DB-level constraint error than to silently block the user.

**Scope parameter:** Restricts the uniqueness check to a parent context.
`undefined` = global check. `{ game_domain_id: "uuid" }` = scoped to that parent.

### `check-name-uniqueness.ts`

```typescript
export async function checkNameUniqueness(
  db: SQL, model, name: string, errorMessage: string,
  scope?, excludeId?
): Promise<UniquenessResult>
```

Specialization of `checkFieldUniqueness` with `fieldName = "name"`. All entity services
use this for name uniqueness — it reduces call-site noise.

### `check-composite-uniqueness.ts`

```typescript
export async function checkCompositeUniqueness(
  db: SQL,
  model: SelectableModel,
  conditions: Record<string, unknown>,
  excludeId?: string
): Promise<boolean>
```

Multi-column uniqueness check. `conditions` is the full composite key
(e.g., `{ modifier_id, target_type, target_id }`). Returns `true` if a conflict exists.
Used by `ItemModifierBindingService` to enforce binding uniqueness.

**Return type difference:** Returns `boolean` (not `UniquenessResult`) because composite
uniqueness is a business-rule check where the caller constructs its own error message.

### `check-name-and-machine-name-uniqueness.ts`

```typescript
export async function checkNameAndMachineNameUniqueness(
  db: SQL,
  model: UniquenessModel,
  input: Record<string, unknown>,
  nameError: string,
  machineNameError: string,
  nameScope?: Record<string, unknown> | false,
  excludeId?: string
): Promise<UniquenessConflict | null>
```

Checks both `name` and `machine_name` in a single call. The `nameScope` parameter has
three distinct behaviors:

| `nameScope` value | Name check behavior |
|---|---|
| `undefined` | Global name check (no scope) — used by GameDomain, Stat |
| `false` | Skip name check entirely — used when parent FK may be absent |
| `Record<string, unknown>` | Scoped name check — used by GameSubdomain, GameCategory, GameSubcategory, Modifier |

`machine_name` is **always checked globally** regardless of `nameScope`.

Returns `null` if both pass; returns a validation error object immediately on first conflict
(name checked first, then machine_name).

---

## Validation Atom — `src/model-service/atoms/validation/validate-tier-set.ts`

```typescript
export type TierInput = {
  tier_index: number; min_value: number; max_value: number
  level_req: number; spawn_weight: number
}

export function validateTierSet(
  tiers: readonly TierInput[]
): TierSetValidationResult
```

Cross-row validation of an entire tier array. **Field-level validation** (min/max bounds,
required) is handled by L1 `validateEntity`. This atom validates **relationships between
rows** — constraints that cannot be expressed as per-field rules.

**Validation rules (in order):**

1. At least one tier required
2. `tier_index` values must be gapless starting from 0 (0, 1, 2, … — no skips)
3. Per-tier: `max_value >= min_value`
4. Cross-tier (tier `i` vs tier `i-1`):
   - `level_req` strictly increasing (`tier[i].level_req > tier[i-1].level_req`)
   - `min_value` non-decreasing (`tier[i].min_value >= tier[i-1].min_value`)
   - `spawn_weight` non-increasing (`tier[i].spawn_weight <= tier[i-1].spawn_weight`)

**Error key format:** `tier_0_max_value`, `tier_1_level_req` — keyed by index and field
name. This format is intentional: L6 browser uses matching keys to highlight the exact
cell in the tier table where the error occurs.

**Collects all errors** before returning (not fail-fast) — same principle as L1
`validateEntity`.

---

## Workflows — `src/model-service/molecules/workflows/`

Universal entity workflows are generic over `TEntity`. They accept structural model
interfaces (`prepareCreate`, `prepareSelect`, etc.) so the same workflow code handles
every entity without modification.

### `select-entity-workflow.ts`

```typescript
export async function selectEntityWorkflow<TEntity>(
  db: SQL,
  config: EntityConfig,
  model: SelectEntityModel<TEntity>,
  id: string
): Promise<SelectWorkflowResult<TEntity>>
```

**Steps:** `model.prepareSelect({ id })` → `selectById` → if null: `not_found`
(using `config.displayName` for the error message) → `model.deserialize(row)` → success.

**Result type:** `success | not_found | database`

**L0 usage:** `config.displayName` is the only reason `EntityConfig` is passed —
to produce a human-readable "GameDomain not found" message.

### `create-entity-workflow.ts`

```typescript
export async function createEntityWorkflow<TEntity>(
  db: SQL,
  model: CreateEntityModel<TEntity>,
  input: Record<string, unknown>
): Promise<CreateWorkflowResult<TEntity>>
```

**Steps:**
1. Generate UUID → merge into input
2. `model.prepareCreate(inputWithId)` — L1 validates + serializes + builds INSERT; catches `ValidationErrors`
3. `insertRecord(db, query)` — executes INSERT
4. `model.prepareSelect({ id })` → `selectById` — fetch-after-insert pattern
5. `model.deserialize(row)` → success

**Result type:** `success | validation | database`

**Why fetch-after-insert:** The returned entity reflects what the database actually stored
(auto-set timestamps, DB defaults) rather than what was submitted. Ensures the caller
always receives a truthful representation.

### `update-entity-workflow.ts`

```typescript
export async function updateEntityWorkflow<TEntity>(
  db: SQL,
  model: UpdateEntityModel<TEntity>,
  id: string,
  data: Record<string, unknown>,
  nonColumnKeys?: readonly string[]
): Promise<UpdateWorkflowResult<TEntity>>
```

**Steps:**
1. Strip `nonColumnKeys` from `data` (removes `status_action`, `tiers_json`, `status_reason`, etc.)
2. `model.prepareUpdate(cleanData, { id })` — L1 validates + serializes + builds UPDATE
3. `updateRecord(db, query)` — executes UPDATE
4. `model.prepareSelect({ id })` → `selectById` — fetch-after-update
5. If null after update: `not_found` (another process may have deleted the record)
6. `model.deserialize(row)` → success

**Result type:** `success | validation | not_found | database`

**`nonColumnKeys` stripping:** This is where virtual form fields are removed. L0
`EntityConfig.nonColumnKeys` lists them; the service passes this to the workflow. The
workflow does the actual stripping — keeping this concern out of entity services.

### `delete-entity-workflow.ts`

```typescript
export async function deleteEntityWorkflow(
  db: SQL,
  model: DeleteEntityModel,
  id: string
): Promise<DeleteWorkflowResult>
```

**Steps:**
1. `model.prepareDelete({ id })` — L1 builds `DELETE ... RETURNING "id"`
2. `deleteRecord(db, query)` — executes; returns `false` if no rows matched
3. If `false`: `not_found`; if `true`: success

**Result type:** `success | not_found | database`

**Simplest workflow** — no fetch-after-delete needed. The RETURNING clause confirms
deletion; the boolean is sufficient.

### `select-many-workflow.ts`

```typescript
export async function selectManyWorkflow<TEntity>(
  db: SQL,
  model: SelectManyEntityModel<TEntity>,
  conditions?: Record<string, unknown>
): Promise<SelectManyWorkflowResult<TEntity>>
```

**Steps:** `model.prepareSelect(conditions)` → `selectMany` →
`rows.map(model.deserialize)` → success with typed array.

**Empty array is success, not an error.** `{ success: true, data: [] }` is the correct
response when no records match. Used by uniqueness atoms as well as entity services.

**Result type:** `success (with data[]) | database`

### `select-many-paginated-workflow.ts`

```typescript
export async function selectManyPaginatedWorkflow<TEntity>(
  db: SQL,
  model: PaginatedEntityModel<TEntity>,
  pagination: PaginationParams,
  conditions?: Record<string, unknown>
): Promise<SelectManyPaginatedResult<TEntity>>
```

**Steps:**
1. Build two queries: `model.preparePaginatedSelect(pagination, conditions)` + `model.prepareCount(conditions)`
2. Execute both in parallel: `await Promise.all([selectMany(db, dataQuery), selectMany(db, countQuery)])`
3. Extract `totalCount` from `countRows[0]["total"]`
4. `rows.map(model.deserialize)` → success with `{ data, totalCount }`

**Parallel execution** — data and count queries run concurrently, not sequentially.
No extra latency for pagination metadata.

**Result type:** `success (with data[] + totalCount) | database`

---

## Entity Services — `src/model-service/entities/`

### Standard Method Set (all 6 simple services)

Every service for GameDomain, GameSubdomain, GameCategory, GameSubcategory, and Stat
exposes the same 8 methods with the same signatures. The only variation is scope.

| Method | Signature | Delegates to |
|---|---|---|
| `create(input)` | `Promise<CreateWorkflowResult<T>>` | `applyStatusAction` → uniqueness check → `createEntityWorkflow` |
| `findById(id)` | `Promise<SelectWorkflowResult<T>>` | `selectEntityWorkflow` |
| `findMany(conditions?)` | `Promise<SelectManyWorkflowResult<T>>` | `selectManyWorkflow` |
| `findManyPaginated(pagination, conditions?)` | `Promise<SelectManyPaginatedResult<T>>` | `selectManyPaginatedWorkflow` |
| `update(id, data)` | `Promise<UpdateWorkflowResult<T>>` | `applyStatusAction` → uniqueness check → `updateEntityWorkflow` |
| `delete(id)` | `Promise<DeleteWorkflowResult>` | `deleteEntityWorkflow` |
| `checkNameAvailable(name, scope?, excludeId?)` | `Promise<{ available: boolean }>` | `checkNameUniqueness` |
| `checkMachineNameAvailable(machineName, excludeId?)` | `Promise<{ available: boolean }>` | `checkFieldUniqueness` |

**Create/update preamble (called before workflow delegation):**
```
1. applyStatusAction(input)   — translate status radio → DB fields
2. checkNameAndMachineNameUniqueness(...)  — fail early if conflict
3. delegate to workflow       — L1 validates, L2 executes
```

### Uniqueness Scope Comparison

| Entity | Name scope | machine_name scope |
|---|---|---|
| `GameDomain` | Global (no scope) | Global |
| `GameSubdomain` | Scoped to `game_domain_id` | Global |
| `GameCategory` | Scoped to `game_subdomain_id` | Global |
| `GameSubcategory` | Scoped to `game_category_id` | Global |
| `Stat` | Global (no scope) | Global |
| `Modifier` | Scoped to `game_subcategory_id` | Global |

**Invariant:** `machine_name` is always globally unique. `name` can be scoped — two
different subcategories can each have a modifier named "Fire Damage".

---

### ModifierService — Complex Organism

`ModifierService` does not delegate create/update to the universal workflows. It has
its own transactional orchestration because modifier creation/update is a multi-entity
operation (modifier + tiers + binding in one transaction).

**Extended return type:**
```typescript
type ModifierWithTiers = Modifier & {
  readonly tiers: readonly ModifierTier[]
}
```
`findById` returns this extended type. All other methods return `Modifier` (without
tiers) for performance — tier loading is lazy.

**Internal `validateModifierInput` preamble (4 steps):**
```
1. applyStatusAction(input)              — translate status radio
2. checkUniqueness(input, excludeId?)    — name + machine_name scoped to game_subcategory_id
3. parseTiersFromInput(input)            — deserialize tiers_json hidden field
4. validateTierSet(parsedTiers)          — cross-row tier constraints
```

**`create` flow:**
```
validateModifierInput()
  → generate UUID
  → ModifierModel.prepareCreate()              (L1: validate + serialize + INSERT query)
  → withTransaction(db, async (txDb) => {
      insertRecord(txDb, modifierQuery)         (insert modifier row)
      insertTiers(txDb, ModifierTierModel, id, tiers)  (batch insert tiers)
      insertAutoBinding(txDb, id, input)        (silently create default item binding)
    })
  → ModifierModel.prepareSelect({ id })
  → selectMany → deserialize → success
```

**`update` flow:**
```
validateModifierInput()
  → strip nonColumnKeys from data
  → ModifierModel.prepareUpdate()              (L1: validate + serialize + UPDATE query)
  → withTransaction(db, async (txDb) => {
      executeWrite(txDb, updateQuery)           (update modifier row)
      executeWrite(txDb, ModifierTierModel.prepareDelete({ modifier_id: id }))  (delete all tiers)
      insertTiers(txDb, ModifierTierModel, id, newTiers)  (insert replacement tiers)
    })
  → ModifierModel.prepareSelect({ id })
  → selectMany → deserialize → success
```

**`findById` flow (tier eager-loading):**
```
selectEntityWorkflow()        → Modifier
fetchTiers(db, ModifierTierModel, id)   → ModifierTier[] sorted by tier_index
return { ...modifier, tiers }
```

**`insertAutoBinding` (internal, called during create):**
- Determines target: `game_subcategory_id` (if present) → falls back to `game_category_id`
- Silently returns if neither is available (no auto-binding when hierarchy is incomplete)
- Inserts one `ItemModifierBinding` row scoped to that target
- Runs inside the same transaction as the modifier insert — binds atomically

**Tier orchestration attachment:**
```typescript
const _core = { create, findById, findMany, ... }
const _tierOrchestration = createTierOrchestration(
  ModifierTierModel,
  (id) => _core.findById(id),  // lazy closure — resolves after _core is defined
)
export const ModifierService = { ..._core, ..._tierOrchestration }
```

Tier methods on the service: `replaceTiers`, `addTier`, `updateTier`, `deleteTier`

---

### ItemModifierBindingService

Manages item modifier bindings (modifier ↔ item subcategory/category scope). Does not use
universal workflows — uses atoms directly for fine-grained control.

**Exported methods:**

| Method | Signature | Key operations |
|---|---|---|
| `findByModifier(modifierId)` | `Promise<{ category: ItemModifierBinding[]; subcategory: ItemModifierBinding[] }>` | `selectMany` → deserialize → group by `target_type` |
| `create(modifierId, input)` | `Promise<CreateWorkflowResult<ItemModifierBinding>>` | verify parent → validate tier range → composite uniqueness → insert → fetch |
| `update(modifierId, bindingId, data)` | `Promise<UpdateWorkflowResult<ItemModifierBinding>>` | verify parent → validate tier range → composite uniqueness → update → fetch |
| `remove(modifierId, bindingId)` | `Promise<DeleteWorkflowResult>` | scoped fetch (verify ownership) → delete |

**Composite uniqueness constraint:** `(modifier_id, target_type, target_id)` must be
unique. A modifier cannot bind the same target twice.

**Scoped operations:** Every `update` and `remove` operation includes both `id` and
`modifier_id` in the WHERE conditions. This prevents one modifier's binding from being
edited or deleted via another modifier's API route — a security boundary enforced at the
query level.

**Tier range validation (`validateTierRange`):** Internal helper that checks
`min_tier_index <= max_tier_index` when both are provided. Returns an error map if
violated. Not cross-row — a single binding's internal consistency check.

---

### EnemyModifierBindingService

Manages enemy modifier bindings (modifier ↔ enemy category/subcategory scope). Parallel
structure to `ItemModifierBindingService` — same 3-method surface, same atom usage, same
uniqueness and tier-range validation.

**Exported methods:**

| Method | Signature | Key operations |
|---|---|---|
| `findByModifier(modifierId)` | `Promise<{ category: EnemyModifierBinding[]; subcategory: EnemyModifierBinding[] }>` | `selectMany` → deserialize → group by `target_type` |
| `create(modifierId, input)` | `Promise<CreateWorkflowResult<EnemyModifierBinding>>` | verify parent → validate tier range → composite uniqueness → insert → fetch |
| `update(modifierId, bindingId, data)` | `Promise<UpdateWorkflowResult<EnemyModifierBinding>>` | verify parent → validate tier range → composite uniqueness → update → fetch |
| `remove(modifierId, bindingId)` | `Promise<DeleteWorkflowResult>` | scoped fetch (verify ownership) → delete |

**Target hierarchy:** Enemy categories and subcategories in the `enemies` game domain (seeded
in `seeds/19-enemies-hierarchy.sql`). The binding does not validate that `target_id` is in
the enemies domain — that constraint is enforced by the UI and conventions, not the DB FK.

---

## Cross-Layer Dependency Map

```
L0 Configuration (src/config/)
        │
        │  EntityConfig             — displayName for error messages (selectEntityWorkflow)
        │  EntityConfig.nonColumnKeys — virtual field list (updateEntityWorkflow stripping)
        ▼
L1 Model (src/model/)
        │
        │  PreparedQuery            — output of all L1 query builders → input to L2 executors
        │  PaginationParams         — pagination input type
        │  Entity model methods     — prepareCreate, prepareSelect, prepareUpdate, prepareDelete, deserialize
        │  Entity types             — GameDomain, Stat, Modifier, etc.
        ▼
L2 Model Service (src/model-service/)
        │
        │  Service objects          — GameDomainService, StatService, ModifierService, etc.
        │  Service result unions    — CreateWorkflowResult, SelectWorkflowResult, etc.
        │  PaginationParams         — passed through from L3 caller
        ▼
L3 Controller (src/controller/)
  • Imports entity services → calls service.create(), service.findById(), etc.
  • Receives result unions → maps to HTTP responses
  • Never touches PreparedQuery, never calls atoms or workflows directly
```

**No direct database access above L2.** L3, L4, L5, and L6 are completely isolated from
the database. L2 is the ceiling of data access.

---

## Result Type Reference

All service methods return discriminated union result types. L3 Controller switches on
`result.success` and `result.stage` to produce HTTP responses.

```typescript
// Create / Update
type CreateWorkflowResult<T> =
  | { success: true; data: T }
  | { success: false; stage: "validation"; errors: Record<string, string> }
  | { success: false; stage: "database"; error: string }

type UpdateWorkflowResult<T> =
  | { success: true; data: T }
  | { success: false; stage: "validation"; errors: Record<string, string> }
  | { success: false; stage: "not_found"; error: string }
  | { success: false; stage: "database"; error: string }

// Read
type SelectWorkflowResult<T> =
  | { success: true; data: T }
  | { success: false; stage: "not_found"; error: string }
  | { success: false; stage: "database"; error: string }

type SelectManyWorkflowResult<T> =
  | { success: true; data: T[] }
  | { success: false; stage: "database"; error: string }

type SelectManyPaginatedResult<T> =
  | { success: true; data: T[]; totalCount: number }
  | { success: false; stage: "database"; error: string }

// Delete
type DeleteWorkflowResult =
  | { success: true }
  | { success: false; stage: "not_found"; error: string }
  | { success: false; stage: "database"; error: string }
```

**Stage semantics:**
- `"validation"` — input was rejected before hitting the database
- `"not_found"` — record(s) not found; not an error, just missing
- `"database"` — database operation failed (connection, constraint, etc.)

---

## Workflows

### Feature Development: Adding a New Simple Entity Service

A "simple" entity is one without owned sub-entities (no tiers, no bindings).

1. Create `src/model-service/entities/{name}/{name}-service.ts`

2. Import the entity model and config:
   ```typescript
   import { EntityNameModel } from "@model/entities/{name}"
   import { ENTITY_NAME_CONFIG } from "@config/entities/{name}"
   ```

3. Determine the name scope for this entity (see scope table above):
   - Top-level entity (no parent) → pass `undefined` for `nameScope`
   - Has a parent FK → scope to the parent FK field: `{ game_domain_id: input.game_domain_id }`

4. Implement `create` and `update` with the standard preamble:
   ```typescript
   async create(input: Record<string, unknown>) {
     applyStatusAction(input)
     const db = getConnection()
     const conflict = await checkNameAndMachineNameUniqueness(
       db, EntityNameModel, input, "Name already taken", "Machine name already taken",
       nameScope  // undefined for global, or { parent_id: input.parent_id }
     )
     if (conflict) return conflict
     return createEntityWorkflow(db, EntityNameModel, input)
   }
   ```

5. Implement standard remaining methods: `findById`, `findMany`, `findManyPaginated`,
   `update`, `delete`, `checkNameAvailable`, `checkMachineNameAvailable`

6. Export the service object

7. Run `bun run typecheck` — zero errors before touching L3

---

### Feature Development: Adding a New Modifier Domain (e.g., EnemyModifier)

A new modifier domain (e.g., SpellModifier) follows the Modifier pattern with tier
orchestration. Because both SpellModifier and the universal Modifier share the same FK
parent concept, the service is essentially a copy with different config/model references.

1. **L0** — Create `SpellModifierConfigFactory` extending `BaseEntityConfigFactory`
   (no new tier/binding factories needed if sharing the universal `modifier` table is acceptable)
2. **L1** — Create `SpellModifierModel`
3. **L2** — Create `spell-modifier-service.ts`:
   - Copy `modifier-service.ts` structure
   - Replace `MODIFIER_CONFIG` → `SPELL_MODIFIER_CONFIG`
   - Replace `ModifierModel` → `SpellModifierModel`
   - Replace `ModifierTierModel` → `SpellModifierTierModel` (if separate tier table)
4. The tier sub-atoms (`insertTiers`, `fetchTiers`, `createTierOrchestration`) are already
   generic — no changes needed to those files
5. The universal workflows are already generic — no changes needed

---

### Feature Development: Adding a New Validation to an Existing Service

When a new cross-entity constraint must be enforced (not a field-level rule):

1. Determine where it belongs:
   - **Cross-row constraint on a sub-entity** (e.g., new tier rule) → add to `validateTierSet`
   - **Uniqueness constraint** (field must be unique within a scope) → use or extend uniqueness atoms
   - **Parent existence check** (must verify FK points to live record) → use `verifyEntityExists`
   - **Custom business rule** → add as internal helper inside the entity service

2. Add the check to the service's `create` and `update` methods before workflow delegation

3. Return early with a validation stage result if the check fails:
   ```typescript
   return { success: false, stage: "validation", errors: { fieldName: "Error message" } }
   ```

---

### Debugging: Tracing a Service-Layer Problem

```
SYMPTOM: Service returns validation error for a value that should be valid
→ L2 uniqueness atoms: Is the scope correct? (Check what's passed as nameScope)
→ L2 applyStatusAction: Is it mutating fields unexpectedly before validation?
→ L1 validateEntity: Is the constraint defined correctly in L0?

SYMPTOM: Create succeeds but the returned record is missing fields
→ L2 createEntityWorkflow: Fetch-after-insert: did the SELECT query include all fields?
→ L1 buildSelectQuery: Are all config.fields included in the SELECT clause?
→ L0: Is the field in the entity config's buildFields()?

SYMPTOM: Update silently succeeds but changes don't persist
→ L2 updateEntityWorkflow: nonColumnKeys stripping — is the field being stripped?
→ L0 EntityConfig.nonColumnKeys: Was the field accidentally added here?
→ L1 buildUpdateQuery: Is the field name quoted correctly?

SYMPTOM: Transaction rolled back — partial data saved
→ L2 withTransaction: Are ALL operations inside the callback (txDb)?
→ Check ModifierService create/update: insertTiers must receive txDb, not db

SYMPTOM: Service returns not_found immediately after a create
→ L2 createEntityWorkflow: The INSERT succeeded but the SELECT found nothing
→ Check the UUID: was it injected into input before prepareCreate?
→ Check that the SELECT conditions use the same id that was generated

SYMPTOM: Tier validation fails for seemingly correct input
→ L2 validateTierSet: Print the sorted tier array — are indexes gapless from 0?
→ Check level_req: must be strictly increasing (equal values are rejected)
→ Check spawn_weight: must be non-increasing (higher tiers must have <= weight)

SYMPTOM: Binding operations affect the wrong modifier
→ L2 ItemModifierBindingService: All WHERE conditions must include modifier_id
→ If update/remove is routing to wrong record, check that modifierId is in conditions
```

---

### Debugging: Inspecting SQL at L2

Insert a temporary log just before or after `executeSelect`/`executeWrite`:

```typescript
// In execute-select.ts or the calling atom, temporarily add:
const pgSql = convertPlaceholders(query.sql)
console.log("SQL:", pgSql)
console.log("Params:", query.params)
// Verify: $n count == params.length
// Verify: table name is correct
// Verify: quoted field names match actual DB column names
```

For transaction issues, log inside the callback to confirm all operations reach the DB:

```typescript
await withTransaction(db, async (txDb) => {
  console.log("TX: inserting modifier")
  await insertRecord(txDb, modifierQuery)
  console.log("TX: inserting tiers")
  await insertTiers(txDb, ...)
  console.log("TX: complete")
})
```

---

### Testing: L2 Service Tests

L2 tests require a live database connection. They test the full L0→L1→L2 stack.

```typescript
import { describe, it, expect, beforeAll } from "bun:test"
import { GameDomainService } from "@model-service/entities/game-domain"

describe("GameDomainService.create", () => {
  it("creates a record and returns it", async () => {
    const result = await GameDomainService.create({
      machine_name: "test_domain",
      name: "Test Domain",
      is_active: true,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe("Test Domain")
      expect(result.data.id).toBeDefined()
      expect(result.data.created_at).toBeInstanceOf(Date)
    }
  })

  it("rejects duplicate machine_name", async () => {
    await GameDomainService.create({ machine_name: "dup", name: "First", is_active: true })
    const result = await GameDomainService.create({ machine_name: "dup", name: "Second", is_active: true })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.stage).toBe("validation")
  })
})
```

Run L2 service tests:
```bash
bun test src/model-service/
```

Note: L2 tests require a running PostgreSQL database with migrations applied.

---

### Git: Commit Conventions for L2 Changes

L2 commits use the `service` scope:

```bash
# New entity service
feat(service): add EnemyModifierService with tier orchestration

# New workflow
feat(service): add select-many-filtered-workflow for condition-scoped lists

# New sub-atom
feat(service): add execute-select-one sub-atom for single-row guarantees

# New uniqueness atom
feat(service): add check-machine-name-uniqueness atom for modifier domain scoping

# Bug fix
fix(service): pass txDb (not db) to insertTiers in Modifier create transaction

# Refactor
refactor(service): extract validateModifierInput preamble into shared atom
```

---

### Git: PR Checklist for L2 Changes

Before pushing a branch with L2 modifications:

- [ ] `bun run typecheck` — zero errors
- [ ] New entity service exported from its `entities/{name}/index.ts`
- [ ] `applyStatusAction` called before uniqueness checks in both `create` and `update`
- [ ] `nonColumnKeys` passed to `updateEntityWorkflow` for entities with virtual form fields
- [ ] Multi-record operations wrapped in `withTransaction` — all operations use `txDb` not `db`
- [ ] `fkFieldName` passed to `insertTiers`/`fetchTiers` if FK column differs from `"modifier_id"`
- [ ] Result types correctly typed — no `any` in return positions
- [ ] No imports from L3, L4, L5, or L6 in any L2 file
- [ ] Commit message uses `feat(service):`, `fix(service):`, or `refactor(service):` scope

---

## Related Documents

- [LAYER-000: Configuration Reference](LAYER-000-configuration-reference.md) — L0 EntityConfig.nonColumnKeys that L2 strips
- [LAYER-001: Model Reference](LAYER-001-model-reference.md) — L1 PreparedQuery and entity models that L2 executes
- [PDR-002: Layer Architecture](PDR-002-layer-architecture.md) — where L2 sits in the full stack
- [PDR-003: Database Design](PDR-003-database-design.md) — PostgreSQL schema that L2 queries target
- [PDR-005: Modifier System](PDR-005-modifier-system.md) — Modifier tier/binding lifecycle that L2 orchestrates
