# PDR-003: Database Design & Hierarchy

**Status:** Active  
**Last updated:** 2026-04-27

---

## The Five-Level Taxonomy

The database is structured as a strict five-level parent-child hierarchy:

```
game_domain
  └── game_subdomain        (FK: game_domain_id → game_domain.id)
        └── game_category   (FK: game_subdomain_id → game_subdomain.id)
              └── game_subcategory (FK: game_category_id → game_category.id)
                    └── modifier (FK: game_subcategory_id → game_subcategory.id)
```

Each level carries a foreign key to exactly one parent. An entity at level N cannot exist
without a valid parent at level N-1. This is enforced at the database level via NOT NULL
FK constraints with CASCADE delete rules.

**Why this structure?**

The hierarchy represents the natural scoping model of an RPG game world. A modifier belongs
to a specific game subcategory context — "STR Requirement" only makes sense in the context
of a weapon subcategory. Placing it under any other context would be semantically incorrect.
The FK chain makes this a hard constraint, not a convention.

---

## Separate Tables per Entity Type

Each entity type has its own table rather than using a single polymorphic table with a
discriminator column.

**Trade-off acknowledged:** This produces more tables and requires joins for cross-entity
queries. The alternative (one `entities` table + discriminator + nullable columns) avoids
the join cost but introduces nullable sprawl — every new entity type adds nullable columns
that are irrelevant to all other types.

**Why separate tables win:**
- `NOT NULL` constraints mean exactly what they say for each specific entity type
- Each table evolves independently; adding an enemy-modifier-specific column doesn't
  touch the modifier table at all
- Fits the atomic principle: each entity is its own organism with well-defined boundaries
- Query performance: full-table scans on individual entity tables, not filtered scans
  on a monolithic shared table

When cross-type queries are needed (future), a database VIEW or GraphQL union type provides
that without requiring the tables to merge.

---

## Game Rules Encoded as Data

The **binding system** encodes game rules as database records, not code conditions.

The classic example: "Poison Damage can only appear on Wands."

In a naive implementation, this would be a code condition:
```
if (modifier.type === "PoisonDamage" && item.type !== "Wand") { reject }
```

In this system, it is a binding record:

```
item_modifier_bindings
  modifier_id        → poison_damage_modifier.id
  game_subcategory_id → wands_subcategory.id
  binding_type        → 'eligible'
```

When the system resolves which modifiers are eligible for a given item, it reads from the
bindings table rather than evaluating code conditions. This means:
- Game designers can change rules by editing data, not deploying code
- Rules are auditable (binding records can be viewed, versioned, exported)
- Rules compose naturally: add a binding, remove a binding, no code deployment

**Resolution order:**

When determining modifier eligibility for a given game subcategory:
1. **Explicit subcategory binding** — a binding record directly referencing this subcategory
2. **Inherited from parent category** — if no explicit binding, check the parent category
3. **No binding** — modifier has no declared eligibility in this context

This gives game designers fine-grained control at the leaf level while allowing broad rules
to be declared at higher levels and inherited downward.

---

## Modifier Subordinate Tables

The `modifier` table is extended by four subordinate tables:

### modifier_tier

Tiers represent value scaling by character progression level. A modifier at tier 0 might
add +5 STR; the same modifier at tier 3 might add +15 STR.

```
modifier_tier
  modifier_id   FK → modifier.id (CASCADE DELETE)
  tier_index    INTEGER — 0-based, must be gapless within a modifier
  level_req     INTEGER — character level required to access this tier
  min_value     NUMERIC — minimum roll value at this tier
  max_value     NUMERIC — maximum roll value at this tier
  spawn_weight  NUMERIC — relative likelihood of this tier appearing
```

Cross-row validation enforces structural integrity of the tier set:
- Tier indexes must be gapless (0, 1, 2 — not 0, 2, 3)
- `level_req` must be non-decreasing across tiers
- `min_value` must be non-decreasing across tiers
- `spawn_weight` must be non-increasing across tiers (rarer at higher tiers)

Persistence uses delete-all-then-reinsert within a transaction. No diffing or UPSERT.
This simplifies the write path at the cost of slightly higher write volume — acceptable
for a CMS authoring flow where writes are infrequent.

### item_modifier_binding

Junction table connecting modifiers to **item** subcategory eligibility contexts. Carries
`affix_type` (prefix | suffix) — an item-specific field that belongs here rather than on
the universal `modifier` table, because enemy and other asset bindings do not have affix slots.

```
item_modifier_binding
  modifier_id      FK → modifier.id (CASCADE DELETE)
  target_type      VARCHAR — "category" | "subcategory" — scope level of the binding
  target_id        UUID — references the category or subcategory row
  affix_type       VARCHAR — "prefix" | "suffix" — item slot
  is_included      BOOLEAN — included vs. excluded from this scope
  weight_override  INTEGER — overrides spawn weight for this scope
  min_tier_index   SMALLINT — minimum eligible tier in this scope
  max_tier_index   SMALLINT — maximum eligible tier in this scope
  level_req_override SMALLINT — overrides level requirement for this scope
  is_active        BOOLEAN
  UNIQUE (modifier_id, target_type, target_id)
```

### enemy_modifier_binding

Junction table connecting modifiers to **enemy** eligibility contexts in the Enemies
hierarchy. Targets categories and subcategories of the `enemies` game domain.

```
enemy_modifier_binding
  modifier_id      FK → modifier.id (CASCADE DELETE)
  target_type      VARCHAR — "category" | "subcategory"
  target_id        UUID — references an enemy category or subcategory row
  is_included      BOOLEAN
  weight_override  INTEGER
  min_tier_index   SMALLINT
  max_tier_index   SMALLINT
  level_req_override SMALLINT
  is_active        BOOLEAN
  UNIQUE (modifier_id, target_type, target_id)
```

**Why separate binding tables per asset type?**

Each asset type may carry binding fields that are specific to its domain (e.g., `affix_type`
on item bindings, future `is_boss_only` on enemy bindings). A single polymorphic binding
table would accumulate nullable columns for every asset type. Separate tables keep each
binding schema minimal and strongly typed.

### modifier_history

Append-only audit log recording every state transition for a modifier.

```
modifier_history
  modifier_id   FK → modifier.id (CASCADE DELETE)
  event_type    VARCHAR — one of: created, updated, deactivated, reactivated,
                          archived, deleted, renamed
  event_data    JSONB   — snapshot of changed fields at time of event
  created_at    TIMESTAMPTZ
```

**Why event types, not a status column?**

A status column (`status: 'active' | 'archived'`) captures current state but loses history.
The history table captures every transition in sequence. The current lifecycle status is
*derived* by reading the most recent status-bearing event — it is never stored as a
column value on the modifier itself. This makes the full audit trail always available
without requiring a separate history query for "what was the previous state?".

---

## Auto-managed Fields

Two field categories are managed by the server and never accepted from client input:

| Pattern | Fields | Rule |
|---|---|---|
| `uuid(autoGenerate: true)` | `id` | Generated server-side; excluded from INSERT/UPDATE bodies |
| `timestamp(autoSet: 'create')` | `created_at` | Set on INSERT; never updated |
| `timestamp(autoSet: 'update')` | `updated_at` | Set on every UPDATE |

The `deriveBodySchema()` sub-atom at L3 skips these fields when building route validation
schemas. The universal validator at L1 also skips them. The config declaration
(`autoGenerate`, `autoSet`) is the single place where this skip behaviour is declared.

---

## PostgreSQL-Specific Notes

- **camelCase column names** must be double-quoted in SQL: `"isActive"`, not `isActive`.
  PostgreSQL folds unquoted identifiers to lowercase, making `isActive` and `isactive` the
  same thing. All query builders quote camelCase names consistently.
- **Boolean values** are passed as native `true`/`false` (not `1`/`0`). Deserialization
  checks `typeof value === "boolean"` before applying any cast.
- **NUMERIC columns** (decimal fields) are serialized as strings to avoid floating-point
  precision loss in transit; deserialized back to `Number()` on read.

---

## Migration History

| Migration | Description |
|---|---|
| `001_create_modifier_tier.sql` | modifier_tier subordinate table |
| `002_add_sort_order_and_modifier_enums.sql` | sort_order, enum columns on taxonomy tables |
| `003_create_modifier_binding.sql` | item_modifier_binding junction table (initial) |
| `005_rename_modifier_tables.sql` | Renamed legacy `modifiers` → `item_modifiers` (pre-universal rename) |
| `006_stats_modifier_refactor_character_formula.sql` | stat, character, formula tables; modifier column refactor |
| `007_rename_modifier_code_to_machine_name.sql` | `code` column renamed to `machine_name` on modifier |
| `008_add_archive_fields.sql` | `archived_at`, `archived_reason` on modifier and taxonomy |
| `009_add_machine_name_to_taxonomy.sql` | `machine_name` added to all 4 taxonomy tables |
| `010_rename_character_to_character_class.sql` | `character` table renamed to `character_class` |
| `011_add_archive_fields_to_character_class.sql` | archive lifecycle on character_class |
| `012_add_combination_type_to_character_stat_base.sql` | `combination_type` on character_stat_base |
| `013_create_item_and_item_stat_base.sql` | `item` and `item_stat_base` tables |
| `014_add_archive_fields_to_item.sql` | archive lifecycle on item |
| `015_move_affix_type_to_binding.sql` | `affix_type` migrated from `modifier` to `item_modifier_binding` |
| `016_drop_affix_type_from_modifier.sql` | `affix_type` column dropped from `modifier` table |
| `017_rename_item_modifier_to_modifier.sql` | `item_modifiers` table renamed to `modifier` (universal rename) |
| `018_create_enemy_modifier_binding.sql` | `enemy_modifier_binding` junction table |

---

## Related Documents

- [PDR-001: Vision & Scope](PDR-001-vision-and-scope.md) — why the taxonomy exists
- [PDR-005: Modifier System](PDR-005-modifier-system.md) — tier and binding logic in depth
- [ADR-004: Why PostgreSQL](ADR-004-why-postgresql.md)
